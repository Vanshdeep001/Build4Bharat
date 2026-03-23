from fastapi import APIRouter, Depends
from database import get_db
from middleware.auth_middleware import require_role, get_current_user
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

DEMO_KPIS = [
    {"kpi_name": "Micro-irrigation coverage", "target": 850, "kpi_type": "irrigation_work"},
    {"kpi_name": "Soil Health Cards issued", "target": 2000, "kpi_type": "soil_health_card"},
    {"kpi_name": "KCC loans facilitated", "target": 500, "kpi_type": "kcc_loan_camp"},
    {"kpi_name": "Seed distribution (quintals)", "target": 1200, "kpi_type": "seed_distribution"},
    {"kpi_name": "Training sessions conducted", "target": 100, "kpi_type": "training"},
]

BLOCKS_META = {
    "uttarkashi": [
        {"block_id": "dunda", "block_name": "Dunda"},
        {"block_id": "bhatwari", "block_name": "Bhatwari"},
        {"block_id": "purola", "block_name": "Purola"},
    ],
    "chamoli": [
        {"block_id": "gopeshwar", "block_name": "Gopeshwar"},
        {"block_id": "joshimath", "block_name": "Joshimath"},
        {"block_id": "karnaprayag", "block_name": "Karnaprayag"},
    ],
}


@router.get("/district/{district_id}")
async def get_district_dashboard(
    district_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()

    # Total submissions
    total_submissions = await db.submissions.count_documents({"district_id": district_id})

    # Total farmers
    total_farmers = await db.farmers.count_documents({"district_id": district_id})

    # Open anomalies
    open_anomalies = await db.anomalies.count_documents(
        {"district_id": district_id, "status": "open"}
    )

    # Fund utilisation
    fund_pipeline = [
        {"$match": {"district_id": district_id}},
        {
            "$group": {
                "_id": None,
                "total_released": {"$sum": "$amount_released"},
                "total_utilised": {"$sum": "$amount_utilised"},
                "avg_progress": {"$avg": "$physical_progress_pct"},
            }
        },
    ]
    fund_agg = await db.fund_logs.aggregate(fund_pipeline).to_list(1)
    fund_data = fund_agg[0] if fund_agg else {"total_released": 0, "total_utilised": 0, "avg_progress": 0}
    fund_utilisation_pct = (
        round((fund_data["total_utilised"] / fund_data["total_released"]) * 100, 1)
        if fund_data["total_released"] > 0 else 0
    )

    # Average physical progress
    avg_physical_progress = round(fund_data.get("avg_progress", 0), 1)

    # Dispute rate
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    total_verifications = await db.farmer_verifications.count_documents(
        {"district_id": district_id, "created_at": {"$gte": thirty_days_ago}}
    )
    disputes = await db.farmer_verifications.count_documents(
        {"district_id": district_id, "benefit_received": False, "created_at": {"$gte": thirty_days_ago}}
    )
    dispute_rate_pct = round((disputes / total_verifications) * 100, 1) if total_verifications > 0 else 0

    # Block summary
    blocks = BLOCKS_META.get(district_id, [])
    block_summary = []
    for block in blocks:
        bid = block["block_id"]
        anomaly_count = await db.anomalies.count_documents(
            {"block_id": bid, "status": "open"}
        )
        if anomaly_count >= 3:
            status = "critical"
        elif anomaly_count >= 1:
            status = "warning"
        else:
            status = "healthy"
        block_summary.append({
            "block_id": bid,
            "block_name": block["block_name"],
            "status": status,
            "anomaly_count": anomaly_count,
        })

    # Recent anomalies
    cursor = db.anomalies.find({"district_id": district_id}).sort("created_at", -1).limit(10)
    recent_anomalies = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        recent_anomalies.append(a)

    # Fund by scheme
    scheme_pipeline = [
        {"$match": {"district_id": district_id}},
        {
            "$group": {
                "_id": "$scheme_name",
                "released": {"$sum": "$amount_released"},
                "utilised": {"$sum": "$amount_utilised"},
            }
        },
    ]
    scheme_data = await db.fund_logs.aggregate(scheme_pipeline).to_list(100)
    fund_by_scheme = [
        {"scheme_name": s["_id"], "released": s["released"], "utilised": s["utilised"]}
        for s in scheme_data
    ]

    # KPI at risk
    kpi_at_risk = []
    scheme_start = datetime(2025, 4, 1, tzinfo=timezone.utc)
    days_elapsed = max((datetime.now(timezone.utc) - scheme_start).days, 1)
    for kpi in DEMO_KPIS:
        pipeline = [
            {"$match": {"district_id": district_id, "kpi_type": kpi["kpi_type"]}},
            {"$group": {"_id": None, "total": {"$sum": "$kpi_value"}}},
        ]
        agg = await db.submissions.aggregate(pipeline).to_list(1)
        current_val = agg[0]["total"] if agg else 0
        projected = current_val * (365 / days_elapsed) if days_elapsed > 0 else current_val
        projected_pct = round((projected / kpi["target"]) * 100, 1) if kpi["target"] > 0 else 0
        kpi_at_risk.append({
            "kpi_name": kpi["kpi_name"],
            "target": kpi["target"],
            "current_value": round(current_val, 1),
            "projected": round(projected, 1),
            "projected_pct": projected_pct,
            "at_risk": projected_pct < 90,
        })

    return {
        "total_submissions": total_submissions,
        "total_farmers": total_farmers,
        "open_anomalies": open_anomalies,
        "fund_utilisation_pct": fund_utilisation_pct,
        "avg_physical_progress_pct": avg_physical_progress,
        "dispute_rate_pct": dispute_rate_pct,
        "kpi_at_risk": kpi_at_risk,
        "block_summary": block_summary,
        "recent_anomalies": recent_anomalies,
        "fund_by_scheme": fund_by_scheme,
    }


@router.get("/state")
async def get_state_dashboard(
    current_user: dict = Depends(require_role("state_admin")),
):
    db = get_db()
    districts = ["uttarkashi", "chamoli"]
    district_data = []

    for did in districts:
        submissions = await db.submissions.count_documents({"district_id": did})
        anomalies = await db.anomalies.count_documents({"district_id": did, "status": "open"})

        fund_pipe = [
            {"$match": {"district_id": did}},
            {
                "$group": {
                    "_id": None,
                    "released": {"$sum": "$amount_released"},
                    "utilised": {"$sum": "$amount_utilised"},
                    "avg_progress": {"$avg": "$physical_progress_pct"},
                }
            },
        ]
        fund_agg = await db.fund_logs.aggregate(fund_pipe).to_list(1)
        fund = fund_agg[0] if fund_agg else {"released": 0, "utilised": 0, "avg_progress": 0}
        fund_util = round((fund["utilised"] / fund["released"]) * 100, 1) if fund["released"] > 0 else 0

        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        total_v = await db.farmer_verifications.count_documents(
            {"district_id": did, "created_at": {"$gte": thirty_days_ago}}
        )
        disputes = await db.farmer_verifications.count_documents(
            {"district_id": did, "benefit_received": False, "created_at": {"$gte": thirty_days_ago}}
        )
        dispute_rate = round((disputes / total_v) * 100, 1) if total_v > 0 else 0

        district_data.append({
            "district_id": did,
            "district_name": did.title(),
            "total_submissions": submissions,
            "open_anomalies": anomalies,
            "fund_utilisation_pct": fund_util,
            "avg_physical_progress_pct": round(fund.get("avg_progress", 0), 1),
            "dispute_rate_pct": dispute_rate,
        })

    return {"districts": district_data}

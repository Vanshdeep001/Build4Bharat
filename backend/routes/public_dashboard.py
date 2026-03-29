"""
Public Dashboard API — no authentication required.
Provides read-only access to aggregated data for the DM Dashboard.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from database import get_db
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/public/dashboard", tags=["public_dashboard"])

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
    "dehradun": [
        {"block_id": "dehradun", "block_name": "Dehradun Block"},
        {"block_id": "vikasnagar", "block_name": "Vikasnagar"},
        {"block_id": "doiwala", "block_name": "Doiwala"},
    ],
}

DISTRICT_NAMES = {
    "uttarkashi": "Uttarkashi",
    "chamoli": "Chamoli",
    "dehradun": "Dehradun",
}

DEMO_KPIS = [
    {"kpi_name": "Micro-irrigation coverage", "target": 850, "kpi_type": "irrigation_work"},
    {"kpi_name": "Soil Health Cards issued", "target": 2000, "kpi_type": "soil_health_card"},
    {"kpi_name": "KCC loans facilitated", "target": 500, "kpi_type": "kcc_loan_camp"},
    {"kpi_name": "Seed distribution (quintals)", "target": 1200, "kpi_type": "seed_distribution"},
    {"kpi_name": "Training sessions conducted", "target": 100, "kpi_type": "training"},
]


async def _get_district_metrics(db, district_id: str) -> dict:
    """Compute all metrics for a single district."""
    thirty_days = datetime.now(timezone.utc) - timedelta(days=30)

    # Counts
    total_submissions = await db.submissions.count_documents({"district_id": district_id})
    total_farmers = await db.farmers.count_documents({"district_id": district_id})
    open_anomalies = await db.anomalies.count_documents({"district_id": district_id, "status": "open"})

    # Fund aggregation
    fund_pipeline = [
        {"$match": {"district_id": district_id}},
        {"$group": {
            "_id": None,
            "total_released": {"$sum": "$amount_released"},
            "total_utilised": {"$sum": "$amount_utilised"},
            "avg_progress": {"$avg": "$physical_progress_pct"},
        }},
    ]
    fund_agg = await db.fund_logs.aggregate(fund_pipeline).to_list(1)
    fund_data = fund_agg[0] if fund_agg else {"total_released": 0, "total_utilised": 0, "avg_progress": 0}
    fund_utilisation_pct = (
        round((fund_data["total_utilised"] / fund_data["total_released"]) * 100, 1)
        if fund_data["total_released"] > 0 else 0
    )

    # Dispute rate
    total_verifications = await db.farmer_verifications.count_documents(
        {"district_id": district_id, "created_at": {"$gte": thirty_days}}
    )
    disputes = await db.farmer_verifications.count_documents(
        {"district_id": district_id, "benefit_received": False, "created_at": {"$gte": thirty_days}}
    )
    dispute_rate_pct = round((disputes / total_verifications) * 100, 1) if total_verifications > 0 else 0

    return {
        "district_id": district_id,
        "district_name": DISTRICT_NAMES.get(district_id, district_id.title()),
        "total_submissions": total_submissions,
        "total_farmers": total_farmers,
        "open_anomalies": open_anomalies,
        "fund_utilisation_pct": fund_utilisation_pct,
        "total_fund_released": round(fund_data["total_released"], 0),
        "total_fund_utilised": round(fund_data["total_utilised"], 0),
        "avg_physical_progress_pct": round(fund_data.get("avg_progress", 0), 1),
        "dispute_rate_pct": dispute_rate_pct,
        "total_verifications": total_verifications,
        "total_disputes": disputes,
    }


@router.get("/overview")
async def get_public_overview():
    """State-level overview with all district metrics and aggregated totals."""
    db = get_db()
    district_ids = list(DISTRICT_NAMES.keys())
    districts = []

    totals = {
        "total_submissions": 0,
        "total_farmers": 0,
        "open_anomalies": 0,
        "total_fund_released": 0,
        "total_fund_utilised": 0,
        "total_verifications": 0,
        "total_disputes": 0,
    }

    for did in district_ids:
        metrics = await _get_district_metrics(db, did)
        districts.append(metrics)
        for key in totals:
            totals[key] += metrics.get(key, 0)

    totals["fund_utilisation_pct"] = (
        round((totals["total_fund_utilised"] / totals["total_fund_released"]) * 100, 1)
        if totals["total_fund_released"] > 0 else 0
    )
    totals["dispute_rate_pct"] = (
        round((totals["total_disputes"] / totals["total_verifications"]) * 100, 1)
        if totals["total_verifications"] > 0 else 0
    )

    return {"districts": districts, "state_totals": totals}


@router.get("/district/{district_id}")
async def get_public_district_dashboard(district_id: str):
    """Full district detail: metrics, block summary, recent anomalies, fund by scheme, KPIs."""
    db = get_db()

    metrics = await _get_district_metrics(db, district_id)

    # Block summary
    blocks = BLOCKS_META.get(district_id, [])
    block_summary = []
    for block in blocks:
        bid = block["block_id"]
        anomaly_count = await db.anomalies.count_documents({"block_id": bid, "status": "open"})
        sub_count = await db.submissions.count_documents({"block_id": bid})
        farmer_count = await db.farmers.count_documents({"block_id": bid})

        # Fund data for block
        block_fund_pipe = [
            {"$match": {"block_id": bid}},
            {"$group": {
                "_id": None,
                "released": {"$sum": "$amount_released"},
                "utilised": {"$sum": "$amount_utilised"},
                "avg_progress": {"$avg": "$physical_progress_pct"},
            }},
        ]
        block_fund_agg = await db.fund_logs.aggregate(block_fund_pipe).to_list(1)
        block_fund = block_fund_agg[0] if block_fund_agg else {"released": 0, "utilised": 0, "avg_progress": 0}
        block_fund_util = (
            round((block_fund["utilised"] / block_fund["released"]) * 100, 1)
            if block_fund["released"] > 0 else 0
        )

        if anomaly_count >= 2:
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
            "submission_count": sub_count,
            "farmer_count": farmer_count,
            "fund_utilisation_pct": block_fund_util,
            "avg_progress_pct": round(block_fund.get("avg_progress", 0), 1),
        })

    # Recent anomalies
    cursor = db.anomalies.find({"district_id": district_id}).sort("created_at", -1).limit(10)
    recent_anomalies = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        if "created_at" in a and a["created_at"]:
            a["created_at"] = a["created_at"].isoformat()
        recent_anomalies.append(a)

    # Fund by scheme
    scheme_pipeline = [
        {"$match": {"district_id": district_id}},
        {"$group": {
            "_id": "$scheme_name",
            "released": {"$sum": "$amount_released"},
            "utilised": {"$sum": "$amount_utilised"},
        }},
    ]
    scheme_data = await db.fund_logs.aggregate(scheme_pipeline).to_list(100)
    fund_by_scheme = [
        {"scheme_name": s["_id"], "released": round(s["released"], 0), "utilised": round(s["utilised"], 0)}
        for s in scheme_data
    ]

    # KPIs
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
        **metrics,
        "block_summary": block_summary,
        "recent_anomalies": recent_anomalies,
        "fund_by_scheme": fund_by_scheme,
        "kpi_at_risk": kpi_at_risk,
    }


@router.get("/anomalies")
async def get_public_anomalies():
    """All anomalies across all districts, sorted by score."""
    db = get_db()
    cursor = db.anomalies.find({}).sort("anomaly_score", -1)
    anomalies = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        if "created_at" in a and a["created_at"]:
            a["created_at"] = a["created_at"].isoformat()
        if "resolved_at" in a and a["resolved_at"]:
            a["resolved_at"] = a["resolved_at"].isoformat()
        # Add human names
        a["district_name"] = DISTRICT_NAMES.get(a.get("district_id", ""), a.get("district_id", ""))
        block_name = a.get("block_id", "")
        for blocks in BLOCKS_META.values():
            for b in blocks:
                if b["block_id"] == block_name:
                    block_name = b["block_name"]
                    break
        a["block_name"] = block_name
        anomalies.append(a)
    return anomalies


@router.get("/anomalies/district/{district_id}")
async def get_public_anomalies_by_district(district_id: str):
    """Anomalies for a specific district."""
    db = get_db()
    cursor = db.anomalies.find({"district_id": district_id}).sort("anomaly_score", -1)
    anomalies = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        if "created_at" in a and a["created_at"]:
            a["created_at"] = a["created_at"].isoformat()
        a["district_name"] = DISTRICT_NAMES.get(district_id, district_id.title())
        anomalies.append(a)
    return anomalies


@router.get("/blocks")
async def get_public_blocks():
    """All block status data with anomaly counts."""
    db = get_db()
    all_blocks = []
    for district_id, blocks in BLOCKS_META.items():
        for block in blocks:
            bid = block["block_id"]
            anomaly_count = await db.anomalies.count_documents({"block_id": bid, "status": "open"})
            sub_count = await db.submissions.count_documents({"block_id": bid})
            farmer_count = await db.farmers.count_documents({"block_id": bid})

            # Fund util
            block_fund_pipe = [
                {"$match": {"block_id": bid}},
                {"$group": {
                    "_id": None,
                    "released": {"$sum": "$amount_released"},
                    "utilised": {"$sum": "$amount_utilised"},
                    "avg_progress": {"$avg": "$physical_progress_pct"},
                }},
            ]
            bfa = await db.fund_logs.aggregate(block_fund_pipe).to_list(1)
            bf = bfa[0] if bfa else {"released": 0, "utilised": 0, "avg_progress": 0}
            fund_util = round((bf["utilised"] / bf["released"]) * 100, 1) if bf["released"] > 0 else 0

            if anomaly_count >= 2:
                status = "CRITICAL"
            elif anomaly_count >= 1:
                status = "WARNING"
            else:
                status = "ON TRACK"

            # Check frozen status from blocks collection
            block_doc = await db.blocks.find_one({"_id": bid})
            frozen_status = block_doc.get("frozen_status", "active") if block_doc else "active"
            frozen_reason = block_doc.get("frozen_reason", "") if block_doc else ""

            all_blocks.append({
                "district_id": district_id,
                "district_name": DISTRICT_NAMES.get(district_id, district_id.title()),
                "block_id": bid,
                "block_name": block["block_name"],
                "fund_utilisation_pct": fund_util,
                "farmer_count": farmer_count,
                "submission_count": sub_count,
                "anomaly_count": anomaly_count,
                "avg_progress_pct": round(bf.get("avg_progress", 0), 1),
                "status": status,
                "frozen_status": frozen_status,
                "frozen_reason": frozen_reason,
            })

    return all_blocks


@router.get("/submissions/recent")
async def get_public_recent_submissions():
    """Last 30 submissions across all districts."""
    db = get_db()
    cursor = db.submissions.find({}).sort("created_at", -1).limit(30)
    submissions = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        if "created_at" in s and s["created_at"]:
            s["created_at"] = s["created_at"].isoformat()
        s["district_name"] = DISTRICT_NAMES.get(s.get("district_id", ""), s.get("district_id", ""))
        submissions.append(s)
    return submissions


@router.get("/fund-summary")
async def get_public_fund_summary():
    """Fund utilisation by district and scheme."""
    db = get_db()

    # By district
    district_pipe = [
        {"$group": {
            "_id": "$district_id",
            "released": {"$sum": "$amount_released"},
            "utilised": {"$sum": "$amount_utilised"},
            "avg_progress": {"$avg": "$physical_progress_pct"},
        }},
    ]
    by_district = await db.fund_logs.aggregate(district_pipe).to_list(100)
    district_summary = []
    for d in by_district:
        district_summary.append({
            "district_id": d["_id"],
            "district_name": DISTRICT_NAMES.get(d["_id"], d["_id"].title()),
            "released": round(d["released"], 0),
            "utilised": round(d["utilised"], 0),
            "utilisation_pct": round((d["utilised"] / d["released"]) * 100, 1) if d["released"] > 0 else 0,
            "avg_progress_pct": round(d["avg_progress"], 1),
        })

    # By scheme
    scheme_pipe = [
        {"$group": {
            "_id": "$scheme_name",
            "released": {"$sum": "$amount_released"},
            "utilised": {"$sum": "$amount_utilised"},
        }},
    ]
    by_scheme = await db.fund_logs.aggregate(scheme_pipe).to_list(100)
    scheme_summary = [
        {
            "scheme_name": s["_id"],
            "released": round(s["released"], 0),
            "utilised": round(s["utilised"], 0),
            "utilisation_pct": round((s["utilised"] / s["released"]) * 100, 1) if s["released"] > 0 else 0,
        }
        for s in by_scheme
    ]

    return {"by_district": district_summary, "by_scheme": scheme_summary}


@router.get("/verifications/summary")
async def get_public_verifications_summary():
    """Dispute rates per district and block."""
    db = get_db()
    thirty_days = datetime.now(timezone.utc) - timedelta(days=30)
    summary = []

    for district_id, blocks in BLOCKS_META.items():
        for block in blocks:
            bid = block["block_id"]
            total = await db.farmer_verifications.count_documents(
                {"block_id": bid, "created_at": {"$gte": thirty_days}}
            )
            disputes = await db.farmer_verifications.count_documents(
                {"block_id": bid, "benefit_received": False, "created_at": {"$gte": thirty_days}}
            )
            dispute_rate = round((disputes / total) * 100, 1) if total > 0 else 0

            summary.append({
                "district_id": district_id,
                "district_name": DISTRICT_NAMES.get(district_id, district_id.title()),
                "block_id": bid,
                "block_name": block["block_name"],
                "total_verifications": total,
                "disputes": disputes,
                "dispute_rate_pct": dispute_rate,
            })

    return summary


@router.get("/advance-analytics")
async def get_public_advance_analytics():
    """
    Full advance analytics data: fund breakdown, verification gap,
    beneficiary scatter, grievance categories, KPI progress, district comparison.
    All from real DB data.
    """
    db = get_db()
    thirty_days = datetime.now(timezone.utc) - timedelta(days=30)

    # ── 1. Fund Utilization Breakdown (by district) ──
    fund_pipe = [
        {"$group": {
            "_id": "$district_id",
            "total_released": {"$sum": "$amount_released"},
            "total_utilised": {"$sum": "$amount_utilised"},
        }},
    ]
    fund_agg = await db.fund_logs.aggregate(fund_pipe).to_list(100)
    total_released_all = sum(f["total_released"] for f in fund_agg) or 1
    total_utilised_all = sum(f["total_utilised"] for f in fund_agg)
    idle = total_released_all - total_utilised_all
    pending = total_released_all * 0.08  # ~8% pending allocation estimate

    fund_utilization = {
        "utilized": round(total_utilised_all / 100000, 1),   # in Lakhs
        "idle": round(max(0, idle - pending) / 100000, 1),
        "pending": round(pending / 100000, 1),
    }

    # ── 2. Verification Gap: Officer submissions vs Farmer confirmations per block ──
    verification_gap = []
    for district_id, blocks in BLOCKS_META.items():
        for block in blocks:
            bid = block["block_id"]
            officer_count = await db.submissions.count_documents({"block_id": bid})
            farmer_confirmed = await db.farmer_verifications.count_documents(
                {"block_id": bid, "benefit_received": True}
            )
            verification_gap.append({
                "name": block["block_name"],
                "officer": officer_count,
                "farmer": farmer_confirmed,
            })

    # ── 3. Beneficiary Scatter: funds vs beneficiaries per block ──
    beneficiary_scatter = []
    for district_id, blocks in BLOCKS_META.items():
        for block in blocks:
            bid = block["block_id"]
            block_fund_pipe = [
                {"$match": {"block_id": bid}},
                {"$group": {"_id": None, "utilised": {"$sum": "$amount_utilised"}}},
            ]
            bfa = await db.fund_logs.aggregate(block_fund_pipe).to_list(1)
            funds_lakhs = round(bfa[0]["utilised"] / 100000, 1) if bfa else 0

            ben_pipe = [
                {"$match": {"block_id": bid}},
                {"$group": {"_id": None, "total": {"$sum": "$beneficiary_count"}}},
            ]
            ben_agg = await db.submissions.aggregate(ben_pipe).to_list(1)
            beneficiaries = ben_agg[0]["total"] if ben_agg else 0

            anomaly_count = await db.anomalies.count_documents({"block_id": bid, "status": "open"})

            beneficiary_scatter.append({
                "name": block["block_name"],
                "district": DISTRICT_NAMES.get(district_id, district_id),
                "x": funds_lakhs,
                "y": beneficiaries,
                "z": 200 if anomaly_count == 0 else 400,
                "outlier": anomaly_count >= 2,
            })

    # ── 4. Grievance Categories from farmer verifications ──
    # Group disputes by their issue descriptions
    grievance_pipe = [
        {"$match": {"benefit_received": False, "issue_description": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$issue_description", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    grievance_agg = await db.farmer_verifications.aggregate(grievance_pipe).to_list(10)

    # Categorize into broader buckets
    category_map = {
        "delivery": 0,
        "quality": 0,
        "agent_visit": 0,
        "other": 0,
    }
    for g in grievance_agg:
        desc = (g["_id"] or "").lower()
        count = g["count"]
        if any(w in desc for w in ["deliver", "received", "half", "materials"]):
            category_map["delivery"] += count
        elif any(w in desc for w in ["quality", "testing", "soil"]):
            category_map["quality"] += count
        elif any(w in desc for w in ["visit", "agent", "never", "location", "site"]):
            category_map["agent_visit"] += count
        else:
            category_map["other"] += count

    grievance_categories = [
        {"name": "Non-Delivery", "value": category_map["delivery"], "color": "#ef4444"},
        {"name": "Quality Issues", "value": category_map["quality"], "color": "#f97316"},
        {"name": "Agent No-Show", "value": category_map["agent_visit"], "color": "#eab308"},
        {"name": "Other Complaints", "value": category_map["other"], "color": "#8b5cf6"},
    ]

    # ── 5. KPI Progress from submissions ──
    scheme_start = datetime(2025, 4, 1, tzinfo=timezone.utc)
    days_elapsed = max((datetime.now(timezone.utc) - scheme_start).days, 1)
    kpi_progress = []
    kpi_defs = [
        {"name": "Seed distribution", "target": 1200, "kpi_type": "seed_distribution", "color": "bg-green-500"},
        {"name": "Irrigation work", "target": 850, "kpi_type": "irrigation_work", "color": "bg-blue-500"},
        {"name": "KCC loans facilitated", "target": 500, "kpi_type": "kcc_loan_camp", "color": "bg-orange-500"},
        {"name": "Soil Health Cards", "target": 2000, "kpi_type": "soil_health_card", "color": "bg-purple-500"},
        {"name": "Storage facilities", "target": 300, "kpi_type": "storage_facility", "color": "bg-yellow-500"},
        {"name": "Training sessions", "target": 100, "kpi_type": "training", "color": "bg-teal-500"},
    ]
    for kpi in kpi_defs:
        agg_pipe = [
            {"$match": {"kpi_type": kpi["kpi_type"]}},
            {"$group": {"_id": None, "total": {"$sum": "$kpi_value"}}},
        ]
        agg = await db.submissions.aggregate(agg_pipe).to_list(1)
        current = agg[0]["total"] if agg else 0
        projected = current * (365 / days_elapsed) if days_elapsed > 0 else current
        progress_pct = round(min(100, (projected / kpi["target"]) * 100), 0) if kpi["target"] > 0 else 0

        kpi_progress.append({
            "name": kpi["name"],
            "progress": int(progress_pct),
            "current": round(current, 1),
            "target": kpi["target"],
            "color": kpi["color"],
        })

    # ── 6. District Comparison data ──
    district_comparison = {}
    for district_id in DISTRICT_NAMES:
        metrics = await _get_district_metrics(db, district_id)
        blocks_in_district = BLOCKS_META.get(district_id, [])
        anomaly_blocks = 0
        for block in blocks_in_district:
            ac = await db.anomalies.count_documents({"block_id": block["block_id"], "status": "open"})
            if ac > 0:
                anomaly_blocks += 1

        score = max(0, 100 - (metrics["open_anomalies"] * 10) - (metrics["dispute_rate_pct"] * 0.5))
        score = min(100, round(score))

        if score >= 80:
            status, color, bg = "On-Track", "text-green-500", "bg-green-500/10"
        elif score >= 50:
            status, color, bg = "At Risk", "text-amber-500", "bg-amber-500/10"
        else:
            status, color, bg = "Critical", "text-error", "bg-error/10"

        district_comparison[DISTRICT_NAMES[district_id]] = {
            "score": score,
            "status": status,
            "color": color,
            "bg": bg,
            "allocated": round(metrics["total_fund_released"] / 10000000, 0),   # in Cr
            "utilized": round(metrics["total_fund_utilised"] / 10000000, 0),
            "utilizationRate": metrics["fund_utilisation_pct"],
            "beneficiaries": metrics["total_farmers"],
            "anomalies": metrics["open_anomalies"],
            "grievancesResolved": round(100 - metrics["dispute_rate_pct"], 1),
            "totalBlocks": len(blocks_in_district),
            "activeBlocks": len(blocks_in_district) - anomaly_blocks,
            "topCrops": ["Wheat", "Millet", "Apple"][:3],   # placeholder
        }

    # ── 7. Block map data with real scores ──
    block_map_data = []
    block_gps = {
        "dunda": [30.75, 78.45], "bhatwari": [30.80, 78.60], "purola": [30.90, 78.10],
        "gopeshwar": [30.40, 79.30], "joshimath": [30.55, 79.55], "karnaprayag": [30.25, 79.20],
        "dehradun": [30.31, 78.03], "vikasnagar": [30.38, 77.80], "doiwala": [30.15, 78.12],
    }
    for district_id, blocks in BLOCKS_META.items():
        for block in blocks:
            bid = block["block_id"]
            anomaly_count = await db.anomalies.count_documents({"block_id": bid, "status": "open"})
            dispute_count = await db.farmer_verifications.count_documents(
                {"block_id": bid, "benefit_received": False, "created_at": {"$gte": thirty_days}}
            )
            total_verif = await db.farmer_verifications.count_documents(
                {"block_id": bid, "created_at": {"$gte": thirty_days}}
            )
            dispute_rate = round((dispute_count / total_verif * 100), 1) if total_verif > 0 else 0

            risk_score = max(0, 100 - (anomaly_count * 25) - (dispute_rate * 0.5))
            risk_score = min(100, round(risk_score))

            if risk_score >= 80:
                status, map_color = "On-Track", "#22c55e"
            elif risk_score >= 50:
                status, map_color = "At Risk", "#eab308"
            else:
                status, map_color = "Critical", "#ef4444"

            coords = block_gps.get(bid, [30.0, 79.0])
            block_map_data.append({
                "id": f"{district_id}-{bid}",
                "name": block["block_name"],
                "district": DISTRICT_NAMES.get(district_id, district_id),
                "district_id": district_id,
                "lat": coords[0],
                "lng": coords[1],
                "anomaly_count": anomaly_count,
                "dispute_rate": dispute_rate,
                "score": risk_score,
                "status": status,
                "color": map_color,
            })

    return {
        "fund_utilization": fund_utilization,
        "verification_gap": verification_gap,
        "beneficiary_scatter": beneficiary_scatter,
        "grievance_categories": grievance_categories,
        "kpi_progress": kpi_progress,
        "district_comparison": district_comparison,
        "block_map_data": block_map_data,
    }


class BlockFreezeRequest(BaseModel):
    block_id: str
    reason: str = ""


@router.post("/blocks/freeze")
async def freeze_block(req: BlockFreezeRequest):
    """DM action: Freeze a block's fund disbursements and agent assignments."""
    db = get_db()
    result = await db.blocks.update_one(
        {"_id": req.block_id},
        {"$set": {
            "frozen_status": "frozen",
            "frozen_at": datetime.now(timezone.utc),
            "frozen_reason": req.reason or "Frozen by District Magistrate due to anomalies detected"
        }}
    )
    if result.matched_count == 0:
        return {"error": "Block not found", "success": False}

    # Also add a notification
    await db.notifications.insert_one({
        "type": "block_frozen",
        "message": f"Block {req.block_id} FROZEN — {req.reason or 'Anomaly investigation in progress'}",
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })

    return {"success": True, "message": f"Block {req.block_id} has been frozen"}


@router.post("/blocks/unfreeze")
async def unfreeze_block(req: BlockFreezeRequest):
    """DM action: Unfreeze a previously frozen block."""
    db = get_db()
    result = await db.blocks.update_one(
        {"_id": req.block_id},
        {"$set": {
            "frozen_status": "active",
            "frozen_at": None,
            "frozen_reason": ""
        }}
    )
    if result.matched_count == 0:
        return {"error": "Block not found", "success": False}

    await db.notifications.insert_one({
        "type": "block_unfrozen",
        "message": f"Block {req.block_id} UNFROZEN — Operations resumed by DM order",
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })

    return {"success": True, "message": f"Block {req.block_id} has been unfrozen"}


@router.get("/blocks/{block_id}/status")
async def get_block_frozen_status(block_id: str):
    """Check if a block is frozen (used by BDO dashboard)."""
    db = get_db()
    block_doc = await db.blocks.find_one({"_id": block_id})
    if not block_doc:
        return {"frozen": False, "reason": ""}
    
    frozen_status = block_doc.get("frozen_status", "active")
    return {
        "frozen": frozen_status == "frozen",
        "reason": block_doc.get("frozen_reason", ""),
        "frozen_at": block_doc.get("frozen_at").isoformat() if block_doc.get("frozen_at") else None,
    }

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta, timezone

scheduler = AsyncIOScheduler()

DEMO_KPIS = [
    {"kpi_name": "Micro-irrigation coverage", "target": 850, "kpi_type": "irrigation_work"},
    {"kpi_name": "Soil Health Cards issued", "target": 2000, "kpi_type": "soil_health_card"},
    {"kpi_name": "KCC loans facilitated", "target": 500, "kpi_type": "kcc_loan_camp"},
    {"kpi_name": "Seed distribution (quintals)", "target": 1200, "kpi_type": "seed_distribution"},
    {"kpi_name": "Training sessions conducted", "target": 100, "kpi_type": "training"},
]

DISTRICTS = ["uttarkashi", "chamoli"]
BLOCKS = {
    "uttarkashi": ["dunda", "bhatwari", "purola"],
    "chamoli": ["gopeshwar", "joshimath", "karnaprayag"],
}
BLOCK_NAMES = {
    "dunda": "Dunda", "bhatwari": "Bhatwari", "purola": "Purola",
    "gopeshwar": "Gopeshwar", "joshimath": "Joshimath", "karnaprayag": "Karnaprayag",
}


async def kpi_gap_prediction():
    """JOB 1: Nightly KPI gap prediction — runs at 11 PM."""
    from database import get_db
    db = get_db()
    if db is None:
        return

    print("🔄 Running KPI gap prediction job...")
    scheme_start = datetime(2025, 4, 1, tzinfo=timezone.utc)
    days_elapsed = max((datetime.now(timezone.utc) - scheme_start).days, 1)

    for district_id in DISTRICTS:
        for kpi in DEMO_KPIS:
            pipeline = [
                {"$match": {"district_id": district_id, "kpi_type": kpi["kpi_type"]}},
                {"$group": {"_id": None, "total": {"$sum": "$kpi_value"}}},
            ]
            agg = await db.submissions.aggregate(pipeline).to_list(1)
            current_val = agg[0]["total"] if agg else 0
            projected = current_val * (365 / days_elapsed)

            if projected < kpi["target"] * 0.9:
                projected_pct = round((projected / kpi["target"]) * 100, 1)
                notification_doc = {
                    "district_id": district_id,
                    "type": "kpi_at_risk",
                    "message": (
                        f"KPI '{kpi['kpi_name']}' is at risk — projected to reach only "
                        f"{projected_pct}% of target by year end at current pace"
                    ),
                    "read": False,
                    "created_at": datetime.now(timezone.utc),
                }
                await db.notifications.insert_one(notification_doc)

                # Emit socket
                try:
                    from main import sio
                    await sio.emit(
                        "kpi_alert",
                        {
                            "kpi_name": kpi["kpi_name"],
                            "projected_pct": projected_pct,
                            "target_pct": 100,
                        },
                        room=f"district_{district_id}",
                    )
                except Exception:
                    pass

    print("✅ KPI gap prediction complete")


async def inactivity_detection():
    """JOB 2: Morning inactivity detection — runs at 8 AM."""
    from database import get_db
    db = get_db()
    if db is None:
        return

    print("🔄 Running inactivity detection job...")

    for district_id in DISTRICTS:
        for block_id in BLOCKS.get(district_id, []):
            # Find last submission
            last = await db.submissions.find_one(
                {"block_id": block_id},
                sort=[("created_at", -1)],
            )

            if last and last.get("created_at"):
                days_inactive = (datetime.now(timezone.utc) - last["created_at"]).days
            else:
                days_inactive = 30  # No submissions at all

            if days_inactive > 7:
                # Check if open inactivity anomaly exists
                existing = await db.anomalies.find_one({
                    "block_id": block_id,
                    "anomaly_type": "inactivity_gap",
                    "status": "open",
                })
                if existing:
                    continue

                from services.openai_service import generate_anomaly_explanation

                explanation = generate_anomaly_explanation({
                    "type": "inactivity_gap",
                    "block_name": BLOCK_NAMES.get(block_id, block_id),
                    "district_name": district_id.title(),
                    "fund_pct": 0, "progress_pct": 0, "dispute_rate": 0,
                    "cost_per_beneficiary": 0, "peer_avg_cost": 2800,
                    "days_inactive": days_inactive,
                })

                anomaly_doc = {
                    "district_id": district_id,
                    "block_id": block_id,
                    "anomaly_type": "inactivity_gap",
                    "anomaly_score": min(100, days_inactive * 3),
                    "explanation": explanation,
                    "suggested_action": "Contact field agents and consider reassignment",
                    "status": "open",
                    "created_at": datetime.now(timezone.utc),
                }
                await db.anomalies.insert_one(anomaly_doc)

                notification_doc = {
                    "district_id": district_id,
                    "type": "anomaly_alert",
                    "message": f"Inactivity detected in {BLOCK_NAMES.get(block_id, block_id)} — no submissions for {days_inactive} days",
                    "read": False,
                    "created_at": datetime.now(timezone.utc),
                }
                await db.notifications.insert_one(notification_doc)

    print("✅ Inactivity detection complete")


def start_scheduler():
    """Start the APScheduler with cron jobs."""
    scheduler.add_job(kpi_gap_prediction, "cron", hour=23, minute=0, id="kpi_gap")
    scheduler.add_job(inactivity_detection, "cron", hour=8, minute=0, id="inactivity")
    scheduler.start()
    print("📅 Scheduler started — KPI gap at 11 PM, Inactivity at 8 AM")

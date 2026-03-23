from database import get_db
from datetime import datetime, timedelta, timezone
from services.openai_service import generate_anomaly_explanation
from services.isolation_forest import score_submission

BLOCK_NAMES = {
    "dunda": "Dunda",
    "bhatwari": "Bhatwari",
    "purola": "Purola",
    "gopeshwar": "Gopeshwar",
    "joshimath": "Joshimath",
    "karnaprayag": "Karnaprayag",
}

DISTRICT_NAMES = {
    "uttarkashi": "Uttarkashi",
    "chamoli": "Chamoli",
}


async def run_anomaly_checks(block_id: str, district_id: str, submission_id: str = None):
    """Run all anomaly checks for a block after new submission or fund log."""
    db = get_db()
    if db is None:
        return

    try:
        # Run Isolation Forest scoring if we have a submission
        if submission_id:
            await _score_with_isolation_forest(db, block_id, district_id, submission_id)

        # Rule-based checks
        await _check_fund_vs_progress(db, block_id, district_id)
        await check_dispute_rate(block_id, district_id)
        await _check_cost_outlier(db, block_id, district_id)

    except Exception as e:
        print(f"Anomaly engine error: {e}")


async def _score_with_isolation_forest(db, block_id: str, district_id: str, submission_id: str):
    """Score a submission using the Isolation Forest model."""
    try:
        from bson import ObjectId

        submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
        if not submission:
            return

        # Gather block-level data for feature extraction
        fund_pipeline = [
            {"$match": {"block_id": block_id}},
            {
                "$group": {
                    "_id": None,
                    "avg_fund": {"$avg": "$amount_released"},
                    "avg_utilised": {"$avg": "$amount_utilised"},
                    "avg_progress": {"$avg": "$physical_progress_pct"},
                }
            },
        ]
        fund_agg = await db.fund_logs.aggregate(fund_pipeline).to_list(1)
        fund_data = fund_agg[0] if fund_agg else {}

        total_utilised = fund_data.get("avg_utilised", 0)
        total_beneficiaries = submission.get("beneficiary_count", 1) or 1

        # Get days since last submission
        prev_submission = await db.submissions.find_one(
            {"block_id": block_id, "_id": {"$ne": ObjectId(submission_id)}},
            sort=[("created_at", -1)],
        )
        days_since = 0
        if prev_submission and prev_submission.get("created_at"):
            delta = datetime.now(timezone.utc) - prev_submission["created_at"]
            days_since = delta.days

        # Get dispute count
        thirty_days = datetime.now(timezone.utc) - timedelta(days=30)
        disputes = await db.farmer_verifications.count_documents(
            {"block_id": block_id, "benefit_received": False, "created_at": {"$gte": thirty_days}}
        )

        feature_data = {
            "fund_released_pct": fund_data.get("avg_fund", 50) / 100 * 100 if fund_data.get("avg_fund") else 50,
            "physical_progress_pct": submission.get("completion_percentage", 50),
            "beneficiary_disputes": disputes,
            "days_since_last_submission": days_since,
            "cost_per_beneficiary": total_utilised / total_beneficiaries if total_beneficiaries else 2800,
            "peer_avg_cost": 2800,
        }

        anomaly_score, is_anomaly = score_submission(feature_data)

        await db.submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {"anomaly_score": anomaly_score, "is_anomaly": is_anomaly}},
        )

    except Exception as e:
        print(f"IF scoring error: {e}")


async def _check_fund_vs_progress(db, block_id: str, district_id: str):
    """CHECK 1: Fund utilisation vs physical progress gap."""
    fund_pipeline = [
        {"$match": {"block_id": block_id}},
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
    if not fund_agg:
        return

    fund = fund_agg[0]
    fund_util_pct = (fund["total_utilised"] / fund["total_released"] * 100) if fund["total_released"] > 0 else 0

    sub_pipeline = [
        {"$match": {"block_id": block_id}},
        {"$group": {"_id": None, "avg_completion": {"$avg": "$completion_percentage"}}},
    ]
    sub_agg = await db.submissions.aggregate(sub_pipeline).to_list(1)
    avg_completion = sub_agg[0]["avg_completion"] if sub_agg else 0

    gap = fund_util_pct - avg_completion
    if gap > 20:
        score = min(100, gap * 2)

        # Check if similar anomaly already exists (open)
        existing = await db.anomalies.find_one({
            "block_id": block_id,
            "anomaly_type": "fund_ahead_of_progress",
            "status": "open",
        })
        if existing:
            return

        explanation = generate_anomaly_explanation({
            "type": "fund_ahead_of_progress",
            "block_name": BLOCK_NAMES.get(block_id, block_id),
            "district_name": DISTRICT_NAMES.get(district_id, district_id),
            "fund_pct": round(fund_util_pct, 1),
            "progress_pct": round(avg_completion, 1),
            "dispute_rate": 0,
            "cost_per_beneficiary": 0,
            "peer_avg_cost": 2800,
            "days_inactive": 0,
        })

        await _create_anomaly(db, district_id, block_id, "fund_ahead_of_progress", score, explanation)


async def check_dispute_rate(block_id: str, district_id: str):
    """CHECK 2: Farmer dispute rate exceeds 15%."""
    db = get_db()
    if db is None:
        return

    thirty_days = datetime.now(timezone.utc) - timedelta(days=30)
    total = await db.farmer_verifications.count_documents(
        {"block_id": block_id, "created_at": {"$gte": thirty_days}}
    )
    if total == 0:
        return

    disputes = await db.farmer_verifications.count_documents(
        {"block_id": block_id, "benefit_received": False, "created_at": {"$gte": thirty_days}}
    )
    dispute_rate = disputes / total

    if dispute_rate > 0.15:
        score = min(100, dispute_rate * 300)

        existing = await db.anomalies.find_one({
            "block_id": block_id,
            "anomaly_type": "high_dispute_rate",
            "status": "open",
        })
        if existing:
            return

        explanation = generate_anomaly_explanation({
            "type": "high_dispute_rate",
            "block_name": BLOCK_NAMES.get(block_id, block_id),
            "district_name": DISTRICT_NAMES.get(district_id, district_id),
            "fund_pct": 0,
            "progress_pct": 0,
            "dispute_rate": round(dispute_rate * 100, 1),
            "cost_per_beneficiary": 0,
            "peer_avg_cost": 2800,
            "days_inactive": 0,
        })

        await _create_anomaly(db, district_id, block_id, "high_dispute_rate", score, explanation)


async def _check_cost_outlier(db, block_id: str, district_id: str):
    """CHECK 3: Cost per beneficiary outlier vs peers."""
    # Get all blocks in same district
    blocks_pipeline = [
        {"$match": {"district_id": district_id}},
        {
            "$group": {
                "_id": "$block_id",
                "total_utilised": {"$sum": "$amount_utilised"},
            }
        },
    ]
    block_funds = await db.fund_logs.aggregate(blocks_pipeline).to_list(100)

    costs = {}
    for bf in block_funds:
        bid = bf["_id"]
        total_beneficiaries_pipeline = [
            {"$match": {"block_id": bid}},
            {"$group": {"_id": None, "total": {"$sum": "$beneficiary_count"}}},
        ]
        ben_agg = await db.submissions.aggregate(total_beneficiaries_pipeline).to_list(1)
        total_ben = ben_agg[0]["total"] if ben_agg else 0
        if total_ben > 0:
            costs[bid] = bf["total_utilised"] / total_ben

    if len(costs) < 2 or block_id not in costs:
        return

    import numpy as np

    values = list(costs.values())
    avg_cost = np.mean(values)
    std_cost = np.std(values)

    if std_cost > 0 and costs[block_id] > avg_cost + 2 * std_cost:
        existing = await db.anomalies.find_one({
            "block_id": block_id,
            "anomaly_type": "cost_outlier",
            "status": "open",
        })
        if existing:
            return

        explanation = generate_anomaly_explanation({
            "type": "cost_outlier",
            "block_name": BLOCK_NAMES.get(block_id, block_id),
            "district_name": DISTRICT_NAMES.get(district_id, district_id),
            "fund_pct": 0,
            "progress_pct": 0,
            "dispute_rate": 0,
            "cost_per_beneficiary": round(costs[block_id], 0),
            "peer_avg_cost": round(avg_cost, 0),
            "days_inactive": 0,
        })

        await _create_anomaly(db, district_id, block_id, "cost_outlier", 75, explanation)


async def _create_anomaly(db, district_id, block_id, anomaly_type, score, explanation):
    """Create an anomaly record and emit Socket.IO notification."""
    anomaly_doc = {
        "district_id": district_id,
        "block_id": block_id,
        "anomaly_type": anomaly_type,
        "anomaly_score": round(score, 1),
        "explanation": explanation,
        "suggested_action": _get_suggested_action(anomaly_type),
        "status": "open",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.anomalies.insert_one(anomaly_doc)
    anomaly_id = str(result.inserted_id)

    # Create notification
    notification_doc = {
        "district_id": district_id,
        "type": "anomaly_alert",
        "message": f"New {anomaly_type.replace('_', ' ')} anomaly detected in {BLOCK_NAMES.get(block_id, block_id)} (Score: {round(score, 1)})",
        "read": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.notifications.insert_one(notification_doc)

    # Emit socket event
    try:
        from main import sio

        await sio.emit(
            "new_anomaly",
            {
                "anomaly_id": anomaly_id,
                "block_name": BLOCK_NAMES.get(block_id, block_id),
                "type": anomaly_type,
                "score": round(score, 1),
                "explanation": explanation,
            },
            room=f"district_{district_id}",
        )
    except Exception as e:
        print(f"Socket emit error: {e}")


def _get_suggested_action(anomaly_type: str) -> str:
    actions = {
        "fund_ahead_of_progress": "Freeze fund releases and schedule physical verification",
        "high_dispute_rate": "Deploy independent verification team within 48 hours",
        "cost_outlier": "Audit vendor contracts and verify material delivery",
        "inactivity_gap": "Contact field agents and consider reassignment",
        "location_mismatch": "Cross-verify agent submissions with site conditions",
    }
    return actions.get(anomaly_type, "Review and investigate")

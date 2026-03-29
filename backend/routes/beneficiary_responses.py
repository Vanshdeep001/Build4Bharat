"""
API endpoints to query beneficiary responses from WhatsApp confirmations.
Used by DM/BDO dashboards to view confirmation stats.
"""

from fastapi import APIRouter, Depends, Query
from database import get_db
from middleware.auth_middleware import get_current_user, require_role
from typing import Optional

router = APIRouter(prefix="/api/beneficiary-responses", tags=["beneficiary-responses"])


@router.get("")
async def list_responses(
    district_id: Optional[str] = Query(None),
    block_id: Optional[str] = Query(None),
    response_filter: Optional[str] = Query(None, alias="response"),
    current_user: dict = Depends(get_current_user),
):
    """
    List all beneficiary responses.
    Optional filters: district_id, block_id, response (yes/no).
    """
    db = get_db()

    query = {}
    if response_filter and response_filter in ("yes", "no"):
        query["response"] = response_filter

    # If filtering by district/block, join with submissions
    if district_id or block_id:
        # Get relevant submission IDs first
        sub_query = {}
        if district_id:
            sub_query["district_id"] = district_id
        if block_id:
            sub_query["block_id"] = block_id

        sub_ids = []
        async for sub in db.submissions.find(sub_query, {"_id": 1}):
            sub_ids.append(str(sub["_id"]))

        query["submission_id"] = {"$in": sub_ids}

    cursor = db.beneficiary_responses.find(query).sort("created_at", -1).limit(200)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)

    return results


@router.get("/stats")
async def response_stats(
    district_id: Optional[str] = Query(None),
    block_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """
    Aggregate stats: total sent, total responded, yes count, no count, pending.
    """
    db = get_db()

    match_stage = {}
    if district_id or block_id:
        sub_query = {}
        if district_id:
            sub_query["district_id"] = district_id
        if block_id:
            sub_query["block_id"] = block_id

        sub_ids = []
        async for sub in db.submissions.find(sub_query, {"_id": 1}):
            sub_ids.append(str(sub["_id"]))
        match_stage["submission_id"] = {"$in": sub_ids}

    pipeline = [
        {"$match": match_stage} if match_stage else {"$match": {}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "yes_count": {
                    "$sum": {"$cond": [{"$eq": ["$response", "yes"]}, 1, 0]}
                },
                "no_count": {
                    "$sum": {"$cond": [{"$eq": ["$response", "no"]}, 1, 0]}
                },
                "pending_count": {
                    "$sum": {"$cond": [{"$eq": ["$response", None]}, 1, 0]}
                },
            }
        },
    ]

    result = await db.beneficiary_responses.aggregate(pipeline).to_list(length=1)

    if result:
        stats = result[0]
        stats.pop("_id", None)
        responded = stats["yes_count"] + stats["no_count"]
        stats["responded"] = responded
        stats["confirmation_rate"] = (
            round((stats["yes_count"] / responded) * 100, 1) if responded > 0 else 0
        )
        return stats

    return {
        "total": 0,
        "yes_count": 0,
        "no_count": 0,
        "pending_count": 0,
        "responded": 0,
        "confirmation_rate": 0,
    }


@router.get("/submission/{submission_id}")
async def get_response_for_submission(
    submission_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get the beneficiary response for a specific submission."""
    db = get_db()
    doc = await db.beneficiary_responses.find_one({"submission_id": submission_id})
    if doc:
        doc["_id"] = str(doc["_id"])
        return doc
    return {"submission_id": submission_id, "response": None, "status": "not_sent"}

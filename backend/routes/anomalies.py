from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models.anomaly import AnomalyStatusUpdate
from middleware.auth_middleware import require_role
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])


@router.get("/district/{district_id}")
async def get_anomalies_by_district(
    district_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.anomalies.find({"district_id": district_id}).sort("anomaly_score", -1)
    anomalies = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        anomalies.append(a)
    return anomalies


@router.get("/block/{block_id}")
async def get_anomalies_by_block(
    block_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.anomalies.find({"block_id": block_id}).sort("anomaly_score", -1)
    anomalies = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        anomalies.append(a)
    return anomalies


@router.patch("/{anomaly_id}/status")
async def update_anomaly_status(
    anomaly_id: str,
    data: AnomalyStatusUpdate,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()

    update_fields = {
        "status": data.status,
        "reviewed_by": current_user.get("user_id", ""),
    }
    if data.status == "resolved":
        update_fields["resolved_at"] = datetime.now(timezone.utc)
    if data.note:
        update_fields["review_note"] = data.note

    try:
        result = await db.anomalies.update_one(
            {"_id": ObjectId(anomaly_id)}, {"$set": update_fields}
        )
    except Exception:
        result = await db.anomalies.update_one(
            {"_id": anomaly_id}, {"$set": update_fields}
        )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    return {"message": f"Anomaly status updated to {data.status}"}

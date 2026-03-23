from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from middleware.auth_middleware import get_current_user
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user.get("user_id", "")
    district_id = current_user.get("district_id", "")

    # Get notifications for this user or their district
    query = {
        "$or": [
            {"user_id": user_id},
            {"district_id": district_id, "user_id": None},
            {"district_id": district_id, "user_id": {"$exists": False}},
        ]
    }
    cursor = db.notifications.find(query).sort("created_at", -1).limit(50)
    notifications = []
    async for n in cursor:
        n["_id"] = str(n["_id"])
        notifications.append(n)
    return notifications


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    try:
        result = await db.notifications.update_one(
            {"_id": ObjectId(notification_id)}, {"$set": {"read": True}}
        )
    except Exception:
        result = await db.notifications.update_one(
            {"_id": notification_id}, {"$set": {"read": True}}
        )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"message": "Marked as read"}

from fastapi import APIRouter, Depends
from database import get_db
from models.verification import VerificationCreate
from middleware.auth_middleware import require_role
from datetime import datetime, timezone
import asyncio

router = APIRouter(prefix="/api/verifications", tags=["verifications"])


@router.post("")
async def create_verification(data: VerificationCreate):
    """Public endpoint — no auth required. Farmer verification form."""
    db = get_db()
    verification_doc = {
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.farmer_verifications.insert_one(verification_doc)

    # Check dispute rate and possibly create anomaly
    try:
        from services.anomaly_engine import check_dispute_rate

        asyncio.create_task(check_dispute_rate(data.block_id, data.district_id))
    except Exception as e:
        print(f"Dispute rate check error: {e}")

    # Emit socket event
    try:
        from main import sio

        await sio.emit(
            "new_verification",
            {
                "block_id": data.block_id,
                "benefit_received": data.benefit_received,
                "quality_rating": data.quality_rating,
                "channel": data.channel,
            },
            room=f"district_{data.district_id}",
        )
    except Exception as e:
        print(f"Socket emit error: {e}")

    return {"id": str(result.inserted_id), "message": "Verification submitted. Thank you!"}


@router.get("/block/{block_id}")
async def get_verifications_by_block(
    block_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.farmer_verifications.find({"block_id": block_id}).sort("created_at", -1)
    verifications = []
    async for v in cursor:
        v["_id"] = str(v["_id"])
        verifications.append(v)
    return verifications


@router.get("/district/{district_id}")
async def get_verifications_by_district(
    district_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.farmer_verifications.find({"district_id": district_id}).sort("created_at", -1)
    verifications = []
    async for v in cursor:
        v["_id"] = str(v["_id"])
        verifications.append(v)
    return verifications

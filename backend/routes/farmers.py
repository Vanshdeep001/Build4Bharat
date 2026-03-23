from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models.farmer import FarmerCreate
from middleware.auth_middleware import get_current_user, any_authenticated
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/api/farmers", tags=["farmers"])


@router.post("")
async def create_farmer(data: FarmerCreate, current_user: dict = Depends(any_authenticated)):
    db = get_db()
    farmer_doc = {
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.farmers.insert_one(farmer_doc)
    return {"id": str(result.inserted_id), "message": "Farmer registered"}


@router.get("/block/{block_id}")
async def get_farmers_by_block(block_id: str, current_user: dict = Depends(any_authenticated)):
    db = get_db()
    cursor = db.farmers.find({"block_id": block_id})
    farmers = []
    async for f in cursor:
        f["_id"] = str(f["_id"])
        farmers.append(f)
    return farmers


@router.get("/{farmer_id}")
async def get_farmer(farmer_id: str, current_user: dict = Depends(any_authenticated)):
    db = get_db()
    try:
        farmer = await db.farmers.find_one({"_id": ObjectId(farmer_id)})
    except Exception:
        farmer = await db.farmers.find_one({"_id": farmer_id})

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farmer["_id"] = str(farmer["_id"])
    return farmer

from fastapi import APIRouter, Depends
from database import get_db
from models.fund_log import FundLogCreate
from middleware.auth_middleware import require_role, get_current_user
from datetime import datetime, timezone
import asyncio

router = APIRouter(prefix="/api/fund-logs", tags=["fund_logs"])


@router.post("")
async def create_fund_log(
    data: FundLogCreate,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    fund_doc = {
        **data.model_dump(),
        "logged_by": current_user.get("user_id", ""),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.fund_logs.insert_one(fund_doc)

    # Trigger anomaly engine
    try:
        from services.anomaly_engine import run_anomaly_checks

        asyncio.create_task(run_anomaly_checks(data.block_id, data.district_id))
    except Exception as e:
        print(f"Anomaly engine trigger error: {e}")

    return {"id": str(result.inserted_id), "message": "Fund log created"}


@router.get("/district/{district_id}")
async def get_fund_logs_by_district(
    district_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.fund_logs.find({"district_id": district_id}).sort("created_at", -1)
    logs = []
    async for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
    return logs


@router.get("/block/{block_id}")
async def get_fund_logs_by_block(
    block_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.fund_logs.find({"block_id": block_id}).sort("created_at", -1)
    logs = []
    async for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
    return logs

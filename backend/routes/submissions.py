from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from database import get_db
from middleware.auth_middleware import get_current_user, require_role
from datetime import datetime, timezone
from bson import ObjectId
import hashlib
import asyncio
from typing import Optional

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("")
async def create_submission(
    district_id: str = Form(...),
    block_id: str = Form(...),
    village: str = Form(...),
    activity_type: str = Form(...),
    completion_percentage: float = Form(...),
    beneficiary_count: int = Form(...),
    project_gps_lat: Optional[float] = Form(None),
    project_gps_lng: Optional[float] = Form(None),
    kpi_value: Optional[float] = Form(None),
    kpi_type: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    farmer_id: Optional[str] = Form(None),
    farmer_name: Optional[str] = Form(None),
    work_description: Optional[str] = Form(None),
    task_status: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("field_agent", "district_admin", "state_admin")),
):
    db = get_db()

    photo_url = None
    photo_gps = None
    location_match = None
    location_distance_km = None

    if photo:
        try:
            from services.photo_service import process_field_photo

            photo_bytes = await photo.read()
            result = process_field_photo(photo_bytes, project_gps_lat, project_gps_lng)
            photo_url = result.get("photo_url")
            photo_gps = result.get("photo_gps")
            location_match = result.get("location_match")
            location_distance_km = result.get("distance_km")
        except Exception as e:
            print(f"Photo processing error: {e}")

    timestamp = datetime.now(timezone.utc)
    agent_id = current_user.get("user_id", "")
    raw = f"{agent_id}{block_id}{timestamp.isoformat()}{photo_url or ''}"
    submission_hash = hashlib.sha256(raw.encode()).hexdigest()

    project_gps = None
    if project_gps_lat is not None and project_gps_lng is not None:
        project_gps = {"lat": project_gps_lat, "lng": project_gps_lng}

    submission_doc = {
        "agent_id": agent_id,
        "farmer_id": farmer_id,
        "farmer_name": farmer_name,
        "district_id": district_id,
        "block_id": block_id,
        "village": village,
        "activity_type": activity_type,
        "completion_percentage": completion_percentage,
        "beneficiary_count": beneficiary_count,
        "materials_used": {},
        "work_description": work_description,
        "task_status": task_status,
        "photo_url": photo_url,
        "photo_gps": photo_gps,
        "project_gps": project_gps,
        "location_match": location_match,
        "location_distance_km": location_distance_km,
        "submission_hash": submission_hash,
        "kpi_value": kpi_value,
        "kpi_type": kpi_type,
        "notes": notes,
        "created_at": timestamp,
        "anomaly_score": 0,
        "is_anomaly": False,
    }

    result = await db.submissions.insert_one(submission_doc)
    submission_id = str(result.inserted_id)

    # Trigger anomaly engine async
    try:
        from services.anomaly_engine import run_anomaly_checks

        asyncio.create_task(run_anomaly_checks(block_id, district_id, submission_id=submission_id))
    except Exception as e:
        print(f"Anomaly engine trigger error: {e}")

    return {
        "id": submission_id,
        "submission_hash": submission_hash,
        "location_match": location_match,
        "location_distance_km": location_distance_km,
        "message": "Submission created successfully",
    }


@router.get("/agent")
async def get_agent_submissions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.submissions.find({"agent_id": current_user["user_id"]}).sort("created_at", -1)
    submissions = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        submissions.append(s)
    return submissions


@router.get("/district/{district_id}")
async def get_district_submissions(
    district_id: str,
    current_user: dict = Depends(require_role("district_admin", "state_admin")),
):
    db = get_db()
    cursor = db.submissions.find({"district_id": district_id}).sort("created_at", -1)
    submissions = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        submissions.append(s)
    return submissions


@router.get("/{submission_id}")
async def get_submission(submission_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    except Exception:
        submission = await db.submissions.find_one({"_id": submission_id})

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission["_id"] = str(submission["_id"])
    return submission

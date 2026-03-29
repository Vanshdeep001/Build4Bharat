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

    # Derive a normalized 'status' field for consistency with BDO dashboard queries
    if task_status == "completed" or completion_percentage >= 100:
        normalized_status = "completed"
    elif task_status == "in_progress" or (completion_percentage > 0 and completion_percentage < 100):
        normalized_status = "in_progress"
    else:
        normalized_status = "pending"

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
        "status": normalized_status,
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

    # Update agent stats (only increment completed when actually completed)
    try:
        if len(agent_id) == 24:
            update_fields = {"$set": {"last_active": timestamp}}
            if normalized_status == "completed":
                update_fields["$inc"] = {"completed_tasks": 1, "pending_tasks": -1}
            
            await db.field_agents.update_one(
                {"_id": ObjectId(agent_id)},
                update_fields
            )
    except Exception as e:
        print(f"Failed to update agent stats: {e}")

    # Emit socket event for BDO dashboard refresh (broadcast to ALL clients)
    try:
        from main import sio
        event_data = {
            "block_id": block_id,
            "district_id": district_id,
            "agent_id": agent_id,
            "submission_id": submission_id,
            "farmer_name": farmer_name,
            "status": normalized_status,
        }
        # Broadcast to everyone (covers clients not in a room)
        await sio.emit('new_visit_completed', event_data)
        # Also emit to the specific district room
        await sio.emit('new_visit_completed', event_data, room=f"district_{district_id}")
        print(f"✅ Socket emitted new_visit_completed for {farmer_name}")
    except Exception as e:
        print(f"Failed to emit socket event: {e}")

    # Trigger anomaly engine async
    try:
        from services.anomaly_engine import run_anomaly_checks

        asyncio.create_task(run_anomaly_checks(block_id, district_id, submission_id=submission_id))
    except Exception as e:
        print(f"Anomaly engine trigger error: {e}")

    # ── WhatsApp Beneficiary Confirmation ──────────────────────
    # Send interactive button message to the farmer asking if they received benefits
    try:
        farmer_phone = None
        if farmer_id:
            farmer_doc = await db.farmers.find_one({"_id": ObjectId(farmer_id)}, {"phone": 1, "name": 1})
            if farmer_doc:
                farmer_phone = farmer_doc.get("phone")
                farmer_name_resolved = farmer_doc.get("name", farmer_name or "Beneficiary")
            else:
                farmer_name_resolved = farmer_name or "Beneficiary"
        else:
            farmer_name_resolved = farmer_name or "Beneficiary"

        if farmer_phone:
            from services.whatsapp_service import send_beneficiary_confirmation
            asyncio.create_task(
                send_beneficiary_confirmation(
                    phone=farmer_phone,
                    farmer_name=farmer_name_resolved,
                    submission_id=submission_id,
                    farmer_id=farmer_id,
                )
            )
            print(f"📱 WhatsApp confirmation queued for {farmer_name_resolved} ({farmer_phone})")
        else:
            print(f"⚠️ No phone number found for farmer_id={farmer_id}, skipping WhatsApp")
    except Exception as e:
        print(f"WhatsApp trigger error: {e}")

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


@router.get("/agent/dashboard")
async def get_agent_dashboard(current_user: dict = Depends(get_current_user)):
    """
    Returns the field agent's assigned farmers with submission status.
    Uses the SAME logic as BDO /agents: classifies from actual submissions.
    """
    db = get_db()
    agent_id = current_user["user_id"]
    block_id = current_user.get("block_id", "")

    # 1. Get agent info
    agent_info = None
    if len(agent_id) == 24:
        try:
            agent_info = await db.field_agents.find_one({"_id": ObjectId(agent_id)})
        except Exception:
            pass

    assigned = agent_info.get("assigned_tasks", 10) if agent_info else 10

    # 2. Fetch ALL submissions by this agent (same as BDO)
    all_subs = await db.submissions.find({"agent_id": agent_id}).to_list(length=200)

    # Build submission map and classify
    sub_by_farmer = {}
    completed_farmer_ids = set()
    for s in all_subs:
        fid = s.get("farmer_id")
        if fid:
            sub_by_farmer[fid] = s
            if s.get("status") == "completed":
                completed_farmer_ids.add(fid)

    # 3. Get all block farmers, prioritizing explicitly assigned ones
    all_block_farmers = await db.farmers.find({"block_id": block_id}).to_list(length=200)
    all_block_farmers.sort(key=lambda f: 0 if f.get("assigned_agent_id") == agent_id else 1)

    # 4. Build completed farmer list
    completed_farmers = []
    for f in all_block_farmers:
        fid = str(f["_id"])
        if fid in completed_farmer_ids:
            completed_farmers.append({
                "id": fid,
                "name": f.get("name", "Unknown"),
                "village": f.get("village", "Unknown"),
                "status": "completed",
            })

    completed = len(completed_farmers)
    pending = max(0, assigned - completed)

    # 5. Build pending farmer list (capped at pending count)
    pending_farmers = []
    for f in all_block_farmers:
        fid = str(f["_id"])
        if fid not in completed_farmer_ids:
            pending_farmers.append({
                "id": fid,
                "name": f.get("name", "Unknown"),
                "village": f.get("village", "Unknown"),
                "status": "not_completed",
            })
        if len(pending_farmers) >= pending:
            break

    # 6. Combine: completed first, then pending
    all_assigned_farmers = completed_farmers + pending_farmers

    # 7. Activity type from submissions
    activity_types = set()
    for s in all_subs:
        at = s.get("activity_type")
        if at:
            activity_types.add(at)
    if not activity_types:
        activity_types = {"seed_distribution"}

    grouped = {}
    for at in activity_types:
        grouped[at] = {
            "farmers": all_assigned_farmers,
            "total": len(all_assigned_farmers),
            "completed": completed,
            "pending": len(pending_farmers),
        }

    # 8. Auto-sync agent doc counters to match reality
    if agent_info and (completed != agent_info.get("completed_tasks", 0) or pending != agent_info.get("pending_tasks", 0)):
        try:
            await db.field_agents.update_one(
                {"_id": agent_info["_id"]},
                {"$set": {"completed_tasks": completed, "pending_tasks": pending}}
            )
        except Exception:
            pass

    return {
        "agent": {
            "name": agent_info.get("name") if agent_info else current_user.get("name", "Agent"),
            "assigned_tasks": assigned,
            "completed_tasks": completed,
            "pending_tasks": pending,
        },
        "tasks": grouped,
        "total_farmers": len(all_assigned_farmers),
    }


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

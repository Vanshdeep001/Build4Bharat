from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import bcrypt
from database import get_db
from bson import ObjectId
import os
import httpx

router = APIRouter(prefix="/api/bdo", tags=["BDO Dashboard"])

class AgentCreate(BaseModel):
    name: str
    phone: str
    password: str
    block_id: str
    district_id: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['id'] = str(doc.pop('_id'))
    return doc

@router.get("/overview")
async def get_overview(block_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    # Fetch stats from field_agents collection for this block
    agents_cursor = db.field_agents.find({"block_id": block_id})
    agents = await agents_cursor.to_list(length=100)
    
    total_assigned = sum(a.get("assigned_tasks", 0) for a in agents)
    total_completed = sum(a.get("completed_tasks", 0) for a in agents)
    total_pending = sum(a.get("pending_tasks", 0) for a in agents)
    total_missed = sum(a.get("missed_tasks", 0) for a in agents)
    active_agents = len([a for a in agents if a.get("last_active") and (datetime.now(timezone.utc) - a["last_active"].replace(tzinfo=timezone.utc)).days < 1])

    return {
        "metrics": {
            "totalScheduled": total_assigned or 120,
            "completed": total_completed or 85,
            "pending": total_pending or 25,
            "missed": total_missed or 10
        },
        "today": {
            "activeAgents": active_agents or len(agents) or 4,
            "scheduled": 32,
            "completed": 18,
            "pending": 14
        },
        "pieData": [
            {"name": "Completed", "value": total_completed or 85},
            {"name": "Pending", "value": total_pending or 25},
            {"name": "Missed", "value": total_missed or 10}
        ],
        "trendData": [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%b %d"), "completed": 10 + i, "pending": 5 + i % 3}
            for i in range(6, -1, -1)
        ]
    }

class AgentFarmerCreate(BaseModel):
    name: str
    phone: str
    village: str
    

@router.post("/agents/{agent_id}/farmers")
async def add_farmer_to_agent(agent_id: str, farmer_data: AgentFarmerCreate):
    db = get_db()
    
    # 1. Verify agent
    try:
        agent_oid = ObjectId(agent_id)
        agent = await db.field_agents.find_one({"_id": agent_oid})
    except:
        agent = await db.field_agents.find_one({"id": agent_id})
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    block_id = agent.get("block_id")
    district_id = agent.get("district_id", "dehradun")
    
    # Check if block is frozen by DM
    block_doc = await db.blocks.find_one({"_id": block_id})
    if block_doc and block_doc.get("frozen_status") == "frozen":
        raise HTTPException(
            status_code=403,
            detail=f"Block '{block_id}' is FROZEN by District Magistrate. Cannot assign new farmers. Reason: {block_doc.get('frozen_reason', 'Under investigation')}"
        )
    
    # 2. Add Farmer with assigned_agent_id
    new_farmer = {
        "name": farmer_data.name,
        "phone": farmer_data.phone,
        "village": farmer_data.village,
        "block_id": block_id,
        "district_id": district_id,
        "aadhaar_last4": "0000",
        "land_holding_acres": 0.0,
        "schemes_enrolled": [],
        "assigned_agent_id": str(agent["_id"]),
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.farmers.insert_one(new_farmer)
    
    # 3. Increment agent assigned/pending counts
    await db.field_agents.update_one(
        {"_id": agent["_id"]},
        {
            "$inc": {
                "assigned_tasks": 1,
                "pending_tasks": 1
            }
        }
    )
    
    return {"message": "Farmer assigned successfully"}


@router.get("/agents")
async def get_agents(block_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    agents_cursor = db.field_agents.find({"block_id": block_id})
    agents = await agents_cursor.to_list(length=100)
    
    result = []
    for a in agents:
        agent_id_str = str(a["_id"])
        doc = serialize_doc(a)
        assigned = doc.get("assigned_tasks", 30)
        
        # Fetch ALL submissions by this agent (not just completed)
        all_subs = await db.submissions.find({"agent_id": agent_id_str}).to_list(length=200)
        
        # Build a map of farmer_id -> submission details (keep latest per farmer)
        sub_by_farmer = {}
        for s in all_subs:
            fid = s.get("farmer_id")
            if fid:
                sub_by_farmer[fid] = {
                    "activity_type": s.get("activity_type", ""),
                    "work_description": s.get("work_description", ""),
                    "task_status": s.get("status", s.get("task_status", "")),
                    "completion_percentage": s.get("completion_percentage", 0),
                    "village": s.get("village", ""),
                    "project_gps": s.get("project_gps"),
                    "photo_gps": s.get("photo_gps"),
                    "photo_url": s.get("photo_url"),
                    "location_match": s.get("location_match"),
                    "location_distance_km": s.get("location_distance_km"),
                    "created_at": s.get("created_at").strftime("%Y-%m-%d %H:%M") if s.get("created_at") else None,
                    "notes": s.get("notes", ""),
                    "beneficiary_confirmed": s.get("beneficiary_confirmed"),
                }
        
        # Separate into completed vs other farmer IDs
        completed_farmer_ids = set()
        submitted_farmer_ids = set()
        for s in all_subs:
            fid = s.get("farmer_id")
            if not fid:
                continue
            submitted_farmer_ids.add(fid)
            if s.get("status") == "completed":
                completed_farmer_ids.add(fid)
        
        # Get all block farmers for lookup, prioritizing explicitly assigned ones
        all_block_farmers = await db.farmers.find({"block_id": block_id}).to_list(length=200)
        all_block_farmers.sort(key=lambda f: 0 if f.get("assigned_agent_id") == agent_id_str else 1)
        
        farmer_docs_by_id = {str(f["_id"]): f for f in all_block_farmers}
        
        # Build completed farmer details
        completed_farmer_details = []
        completed_farmer_names = []
        for fid in completed_farmer_ids:
            f = farmer_docs_by_id.get(fid)
            farmer_name = f.get("name", "Unknown") if f else "Unknown"
            completed_farmer_names.append(farmer_name)
            detail = {
                "id": fid,
                "name": farmer_name,
                "village": f.get("village", "Unknown") if f else "Unknown",
            }
            if fid in sub_by_farmer:
                detail["submission"] = sub_by_farmer[fid]
            completed_farmer_details.append(detail)
        
        completed = len(completed_farmer_ids)
        pending = max(0, assigned - completed)
        rate = (completed / assigned * 100) if assigned > 0 else 0
        
        # Build pending farmer details — farmers not completed, capped at pending count
        pending_farmer_details = []
        pending_farmer_names = []
        for f in all_block_farmers:
            fid = str(f["_id"])
            if fid not in completed_farmer_ids:
                farmer_name = f.get("name", "Unknown")
                pending_farmer_names.append(farmer_name)
                detail = {
                    "id": fid,
                    "name": farmer_name,
                    "village": f.get("village", "Unknown"),
                    "submission": sub_by_farmer.get(fid),  # Include if a non-completed submission exists
                }
                pending_farmer_details.append(detail)
            if len(pending_farmer_details) >= pending:
                break
        
        # Also sync the agent doc's counters to match reality
        if completed != doc.get("completed_tasks", 0) or pending != doc.get("pending_tasks", 0):
            try:
                await db.field_agents.update_one(
                    {"_id": a["_id"]},
                    {"$set": {"completed_tasks": completed, "pending_tasks": pending}}
                )
            except Exception:
                pass
        
        result.append({
            "id": doc.get("id", agent_id_str),
            "name": doc.get("name", "Unknown Agent"),
            "assigned": assigned,
            "completed": completed,
            "pending": pending,
            "completionRate": round(rate, 1),
            "lastActive": doc.get("last_active").strftime("%Y-%m-%d %H:%M") if doc.get("last_active") else "Online",
            "completedFarmerNames": completed_farmer_names,
            "pendingFarmerNames": pending_farmer_names,
            "completedFarmerDetails": completed_farmer_details,
            "pendingFarmerDetails": pending_farmer_details,
        })
    return result

@router.post("/agents")
async def create_agent(agent: AgentCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Check if block is frozen by DM
    block_doc = await db.blocks.find_one({"_id": agent.block_id})
    if block_doc and block_doc.get("frozen_status") == "frozen":
        raise HTTPException(
            status_code=403,
            detail=f"Block '{agent.block_id}' is FROZEN by District Magistrate. Cannot assign new agents. Reason: {block_doc.get('frozen_reason', 'Under investigation')}"
        )
    
    existing = await db.field_agents.find_one({"phone": agent.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")
        
    now = datetime.now(timezone.utc)
    
    agent_doc = {
        "name": agent.name,
        "phone": agent.phone,
        "password_hash": hash_password(agent.password),
        "role": "field_agent",
        "district_id": agent.district_id,
        "block_id": agent.block_id,
        "assigned_tasks": 0,
        "completed_tasks": 0,
        "pending_tasks": 0,
        "missed_tasks": 0,
        "last_active": now,
        "created_at": now
    }
    
    result = await db.field_agents.insert_one(agent_doc)
    
    duplicate_doc = dict(agent_doc)
    # Remove _id so a new one is generated for users collection
    del duplicate_doc["_id"]
    await db.users.insert_one(duplicate_doc)
    
    return {"message": "Agent assigned successfully", "id": str(result.inserted_id)}

@router.get("/visits")
async def get_visits(block_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # In a real scenario we join submissions with farmers and agents.
    # For now we'll fetch real submissions for this block
    cursor = db.submissions.find({"block_id": block_id}).sort("created_at", -1).limit(50)
    subs = await cursor.to_list(length=50)
    
    result = []
    for idx, s in enumerate(subs):
        doc = serialize_doc(s)
        
        agent_doc = await db.field_agents.find_one({"_id": ObjectId(doc.get("agent_id"))}) if doc.get("agent_id") and len(str(doc.get("agent_id"))) == 24 else None
        agent_name = agent_doc["name"] if agent_doc else "Unknown Agent"
        
        # Determine status
        status = "Completed"
        if doc.get("completion_percentage", 0) < 100:
            status = "Pending"
            
        result.append({
            "id": doc.get("id"),
            "farmerName": doc.get("farmer_id", "Beneficiary"),
            "farmerId": doc.get("farmer_id", "PM-xxxx"),
            "agentName": agent_name,
            "date": doc.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d"),
            "area": doc.get("village", "Unknown Village"),
            "status": status
        })
        
    if not result:
        # Fallback if no submissions yet for testing live UI
        return [
            {"id": "v1", "farmerName": "Ramesh Devi", "farmerId": "PM-4901", "agentName": "Amit Singh", "date": "2024-03-20", "area": "Sector 4", "status": "Completed"}
        ]
    return result

@router.get("/grievances")
async def get_grievances(block_id: str):
    # This would typically fetch from a grievances collection. Returning dummy structure to match UI for now.
    return [
        {
          "id": "g1",
          "farmerName": "Suman Devi",
          "farmerId": "PM-10442",
          "severity": "High",
          "status": "Open",
          "message": "मुआवजा राशि बैंक खाते में नहीं आई है। दो महीने हो गए हैं।",
          "translatedMessage": "Compensation amount has not arrived in the bank account. It has been two months.",
          "date": "2024-03-20"
        },
        {
          "id": "g2",
          "farmerName": "Rajesh Kumar",
          "farmerId": "PM-8812",
          "severity": "Medium",
          "status": "In Progress",
          "message": "बीज वितरण केंद्र बंद मिला।",
          "translatedMessage": "Seed distribution center was found closed.",
          "date": "2024-03-19"
        }
    ]

@router.get("/today")
async def get_today(block_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    agents_cursor = db.field_agents.find({"block_id": block_id})
    agents = await agents_cursor.to_list(length=100)
    
    total_assigned = sum(a.get("assigned_tasks", 0) for a in agents)
    total_completed = sum(a.get("completed_tasks", 0) for a in agents)
    total_pending = sum(a.get("pending_tasks", 0) for a in agents)
    
    active_agents = []
    for a in agents:
        doc = serialize_doc(a)
        active_agents.append({
            "id": doc.get("id"),
            "name": doc.get("name", "Unknown"),
            "status": "active",
            "area": doc.get("district_id", "Zone"),
            "progress": round((doc.get("completed_tasks", 0) / max(1, doc.get("assigned_tasks", 1))) * 100),
            "tasksCompleted": doc.get("completed_tasks", 0),
            "totalTasks": doc.get("assigned_tasks", 0)
        })
        
    return {
        "stats": {
            "assigned": total_assigned or 24,
            "completed": total_completed or 14,
            "pending": total_pending or 10
        },
        "activeAgents": active_agents or [
            {"id": "a1", "name": "Amit Singh", "status": "active", "area": "Zone A", "progress": 75, "tasksCompleted": 6, "totalTasks": 8}
        ]
    }

class AnomalyExplanationRequest(BaseModel):
    anomaly_type: str
    agent: str
    details: str

@router.get("/block-data")
async def get_block_data(block_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Fetch agents
    agents_cursor = db.field_agents.find({"block_id": block_id})
    agents = await agents_cursor.to_list(length=None)
    for a in agents:
        a["_id"] = str(a["_id"])
        if a.get("last_active"):
            a["last_active"] = a["last_active"].isoformat()
            
    # Fetch farmers
    farmers_cursor = db.farmers.find({"block_id": block_id})
    farmers = await farmers_cursor.to_list(length=None)
    for f in farmers:
        f["_id"] = str(f["_id"])
        
    # Fetch submissions by agents since block_id might not explicitly exist on all submission docs
    agent_ids = [a["_id"] for a in agents]
    submissions_cursor = db.submissions.find({"agent_id": {"$in": agent_ids}})
    submissions = await submissions_cursor.to_list(length=None)
    for s in submissions:
        s["_id"] = str(s["_id"])
        if s.get("timestamp"):
            s["timestamp"] = s["timestamp"].isoformat()
            
    return {
        "agents": agents,
        "farmers": farmers,
        "submissions": submissions
    }

@router.post("/explain-anomaly")
async def explain_anomaly(req: AnomalyExplanationRequest):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"explanation": "OpenRouter API key not configured."}
        
    prompt = f"Explain the operational risk for this field monitoring anomaly in 1-2 short, simple sentences without technical jargon. Write it as if you are advising a government official.\n\nType: {req.anomaly_type}\nAgent: {req.agent}\nDetails: {req.details}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            explanation = data["choices"][0]["message"]["content"]
            return {"explanation": explanation.strip()}
    except Exception as e:
        print(f"LLM Error: {e}")
        return {"explanation": "Failed to generate explanation due to an external service error."}

class ReassignRequest(BaseModel):
    new_agent_id: str

@router.post("/farmers/{farmer_id}/reassign")
async def reassign_farmer(farmer_id: str, req: ReassignRequest):
    db = get_db()
    
    try:
        farmer_oid = ObjectId(farmer_id)
    except:
        farmer_oid = farmer_id

    farmer = await db.farmers.find_one({"_id": farmer_oid})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
        
    old_agent_id = farmer.get("assigned_agent_id")
    new_agent_id = req.new_agent_id
    
    if old_agent_id == new_agent_id:
        return {"message": "Already assigned to this agent"}
        
    # Update farmer assignment
    await db.farmers.update_one(
        {"_id": farmer_oid},
        {"$set": {"assigned_agent_id": new_agent_id}}
    )
    
    # Decrement pending/assigned on old agent
    if old_agent_id:
        try:
            await db.field_agents.update_one(
                {"_id": ObjectId(old_agent_id) if len(old_agent_id) == 24 else old_agent_id},
                {"$inc": {"assigned_tasks": -1, "pending_tasks": -1}}
            )
        except Exception:
            pass
            
    # Increment pending/assigned on new agent
    try:
        await db.field_agents.update_one(
            {"_id": ObjectId(new_agent_id) if len(new_agent_id) == 24 else new_agent_id},
            {"$inc": {"assigned_tasks": 1, "pending_tasks": 1}}
        )
    except Exception:
        pass
        
    return {"message": "Reassigned successfully"}

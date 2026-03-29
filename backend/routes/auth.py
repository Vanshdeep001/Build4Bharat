from fastapi import APIRouter, HTTPException
from database import get_db
from models.user import UserCreate, UserLogin
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(data: UserLogin):
    db = get_db()
    
    # Try finding in field_agents collection FIRST for field agents
    # This ensures we use the canonical field_agents _id in the JWT,
    # which matches the agent_id stored in submissions.
    field_agent = await db.field_agents.find_one({"phone": data.phone})
    
    if field_agent:
        user = field_agent
        role = "field_agent"
    else:
        # Not a field agent — check users collection (admins, etc.)
        user = await db.users.find_one({"phone": data.phone})
        if user:
            role = user.get("role", "district_admin")
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check password: bcrypt hash or raw match (for temp test agents)
    matched = False
    try:
        matched = bcrypt.checkpw(data.password.encode("utf-8"), user["password_hash"].encode("utf-8"))
    except ValueError:
        # Not a bcrypt hash
        if user["password_hash"] == data.password:
            matched = True

    if not matched:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {
        "user_id": str(user["_id"]),
        "role": role,
        "district_id": user.get("district_id", ""),
        "block_id": user.get("block_id", ""),
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
    }
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "phone": user["phone"],
            "role": role,
            "district_id": user.get("district_id", ""),
            "block_id": user.get("block_id", ""),
        },
    }


@router.post("/register")
async def register(data: UserCreate):
    db = get_db()

    existing = await db.users.find_one({"phone": data.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")

    password_hash = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_doc = {
        "name": data.name,
        "phone": data.phone,
        "password_hash": password_hash,
        "role": data.role,
        "district_id": data.district_id,
        "block_id": data.block_id,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    return {"id": str(result.inserted_id), "message": "User registered successfully"}

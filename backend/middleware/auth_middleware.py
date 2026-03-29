from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from config import settings

security = HTTPBearer()


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


from database import get_db
from bson import ObjectId

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = decode_token(credentials.credentials)
    user_id = payload.get("user_id")
    
    if user_id:
        db = get_db()
        # Check both collections
        try:
            oid = ObjectId(user_id)
            user_exists = await db.field_agents.count_documents({"_id": oid}) or await db.users.count_documents({"_id": oid})
        except Exception:
            user_exists = await db.field_agents.count_documents({"_id": user_id}) or await db.users.count_documents({"_id": user_id})
            
        if not user_exists:
            raise HTTPException(status_code=401, detail="User not found or session stale")
            
    return payload


def require_role(*roles):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker


field_agent_required = require_role("field_agent")
district_admin_required = require_role("district_admin")
state_admin_required = require_role("state_admin")
admin_required = require_role("district_admin", "state_admin")
any_authenticated = require_role("field_agent", "district_admin", "state_admin")

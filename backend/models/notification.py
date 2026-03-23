from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    district_id: str
    type: str
    message: str
    read: bool = False


class NotificationResponse(BaseModel):
    id: str = ""
    user_id: Optional[str] = None
    district_id: str = ""
    type: str = ""
    message: str = ""
    read: bool = False
    created_at: Optional[datetime] = None

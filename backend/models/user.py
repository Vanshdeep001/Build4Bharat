from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    phone: str
    password: str
    role: str = Field(..., pattern="^(field_agent|district_admin|state_admin)$")
    district_id: Optional[str] = None
    block_id: Optional[str] = None


class UserLogin(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    phone: str
    role: str
    district_id: Optional[str] = None
    block_id: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True


class TokenResponse(BaseModel):
    token: str
    user: dict

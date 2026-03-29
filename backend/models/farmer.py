from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class FarmerCreate(BaseModel):
    name: str
    aadhaar_last4: Optional[str] = "0000"
    phone: str
    district_id: str
    block_id: str
    village: str
    land_holding_acres: float = 0.0
    schemes_enrolled: List[str] = []
    assigned_agent_id: Optional[str] = None


class FarmerResponse(BaseModel):
    id: str = ""
    name: str
    aadhaar_last4: str
    phone: str
    district_id: str
    block_id: str
    village: str
    land_holding_acres: float
    schemes_enrolled: List[str] = []
    assigned_agent_id: Optional[str] = None
    created_at: Optional[datetime] = None

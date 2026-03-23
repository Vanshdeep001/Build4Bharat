from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class FarmerCreate(BaseModel):
    name: str
    aadhaar_last4: str = Field(..., min_length=4, max_length=4)
    phone: str
    district_id: str
    block_id: str
    village: str
    land_holding_acres: float = 0.0
    schemes_enrolled: List[str] = []


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
    created_at: Optional[datetime] = None

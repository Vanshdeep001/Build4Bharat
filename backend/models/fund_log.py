from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FundLogCreate(BaseModel):
    district_id: str
    block_id: str
    scheme_name: str
    amount_released: float
    amount_utilised: float
    vendor_name: Optional[str] = None
    physical_progress_pct: float = Field(..., ge=0, le=100)


class FundLogResponse(BaseModel):
    id: str = ""
    district_id: str = ""
    block_id: str = ""
    scheme_name: str = ""
    amount_released: float = 0
    amount_utilised: float = 0
    vendor_name: Optional[str] = None
    physical_progress_pct: float = 0
    logged_by: Optional[str] = None
    created_at: Optional[datetime] = None

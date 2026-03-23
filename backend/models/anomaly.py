from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AnomalyCreate(BaseModel):
    district_id: str
    block_id: str
    submission_id: Optional[str] = None
    fund_log_id: Optional[str] = None
    anomaly_type: str
    anomaly_score: float = Field(0, ge=0, le=100)
    explanation: Optional[str] = None
    suggested_action: Optional[str] = None
    status: str = "open"


class AnomalyResponse(BaseModel):
    id: str = ""
    district_id: str = ""
    block_id: str = ""
    submission_id: Optional[str] = None
    fund_log_id: Optional[str] = None
    anomaly_type: str = ""
    anomaly_score: float = 0
    explanation: Optional[str] = None
    suggested_action: Optional[str] = None
    status: str = "open"
    reviewed_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class AnomalyStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(reviewed|resolved)$")
    note: Optional[str] = None

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VerificationCreate(BaseModel):
    farmer_id: Optional[str] = None
    submission_id: Optional[str] = None
    district_id: str
    block_id: str
    channel: str = "web"
    benefit_received: bool
    quality_rating: int = Field(0, ge=0, le=5)
    issue_description: Optional[str] = None
    issue_photo_url: Optional[str] = None


class VerificationResponse(BaseModel):
    id: str = ""
    farmer_id: Optional[str] = None
    submission_id: Optional[str] = None
    district_id: str = ""
    block_id: str = ""
    channel: str = "web"
    benefit_received: bool = False
    quality_rating: int = 0
    issue_description: Optional[str] = None
    issue_photo_url: Optional[str] = None
    created_at: Optional[datetime] = None

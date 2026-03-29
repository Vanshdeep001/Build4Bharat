from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BeneficiaryResponseCreate(BaseModel):
    submission_id: str
    farmer_id: Optional[str] = None
    farmer_name: Optional[str] = None
    farmer_phone: str
    response: str = Field(..., pattern="^(yes|no)$")


class BeneficiaryResponseOut(BaseModel):
    id: str = ""
    submission_id: str = ""
    farmer_id: Optional[str] = None
    farmer_name: Optional[str] = None
    farmer_phone: str = ""
    response: str = ""
    whatsapp_message_id: Optional[str] = None
    responded_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

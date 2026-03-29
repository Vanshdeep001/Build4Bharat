from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FieldAgentCreate(BaseModel):
    name: str
    phone: str
    password: str
    district_id: str
    block_id: str
    # Statistics initialized to 0
    assigned_tasks: int = 0
    completed_tasks: int = 0
    pending_tasks: int = 0
    missed_tasks: int = 0

class FieldAgentLogin(BaseModel):
    phone: str
    password: str

class FieldAgentResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    phone: str
    district_id: str
    block_id: str
    assigned_tasks: int
    completed_tasks: int
    pending_tasks: int
    missed_tasks: int
    last_active: Optional[datetime] = None
    created_at: datetime
    
    # Computed property for completion rate can be done at the database level or frontend
    @property
    def completion_rate(self) -> float:
        if self.assigned_tasks == 0:
            return 0.0
        return (self.completed_tasks / self.assigned_tasks) * 100

    class Config:
        populate_by_name = True

class FieldAgentTokenResponse(BaseModel):
    token: str
    agent: dict

from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime


class SubmissionCreate(BaseModel):
    farmer_id: Optional[str] = None
    district_id: str
    block_id: str
    village: str
    activity_type: str
    completion_percentage: float = Field(..., ge=0, le=100)
    beneficiary_count: int = Field(..., ge=0)
    materials_used: Dict[str, str] = {}
    project_gps_lat: Optional[float] = None
    project_gps_lng: Optional[float] = None
    kpi_value: Optional[float] = None
    kpi_type: Optional[str] = None
    notes: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: str = ""
    agent_id: str = ""
    farmer_id: Optional[str] = None
    district_id: str = ""
    block_id: str = ""
    village: str = ""
    activity_type: str = ""
    completion_percentage: float = 0
    beneficiary_count: int = 0
    materials_used: Dict[str, str] = {}
    photo_url: Optional[str] = None
    photo_gps: Optional[Dict[str, float]] = None
    project_gps: Optional[Dict[str, float]] = None
    location_match: Optional[bool] = None
    location_distance_km: Optional[float] = None
    submission_hash: Optional[str] = None
    kpi_value: Optional[float] = None
    kpi_type: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    anomaly_score: float = 0
    is_anomaly: bool = False

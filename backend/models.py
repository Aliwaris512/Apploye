from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from enum import Enum
from uuid import uuid4

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class UserBase(BaseModel):
    email: str
    full_name: str
    position: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True
    role: UserRole = UserRole.EMPLOYEE

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    client: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None

class ProjectInDB(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TimeEntryBase(BaseModel):
    user_id: str
    project_id: str
    task_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    is_billable: bool = True

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    is_billable: Optional[bool] = None

class TimeEntryInDB(TimeEntryBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    duration_seconds: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ScreenshotBase(BaseModel):
    user_id: str
    time_entry_id: str
    image_path: str
    thumbnail_path: str
    activity_level: int  # 0-100
    window_title: Optional[str] = None
    application_name: Optional[str] = None

class ScreenshotInDB(ScreenshotBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ActivityLogBase(BaseModel):
    user_id: str
    time_entry_id: str
    timestamp: datetime
    mouse_activity: int  # 0-100
    keyboard_activity: int  # 0-100
    overall_activity: int  # 0-100

class ActivityLogInDB(ActivityLogBase):
    id: str = Field(default_factory=lambda: str(uuid4()))

class ReportBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    user_ids: List[str] = []
    project_ids: List[str] = []
    report_type: str  # daily, weekly, monthly, custom
    metrics: List[str]  # e.g., ["time_tracked", "screenshots", "activity_levels"]

class ReportCreate(ReportBase):
    pass

class ReportInDB(ReportBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, processing, completed, failed
    file_path: Optional[str] = None

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

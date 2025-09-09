from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from enum import Enum
from uuid import UUID

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    position: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.EMPLOYEE

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class UserInDB(UserBase):
    id: str
    role: UserRole
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class UserResponse(UserInDB):
    pass

class ProjectBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    client: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    client: Optional[str] = None

class ProjectInDB(ProjectBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ProjectResponse(ProjectInDB):
    pass

class TaskBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    status: str = "todo"
    due_date: Optional[datetime] = None
    project_id: str
    assignee_id: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[str] = None

class TaskInDB(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TaskResponse(TaskInDB):
    pass

class TimeEntryBase(BaseModel):
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
    id: str
    user_id: str
    duration_seconds: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TimeEntryResponse(TimeEntryInDB):
    pass

class ScreenshotBase(BaseModel):
    image_path: str
    thumbnail_path: str
    activity_level: int = Field(..., ge=0, le=100)
    window_title: Optional[str] = None
    application_name: Optional[str] = None

class ScreenshotCreate(ScreenshotBase):
    pass

class ScreenshotInDB(ScreenshotBase):
    id: str
    user_id: str
    time_entry_id: str
    created_at: datetime

    class Config:
        orm_mode = True

class ScreenshotResponse(ScreenshotInDB):
    pass

class ReportBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    user_ids: List[str] = []
    project_ids: List[str] = []
    report_type: str
    metrics: List[str]

class ReportCreate(ReportBase):
    pass

class ReportInDB(ReportBase):
    id: str
    created_by: str
    created_at: datetime
    status: str
    file_path: Optional[str] = None

    class Config:
        orm_mode = True

class ReportResponse(ReportInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[UserRole] = None

# Response models for pagination and filtering
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

class TimeRangeFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class UserFilter(TimeRangeFilter):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    department: Optional[str] = None

class ProjectFilter(TimeRangeFilter):
    status: Optional[ProjectStatus] = None
    client: Optional[str] = None

class TimeEntryFilter(TimeRangeFilter):
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    task_id: Optional[str] = None
    is_billable: Optional[bool] = None

class ReportFilter(TimeRangeFilter):
    status: Optional[str] = None
    created_by: Optional[str] = None

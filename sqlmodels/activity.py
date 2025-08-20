from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from pydantic import BaseModel
import uuid

class ActivityBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    activity_type: str  # e.g., 'app_usage', 'screenshot', 'idle_time', 'active_time'
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None  # in seconds
    activity_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

class Activity(ActivityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(back_populates="activities")

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(SQLModel):
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    activity_data: Optional[Dict[str, Any]] = None

# Specific activity type models
class AppUsageBase(SQLModel):
    app_name: str
    window_title: str
    executable_path: Optional[str] = None
    is_active: bool = False

class ScreenshotBase(SQLModel):
    image_path: str
    thumbnail_path: str
    window_title: Optional[str] = None
    app_name: Optional[str] = None

class IdleTimeBase(SQLModel):
    idle_seconds: float
    was_locked: bool = False

# Request/Response models
class TrackActivityRequest(BaseModel):
    activity_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    activity_data: Optional[Dict[str, Any]] = {}

class TrackAppUsageRequest(AppUsageBase):
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None

class TrackScreenshotRequest(ScreenshotBase):
    taken_at: datetime = Field(default_factory=datetime.utcnow)

class TrackIdleTimeRequest(IdleTimeBase):
    start_time: datetime
    end_time: Optional[datetime] = None

# Response models
class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime
    updated_at: datetime

class DailyActivitySummary(SQLModel):
    date: str
    total_active_seconds: float
    total_idle_seconds: float
    total_productive_seconds: float
    apps: Dict[str, float]  # app_name: seconds_spent
    screenshots: List[Dict[str, Any]] = []

class ActivityStats(SQLModel):
    date: str
    active_percentage: float
    idle_percentage: float
    productive_percentage: float
    total_hours: float
    productive_hours: float
    idle_hours: float

# Update User model to include activities relationship
def update_user_model():
    from sqlmodels.user_usage import User
    User.model_rebuild()
    if not hasattr(User, 'activities'):
        User.activities = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

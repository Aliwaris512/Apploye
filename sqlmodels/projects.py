from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import field_validator
import re

class ProjectBase(SQLModel):
    name: str = Field(index=True)
    description: str
    client_id: Optional[int] = Field(default=None)  # Removed foreign key constraint for now
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    status: str = Field(default="active")  # active, completed, on_hold, cancelled
    budget: Optional[float] = None

class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    tasks: List["Task"] = Relationship(back_populates="project")
    members: List["ProjectMember"] = Relationship(back_populates="project")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = None

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    project_id: int = Field(foreign_key="project.id")
    assigned_to: Optional[int] = Field(default=None, foreign_key="user.id")
    status: str = Field(default="todo")  # todo, in_progress, review, done
    priority: str = Field(default="medium")  # low, medium, high
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    project: Project = Relationship(back_populates="tasks")
    time_entries: List["TimeEntry"] = Relationship(back_populates="task")

class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None

class TimeEntryBase(SQLModel):
    task_id: int = Field(foreign_key="task.id")
    user_id: int = Field(foreign_key="user.id")
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None  # in hours
    description: Optional[str] = None
    billable: bool = True

class TimeEntry(TimeEntryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    task: Task = Relationship(back_populates="time_entries")
    user: "User" = Relationship()

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(SQLModel):
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    description: Optional[str] = None
    billable: Optional[bool] = None

class ProjectMemberBase(SQLModel):
    project_id: int = Field(foreign_key="project.id")
    user_id: int = Field(foreign_key="user.id")
    role: str = Field(default="member")  # member, manager
    hourly_rate: Optional[float] = None

class ProjectMember(ProjectMemberBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    project: Project = Relationship(back_populates="members")
    user: "User" = Relationship()

class ProjectMemberCreate(ProjectMemberBase):
    pass

class ProjectMemberUpdate(SQLModel):
    role: Optional[str] = None
    hourly_rate: Optional[float] = None

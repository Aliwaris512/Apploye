from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, JSON, Date, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime, date
from typing import Optional, List
import os
import uuid
from dotenv import load_dotenv
from enum import Enum as PyEnum

# Load environment variables
load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite+aiosqlite:///./activity_tracker.db"
)

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# Session maker
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# Enums
class UserRole(str, PyEnum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class ProjectStatus(str, PyEnum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"

# Models
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    position = Column(String, nullable=True)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.EMPLOYEE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    projects = relationship("Project", back_populates="owner")
    time_entries = relationship("TimeEntry", back_populates="user")
    screenshots = relationship("Screenshot", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    reports = relationship("Report", back_populates="creator")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLAlchemyEnum(ProjectStatus), default=ProjectStatus.PLANNING)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    budget = Column(Float, nullable=True)
    client = Column(String, nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="projects")
    time_entries = relationship("TimeEntry", back_populates="project")
    tasks = relationship("Task", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo")
    due_date = Column(DateTime(timezone=True), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    assignee_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    time_entries = relationship("TimeEntry", back_populates="task")

class TimeEntry(Base):
    __tablename__ = "time_entries"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    is_billable = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="time_entries")
    project = relationship("Project", back_populates="time_entries")
    task = relationship("Task", back_populates="time_entries")
    screenshots = relationship("Screenshot", back_populates="time_entry")
    activity_logs = relationship("ActivityLog", back_populates="time_entry")

class Screenshot(Base):
    __tablename__ = "screenshots"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    time_entry_id = Column(String, ForeignKey("time_entries.id"), nullable=False)
    image_path = Column(String, nullable=False)
    thumbnail_path = Column(String, nullable=False)
    activity_level = Column(Integer, nullable=False)  # 0-100
    window_title = Column(String, nullable=True)
    application_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="screenshots")
    time_entry = relationship("TimeEntry", back_populates="screenshots")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    time_entry_id = Column(String, ForeignKey("time_entries.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    mouse_activity = Column(Integer, nullable=False)  # 0-100
    keyboard_activity = Column(Integer, nullable=False)  # 0-100
    overall_activity = Column(Integer, nullable=False)  # 0-100

    # Relationships
    user = relationship("User", back_populates="activity_logs")
    time_entry = relationship("TimeEntry", back_populates="activity_logs")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    user_ids = Column(JSON, nullable=False, default=list)
    project_ids = Column(JSON, nullable=False, default=list)
    report_type = Column(String, nullable=False)  # daily, weekly, monthly, custom
    metrics = Column(JSON, nullable=False, default=list)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending")  # pending, processing, completed, failed
    file_path = Column(String, nullable=True)

    # Relationships
    creator = relationship("User", back_populates="reports")

# Create tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Drop all tables (for development)
async def drop_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


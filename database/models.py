from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
import os

# Import all models to register them with SQLModel
from sqlmodels.user_usage import User, AppUsage, AppUserLink
from sqlmodels.projects import Project, Task, TimeEntry, ProjectMember

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./activity_tracker.db")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create async session maker
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async session"""
    async with async_session_maker() as session:
        yield session

async def create_db_and_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def drop_db():
    """Drop all database tables (for testing/development)"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

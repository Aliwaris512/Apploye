import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# Import all models to register them with SQLModel
from sqlmodels.enhanced_models import User, Activity, Screenshot
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
    engine, class_=AsyncSession, expire_on_commit=False, autocommit=False, autoflush=False
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async session"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def create_db_and_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def drop_db():
    """Drop all database tables (for testing/development)"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

# Create database tables on startup
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create default admin user if not exists
    from sqlalchemy import select
    from sqlalchemy.exc import NoResultFound
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    async with async_session_maker() as session:
        try:
            # Check if admin exists
            result = await session.execute(select(User).where(User.email == "admin@example.com"))
            admin = result.scalars().first()
            
            if not admin:
                admin = User(
                    name="Admin User",
                    email="admin@example.com",
                    hashed_password=pwd_context.hash("admin123"),
                    role="admin",
                    is_active=True
                )
                session.add(admin)
                await session.commit()
                print("Default admin user created successfully!")
                
        except Exception as e:
            print(f"Error initializing database: {e}")
            await session.rollback()
            raise

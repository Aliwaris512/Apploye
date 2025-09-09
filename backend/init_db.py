import asyncio
import os
import sys
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent))

from database import engine, Base, get_db, User, UserRole
from auth import get_password_hash

async def init_models():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")

async def create_admin_user():
    db = await anext(get_db())
    
    # Check if admin user already exists
    result = await db.execute(select(User).where(User.email == "admin@example.com"))
    admin = result.scalars().first()
    
    if admin is None:
        # Create admin user
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        await db.commit()
        print("Admin user created successfully")
    else:
        print("Admin user already exists")

async def main():
    # Create database tables
    await init_models()
    
    # Create admin user
    await create_admin_user()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

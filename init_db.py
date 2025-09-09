import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.database import engine, Base, async_session, User, UserRole
from backend.auth import get_password_hash

async def init_models():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Database tables created successfully")

async def create_admin_user():
    async with async_session() as db:
        # Check if admin user already exists
        from sqlalchemy import select
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
            print("[OK] Admin user created successfully")
            print("   Email: admin@example.com")
            print("   Password: admin123")
        else:
            print("[INFO] Admin user already exists")

async def main():
    # Create database tables
    await init_models()
    
    # Create admin user
    await create_admin_user()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

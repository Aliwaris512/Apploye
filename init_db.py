import asyncio
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from database.structure import engine as async_engine
from sqlmodels.user_usage import User
from sqlmodels.projects import Project, Task, ProjectMember, ProjectRole
from sqlmodels.activity import Activity
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create async session
async_session = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Sample data
SAMPLE_USERS = [
    {
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "admin123",
        "role": "admin"
    },
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "role": "user"
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "password": "password123",
        "role": "user"
    }
]

SAMPLE_PROJECTS = [
    {
        "name": "Website Redesign",
        "description": "Complete redesign of company website",
        "status": "in_progress"
    },
    {
        "name": "Mobile App Development",
        "description": "New mobile application for iOS and Android",
        "status": "planning"
    },
    {
        "name": "Marketing Campaign",
        "description": "Q4 marketing campaign",
        "status": "not_started"
    }
]

SAMPLE_TASKS = [
    {"title": "Design Homepage", "description": "Create new homepage design", "status": "todo"},
    {"title": "Implement Backend", "description": "Develop API endpoints", "status": "in_progress"},
    {"title": "Write Tests", "description": "Create unit and integration tests", "status": "todo"},
    {"title": "Deploy to Staging", "description": "Deploy to staging environment", "status": "todo"},
    {"title": "User Testing", "description": "Conduct user testing sessions", "status": "todo"},
]

# Password hashing
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def init_db():
    print("🚀 Starting database initialization...")
    
    # Create all tables
    print("🔄 Creating database tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    print("✅ Database tables created")
    
    # Create async session
    async with async_session() as session:
        # Create users
        print("👥 Creating users...")
        db_users = []
        for user_data in SAMPLE_USERS:
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password=hash_password(user_data["password"]),
                role=user_data["role"]
            )
            session.add(user)
            db_users.append(user)
        
        await session.commit()
        
        # Refresh to get IDs
        for user in db_users:
            await session.refresh(user)
        
        admin_user = next(u for u in db_users if u.role == "admin")
        regular_users = [u for u in db_users if u.role == "user"]
        
        # Create projects
        print("📂 Creating projects...")
        db_projects = []
        for project_data in SAMPLE_PROJECTS:
            project = Project(**project_data)
            session.add(project)
            db_projects.append(project)
        
        await session.commit()
        
        # Create project members
        print("👥 Adding project members...")
        for project in db_projects:
            # Add admin as project admin
            admin_member = ProjectMember(
                project_id=project.id,
                user_id=admin_user.id,
                role=ProjectRole.ADMIN,
                joined_at=datetime.utcnow()
            )
            session.add(admin_member)
            
            # Add some regular users as members
            for user in regular_users[:2]:  # First 2 regular users
                member = ProjectMember(
                    project_id=project.id,
                    user_id=user.id,
                    role=ProjectRole.MEMBER,
                    joined_at=datetime.utcnow()
                )
                session.add(member)
        
        await session.commit()
        
        # Create tasks
        print("✅ Creating tasks...")
        for project in db_projects:
            for task_data in SAMPLE_TASKS:
                task = Task(
                    **task_data,
                    project_id=project.id,
                    created_by=admin_user.id,
                    due_date=datetime.utcnow() + timedelta(days=random.randint(7, 30))
                )
                session.add(task)
        
        await session.commit()
        
        # Create some sample activities
        print("📊 Creating sample activities...")
        for day in range(30):  # Last 30 days
            activity_date = datetime.utcnow() - timedelta(days=day)
            
            for user in db_users:
                # Create app usage
                for hour in range(9, 18):  # 9 AM to 6 PM
                    if random.random() > 0.2:  # 80% chance of activity in work hours
                        start_time = activity_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                        end_time = start_time + timedelta(minutes=random.randint(30, 120))
                        
                        activity = Activity(
                            user_id=user.id,
                            activity_type="app_usage",
                            start_time=start_time,
                            end_time=end_time,
                            duration=(end_time - start_time).total_seconds(),
                            activity_data={
                                "app_name": random.choice(["VS Code", "Chrome", "Terminal", "Slack"]),
                                "window_title": random.choice([
                                    "main.py - Activity Tracker", 
                                    "Google - Chrome", 
                                    "Terminal - bash",
                                    "Slack | General"
                                ]),
                                "executable_path": "/applications/" + random.choice([
                                    "vscode.app", 
                                    "google chrome.app", 
                                    "terminal.app",
                                    "slack.app"
                                ]).lower()
                            }
                        )
                        session.add(activity)
                
                # Create idle time
                idle_activity = Activity(
                    user_id=user.id,
                    activity_type="idle_time",
                    start_time=activity_date.replace(hour=13, minute=0),  # 1 PM
                    end_time=activity_date.replace(hour=13, minute=30),   # 1:30 PM
                    duration=1800,  # 30 minutes
                    activity_data={"reason": "Lunch break"}
                )
                session.add(idle_activity)
        
        await session.commit()
        
        print("\n🎉 Database initialization complete!")
        print("\nSample users created:")
        print("-" * 50)
        for user in db_users:
            print(f"Name: {user.name}")
            print(f"Email: {user.email}")
            print(f"Password: {'admin123' if user.role == 'admin' else 'password123'}")
            print(f"Role: {user.role}")
            print("-" * 50)

if __name__ == "__main__":
    asyncio.run(init_db())

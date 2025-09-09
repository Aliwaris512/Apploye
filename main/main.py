import uvicorn
import sys
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

# Now import local modules using absolute imports
from database.structure import engine, get_session
from routers import admin, admin_tasks, client_tasks, employee_tasks, login, tracking
from notifications.ws_router import router as ws_router

# Initialize database
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

app = FastAPI(title="Activity Tracker API")

# CORS for frontend dev server (relaxed to avoid preflight 400s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(login.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(admin_tasks.router, prefix="/api/admin/tasks", tags=["Admin Tasks"])
app.include_router(client_tasks.router, prefix="/api/client/tasks", tags=["Client Tasks"])
app.include_router(employee_tasks.router, prefix="/api/employee/tasks", tags=["Employee Tasks"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Tracking"])
app.include_router(ws_router, prefix="/ws", tags=["WebSocket"])

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("Database tables created")

@app.get("/")
def read_root():
    return {"message": "Welcome to Activity Tracker API"}
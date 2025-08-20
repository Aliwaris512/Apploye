import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from routers import login, activity, projects, timesheets, admin, tracking
from notifications import ws_router
from sqlmodel import SQLModel
from database.structure import engine
from push_notify import subscription, web_push
#from utils import login_save_token, create_save_device_id

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:9000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:9000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(login.router)
app.include_router(activity.router)
app.include_router(projects.router)  # Projects and tasks
app.include_router(timesheets.router)  # Timesheets, attendance, and payroll
app.include_router(admin.router)  # Admin endpoints for user management
app.include_router(tracking.router)  # Activity tracking endpoints
app.include_router(ws_router.router)  # WebSocket notifications
app.include_router(subscription.router)  # Push notifications
app.include_router(web_push.router)  # Web push notifications

# Serve static files (screenshots)
os.makedirs("screenshots", exist_ok=True)
app.mount("/screenshots", StaticFiles(directory="screenshots"), name="screenshots")

 
@app.on_event("startup") 
def on_startup() -> None:
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
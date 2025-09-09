from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Activity Tracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database models (in-memory for now)
class User(BaseModel):
    id: str
    username: str
    email: str
    hashed_password: str
    disabled: bool = False
    role: str = "user"

class Project(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class Task(BaseModel):
    id: str
    title: str
    description: str
    project_id: str
    assignee_id: str
    status: str = "todo"
    due_date: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str = "info"
    read: bool = False
    link: Optional[str] = None
    created_at: datetime = datetime.utcnow()

# In-memory storage (replace with database in production)
fake_users_db = {}
fake_projects_db = {}
fake_tasks_db = {}
fake_notifications_db = {}

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db, username: str):
    print(f"\n=== DEBUG: get_user called ===")
    print(f"Looking for username: {username}")
    print(f"Available users in DB: {list(db.keys())}")
    
    if username in db:
        user_dict = db[username]
        print(f"Found user: {user_dict}")
        return User(**user_dict)
    
    print(f"User '{username}' not found in database")
    return None

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=username)
    if user is None:
        raise credentials_exception
    return user

# API Endpoints
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Projects endpoints
@app.get("/api/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    return list(fake_projects_db.values())

@app.post("/api/projects", response_model=Project)
async def create_project(project: Project, current_user: User = Depends(get_current_user)):
    if project.id in fake_projects_db:
        raise HTTPException(status_code=400, detail="Project already exists")
    fake_projects_db[project.id] = project
    return project

# Tasks endpoints
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    if project_id:
        return [task for task in fake_tasks_db.values() if task.project_id == project_id]
    return list(fake_tasks_db.values())

# Activity endpoints
@app.get("/api/activity/summary")
async def get_activity_summary(user_id: str, date: str, current_user: User = Depends(get_current_user)):
    # In a real app, this would fetch from a database
    return {
        "total_hours": 8.5,
        "projects": [
            {"name": "Project A", "hours": 5.0},
            {"name": "Project B", "hours": 3.5}
        ],
        "date": date
    }

# Timesheet endpoints
@app.get("/api/timesheet/entries")
async def get_timesheet_entries(user_id: str, start_date: str, end_date: str, current_user: User = Depends(get_current_user)):
    # In a real app, this would fetch from a database
    return [
        {
            "id": "1",
            "project_id": "1",
            "project_name": "Project A",
            "date": start_date,
            "hours": 4.0,
            "description": "Worked on feature X"
        },
        {
            "id": "2",
            "project_id": "2",
            "project_name": "Project B",
            "date": start_date,
            "hours": 4.5,
            "description": "Fixed bugs"
        }
    ]

# Notifications endpoints
@app.get("/api/notifications", response_model=List[Notification])
async def get_notifications(read: Optional[bool] = None, current_user: User = Depends(get_current_user)):
    notifications = [n for n in fake_notifications_db.values() if n.user_id == current_user.id]
    if read is not None:
        notifications = [n for n in notifications if n.read == read]
    return notifications

@app.post("/api/notifications/mark-as-read/{notification_id}")
async def mark_notification_as_read(notification_id: str, current_user: User = Depends(get_current_user)):
    if notification_id not in fake_notifications_db:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification = fake_notifications_db[notification_id]
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    notification.read = True
    return {"status": "success"}

# WebSocket endpoint for real-time updates
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages here
            await manager.send_personal_message(f"You wrote: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast(f"Client #{client_id} left the chat")

if __name__ == "__main__":
    # Create a test user
    test_password = "testpassword"
    test_user = User(
        id="1",
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash(test_password),
        role="admin"
    )
    fake_users_db[test_user.username] = test_user.dict()
    
    # Debug output
    print("\n=== DEBUG INFO ===")
    print(f"Test user created:")
    print(f"  Username: {test_user.username}")
    print(f"  Password (plain): {test_password}")
    print(f"  Stored hash: {test_user.hashed_password}")
    print(f"  Users in DB: {list(fake_users_db.keys())}")
    print("=================\n")
    
    # Start the server
    uvicorn.run(app, host="0.0.0.0", port=9000, reload=True)

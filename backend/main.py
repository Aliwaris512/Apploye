from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import datetime, date, timedelta
from typing import List, Optional
import os
import uvicorn
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from . import schemas, auth
from .database import engine, get_db, create_tables, Base, User, UserRole
from .routers import users, projects, time_entries, screenshots, reports, tasks

# Create database tables on startup
import asyncio

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Configure CORS
origins = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app = FastAPI(
    title="Activity Tracker API",
    description="Employee monitoring and time tracking system",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(time_entries.router, prefix="/api/time-entries", tags=["time-entries"])
app.include_router(screenshots.router, prefix="/api/screenshots", tags=["screenshots"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

# Authentication endpoints
@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: schemas.UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    # Check if user with email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        position=user_data.position,
        department=user_data.department,
        is_active=True,
        role=UserRole.EMPLOYEE  # Default role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.post("/auth/login", include_in_schema=False)
@app.post("/api/auth/login", include_in_schema=False)
async def login_for_access_token_alias(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Alias for /api/auth/token to match frontend expectations"""
    try:
        # Log the incoming request
        print("\n=== Login Request ===")
        print(f"Method: {request.method}")
        print(f"URL: {request.url}")
        print(f"Headers: {dict(request.headers)}")
        
        # Check content type
        content_type = request.headers.get('content-type', '')
        print(f"Content-Type: {content_type}")
        
        # Get raw body for debugging
        body = await request.body()
        print(f"Raw body: {body}")
        
        # Try to parse as JSON first
        try:
            json_data = await request.json()
            print(f"JSON data: {json_data}")
            username = json_data.get("username") or json_data.get("email")
            password = json_data.get("password")
        except Exception as json_err:
            print(f"Error parsing JSON: {json_err}")
            # If not JSON, try form data
            try:
                form_data = await request.form()
                print(f"Form data: {dict(form_data)}")
                username = form_data.get("username") or form_data.get("email")
                password = form_data.get("password")
                
                # If no data in form, try to parse from body as URL-encoded
                if not username and not password and body:
                    try:
                        from urllib.parse import parse_qs
                        parsed = parse_qs(body.decode('utf-8'))
                        username = parsed.get('username', [None])[0] or parsed.get('email', [None])[0]
                        password = parsed.get('password', [None])[0]
                        print(f"Parsed from body - Username: {username}, Password: {'*' * len(password) if password else 'None'}")
                    except Exception as e:
                        print(f"Error parsing URL-encoded body: {e}")
            except Exception as form_err:
                print(f"Error parsing form data: {form_err}")
                # Try to get raw body as string
                try:
                    body_str = body.decode('utf-8')
                    print(f"Raw body as string: {body_str}")
                    if '@' in body_str and 'password' not in body_str:
                        # If it's just an email, prompt for password
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Password is required"
                        )
                except:
                    pass
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request format. Please send JSON with email and password."
                )
        
        print(f"Username: {username}")
        print(f"Password: {'*' * len(password) if password else 'None'}")
        
        if not username or not password:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Both username/email and password are required"
            )
    
        # Call the token endpoint logic
        user = await auth.authenticate_user(db, username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Generate access token
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={
                "sub": user.email,
                "role": user.role if hasattr(user, 'role') else 'user',
            },
            expires_delta=access_token_expires,
        )
        
        # Generate refresh token
        refresh_token_expires = timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token = auth.create_refresh_token(
            data={"sub": user.email},
            expires_delta=refresh_token_expires,
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "role": user.role if hasattr(user, 'role') else 'user',
                "position": user.position if hasattr(user, 'position') else None,
                "department": user.department if hasattr(user, 'department') else None
            }
        }
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Log the full error for debugging
        print(f"Unexpected error during login: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )
    refresh_token_expires = timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    refresh_token = auth.create_refresh_token(
        data={"sub": user.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active
        }
    }

@app.post("/api/auth/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db=Depends(get_db)
):
    # Handle both username and email fields from frontend
    username_or_email = form_data.username
    
    # Try to find user by email first, then by username
    user = await auth.authenticate_user(db, username_or_email, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    refresh_token = auth.create_refresh_token(
        data={"sub": user.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active
        }
    }

@app.post("/api/auth/refresh-token")
async def refresh_access_token(refresh_token: str):
    try:
        payload = auth.jwt.decode(
            refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        user_id = payload.get("sub")
        user_role = payload.get("role")
        if not user_id or not user_role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return auth.create_tokens(user_id, user_role)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Serve frontend files (for production)
frontend_path = Path(__file__).parent.parent / "frontend-vite" / "dist"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=frontend_path / "static"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        path = frontend_path / full_path
        if not path.exists() or path.is_dir():
            return FileResponse(frontend_path / "index.html")
        return FileResponse(path)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    await init_db()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, or_, and_
from pydantic import EmailStr, BaseModel, Field, validator
from typing import Any
import uuid

from database.structure import get_session
from sqlmodels.user_usage import User
from sqlmodels.projects import ProjectMember
from authentication.jwt_hashing import get_current_user, get_hashed_password, create_access_token, verify_password

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"]
)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"

class InviteUserRequest(BaseModel):
    email: EmailStr
    role: str = "user"
    project_ids: List[int] = []

@router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """Create a new user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create users"
        )
    
    # Check if email exists
    existing_user = session.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_hashed_password(user.password)
    
    # Create user
    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@router.get("/users/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """List all users with filtering options (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can list users"
        )
    
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    if search:
        search = f"%{search}%"
        query = query.where(
            or_(
                User.name.ilike(search),
                User.email.ilike(search)
            )
        )
    
    users = session.exec(query.offset(skip).limit(limit)).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """Get user by ID (admin only)"""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """Update user details (admin only)"""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent role escalation
    if 'role' in user_update and current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user roles"
        )
    
    # Update user fields
    for field, value in user_update.items():
        if hasattr(db_user, field) and field != 'id':
            setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """Delete a user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete by marking as inactive
    user.is_active = False
    session.add(user)
    session.commit()
    
    return None

@router.post("/users/{user_id}/reset-password", status_code=status.HTTP_200_OK)
async def reset_user_password(
    user_id: int,
    new_password: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """Reset a user's password (admin only)"""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reset this password"
        )
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash the new password
    hashed_password = get_hashed_password(new_password)
    user.password = hashed_password
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    return {"message": "Password updated successfully"}

@router.get("/users/{user_id}/projects", response_model=List[Dict[str, Any]])
async def get_user_projects(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """Get all projects for a specific user"""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these projects"
        )
    
    # Get all project memberships for the user
    memberships = session.exec(
        select(ProjectMember)
        .where(ProjectMember.user_id == user_id)
    ).all()
    
    # Get project details for each membership
    projects = []
    for member in memberships:
        project = session.get(Project, member.project_id)
        if project:
            projects.append({
                "project_id": project.id,
                "name": project.name,
                "role": member.role,
                "hourly_rate": member.hourly_rate,
                "joined_at": member.joined_at
            })
    
    return projects

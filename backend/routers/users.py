from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from .. import schemas, auth
from ..database import get_db, User, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.admin_only)
):
    # Check if user with email already exists
    result = await db.execute(select(User).where(User.email == user.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        position=user.position,
        department=user.department,
        is_active=user.is_active,
        role=user.role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: User = Depends(auth.get_current_active_user)):
    return current_user

@router.get("/", response_model=schemas.PaginatedResponse)
async def read_users(
    skip: int = 0,
    limit: int = 100,
    filter: Optional[schemas.UserFilter] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Only admins can list all users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Build query
    query = select(models.User)
    
    # Apply filters
    if filter:
        if filter.role:
            query = query.where(models.User.role == filter.role)
        if filter.is_active is not None:
            query = query.where(models.User.is_active == filter.is_active)
        if filter.department:
            query = query.where(models.User.department == filter.department)
    
    # Get total count
    total = (await db.execute(select([query.subquery()]))).scalars().count()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "items": users,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{user_id}", response_model=schemas.UserResponse)
async def read_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Users can only see their own profile unless they're admin/manager
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: str,
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Users can only update their own profile unless they're admin
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this user"
        )
    
    # Only admins can change roles
    if user_update.role is not None and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user roles"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    for field, value in user_update.dict(exclude_unset=True).items():
        if field == "password":
            db_user.hashed_password = auth.get_password_hash(value)
        else:
            setattr(db_user, field, value)
    
    db_user.updated_at = models.func.now()
    
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.admin_only)
):
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if db_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    await db.delete(db_user)
    await db.commit()
    return None

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date, timedelta

from .. import schemas, auth
from ..database import get_db, User

router = APIRouter()

@router.post("/start", response_model=schemas.TimeEntryResponse, status_code=status.HTTP_201_CREATED)
async def start_time_entry(
    time_entry: schemas.TimeEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Check if user already has a running timer
    running_timer = await db.execute(
        select(models.TimeEntry).where(
            and_(
                models.TimeEntry.user_id == current_user.id,
                models.TimeEntry.end_time.is_(None)
            )
        )
    )
    
    if running_timer.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a running timer. Please stop it first."
        )
    
    # Check if project exists
    project = await db.execute(
        select(models.Project).where(models.Project.id == time_entry.project_id)
    )
    if not project.scalars().first():
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if task exists if provided
    if time_entry.task_id:
        task = await db.execute(
            select(models.Task).where(models.Task.id == time_entry.task_id)
        )
        if not task.scalars().first():
            raise HTTPException(status_code=404, detail="Task not found")
    
    # Create new time entry
    db_time_entry = models.TimeEntry(
        **time_entry.dict(exclude={"start_time"}),
        user_id=current_user.id,
        start_time=datetime.utcnow()
    )
    
    db.add(db_time_entry)
    await db.commit()
    await db.refresh(db_time_entry)
    return db_time_entry

@router.post("/{time_entry_id}/stop", response_model=schemas.TimeEntryResponse)
async def stop_time_entry(
    time_entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the time entry
    result = await db.execute(
        select(models.TimeEntry).where(models.TimeEntry.id == time_entry_id)
    )
    db_time_entry = result.scalars().first()
    
    if db_time_entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Check permissions
    if db_time_entry.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to stop this time entry"
        )
    
    # Stop the timer
    now = datetime.utcnow()
    db_time_entry.end_time = now
    if db_time_entry.start_time:
        db_time_entry.duration_seconds = int((now - db_time_entry.start_time).total_seconds())
    
    await db.commit()
    await db.refresh(db_time_entry)
    return db_time_entry

@router.get("/", response_model=schemas.PaginatedResponse)
async def read_time_entries(
    skip: int = 0,
    limit: int = 100,
    filter: Optional[schemas.TimeEntryFilter] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Build query
    query = select(models.TimeEntry)
    
    # Apply filters
    if filter:
        if filter.user_id:
            query = query.where(models.TimeEntry.user_id == filter.user_id)
        if filter.project_id:
            query = query.where(models.TimeEntry.project_id == filter.project_id)
        if filter.task_id:
            query = query.where(models.TimeEntry.task_id == filter.task_id)
        if filter.is_billable is not None:
            query = query.where(models.TimeEntry.is_billable == filter.is_billable)
        if filter.start_date:
            query = query.where(models.TimeEntry.start_time >= filter.start_date)
        if filter.end_date:
            # Add one day to include the entire end date
            end_date = filter.end_date + timedelta(days=1)
            query = query.where(models.TimeEntry.start_time < end_date)
    
    # Regular users can only see their own time entries
    if current_user.role == models.UserRole.EMPLOYEE:
        query = query.where(models.TimeEntry.user_id == current_user.id)
    # Managers can see their team's time entries
    elif current_user.role == models.UserRole.MANAGER:
        # This assumes there's a way to determine team members
        # You'll need to implement this based on your team structure
        team_member_ids = await get_team_member_ids(db, current_user.id)
        query = query.where(
            or_(
                models.TimeEntry.user_id == current_user.id,
                models.TimeEntry.user_id.in_(team_member_ids)
            )
        )
    
    # Order by start time (newest first)
    query = query.order_by(models.TimeEntry.start_time.desc())
    
    # Get total count
    total = (await db.execute(select([query.subquery()]))).scalars().count()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    time_entries = result.scalars().all()
    
    return {
        "items": time_entries,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{time_entry_id}", response_model=schemas.TimeEntryResponse)
async def read_time_entry(
    time_entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    result = await db.execute(
        select(models.TimeEntry).where(models.TimeEntry.id == time_entry_id)
    )
    time_entry = result.scalars().first()
    
    if time_entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Check permissions
    if time_entry.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this time entry"
        )
    
    return time_entry

@router.put("/{time_entry_id}", response_model=schemas.TimeEntryResponse)
async def update_time_entry(
    time_entry_id: str,
    time_entry_update: schemas.TimeEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the time entry
    result = await db.execute(
        select(models.TimeEntry).where(models.TimeEntry.id == time_entry_id)
    )
    db_time_entry = result.scalars().first()
    
    if db_time_entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Check permissions
    if db_time_entry.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this time entry"
        )
    
    # Update time entry fields
    for field, value in time_entry_update.dict(exclude_unset=True).items():
        setattr(db_time_entry, field, value)
    
    # Recalculate duration if start_time or end_time was updated
    if 'start_time' in time_entry_update.dict(exclude_unset=True) or 'end_time' in time_entry_update.dict(exclude_unset=True):
        if db_time_entry.start_time and db_time_entry.end_time:
            db_time_entry.duration_seconds = int((db_time_entry.end_time - db_time_entry.start_time).total_seconds())
    
    db_time_entry.updated_at = models.func.now()
    
    await db.commit()
    await db.refresh(db_time_entry)
    return db_time_entry

@router.delete("/{time_entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    time_entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the time entry
    result = await db.execute(
        select(models.TimeEntry).where(models.TimeEntry.id == time_entry_id)
    )
    db_time_entry = result.scalars().first()
    
    if db_time_entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    # Check permissions
    if db_time_entry.user_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this time entry"
        )
    
    await db.delete(db_time_entry)
    await db.commit()
    return None

# Helper function to get team member IDs for a manager
async def get_team_member_ids(db: AsyncSession, manager_id: str) -> List[str]:
    # This is a placeholder implementation
    # You'll need to implement this based on your team structure
    # For example, you might have a Team model with a manager_id field
    result = await db.execute(
        select(models.User.id).where(
            models.User.manager_id == manager_id
        )
    )
    return [row[0] for row in result.all()]

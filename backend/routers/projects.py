from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from .. import schemas, auth
from ..database import get_db, User, UserRole, Project, Task

router = APIRouter()

@router.post("/", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: schemas.ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Only admins and managers can create projects
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create projects"
        )
    
    # Create new project
    db_project = Project(
        **project.dict(),
        created_by=current_user.id
    )
    
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.get("/", response_model=schemas.PaginatedResponse)
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    filter: Optional[schemas.ProjectFilter] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Build query
    query = select(Project)
    
    # Apply filters
    if filter:
        if filter.status:
            query = query.where(Project.status == filter.status)
        if filter.client:
            query = query.where(Project.client == filter.client)
        if filter.start_date:
            query = query.where(Project.start_date >= filter.start_date)
        if filter.end_date:
            query = query.where(Project.end_date <= filter.end_date)
    
    # Regular users can only see projects they're assigned to
    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.MANAGER:
        # Regular users can only see projects they own
        query = query.where(
            Project.created_by == current_user.id
        )
    
    # Get total count (SQLAlchemy 1.4/2.0 compatible)
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return {
        "items": projects,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
async def read_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalars().first()
    
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.MANAGER:
        # Check if user is a member of the project
        member_result = await db.execute(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == current_user.id
            )
        )
        if not member_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view this project"
            )
    
    return project

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
async def update_project(
    project_id: str,
    project_update: schemas.ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Only admins and managers can update projects
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update projects"
        )
    
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project fields
    for field, value in project_update.dict(exclude_unset=True).items():
        setattr(db_project, field, value)
    
    db_project.updated_at = func.now()
    
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.admin_only)
):
    # Only admins can delete projects
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    db_project = result.scalars().first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(db_project)
    await db.commit()
    return None

# Project members endpoints - Not implemented in current schema
# The current schema doesn't support multiple members per project.
# To implement this, you'll need to create a ProjectMember model and set up the many-to-many relationship.
# Here's a placeholder for future implementation:

@router.post("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_project_member(
    project_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.manager_only)
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Project members feature is not implemented in the current schema"
    )

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_member(
    project_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.manager_only)
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Project members feature is not implemented in the current schema"
    )

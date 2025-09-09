from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime

from .. import schemas, auth
from ..database import get_db, User, Project, Task, UserRole

router = APIRouter()

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: schemas.TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Check if project exists
    project = await db.execute(
        select(Project).where(Project.id == task.project_id)
    )
    project = project.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions
    if current_user.role == UserRole.EMPLOYEE and project.created_by != current_user.id:
        # Regular users can only create tasks in their own projects
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create tasks in this project"
        )
    
    # Check if assignee exists and has access to the project
    if task.assignee_id:
        assignee = await db.execute(
            select(User).where(User.id == task.assignee_id)
        )
        if not assignee.scalars().first():
            raise HTTPException(status_code=404, detail="Assignee not found")
        
        # Check if assignee exists
        assignee_user = await db.execute(
            select(User).where(User.id == task.assignee_id)
        )
        if not assignee_user.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assignee not found"
            )
    
    # Create new task
    db_task = Task(
        **task.dict(),
        created_by=current_user.id,
        created_at=datetime.utcnow()
    )
    
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    
    return db_task

@router.get("/", response_model=schemas.PaginatedResponse)
async def get_tasks(
    project_id: Optional[str] = None,
    assignee_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Build query
    query = select(Task)
    
    # Apply filters
    if project_id:
        query = query.where(Task.project_id == project_id)
    
    if assignee_id:
        # Regular users can only see their own assigned tasks
        if current_user.role == UserRole.EMPLOYEE and assignee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view other users' tasks"
            )
        query = query.where(Task.assignee_id == assignee_id)
    
    if status:
        query = query.where(Task.status == status)
    
    # Regular users can only see tasks in their own projects
    if current_user.role == UserRole.EMPLOYEE:
        query = query.join(
            Project,
            Task.project_id == Project.id
        ).where(
            Project.created_by == current_user.id
        )
    # Managers can see all tasks
    elif current_user.role == UserRole.MANAGER:
        # Managers can see all tasks
        pass
    
    # Order by due date (nulls last) and creation time
    query = query.order_by(
        Task.due_date.asc().nullslast(),
        Task.created_at.desc()
    )
    
    # Get total count
    total = (await db.execute(select([query.subquery()]))).scalars().count()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return {
        "items": tasks,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{task_id}", response_model=schemas.TaskResponse)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalars().first()
    
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if current_user.role == UserRole.EMPLOYEE:
        # Check if user is the owner of the project
        project = await db.execute(
            select(Project).where(
                Project.id == task.project_id,
                Project.created_by == current_user.id
            )
        )
        if not project.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view this task"
            )
    
    return task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
async def update_task(
    task_id: str,
    task_update: schemas.TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the task
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if current_user.role == UserRole.EMPLOYEE:
        # Regular users can only update their own tasks in their own projects
        if db_task.assignee_id != current_user.id:
            # Check if user is the owner of the project
            project = await db.execute(
                select(Project).where(
                    Project.id == db_task.project_id,
                    Project.created_by == current_user.id
                )
            )
            if not project.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions to update this task"
                )
    
    # Check if assignee exists
    if task_update.assignee_id is not None and task_update.assignee_id != db_task.assignee_id:
        assignee = await db.execute(
            select(User).where(User.id == task_update.assignee_id)
        )
        if not assignee.scalars().first():
            raise HTTPException(status_code=404, detail="Assignee not found")
    
    # Update task fields
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)
    
    db_task.updated_at = func.now()
    
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the task
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if current_user.role == UserRole.EMPLOYEE:
        # Regular users can only delete their own tasks or tasks in their projects
        if db_task.assignee_id != current_user.id:
            # Check if user is the owner of the project
            project = await db.execute(
                select(Project).where(
                    Project.id == db_task.project_id,
                    Project.created_by == current_user.id
                )
            )
            if not project.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions to delete this task"
                )
    
    await db.delete(db_task)
    await db.commit()
    return None

# Helper function to get team member IDs for a manager
async def get_team_member_ids(db: AsyncSession, manager_id: str) -> List[str]:
    # This is a placeholder implementation
    # You'll need to implement this based on your team structure
    # For example, you might have a Team model with a manager_id field
    result = await db.execute(
        select(User.id).where(
            User.manager_id == manager_id
        )
    )
    return [row[0] for row in result.all()]

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, or_

from database.structure import get_session
from sqlmodels.projects import (
    Project, ProjectCreate, ProjectUpdate, 
    Task, TaskCreate, TaskUpdate,
    TimeEntry, TimeEntryCreate, TimeEntryUpdate,
    ProjectMember, ProjectMemberCreate, ProjectMemberUpdate
)
from sqlmodels.user_usage import User
from authentication.jwt_hashing import get_current_user, bearer_scheme

router = APIRouter(
    prefix="/api/v1",
    tags=["Projects & Tasks"]
)

# Helper function to check if user is project member
def check_project_member(session: Session, project_id: int, user_id: int, required_role: str = None):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    member = session.exec(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .where(ProjectMember.user_id == user_id)
    ).first()
    
    if not member and required_role:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    if required_role and member.role != required_role and member.role != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return project, member

# Projects endpoints
@router.post("/projects/", status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Only admins can create projects
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create projects")
    
    # Create the project
    db_project = Project.model_validate(project)
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    
    # Automatically add the creator as an admin member
    member = ProjectMember(
        project_id=db_project.id,
        user_id=current_user.id,
        role="admin",
        joined_at=datetime.utcnow()
    )
    session.add(member)
    session.commit()
    
    return db_project

@router.get("/projects/", response_model=List[Project])
async def list_projects(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    if current_user.role == "admin":
        projects = session.exec(select(Project)).all()
    else:
        # Only show projects the user is a member of
        projects = session.exec(
            select(Project)
            .join(ProjectMember)
            .where(ProjectMember.user_id == current_user.id)
        ).all()
    return projects

@router.get("/projects/{project_id}")
async def get_project(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    project, _ = check_project_member(session, project_id, current_user.id)
    return project

# Tasks endpoints
@router.post("/projects/{project_id}/tasks/", status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: int,
    task: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Check if project exists and user is a member
    project, member = check_project_member(session, project_id, current_user.id, "manager")
    
    db_task = Task.model_validate(task, update={"project_id": project_id})
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/projects/{project_id}/tasks/", response_model=List[Task])
async def list_tasks(
    project_id: int,
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Check if project exists and user is a member
    check_project_member(session, project_id, current_user.id)
    
    query = select(Task).where(Task.project_id == project_id)
    
    if status:
        query = query.where(Task.status == status)
    if assigned_to:
        query = query.where(Task.assigned_to == assigned_to)
    
    tasks = session.exec(query).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Get the task
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user is a project member
    check_project_member(session, db_task.project_id, current_user.id)
    
    return db_task

@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Get the task
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user is a project member with write access
    project, member = check_project_member(session, db_task.project_id, current_user.id, "member")
    
    # Verify the assigned user is a project member if being updated
    if task_update.assigned_to is not None:
        assigned_member = session.exec(
            select(ProjectMember)
            .where(ProjectMember.project_id == db_task.project_id)
            .where(ProjectMember.user_id == task_update.assigned_to)
        ).first()
        if not assigned_member:
            raise HTTPException(status_code=400, detail="Assigned user is not a project member")
    
    # Update task data
    task_data = task_update.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        setattr(db_task, key, value)
    
    db_task.updated_at = datetime.utcnow()
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Get the task
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Only project admins or the task creator can delete tasks
    project, member = check_project_member(session, db_task.project_id, current_user.id, "member")
    
    # Check if user is admin or the task creator
    if member.role not in ["admin", "manager"] and db_task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Only project admins, managers, or the task creator can delete tasks")
    
    session.delete(db_task)
    session.commit()
    return None

# Time entries endpoints
@router.post("/time-entries/", status_code=status.HTTP_201_CREATED)
async def create_time_entry(
    time_entry: TimeEntryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Verify the task exists and user is assigned to it
    task = session.get(Task, time_entry.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user is a member of the project
    check_project_member(session, task.project_id, current_user.id)
    
    # Set the current user as the time entry owner
    db_time_entry = TimeEntry.model_validate(
        time_entry, 
        update={"user_id": current_user.id, "end_time": None}
    )
    
    session.add(db_time_entry)
    session.commit()
    session.refresh(db_time_entry)
    return db_time_entry

@router.post("/time-entries/{entry_id}/stop")
async def stop_time_entry(
    entry_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    time_entry = session.get(TimeEntry, entry_id)
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    if time_entry.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify this time entry")
    
    if time_entry.end_time:
        raise HTTPException(status_code=400, detail="Time entry already stopped")
    
    # Calculate duration in hours
    time_entry.end_time = datetime.utcnow()
    duration = (time_entry.end_time - time_entry.start_time).total_seconds() / 3600
    time_entry.duration = round(duration, 2)  # Round to 2 decimal places
    
    session.add(time_entry)
    session.commit()
    session.refresh(time_entry)
    return time_entry

# Project members management
@router.post("/projects/{project_id}/members/")
async def add_project_member(
    project_id: int,
    member: ProjectMemberCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    # Only project managers or admins can add members
    project, existing_member = check_project_member(session, project_id, current_user.id, "manager")
    
    # Check if user exists
    user = session.get(User, member.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a member
    existing = session.exec(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .where(ProjectMember.user_id == member.user_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this project")
    
    db_member = ProjectMember.model_validate(member, update={"project_id": project_id})
    session.add(db_member)
    session.commit()
    session.refresh(db_member)
    return db_member

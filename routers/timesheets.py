from datetime import datetime, timedelta, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlmodel import Session, select, func, or_

from database.structure import get_session
from sqlmodels.projects import TimeEntry, Task, Project, ProjectMember
from sqlmodels.user_usage import User
from authentication.jwt_hashing import get_current_user, bearer_scheme
from pydantic import BaseModel, Field
from typing import Dict, Any, List as ListType

router = APIRouter(
    prefix="/api/v1",
    tags=["Timesheets & Attendance"]
)

class TimesheetEntry(BaseModel):
    date: date
    project_name: str
    task_name: str
    start_time: datetime
    end_time: Optional[datetime]
    duration: float  # in hours
    status: str

class TimesheetResponse(BaseModel):
    user_id: int
    user_name: str
    entries: List[TimesheetEntry]
    total_hours: float

class AttendanceRecord(BaseModel):
    date: date
    status: str  # present, absent, late, half-day
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    total_hours: Optional[float]

class TimeEntryStart(BaseModel):
    task_id: int = Field(..., description="ID of the task to track time for")
    project_id: int = Field(..., description="ID of the project the task belongs to")
    description: Optional[str] = Field(None, description="Optional description for this time entry")
    start_time: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Optional start time (defaults to current time if not provided)"
    )

class TimeEntryStop(BaseModel):
    time_entry_id: Optional[int] = Field(
        None, 
        description="ID of the time entry to stop. If not provided, will stop the most recent running entry."
    )
    end_time: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Optional end time (defaults to current time if not provided)"
    )
    notes: Optional[str] = Field(None, description="Optional notes for this time entry")

class PayrollPeriod(BaseModel):
    start_date: date
    end_date: date
    user_id: int
    hourly_rate: float
    total_hours: float
    total_pay: float
    status: str  # pending, approved, paid

@router.get("/timesheet", response_model=TimesheetResponse)
async def get_timesheet(
    user_id: Optional[int] = None,
    start_date: date = Query(default_factory=lambda: (datetime.utcnow() - timedelta(days=7)).date()),
    end_date: date = Query(default_factory=lambda: datetime.utcnow().date()),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Get timesheet entries for a user within a date range.
    Admins can view any user's timesheet, users can only view their own.
    """
    # If no user_id provided, use current user
    if user_id is None:
        user_id = current_user.id
    
    # Check if user has permission to view this timesheet
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this timesheet"
        )
    
    # Get user details
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Query time entries for the user within date range
    stmt = (
        select(TimeEntry, Task, Project)
        .join(Task, TimeEntry.task_id == Task.id)
        .join(Project, Task.project_id == Project.id)
        .where(TimeEntry.user_id == user_id)
        .where(TimeEntry.start_time >= start_date)
        .where(TimeEntry.end_time <= end_date + timedelta(days=1))  # Include full end date
        .order_by(TimeEntry.start_time)
    )
    
    results = session.exec(stmt).all()
    
    # Format the response
    entries = []
    total_hours = 0.0
    
    for time_entry, task, project in results:
        duration = time_entry.duration or (
            (time_entry.end_time - time_entry.start_time).total_seconds() / 3600 
            if time_entry.end_time else 0
        )
        total_hours += duration
        
        entries.append(TimesheetEntry(
            date=time_entry.start_time.date(),
            project_name=project.name,
            task_name=task.title,
            start_time=time_entry.start_time,
            end_time=time_entry.end_time,
            duration=round(duration, 2),
            status=time_entry.status or "completed"
        ))
    
    return TimesheetResponse(
        user_id=user.id,
        user_name=user.name,
        entries=entries,
        total_hours=round(total_hours, 2)
    )

@router.get("/attendance", response_model=List[AttendanceRecord])
async def get_attendance(
    user_id: Optional[int] = None,
    start_date: date = Query(default_factory=lambda: (datetime.utcnow() - timedelta(days=30)).date()),
    end_date: date = Query(default_factory=lambda: datetime.utcnow().date()),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Get attendance records for a user within a date range.
    """
    if user_id is None:
        user_id = current_user.id
    
    # Check permissions
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this attendance record"
        )
    
    # Get all days in the date range
    delta = end_date - start_date
    date_range = [start_date + timedelta(days=i) for i in range(delta.days + 1)]
    
    # Get all time entries for the user in this date range
    stmt = (
        select(TimeEntry)
        .where(TimeEntry.user_id == user_id)
        .where(TimeEntry.start_time >= start_date)
        .where(TimeEntry.end_time <= end_date + timedelta(days=1))
        .order_by(TimeEntry.start_time)
    )
    
    time_entries = session.exec(stmt).all()
    
    # Group time entries by date
    entries_by_date: Dict[date, List[TimeEntry]] = {}
    for entry in time_entries:
        entry_date = entry.start_time.date()
        if entry_date not in entries_by_date:
            entries_by_date[entry_date] = []
        entries_by_date[entry_date].append(entry)
    
    # Create attendance records
    attendance_records = []
    
    for day in date_range:
        if day in entries_by_date:
            # Get all entries for this day
            day_entries = entries_by_date[day]
            day_entries.sort(key=lambda x: x.start_time)
            
            # Calculate total hours for the day
            total_hours = sum(
                (entry.duration or 
                 ((entry.end_time - entry.start_time).total_seconds() / 3600 if entry.end_time else 0))
                for entry in day_entries
            )
            
            # Determine status based on total hours
            if total_hours >= 8:
                status = "present"
            elif total_hours >= 4:
                status = "half-day"
            else:
                status = "present"  # Consider any activity as present for now
            
            attendance_records.append(AttendanceRecord(
                date=day,
                status=status,
                check_in=day_entries[0].start_time,
                check_out=day_entries[-1].end_time,
                total_hours=round(total_hours, 2)
            ))
        else:
            # No time entries for this day
            attendance_records.append(AttendanceRecord(
                date=day,
                status="absent",
                check_in=None,
                check_out=None,
                total_hours=0.0
            ))
    
    return attendance_records

@router.get("/payroll/calculate", response_model=PayrollPeriod)
async def calculate_payroll(
    user_id: int,
    start_date: date,
    end_date: date,
    hourly_rate: Optional[float] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Calculate payroll for a user within a date range.
    Only admins can calculate payroll for other users.
    """
    # Check permissions
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to calculate payroll"
        )
    
    # Get user and their default hourly rate if not provided
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the default hourly rate from the user's most recent project membership
    if hourly_rate is None:
        stmt = (
            select(ProjectMember.hourly_rate)
            .where(ProjectMember.user_id == user_id)
            .order_by(ProjectMember.joined_at.desc())
            .limit(1)
        )
        result = session.exec(stmt).first()
        hourly_rate = result[0] if result else 0.0
    
    # Get all time entries for the user in this date range
    stmt = (
        select(TimeEntry)
        .where(TimeEntry.user_id == user_id)
        .where(TimeEntry.start_time >= start_date)
        .where(TimeEntry.end_time <= end_date + timedelta(days=1))
        .where(TimeEntry.status == "completed")
    )
    
    time_entries = session.exec(stmt).all()
    
    # Calculate total hours
    total_hours = sum(
        (entry.duration or 
         ((entry.end_time - entry.start_time).total_seconds() / 3600 if entry.end_time else 0))
        for entry in time_entries
    )
    
    total_pay = total_hours * hourly_rate
    
    return PayrollPeriod(
        start_date=start_date,
        end_date=end_date,
        user_id=user_id,
        hourly_rate=hourly_rate,
        total_hours=round(total_hours, 2),
        total_pay=round(total_pay, 2),
        status="pending"
    )

@router.post("/timesheet/start", response_model=TimeEntry, status_code=status.HTTP_201_CREATED)
async def start_time_tracking(
    time_entry: TimeEntryStart,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Start tracking time for a specific task.
    Only one time entry can be active at a time per user.
    """
    # Check if user has an active time entry
    active_entry = session.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .where(TimeEntry.end_time.is_(None))
    ).first()
    
    if active_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active time entry. Please stop it before starting a new one."
        )
    
    # Verify task exists and belongs to the specified project
    task = session.get(Task, time_entry.task_id)
    if not task or task.project_id != time_entry.project_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or doesn't belong to the specified project"
        )
    
    # Create new time entry
    new_entry = TimeEntry(
        task_id=time_entry.task_id,
        user_id=current_user.id,
        start_time=time_entry.start_time or datetime.now(timezone.utc),
        description=time_entry.description or f"Working on {task.title}"
    )
    
    session.add(new_entry)
    session.commit()
    session.refresh(new_entry)
    
    return new_entry

@router.post("/timesheet/stop", response_model=TimeEntry)
async def stop_time_tracking(
    stop_data: TimeEntryStop = Body(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Stop the currently active time tracking entry.
    """
    # Find the active time entry
    query = select(TimeEntry).where(
        TimeEntry.user_id == current_user.id,
        TimeEntry.end_time.is_(None)
    )
    
    if stop_data.time_entry_id:
        query = query.where(TimeEntry.id == stop_data.time_entry_id)
    
    active_entry = session.exec(query.order_by(TimeEntry.start_time.desc())).first()
    
    if not active_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active time entry found to stop"
        )
    
    # Update the time entry
    active_entry.end_time = stop_data.end_time or datetime.now(timezone.utc)
    active_entry.duration = (active_entry.end_time - active_entry.start_time).total_seconds() / 3600  # in hours
    
    if stop_data.notes:
        if active_entry.description:
            active_entry.description += f"\nNotes: {stop_data.notes}"
        else:
            active_entry.description = f"Notes: {stop_data.notes}"
    
    session.add(active_entry)
    session.commit()
    session.refresh(active_entry)
    
    return active_entry

# Add this router to your main FastAPI app in main.py
# from routers import timesheets
# app.include_router(timesheets.router)

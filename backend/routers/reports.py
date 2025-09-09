from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import csv
import json
import os
from pathlib import Path
import uuid

from .. import schemas, auth
from ..database import get_db, User, Report, TimeEntry, ActivityLog, Screenshot, UserRole

router = APIRouter()

# Configuration
REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

@router.post("/", response_model=schemas.ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report: schemas.ReportCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Create report record
    db_report = Report(
        **report.dict(),
        created_by=current_user.id,
        status="pending"
    )
    
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    
    # Start background task to generate report
    background_tasks.add_task(
        generate_report_background,
        db=db,
        report_id=db_report.id,
        report_data=report.dict()
    )
    
    return db_report

async def generate_report_background(db: AsyncSession, report_id: str, report_data: Dict[str, Any]):
    try:
        # Get the report
        result = await db.execute(
            select(Report).where(Report.id == report_id)
        )
        db_report = result.scalars().first()
        
        if not db_report:
            return  # Report not found
        
        # Update status to processing
        db_report.status = "processing"
        await db.commit()
        
        # Generate report based on type
        report_file = None
        
        if db_report.report_type == "time_entries":
            report_file = await generate_time_entries_report(db, db_report, report_data)
        elif db_report.report_type == "activity":
            report_file = await generate_activity_report(db, db_report, report_data)
        elif db_report.report_type == "screenshots":
            report_file = await generate_screenshots_report(db, db_report, report_data)
        else:
            raise ValueError(f"Unknown report type: {db_report.report_type}")
        
        # Update report with file path
        db_report.file_path = str(report_file)
        db_report.status = "completed"
        
    except Exception as e:
        # Update report with error
        db_report.status = "failed"
        db_report.file_path = None
        print(f"Error generating report: {e}")
    
    finally:
        db_report.updated_at = func.now()
        await db.commit()

async def generate_time_entries_report(db: AsyncSession, report: Report, report_data: Dict[str, Any]) -> Path:
    # Build query
    query = select(
        TimeEntry,
        User.full_name,
        Project.name.label("project_name"),
        Task.title.label("task_title")
    ).join(
        User, TimeEntry.user_id == User.id
    ).join(
        Project, TimeEntry.project_id == Project.id
    ).outerjoin(
        Task, TimeEntry.task_id == Task.id
    )
    
    # Apply filters
    if report_data.get("user_id"):
        query = query.where(TimeEntry.user_id == report_data["user_id"])
    if report_data.get("project_id"):
        query = query.where(TimeEntry.project_id == report_data["project_id"])
    if report_data.get("task_id"):
        query = query.where(TimeEntry.task_id == report_data["task_id"])
    if report_data.get("start_date"):
        query = query.where(TimeEntry.start_time >= report_data["start_date"])
    if report_data.get("end_date"):
        query = query.where(TimeEntry.end_time <= report_data["end_date"] + timedelta(days=1))
    if report.user_ids:
        query = query.where(TimeEntry.user_id.in_(report.user_ids))
    if report.project_ids:
        query = query.where(TimeEntry.project_id.in_(report.project_ids))
    
    # Execute query
    result = await db.execute(query)
    rows = result.all()
    
    # Generate CSV
    report_file = Path(REPORTS_DIR) / f"time_entries_{report.id}.csv"
    
    with open(report_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow([
            "User", "Project", "Task", "Start Time", "End Time", 
            "Duration (hours)", "Description", "Billable"
        ])
        
        # Write data
        for row in rows:
            time_entry = row[0]
            duration_hours = time_entry.duration_seconds / 3600 if time_entry.duration_seconds else 0
            
            writer.writerow([
                row.full_name,
                row.project_name,
                row.task_title or "",
                time_entry.start_time.isoformat() if time_entry.start_time else "",
                time_entry.end_time.isoformat() if time_entry.end_time else "",
                f"{duration_hours:.2f}",
                time_entry.description or "",
                "Yes" if time_entry.is_billable else "No"
            ])
    
    return report_file

async def generate_activity_report(db: AsyncSession, report: Report, report_data: Dict[str, Any]) -> Path:
    # This is a simplified example - in a real app, you'd aggregate activity data
    # from the activity_logs table
    
    # Build query
    query = select(
        User.full_name,
        func.avg(ActivityLog.overall_activity).label("avg_activity"),
        func.count(ActivityLog.id).label("log_count"),
        func.date(ActivityLog.timestamp).label("log_date")
    ).join(
        User, ActivityLog.user_id == User.id
    )
    
    # Apply filters
    if report_data.get("user_id"):
        query = query.where(ActivityLog.user_id == report_data["user_id"])
    if report_data.get("start_date"):
        query = query.where(ActivityLog.timestamp >= report_data["start_date"])
    if report_data.get("end_date"):
        query = query.where(ActivityLog.timestamp <= report_data["end_date"] + timedelta(days=1))
    if report.user_ids:
        query = query.where(ActivityLog.user_id.in_(report.user_ids))
    
    # Group by user and date
    query = query.group_by(
        User.full_name,
        func.date(ActivityLog.timestamp)
    ).order_by(
        User.full_name,
        func.date(ActivityLog.timestamp)
    )
    
    # Execute query
    result = await db.execute(query)
    rows = result.all()
    
    # Generate CSV
    report_file = Path(REPORTS_DIR) / f"activity_{report.id}.csv"
    
    with open(report_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow(["User", "Date", "Average Activity (%)", "Data Points"])
        
        # Write data
        for row in rows:
            writer.writerow([
                row.full_name,
                row.log_date.isoformat(),
                f"{row.avg_activity:.1f}",
                row.log_count
            ])
    
    return report_file

async def generate_screenshots_report(db: AsyncSession, report: Report, report_data: Dict[str, Any]) -> Path:
    # Build query
    query = select(
        Screenshot,
        User.full_name,
        TimeEntry.description.label("time_entry_description")
    ).join(
        User, Screenshot.user_id == User.id
    ).outerjoin(
        TimeEntry, Screenshot.time_entry_id == TimeEntry.id
    ).join(
        Project, TimeEntry.project_id == Project.id
    )
    
    # Apply filters
    if report_data.get("user_id"):
        query = query.where(Screenshot.user_id == report_data["user_id"])
    if report_data.get("project_id"):
        query = query.where(TimeEntry.project_id == report_data["project_id"])
    if report_data.get("start_date"):
        query = query.where(Screenshot.created_at >= report_data["start_date"])
    if report_data.get("end_date"):
        query = query.where(Screenshot.created_at <= report_data["end_date"] + timedelta(days=1))
    if report.start_date:
        query = query.where(Screenshot.created_at >= report.start_date)
    if report.end_date:
        query = query.where(Screenshot.created_at <= report.end_date + timedelta(days=1))
    if report.user_ids:
        query = query.where(Screenshot.user_id.in_(report.user_ids))
    if report.project_ids:
        query = query.where(Project.id.in_(report.project_ids))
    
    # Execute query
    result = await db.execute(query)
    rows = result.all()
    
    # Generate CSV
    report_file = Path(REPORTS_DIR) / f"screenshots_{report.id}.csv"
    
    with open(report_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow(["User", "Project", "Timestamp", "Activity Level (0-100)", "Window Title", "Application"])
        
        # Write data
        for row in rows:
            screenshot = row[0]
            writer.writerow([
                row.full_name,
                row.project_name,
                screenshot.created_at.isoformat(),
                screenshot.activity_level,
                screenshot.window_title or "",
                screenshot.application_name or ""
            ])
    
    return report_file

@router.get("/", response_model=schemas.PaginatedResponse)
async def get_reports(
    skip: int = 0,
    limit: int = 100,
    filter: Optional[schemas.ReportFilter] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Build query
    query = select(Report)
    
    # Apply filters
    if filter:
        if filter.status:
            query = query.where(models.Report.status == filter.status)
        if filter.created_by:
            query = query.where(models.Report.created_by == filter.created_by)
        if filter.start_date:
            query = query.where(models.Report.created_at >= filter.start_date)
        if filter.end_date:
            query = query.where(models.Report.created_at <= filter.end_date + timedelta(days=1))
    
    # Regular users can only see their own reports
    if current_user.role == UserRole.EMPLOYEE:
        query = query.where(models.Report.created_by == current_user.id)
    # Managers can see their team's reports
    elif current_user.role == UserRole.MANAGER:
        # This assumes there's a way to determine team members
        # You'll need to implement this based on your team structure
        team_member_ids = await get_team_member_ids(db, current_user.id)
        team_member_ids.append(current_user.id)  # Include self
        query = query.where(models.Report.created_by.in_(team_member_ids))
    
    # Order by creation time (newest first)
    query = query.order_by(models.Report.created_at.desc())
    
    # Get total count
    total = (await db.execute(select([query.subquery()]))).scalars().count()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    reports = result.scalars().all()
    
    return {
        "items": reports,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{report_id}", response_model=schemas.ReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    result = await db.execute(
        select(Report).where(Report.id == report_id)
    )
    report = result.scalars().first()
    
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check permissions
    if report.created_by != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        # For managers, check if the report creator is in their team
        if current_user.role == UserRole.MANAGER:
            team_member_ids = await get_team_member_ids(db, current_user.id)
            if report.created_by not in team_member_ids and report.created_by != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions to view this report"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view this report"
            )
    
    return report

@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the report
    result = await db.execute(
        select(Report).where(Report.id == report_id)
    )
    report = result.scalars().first()
    
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check permissions (same as get_report)
    if report.created_by != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        if current_user.role == UserRole.MANAGER:
            team_member_ids = await get_team_member_ids(db, current_user.id)
            if report.created_by not in team_member_ids and report.created_by != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions to download this report"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to download this report"
            )
    
    # Check if report file exists
    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    
    # Determine content type based on file extension
    ext = os.path.splitext(report.file_path)[1].lower()
    media_type = "text/csv" if ext == ".csv" else "application/octet-stream"
    
    # Return the file
    from fastapi.responses import FileResponse
    return FileResponse(report.file_path, media_type=media_type, filename=os.path.basename(report.file_path))

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the report
    result = await db.execute(
        select(Report).where(Report.id == report_id)
    )
    db_report = result.scalars().first()
    
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Only the creator or an admin can delete the report
    if db_report.created_by != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this report"
        )
    
    # Delete the report file if it exists
    if db_report.file_path and os.path.exists(db_report.file_path):
        try:
            os.remove(db_report.file_path)
        except Exception as e:
            print(f"Error deleting report file: {e}")
    
    # Delete the database record
    await db.delete(db_report)
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

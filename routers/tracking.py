from datetime import datetime, timedelta, date, time
from typing import List, Optional, Dict, Any, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, BackgroundTasks
from sqlmodel import Session, select, func, and_, or_
from pydantic import BaseModel, Field, HttpUrl
import os
import uuid
import shutil
from pathlib import Path
from PIL import Image
import io

from database.structure import get_session
from sqlmodels.user_usage import User
from sqlmodels.activity import (
    Activity, TrackActivityRequest, TrackAppUsageRequest,
    TrackScreenshotRequest, ActivityStats, DailyActivitySummary
)
from authentication.jwt_hashing import get_current_user

# Add this at the end to ensure all models are properly set up
# This will update the User model with the activities relationship
from sqlmodels.user_usage import User as UserModel
if not hasattr(UserModel, 'activities'):
    from sqlmodel import Relationship
    UserModel.activities = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

# Configuration
SCREENSHOTS_DIR = "screenshots"
THUMBNAILS_DIR = os.path.join(SCREENSHOTS_DIR, "thumbnails")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(THUMBNAILS_DIR, exist_ok=True)

router = APIRouter(
    prefix="/api/v1",
    tags=['Activity Tracking']
)

def save_uploaded_file(upload_file: UploadFile, user_id: int) -> Tuple[str, str]:
    """
    Save uploaded screenshot and return (file_path, relative_path)
    """
    # Create user directory if it doesn't exist
    user_dir = os.path.join(SCREENSHOTS_DIR, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename with original extension
    file_ext = Path(upload_file.filename).suffix.lower() or '.png'
    filename = f"{uuid.uuid4()}{file_ext}"
    
    # Save file
    file_path = os.path.join(user_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return both full path and relative path
    relative_path = os.path.join(str(user_id), filename)
    return file_path, relative_path

def create_thumbnail(source_path: str, size: tuple = (300, 300)) -> str:
    """Create a thumbnail from an image"""
    try:
        # Create thumbnail directory if it doesn't exist
        thumb_dir = os.path.join(THUMBNAILS_DIR, os.path.dirname(os.path.relpath(source_path, SCREENSHOTS_DIR)))
        os.makedirs(thumb_dir, exist_ok=True)
        
        # Generate thumbnail path
        thumb_path = os.path.join(THUMBNAILS_DIR, os.path.relpath(source_path, SCREENSHOTS_DIR))
        
        # Create and save thumbnail
        with Image.open(source_path) as img:
            img.thumbnail(size)
            img.save(thumb_path)
            
        return thumb_path
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return source_path  # Return original path if thumbnail creation fails

@router.post("/activity/track", status_code=status.HTTP_201_CREATED)
async def track_activity(
    activity: TrackActivityRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Track a generic activity with the following required fields:
    - activity_type: Type of activity (e.g., 'app_usage', 'idle_time', 'active_time')
    - start_time: When the activity started
    - end_time: When the activity ended (optional for ongoing activities)
    - duration: Duration in seconds (optional if end_time is provided)
    - activity_data: Additional data specific to the activity type
    """
    # Calculate duration if not provided but end_time is
    if activity.duration is None and activity.end_time is not None:
        activity.duration = (activity.end_time - activity.start_time).total_seconds()
    
    db_activity = Activity(
        user_id=current_user.id,
        activity_type=activity.activity_type,
        start_time=activity.start_time,
        end_time=activity.end_time,
        duration=activity.duration,
        activity_data=activity.activity_data or {}
    )
    
    session.add(db_activity)
    session.commit()
    session.refresh(db_activity)
    
    return {"id": db_activity.id, "message": "Activity tracked successfully"}

@router.post("/activity/track/app-usage", status_code=status.HTTP_201_CREATED)
async def track_app_usage(
    app_usage: TrackAppUsageRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Track application usage with the following details:
    - app_name: Name of the application
    - window_title: Title of the active window
    - executable_path: Path to the application executable (optional)
    - is_active: Whether the window was active
    - start_time: When the app usage started
    - end_time: When the app usage ended (optional)
    - duration: Duration in seconds (optional if end_time is provided)
    """
    activity_data = {
        "app_name": app_usage.app_name,
        "window_title": app_usage.window_title,
        "executable_path": app_usage.executable_path,
        "is_active": app_usage.is_active
    }
    
    # Calculate duration if not provided but end_time is
    if app_usage.duration is None and app_usage.end_time is not None:
        app_usage.duration = (app_usage.end_time - app_usage.start_time).total_seconds()
    
    db_activity = Activity(
        user_id=current_user.id,
        activity_type="app_usage",
        start_time=app_usage.start_time,
        end_time=app_usage.end_time,
        duration=app_usage.duration,
activity_data=activity_data
    )
    
    session.add(db_activity)
    session.commit()
    
    return {"id": db_activity.id, "message": "App usage tracked successfully"}

@router.post("/activity/track/screenshot", status_code=status.HTTP_201_CREATED)
async def track_screenshot(
    file: UploadFile = File(...),
    window_title: Optional[str] = None,
    app_name: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user())
):
    """
    Upload and track a screenshot with optional activity data
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Save the uploaded file
        file_path, relative_path = save_uploaded_file(file, current_user.id)
        
        # Create thumbnail in background
        thumb_path = create_thumbnail(file_path)
        
        # Prepare activity data
        activity_data = {
            "image_path": relative_path,
            "thumbnail_path": os.path.relpath(thumb_path, SCREENSHOTS_DIR) if thumb_path != file_path else relative_path,
            "window_title": window_title,
            "app_name": app_name,
            "file_size": os.path.getsize(file_path),
            "content_type": file.content_type
        }
        
        # Create activity record
        db_activity = Activity(
            user_id=current_user.id,
            activity_type="screenshot",
            start_time=datetime.utcnow(),
    activity_data=activity_data
        )
        
        session.add(db_activity)
        session.commit()
        session.refresh(db_activity)
        
        return {
            "id": db_activity.id,
            "timestamp": db_activity.start_time.isoformat(),
            "image_url": f"/api/v1/screenshots/{db_activity.id}/full",
            "thumbnail_url": f"/api/v1/screenshots/{db_activity.id}/thumbnail"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing screenshot: {str(e)}"
        )

@router.get("/activity/summary/daily", response_model=DailyActivitySummary)
async def get_daily_summary(
    target_date: date = Query(default_factory=date.today),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get a summary of activities for a specific day
    """
    start_datetime = datetime.combine(target_date, time.min)
    end_datetime = datetime.combine(target_date + timedelta(days=1), time.min)
    
    # Get all activities for the day
    activities = session.exec(
        select(Activity)
        .where(Activity.user_id == current_user.id)
        .where(Activity.start_time >= start_datetime)
        .where(Activity.start_time < end_datetime)
        .order_by(Activity.start_time)
    ).all()
    
    # Calculate summary
    total_active = 0
    total_idle = 0
    total_productive = 0
    app_usage = {}
    screenshots = []
    
    for activity in activities:
        duration = activity.duration or 0
        
        if activity.activity_type == "active_time":
            total_active += duration
        elif activity.activity_type == "idle_time":
            total_idle += duration
        elif activity.activity_type == "app_usage":
            app_name = activity.activity_data.get("app_name", "Unknown")
            app_usage[app_name] = app_usage.get(app_name, 0) + duration
            
            # Simple heuristic: consider time as productive if it's not a social/media app
            if not any(x in app_name.lower() for x in ["facebook", "twitter", "youtube", "netflix"]):
                total_productive += duration
        elif activity.activity_type == "screenshot":
            screenshots.append({
                "id": activity.id,
                "timestamp": activity.start_time.isoformat(),
                "thumbnail_url": f"/api/v1/screenshots/{activity.id}/thumbnail",
                "full_url": f"/api/v1/screenshots/{activity.id}/full"
            })
    
    return {
        "date": target_date.isoformat(),
        "total_active_seconds": total_active,
        "total_idle_seconds": total_idle,
        "total_productive_seconds": total_productive,
        "apps": app_usage,
        "screenshots": screenshots
    }

@router.get("/activity/screenshots/{screenshot_id}/thumbnail")
async def get_screenshot_thumbnail(
    screenshot_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a thumbnail for a specific screenshot"""
    activity = session.get(Activity, screenshot_id)
    
    if not activity or activity.activity_type != "screenshot" or activity.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    
    thumb_path = os.path.join(SCREENSHOTS_DIR, activity.activity_data["thumbnail_path"])
    
    if not os.path.exists(thumb_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    return FileResponse(thumb_path, media_type="image/jpeg")

@router.get("/activity/screenshots/{screenshot_id}/full")
async def get_screenshot_full(
    screenshot_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get the full-size screenshot"""
    activity = session.get(Activity, screenshot_id)
    
    if not activity or activity.activity_type != "screenshot" or activity.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    
    img_path = os.path.join(SCREENSHOTS_DIR, activity.activity_data["image_path"])
    
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(img_path, media_type=activity.activity_data.get("content_type", "image/jpeg"))

@router.get("/activity/timeline", response_model=List[Dict[str, Any]])
async def get_activity_timeline(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a timeline of activities between two dates"""
    start_datetime = datetime.combine(start_date, time.min)
    end_datetime = datetime.combine(end_date + timedelta(days=1), time.min)
    
    if (end_datetime - start_datetime).days > 31:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date range cannot exceed 31 days"
        )
    
    activities = session.exec(
        select(Activity)
        .where(Activity.user_id == current_user.id)
        .where(Activity.start_time >= start_datetime)
        .where(Activity.start_time < end_datetime)
        .order_by(Activity.start_time)
    ).all()
    
    timeline = []
    
    for activity in activities:
        item = {
            "id": activity.id,
            "type": activity.activity_type,
            "start_time": activity.start_time.isoformat(),
            "end_time": activity.end_time.isoformat() if activity.end_time else None,
            "duration": activity.duration,
            "activity_data": activity.activity_data
        }
        
        # Add human-readable description
        if activity.activity_type == "app_usage":
            item["description"] = f"Used {activity.activity_data.get('app_name', 'an app')}"
        elif activity.activity_type == "screenshot":
            item["description"] = f"Screenshot: {activity.activity_data.get('window_title', 'Untitled')}"
        elif activity.activity_type == "idle_time":
            item["description"] = "Idle time"
        elif activity.activity_type == "active_time":
            item["description"] = "Active time"
        
        timeline.append(item)
    
    return timeline

@router.get("/activity/stats/daily", response_model=List[Dict[str, Any]])
async def get_daily_stats(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get daily statistics for a date range"""
    start_datetime = datetime.combine(start_date, time.min)
    end_datetime = datetime.combine(end_date + timedelta(days=1), time.min)
    
    if (end_datetime - start_datetime).days > 365:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date range cannot exceed 1 year"
        )
    
    # Get all activities in the date range
    activities = session.exec(
        select(Activity)
        .where(Activity.user_id == current_user.id)
        .where(Activity.start_time >= start_datetime)
        .where(Activity.start_time < end_datetime)
    ).all()
    
    # Group activities by date
    daily_stats = {}
    
    for activity in activities:
        activity_date = activity.start_time.date()
        date_str = activity_date.isoformat()
        
        if date_str not in daily_stats:
            daily_stats[date_str] = {
                "date": date_str,
                "active_seconds": 0,
                "idle_seconds": 0,
                "productive_seconds": 0,
                "app_usage": {},
                "screenshot_count": 0
            }
        
        day_data = daily_stats[date_str]
        duration = activity.duration or 0
        
        if activity.activity_type == "active_time":
            day_data["active_seconds"] += duration
        elif activity.activity_type == "idle_time":
            day_data["idle_seconds"] += duration
        elif activity.activity_type == "app_usage":
            app_name = activity.activity_data.get("app_name", "Unknown")
            day_data["app_usage"][app_name] = day_data["app_usage"].get(app_name, 0) + duration
            
            # Simple heuristic for productive time
            if not any(x in app_name.lower() for x in ["facebook", "twitter", "youtube", "netflix"]):
                day_data["productive_seconds"] += duration
        elif activity.activity_type == "screenshot":
            day_data["screenshot_count"] += 1
    
    # Convert to list and sort by date
    result = sorted(daily_stats.values(), key=lambda x: x["date"])
    return result

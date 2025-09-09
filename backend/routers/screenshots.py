from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import os
import uuid
from datetime import datetime
from pathlib import Path
import aiofiles

from .. import schemas, auth
from ..database import get_db, User, TimeEntry, Screenshot

router = APIRouter()

# Configuration
UPLOAD_DIR = "uploads/screenshots"
THUMBNAIL_DIR = "uploads/thumbnails"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Create upload directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(THUMBNAIL_DIR, exist_ok=True)

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/upload", response_model=schemas.ScreenshotResponse, status_code=status.HTTP_201_CREATED)
async def upload_screenshot(
    time_entry_id: str = Form(...),
    activity_level: int = Form(..., ge=0, le=100),
    window_title: Optional[str] = Form(None),
    application_name: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Check if time entry exists and belongs to the user
    time_entry = await db.execute(
        select(TimeEntry).where(
            TimeEntry.id == time_entry_id,
            TimeEntry.user_id == current_user.id
        )
    )
    time_entry = time_entry.scalars().first()
    
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found or access denied")
    
    # Validate file
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Generate unique filename
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        # Read file content
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        
        # Save original file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(contents)
        
        # In a real application, you would also generate a thumbnail here
        # For now, we'll just use the same path for the thumbnail
        thumbnail_path = os.path.join(THUMBNAIL_DIR, filename)
        async with aiofiles.open(thumbnail_path, 'wb') as f:
            await f.write(contents)  # In reality, create a thumbnail
        
        # Create screenshot record in database
        db_screenshot = models.Screenshot(
            user_id=current_user.id,
            time_entry_id=time_entry_id,
            image_path=file_path,
            thumbnail_path=thumbnail_path,
            activity_level=activity_level,
            window_title=window_title,
            application_name=application_name
        )
        
        db.add(db_screenshot)
        await db.commit()
        await db.refresh(db_screenshot)
        
        return db_screenshot
        
    except Exception as e:
        # Clean up if something went wrong
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=schemas.PaginatedResponse)
async def get_screenshots(
    time_entry_id: Optional[str] = None,
    user_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Build query
    query = select(Screenshot)
    
    # Apply filters
    if time_entry_id:
        query = query.where(models.Screenshot.time_entry_id == time_entry_id)
    
    if user_id:
        # Only admins can view other users' screenshots
        if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER] and user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view these screenshots"
            )
        query = query.where(models.Screenshot.user_id == user_id)
    else:
        # Regular users can only see their own screenshots
        if current_user.role == models.UserRole.EMPLOYEE:
            query = query.where(models.Screenshot.user_id == current_user.id)
    
    if start_date:
        query = query.where(models.Screenshot.created_at >= start_date)
    
    if end_date:
        query = query.where(models.Screenshot.created_at <= end_date)
    
    # Order by creation time (newest first)
    query = query.order_by(models.Screenshot.created_at.desc())
    
    # Get total count
    total = (await db.execute(select([query.subquery()]))).scalars().count()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    screenshots = result.scalars().all()
    
    return {
        "items": screenshots,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{screenshot_id}", response_model=schemas.ScreenshotResponse)
async def get_screenshot(
    screenshot_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    result = await db.execute(
        select(Screenshot).where(Screenshot.id == screenshot_id)
    )
    screenshot = result.scalars().first()
    
    if screenshot is None:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    
    # Check permissions
    if screenshot.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this screenshot"
        )
    
    return screenshot

@router.get("/{screenshot_id}/image")
async def get_screenshot_image(
    screenshot_id: str,
    thumbnail: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    result = await db.execute(
        select(Screenshot).where(Screenshot.id == screenshot_id)
    )
    screenshot = result.scalars().first()
    
    if screenshot is None:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    
    # Check permissions
    if screenshot.user_id != current_user.id and current_user.role not in [models.UserRole.ADMIN, models.UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this screenshot"
        )
    
    # Get the image path
    image_path = screenshot.thumbnail_path if thumbnail else screenshot.image_path
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    
    # Determine content type based on file extension
    ext = os.path.splitext(image_path)[1].lower()
    media_type = f"image/{ext[1:] if ext != '.jpg' else 'jpeg'}"
    
    # Return the image file
    from fastapi.responses import FileResponse
    return FileResponse(image_path, media_type=media_type)

@router.delete("/{screenshot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_screenshot(
    screenshot_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(auth.any_authenticated)
):
    # Get the screenshot
    result = await db.execute(
        select(Screenshot).where(Screenshot.id == screenshot_id)
    )
    db_screenshot = result.scalars().first()
    
    if db_screenshot is None:
        raise HTTPException(status_code=404, detail="Screenshot not found")
    
    # Check permissions
    if db_screenshot.user_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this screenshot"
        )
    
    # Delete the files
    try:
        if os.path.exists(db_screenshot.image_path):
            os.remove(db_screenshot.image_path)
        if os.path.exists(db_screenshot.thumbnail_path):
            os.remove(db_screenshot.thumbnail_path)
    except Exception as e:
        # Log the error but continue with database deletion
        print(f"Error deleting screenshot files: {e}")
    
    # Delete the database record
    await db.delete(db_screenshot)
    await db.commit()
    
    return None

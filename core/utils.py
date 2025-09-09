import os
import hashlib
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Union
from pathlib import Path
import mimetypes
from fastapi import UploadFile
import aiofiles
from jose import jwt
from passlib.context import CryptContext

from config import settings

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)

def generate_random_password(length: int = 12) -> str:
    """Generate a random password with letters, digits, and special characters."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password)
                and any(c.isupper() for c in password)
                and sum(c.isdigit() for c in password) >= 3):
            return password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# File handling
async def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    """Save an uploaded file to the specified destination."""
    try:
        # Create directory if it doesn't exist
        destination.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the file
        async with aiofiles.open(destination, 'wb') as buffer:
            content = await upload_file.read()
            await buffer.write(content)
            
        return str(destination)
    except Exception as e:
        # Clean up in case of error
        if destination.exists():
            destination.unlink()
        raise e

def get_file_extension(filename: str) -> str:
    """Get the file extension from a filename."""
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    if not filename:
        return False
    return get_file_extension(filename)[1:] in settings.ALLOWED_EXTENSIONS

# Date and time
def format_duration(minutes: int) -> str:
    """Format duration in minutes to a human-readable string."""
    if not minutes:
        return "0m"
    
    hours, mins = divmod(minutes, 60)
    days, hours = divmod(hours, 24)
    
    parts = []
    if days > 0:
        parts.append(f"{int(days)}d")
    if hours > 0:
        parts.append(f"{int(hours)}h")
    if mins > 0 or not parts:
        parts.append(f"{int(mins)}m")
        
    return " ".join(parts)

def get_week_range(date: datetime = None) -> tuple[datetime, datetime]:
    """Get the start and end of the week for the given date."""
    if date is None:
        date = datetime.utcnow()
    start = date - timedelta(days=date.weekday())
    end = start + timedelta(days=6)
    return start, end

# Data validation
def validate_email(email: str) -> bool:
    """Validate an email address."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# URL handling
def get_absolute_url(path: str) -> str:
    """Get the absolute URL for a given path."""
    base_url = settings.BASE_URL.rstrip('/')
    path = path.lstrip('/')
    return f"{base_url}/{path}"

# Security
def generate_csrf_token() -> str:
    """Generate a CSRF token."""
    return secrets.token_urlsafe(32)

# Caching
def get_cache_key(prefix: str, *args) -> str:
    """Generate a cache key from the given prefix and arguments."""
    key_parts = [str(prefix)] + [str(arg) for arg in args]
    return ":".join(key_parts)

# Error handling
class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, status_code: int = 400, details: Any = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

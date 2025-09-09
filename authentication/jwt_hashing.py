from datetime import datetime, timedelta
from typing import Dict
from database.structure import get_session
from decouple import config
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodels.enhanced_models import User
from sqlmodel import Session, select
import bcrypt
from typing import Annotated, Optional
from datetime import timedelta, timezone

__all__ = [
    'get_hashed_password',
    'get_password_hash',
    'verify_password',
    'create_access_token',
    'get_current_user'
]

# Hashing logic

pwd = CryptContext(schemes = ['bcrypt'], deprecated = 'auto')
def get_hashed_password(password: str) -> str:
    return pwd.hash(password)

def get_password_hash(password: str) -> str:
    """Alias for get_hashed_password for compatibility"""
    return get_hashed_password(password)

def verify_password(plain_pass: str, hashed_pass: str) -> bool:
    return pwd.verify(plain_pass, hashed_pass)

# JWT Logic
SECRET_KEY: str = config('SECRET_KEY', cast=str, default='secret')
ALGORITHM: str = config('ALGORITHM', cast=str, default='HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = 3000000

bearer_scheme = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token with the provided data.
    
    Args:
        data: Dictionary containing token claims (must include 'sub' for subject/email)
        expires_delta: Optional timedelta for token expiration (default: 30 minutes)
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=30))
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),  # Issued at
        "iss": "activity-tracker-api"        # Issuer
    })
    
    try:
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create access token: {str(e)}"
        )

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: Session = Depends(get_session),
    required_role: Optional[str] = None
) -> User:
    """
    Dependency to get the current authenticated user from the JWT token.
    
    Args:
        credentials: The HTTP authorization credentials containing the JWT token
        session: Database session
        required_role: Optional role required to access the endpoint
        
    Returns:
        User: The authenticated user
        
    Raises:
        HTTPException: If authentication fails or user doesn't have required role
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify and decode the JWT token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Get user identity from token
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if not email or not user_id:
            raise credentials_exception
            
        # Get user from database
        user = session.exec(
            select(User).where(User.id == user_id, User.email == email)
        ).first()
        
        if not user:
            raise credentials_exception
            
        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive account"
            )
            
        # Check role-based access
        if required_role and user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
            
        return user
        
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )


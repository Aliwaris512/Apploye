from datetime import datetime, timedelta
from typing import Dict
from database.structure import get_session
from decouple import config
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodels.user_usage import User
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

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) +( expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(required_role: Optional[str] = None):
 def inner(credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: Session = Depends(get_session)
):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
     )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        user_id: int | None = payload.get("id")
        role : str | None = payload.get("role")
        if username is None or user_id is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        
        if required_role and role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        query = select(User).where(User.email == username, User.id == user_id)
        user = session.exec(query).first()
        if user is None:
            raise credentials_exception
    
        if user.role != role: 
            raise credentials_exception
        return user
    except JWTError:
       raise credentials_exception
 return inner


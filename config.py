import secrets
import os
from datetime import timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List, Union, Literal

from pydantic import (
    PostgresDsn,
    HttpUrl,
    EmailStr,
    field_validator,
    model_validator,
    ConfigDict,
    RedisDsn
)
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    ENVIRONMENT: Literal["development", "staging", "production"] = "production"
    DEBUG: bool = False
    SECRET_KEY: str = ""  # Will be auto-generated if not set in .env
    ALGORITHM: str = "HS256"
    
    # Server
    DOMAIN: str = "localhost"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # Security
    SECURE_COOKIES: bool = True
    SESSION_COOKIE_NAME: str = "__Secure-session" if ENVIRONMENT == "production" else "session"
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SECURE: bool = ENVIRONMENT == "production"
    SESSION_COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    CSRF_COOKIE_SECURE: bool = ENVIRONMENT == "production"
    CSRF_COOKIE_HTTPONLY: bool = False  # Required for JavaScript access
    
    # Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    ACCOUNT_VERIFICATION_REQUIRED: bool = True
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 30
    
    # Password Policy
    PASSWORD_MIN_LENGTH: int = 12
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = True
    
    # Rate Limiting
    RATE_LIMIT: str = "100/minute"
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # Database
    DATABASE_URL: str = ""
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = DEBUG
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: EmailStr = "noreply@example.com"
    EMAILS_FROM_NAME: str = "Employee Monitoring System"
    EMAIL_TEMPLATES_DIR: str = "/app/email-templates"
    
    # Redis
    REDIS_URL: RedisDsn = "redis://localhost:6379/0"
    REDIS_TIMEOUT: int = 5  # seconds
    
    # File Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "pdf"]
    
    # Sentry
    SENTRY_DSN: Optional[HttpUrl] = None
    SENTRY_ENVIRONMENT: str = ENVIRONMENT
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore',
        env_nested_delimiter='__',
    )
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def generate_secret_key(cls, v: Optional[str]) -> str:
        if not v:
            if cls.model_fields["ENVIRONMENT"].default == "production":
                raise ValueError("SECRET_KEY must be set in production")
            return secrets.token_urlsafe(32)
        return v
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info) -> Any:
        if isinstance(v, str) and v:
            return v
            
        if cls.model_fields["ENVIRONMENT"].default == "production" and not v:
            raise ValueError("DATABASE_URL must be set in production")
            
        # Default to SQLite for development
        return "sqlite+aiosqlite:///./activity_tracker.db"
    
    @property
    def SMTP_USERNAME(self) -> Optional[str]:
        return self.SMTP_USER or str(self.EMAILS_FROM_EMAIL)
    
    @property
    def EMAIL_FROM(self) -> str:
        return f"{self.EMAILS_FROM_NAME} <{self.EMAILS_FROM_EMAIL}>"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return str(self.DATABASE_URL)
    
    @property
    def SQLALCHEMY_ENGINE_OPTIONS(self) -> Dict[str, Any]:
        return {
            "pool_size": self.DATABASE_POOL_SIZE,
            "max_overflow": self.DATABASE_MAX_OVERFLOW,
            "pool_pre_ping": True,
            "pool_recycle": 300,
        }
    
    def ensure_upload_dir_exists(self) -> None:
        """Ensure the upload directory exists."""
        upload_dir = Path(self.UPLOAD_DIR)
        if not upload_dir.exists():
            upload_dir.mkdir(parents=True, exist_ok=True)

# Create settings instance
settings = Settings()

# Ensure upload directory exists
settings.ensure_upload_dir_exists()

# Generate a secret key if not set and in development
if settings.ENVIRONMENT != "production" and not os.getenv("SECRET_KEY"):
    os.environ["SECRET_KEY"] = settings.SECRET_KEY

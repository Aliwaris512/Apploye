from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp
import time
import logging
from typing import Optional, Callable, Awaitable, Any

from config import settings
from .utils import AppError

logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware to handle exceptions and format error responses."""
    
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except AppError as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "detail": e.message,
                    "status_code": e.status_code,
                    "details": e.details
                }
            )
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail, "status_code": e.status_code}
            )
        except Exception as e:
            logger.exception("Unhandled exception occurred")
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "status_code": 500,
                    "error": str(e)
                }
            )

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging."""
    
    async def dispatch(self, request: Request, call_next):
        # Log request
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate process time
        process_time = (time.time() - start_time) * 1000
        process_time = round(process_time, 2)
        
        # Log request details
        logger.info(
            f"{request.method} {request.url.path} "
            f"Status: {response.status_code} "
            f"Time: {process_time}ms"
        )
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers to responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        # HSTS (only in production with HTTPS)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Basic rate limiting middleware."""
    
    def __init__(
        self,
        app: ASGIApp,
        limit: int = 100,
        window: int = 60,  # seconds
        identifier: Optional[Callable[[Request], Awaitable[str]]] = None,
    ):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.identifier = identifier or self.default_identifier
        self.requests = {}
    
    async def default_identifier(self, request: Request) -> str:
        """Default identifier using client IP."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0]
        return request.client.host if request.client else "unknown"
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for certain paths
        if request.url.path.startswith("/static/") or request.url.path == "/health":
            return await call_next(request)
        
        # Get client identifier
        client_id = await self.identifier(request)
        
        # Get current timestamp
        current_time = int(time.time())
        window_start = current_time - self.window
        
        # Clean up old requests
        if client_id in self.requests:
            self.requests[client_id] = [
                t for t in self.requests[client_id] if t > window_start
            ]
        else:
            self.requests[client_id] = []
        
        # Check rate limit
        if len(self.requests[client_id]) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={"Retry-After": str(self.window)}
            )
        
        # Add current request
        self.requests[client_id].append(current_time)
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(
            self.limit - len(self.requests[client_id])
        )
        
        return response

def setup_middlewares(app):
    """Setup all middleware for the application."""
    # The order of middleware matters - they run in reverse order
    # (last added runs first for requests, first runs last for responses)
    
    # Error handling should be the first middleware to catch all exceptions
    app.add_middleware(ErrorHandlerMiddleware)
    
    # Security headers should be added early in the middleware chain
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Rate limiting should be after error handling but before other middleware
    app.add_middleware(RateLimitMiddleware, limit=100, window=60)
    
    # Logging should be after security but before the main application
    app.add_middleware(LoggingMiddleware)
    
    # Add any additional middleware here
    
    return app

"""
FastAPI Application Entry Point for Task Management System (Phase II)
"""
import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Configure root logger for debugging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Set specific loggers to DEBUG
for logger_name in ["auth", "jwt_middleware", "uvicorn.access"]:
    logging.getLogger(logger_name).setLevel(logging.DEBUG)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.engine import close_db, init_db
from app.middleware.logging import StructuredLoggingMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.routers import tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup: Initialize database
    print("🚀 Starting up...")
    try:
        await init_db()
        print("✅ Application startup complete")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise

    yield  # Application is running

    # Shutdown: Close database connections
    print("🛑 Shutting down...")
    try:
        await close_db()
        print("✅ Application shutdown complete")
    except Exception as e:
        print(f"⚠️  Error during shutdown: {e}")


app = FastAPI(
    title="Task Management API",
    version="2.0.0",
    description="Multi-user task management with JWT authentication",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware order matters: innermost (last added) executes first
# Order: CORS → Logging → RequestID → Routes

# 1. CORS Middleware (outermost - handles preflight)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# 2. Structured Logging Middleware
app.add_middleware(StructuredLoggingMiddleware)

# 3. Request ID Middleware (innermost - generates ID first)
app.add_middleware(RequestIDMiddleware)

# Include routers
app.include_router(tasks.router)


# Global exception handlers to ensure proper error responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with proper JSON response"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with proper JSON response"""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions to ensure CORS headers are sent"""
    logging.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Task Management API",
        "version": "2.0.0",
        "docs": "/docs",
    }

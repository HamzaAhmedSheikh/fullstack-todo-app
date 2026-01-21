# Implementation Plan: Full-Stack Task Management System (Phase II Backend)

**Feature**: `002-fullstack-task-management`
**Created**: 2025-12-19
**Status**: Draft
**Spec Reference**: `@specs/002-fullstack-task-management/spec.md`

---

## Executive Summary

This plan outlines the technical architecture and implementation strategy for Phase II of the Full-Stack Task Management System, focusing exclusively on the **FastAPI backend**. The system will provide RESTful APIs for multi-user task management with JWT authentication, optimistic locking, structured logging, and rate limiting, all backed by Neon Serverless PostgreSQL cloud-native database.

**Core Objectives**:
- Transform single-user CLI app into multi-user web backend
- Implement stateless JWT authentication compatible with Better Auth
- Ensure per-user data isolation and ownership enforcement
- Provide production-ready observability and security controls
- Leverage Neon Serverless PostgreSQL cloud-native features

**Technology Stack**:
- **Language**: Python 3.13+
- **Framework**: FastAPI with Pydantic v2
- **ORM**: SQLModel (SQLAlchemy Core)
- **Database**: Neon Serverless PostgreSQL (cloud-native, NOT local)
- **Dependency Management**: `uv` exclusively (no pip/poetry/pipenv)
- **Migrations**: Alembic
- **Authentication**: JWT with JWKS RS256 verification

---

## 1. Architecture Overview

### 1.1 System Architecture

The backend follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                  (Next.js 16+ Frontend + Better Auth)            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Application                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Layer (Routers)                                      │  │
│  │  - /api/{user_id}/tasks/* endpoints                       │  │
│  │  - Request/Response validation (Pydantic)                 │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Stack (Execution Order)                       │  │
│  │  1. CORS Middleware (origin validation)                   │  │
│  │  2. Request ID Middleware (correlation tracking)          │  │
│  │  3. Structured Logging Middleware (JSON logs)             │  │
│  │  4. Rate Limiting Middleware (per-user 100 req/min)       │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Security Layer                                            │  │
│  │  - JWT Dependency (parse Authorization header)            │  │
│  │  - JWKS Verifier (RS256 signature validation)             │  │
│  │  - User Extractor (extract user_id from JWT claims)       │  │
│  │  - Ownership Enforcer (URL path user_id matching)         │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                      │  │
│  │  - Task CRUD Service (create, read, update, delete)       │  │
│  │  - Optimistic Locking Handler (version checking)          │  │
│  │  - Input Validation Service (title/description limits)    │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Data Access Layer (SQLModel)                             │  │
│  │  - Task Model (SQLModel with UUID PK)                     │  │
│  │  - Database Session Management (dependency injection)     │  │
│  │  - Query Builders (ownership-scoped queries)              │  │
│  └───────────────────────┬──────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │ psycopg[binary]
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Neon Serverless PostgreSQL (Cloud)                  │
│  - Auto-scaling compute                                          │
│  - Serverless connection pooling                                 │
│  - Branch/clone capabilities                                     │
│  - Multi-region availability                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Request/Response Lifecycle

**Typical Authenticated Request Flow**:

1. **Client** → Sends request with `Authorization: Bearer <jwt>` header
2. **CORS Middleware** → Validates origin against `CORS_ORIGINS`
3. **Request ID Middleware** → Generates correlation ID, adds to context
4. **Logging Middleware** → Logs request start with correlation ID
5. **Rate Limiting Middleware** → Checks user's request count (100/min limit)
6. **JWT Dependency** → Extracts token from Authorization header
7. **JWKS Verifier** → Fetches cached public keys, verifies RS256 signature
8. **User Extractor** → Extracts `user_id` from JWT claims
9. **Ownership Enforcer** → Compares JWT `user_id` to URL path `{user_id}`
10. **Business Logic** → Executes task operation (CRUD)
11. **Optimistic Locking** → Checks version field for updates
12. **Data Access Layer** → Executes ownership-scoped SQL query
13. **Neon PostgreSQL** → Returns data from cloud database
14. **Response** → Formats JSON, adds rate limit headers, returns to client
15. **Logging Middleware** → Logs response with status code, duration

**Error Handling at Each Layer**:
- Missing JWT → HTTP 401 (before business logic)
- Invalid JWT signature → HTTP 401 (JWKS verification)
- User_id mismatch → HTTP 403 (ownership enforcer)
- Task not found → HTTP 404 (data access layer)
- Stale version → HTTP 409 (optimistic locking)
- Rate limit exceeded → HTTP 429 (rate limiting middleware)
- Database error → HTTP 500 (generic error, no details exposed)

### 1.3 Neon Serverless PostgreSQL Integration

**Cloud-Native Connection Management**:

```python
# Engine configuration optimized for Neon Serverless
engine = create_async_engine(
    DATABASE_URL,  # e.g., postgresql://user:pass@ep-xxx.neon.tech/db
    echo=False,
    pool_pre_ping=True,  # Validate connections before use
    pool_size=5,  # Small pool for serverless (Neon handles pooling)
    max_overflow=10,  # Allow burst capacity
    pool_recycle=300,  # Recycle connections every 5 min (serverless timeout)
    connect_args={
        "server_settings": {
            "application_name": "fastapi-task-backend",
            "jit": "off"  # Disable JIT for faster cold starts
        }
    }
)
```

**Key Neon-Specific Optimizations**:
1. **Serverless-First Connection Pooling**: Small local pool (5-10 connections) because Neon provides connection pooling infrastructure
2. **Connection Recycling**: Recycle every 300 seconds to avoid serverless timeout issues
3. **Pre-Ping**: Validate connections before use (serverless connections can idle-close)
4. **Application Name**: Identify backend in Neon dashboard for monitoring
5. **JIT Disabled**: Faster cold start performance (trade-off: slightly slower repeated queries)

**Neon Branch/Clone Strategy** (for development):
- **Production**: Main branch (`main`)
- **Staging**: Dedicated branch (`staging`) with production data clone
- **Development**: Per-developer branches (`dev-<name>`) for isolated testing
- **CI/CD**: Ephemeral branches for test runs (auto-deleted after tests)

---

## 2. Component Breakdown

### 2.1 Application Entry Point (`app/main.py`)

**Responsibilities**:
- Initialize FastAPI application instance
- Register middleware stack (CORS, logging, rate limiting, request ID)
- Include API routers (task routes)
- Configure lifecycle event handlers (startup, shutdown)
- Set up OpenAPI documentation configuration
- Configure exception handlers for global error handling

**Key Interfaces**:
```python
from fastapi import FastAPI
from app.middleware import logging, rate_limit, request_id
from app.routers import tasks
from app.database import init_db, close_db

app = FastAPI(
    title="Task Management API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware (order matters - executed bottom-to-top)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Routers
app.include_router(tasks.router, prefix="/api", tags=["tasks"])

# Lifecycle
@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()
```

**Dependencies**:
- Configuration module (environment variables)
- Database initialization module
- All router modules
- All middleware modules

---

### 2.2 Configuration Management (`app/config.py`)

**Responsibilities**:
- Load and validate environment variables
- Provide type-safe configuration access
- Manage secrets (database URL, JWKS endpoint)
- Set default values for optional configs
- Validate configuration on startup

**Key Configuration**:
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str  # Required: Neon PostgreSQL connection string

    # Authentication
    BETTER_AUTH_JWKS_URL: str  # Required: JWKS endpoint for public keys
    JWKS_CACHE_TTL: int = 3600  # Default: 1 hour (3600 seconds)

    # CORS
    CORS_ORIGINS: List[str]  # Required: Comma-separated allowed origins

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100  # Default: 100 requests
    RATE_LIMIT_WINDOW: int = 60  # Default: 60 seconds (1 minute)

    # Logging
    LOG_LEVEL: str = "INFO"  # Default: INFO
    LOG_FORMAT: str = "json"  # Default: structured JSON

    # Application
    APP_PORT: int = 8000  # Default: 8000
    APP_HOST: str = "0.0.0.0"  # Default: bind to all interfaces

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**Validation Rules**:
- `DATABASE_URL` must start with `postgresql://` or `postgresql+asyncpg://`
- `BETTER_AUTH_JWKS_URL` must be a valid HTTPS URL
- `CORS_ORIGINS` must not be empty
- `RATE_LIMIT_REQUESTS` must be positive integer

**Dependencies**: None (foundation module)

---

### 2.3 Database Layer (`app/database/`)

**Structure**:
```
app/database/
├── __init__.py          # Engine and session exports
├── engine.py            # Neon SQLAlchemy engine setup
├── session.py           # Session factory and dependency
└── models.py            # SQLModel models (Task)
```

#### 2.3.1 Engine Setup (`engine.py`)

**Responsibilities**:
- Create SQLAlchemy engine with Neon-optimized settings
- Configure connection pooling for serverless
- Handle connection lifecycle (startup/shutdown)
- Provide async engine interface

**Implementation**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from app.config import settings

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.LOG_LEVEL == "DEBUG",
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    connect_args={
        "server_settings": {
            "application_name": "fastapi-task-backend"
        }
    }
)

async def init_db():
    """Initialize database connection on startup"""
    async with engine.begin() as conn:
        # Test connection
        await conn.execute(text("SELECT 1"))

async def close_db():
    """Close database connections on shutdown"""
    await engine.dispose()
```

#### 2.3.2 Session Management (`session.py`)

**Responsibilities**:
- Provide async session factory
- Implement dependency injection for endpoints
- Handle session lifecycle (commit/rollback)
- Ensure proper session cleanup

**Implementation**:
```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from app.database.engine import engine

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncSession:
    """Dependency for database sessions"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

#### 2.3.3 SQLModel Models (`models.py`)

**Responsibilities**:
- Define Task model with all required fields
- Implement optimistic locking with version field
- Configure indexes for performance
- Define relationships and constraints

**Task Model**:
```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    # Primary Key
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    # Ownership
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)

    # Task Data
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(max_length=500, default=None)
    completed: bool = Field(default=False)

    # Optimistic Locking
    version: int = Field(default=1, nullable=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "version": 1,
                "created_at": "2025-12-19T10:00:00Z",
                "updated_at": "2025-12-19T10:00:00Z"
            }
        }
```

**Indexes**:
- Primary key index on `id` (automatic)
- Index on `user_id` for ownership queries (critical for performance)
- Composite index on `(user_id, completed)` for filtered listings

**Dependencies**: Configuration module

---

### 2.4 Authentication Subsystem (`app/auth/`)

**Structure**:
```
app/auth/
├── __init__.py          # Export auth dependencies
├── jwks.py              # JWKS fetcher and cache
├── jwt_handler.py       # JWT parsing and validation
└── dependencies.py      # FastAPI dependencies (get_current_user)
```

#### 2.4.1 JWKS Handler (`jwks.py`)

**Responsibilities**:
- Fetch public keys from Better Auth JWKS endpoint
- Cache keys in-memory with 1-hour TTL
- Refresh cache on expiry or verification failure
- Handle JWKS endpoint failures gracefully

**Implementation**:
```python
import httpx
from datetime import datetime, timedelta
from typing import Dict, Optional
from jose import jwk

class JWKSCache:
    def __init__(self, jwks_url: str, ttl_seconds: int = 3600):
        self.jwks_url = jwks_url
        self.ttl_seconds = ttl_seconds
        self._keys: Optional[Dict] = None
        self._expires_at: Optional[datetime] = None

    async def get_key(self, kid: str) -> Optional[Dict]:
        """Get public key by key ID (kid)"""
        if self._is_expired():
            await self._refresh()

        if self._keys is None:
            return None

        return self._keys.get(kid)

    async def _refresh(self):
        """Fetch and cache JWKS from endpoint"""
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jwks_url)
            response.raise_for_status()
            jwks_data = response.json()

        # Index keys by 'kid' for fast lookup
        self._keys = {key["kid"]: key for key in jwks_data.get("keys", [])}
        self._expires_at = datetime.utcnow() + timedelta(seconds=self.ttl_seconds)

    def _is_expired(self) -> bool:
        if self._expires_at is None:
            return True
        return datetime.utcnow() >= self._expires_at

    async def force_refresh(self):
        """Force cache refresh (called on verification failure)"""
        await self._refresh()
```

#### 2.4.2 JWT Handler (`jwt_handler.py`)

**Responsibilities**:
- Parse JWT from Authorization header
- Verify RS256 signature using JWKS public keys
- Extract user_id from JWT claims
- Handle expired/invalid tokens

**Implementation**:
```python
from jose import jwt, JWTError
from fastapi import HTTPException, status
from app.auth.jwks import JWKSCache
from app.config import settings

jwks_cache = JWKSCache(settings.BETTER_AUTH_JWKS_URL, settings.JWKS_CACHE_TTL)

async def verify_jwt(token: str) -> Dict:
    """Verify JWT and return payload"""
    try:
        # Decode header to get 'kid' (key ID)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing 'kid' in JWT header"
            )

        # Get public key from cache
        public_key = await jwks_cache.get_key(kid)

        if not public_key:
            # Try refreshing cache once
            await jwks_cache.force_refresh()
            public_key = await jwks_cache.get_key(kid)

        if not public_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Public key not found for kid"
            )

        # Verify signature and decode payload
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Better Auth may not set audience
        )

        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid JWT: {str(e)}"
        )
```

#### 2.4.3 Auth Dependencies (`dependencies.py`)

**Responsibilities**:
- Extract JWT from Authorization header
- Verify JWT signature
- Extract and validate user_id from claims
- Provide dependency for protected endpoints

**Implementation**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID
from app.auth.jwt_handler import verify_jwt

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UUID:
    """Extract and validate user_id from JWT"""
    token = credentials.credentials
    payload = await verify_jwt(token)

    user_id_str = payload.get("sub") or payload.get("user_id")

    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing user_id in JWT payload"
        )

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user_id format in JWT"
        )

    return user_id
```

**Dependencies**: Configuration, JWKS cache, JWT handler

---

### 2.5 Task Management API (`app/routers/tasks.py`)

**Responsibilities**:
- Define all task-related API endpoints
- Implement ownership enforcement (user_id matching)
- Handle CRUD operations with optimistic locking
- Validate request/response data with Pydantic
- Return proper HTTP status codes and error messages

**Endpoint Summary**:
```python
router = APIRouter()

@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all tasks for authenticated user"""
    # Enforce ownership
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Query user's tasks
    result = await db.execute(
        select(Task).where(Task.user_id == user_id)
    )
    tasks = result.scalars().all()
    return tasks

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: UUID,
    task_data: TaskCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create new task"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    task = Task(**task_data.dict(), user_id=user_id)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get single task details"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: UUID,
    task_id: UUID,
    task_update: TaskUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update task with optimistic locking"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Optimistic locking check
    if task_update.version != task.version:
        raise HTTPException(
            status_code=409,
            detail="Conflict: Task was modified by another request"
        )

    # Update fields
    task.title = task_update.title
    task.description = task_update.description
    task.version += 1
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete task"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return None

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_completion(
    user_id: UUID,
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Toggle task completion status (idempotent)"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    task.version += 1
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)
    return task
```

**Pydantic Schemas**:
```python
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)

class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    version: int  # Required for optimistic locking

class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

**Dependencies**: Auth dependencies, database session, Task model

---

### 2.6 Middleware Stack

#### 2.6.1 Request ID Middleware (`app/middleware/request_id.py`)

**Responsibilities**:
- Generate unique correlation ID for each request
- Add correlation ID to response headers
- Store correlation ID in request state for logging

**Implementation**:
```python
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid4())
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response
```

#### 2.6.2 Structured Logging Middleware (`app/middleware/logging.py`)

**Responsibilities**:
- Log all requests and responses in structured JSON format
- Include correlation ID, user_id, endpoint, status code, duration
- Log authentication/authorization failures with reasons
- Exclude sensitive data (JWT tokens, passwords)

**Implementation**:
```python
import logging
import json
import time
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()

        # Extract request metadata
        request_id = getattr(request.state, "request_id", None)
        user_id = getattr(request.state, "user_id", None)

        # Log request
        logger.info(json.dumps({
            "event": "request_started",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "user_id": str(user_id) if user_id else None,
            "timestamp": time.time()
        }))

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log response
        logger.info(json.dumps({
            "event": "request_completed",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2),
            "user_id": str(user_id) if user_id else None,
            "timestamp": time.time()
        }))

        return response
```

#### 2.6.3 Rate Limiting Middleware (`app/middleware/rate_limit.py`)

**Responsibilities**:
- Track requests per user_id (100 requests per minute)
- Return HTTP 429 when limit exceeded
- Include rate limit headers in responses
- Use sliding window algorithm

**Implementation**:
```python
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException, status
from collections import defaultdict
from datetime import datetime, timedelta

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.user_requests = defaultdict(list)

    async def dispatch(self, request, call_next):
        user_id = getattr(request.state, "user_id", None)

        if user_id:
            now = datetime.utcnow()
            window_start = now - timedelta(minutes=1)

            # Remove old requests outside window
            self.user_requests[user_id] = [
                req_time for req_time in self.user_requests[user_id]
                if req_time > window_start
            ]

            # Check limit
            if len(self.user_requests[user_id]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                    headers={"Retry-After": "60"}
                )

            # Add current request
            self.user_requests[user_id].append(now)

        response = await call_next(request)

        # Add rate limit headers
        if user_id:
            remaining = self.requests_per_minute - len(self.user_requests[user_id])
            response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
            response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
            response.headers["X-RateLimit-Reset"] = str(int((now + timedelta(minutes=1)).timestamp()))

        return response
```

**Dependencies**: Auth dependencies (for user_id extraction)

---

### 2.7 Migration System (`alembic/`)

**Responsibilities**:
- Generate database schema migrations
- Apply migrations to Neon cloud database
- Support rollback for failed migrations
- Version control for schema changes

**Alembic Configuration** (`alembic.ini`):
```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql://localhost/placeholder  # Overridden by env.py

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

**Environment Configuration** (`alembic/env.py`):
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.config import settings
from app.database.models import SQLModel

# Alembic Config object
config = context.config

# Override sqlalchemy.url with environment variable
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging
fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = SQLModel.metadata

def run_migrations_online():
    """Run migrations in 'online' mode (connected to database)"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
```

**Initial Migration** (`alembic/versions/001_create_tasks_table.py`):
```python
"""Create tasks table

Revision ID: 001
Create Date: 2025-12-19
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('completed', sa.Boolean(), default=False, nullable=False),
        sa.Column('version', sa.Integer(), default=1, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    # Create composite index for filtered queries
    op.create_index(
        'ix_tasks_user_id_completed',
        'tasks',
        ['user_id', 'completed']
    )

def downgrade():
    op.drop_index('ix_tasks_user_id_completed', table_name='tasks')
    op.drop_table('tasks')
```

**Dependencies**: Database models, configuration

---

## 3. Implementation Phases

### Phase 1: Project Foundation (Est: 1-2 hours)

**Objective**: Establish project structure, dependency management, and basic FastAPI application

**Tasks**:
1. Initialize project with `uv`
   ```bash
   cd /path/to/fullstack-todo-app
   mkdir backend && cd backend
   uv init
   ```

2. Create virtual environment
   ```bash
   uv venv
   source .venv/bin/activate  # macOS/Linux
   # .venv\Scripts\activate    # Windows
   ```

3. Install core dependencies
   ```bash
   uv add fastapi uvicorn[standard] sqlmodel "psycopg[binary]" python-jose[cryptography] python-multipart httpx pydantic-settings
   uv add --dev pytest pytest-asyncio httpx black mypy ruff alembic
   ```

4. Create project structure
   ```
   backend/
   ├── app/
   │   ├── __init__.py
   │   ├── main.py          # FastAPI app entry point
   │   ├── config.py        # Settings management
   │   ├── database/
   │   │   ├── __init__.py
   │   │   ├── engine.py
   │   │   ├── session.py
   │   │   └── models.py
   │   ├── auth/
   │   │   ├── __init__.py
   │   │   ├── jwks.py
   │   │   ├── jwt_handler.py
   │   │   └── dependencies.py
   │   ├── routers/
   │   │   ├── __init__.py
   │   │   └── tasks.py
   │   └── middleware/
   │       ├── __init__.py
   │       ├── request_id.py
   │       ├── logging.py
   │       └── rate_limit.py
   ├── alembic/
   │   ├── versions/
   │   └── env.py
   ├── tests/
   │   ├── __init__.py
   │   ├── conftest.py
   │   └── test_tasks.py
   ├── .env.example
   ├── .gitignore
   ├── pyproject.toml
   └── README.md
   ```

5. Implement basic configuration (`app/config.py`)
   - Load environment variables with Pydantic Settings
   - Validate required fields (DATABASE_URL, BETTER_AUTH_JWKS_URL, CORS_ORIGINS)
   - Set defaults for optional configs

6. Create basic FastAPI app (`app/main.py`)
   - Initialize FastAPI instance
   - Add health check endpoint (`GET /health`)
   - Configure CORS middleware
   - Set up OpenAPI documentation

7. Create `.env.example` template
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/taskdb
   BETTER_AUTH_JWKS_URL=https://your-frontend.com/.well-known/jwks.json
   CORS_ORIGINS=http://localhost:3000,https://your-frontend.com
   LOG_LEVEL=INFO
   RATE_LIMIT_REQUESTS=100
   RATE_LIMIT_WINDOW=60
   ```

**Completion Criteria**:
- [x] `uv` project initialized with virtual environment
- [x] All dependencies installed and locked
- [x] Project structure created with all directories
- [x] Configuration module loads and validates settings
- [x] Basic FastAPI app runs (`uvicorn app.main:app --reload`)
- [x] Health check endpoint returns 200 OK
- [x] OpenAPI docs accessible at `/docs`

**Spec Alignment**: Project setup and basic API structure

**Tests**:
```python
# tests/test_foundation.py
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_config_validation():
    from app.config import settings
    assert settings.DATABASE_URL.startswith("postgresql://")
    assert settings.BETTER_AUTH_JWKS_URL.startswith("https://")
    assert len(settings.CORS_ORIGINS) > 0
```

---

### Phase 2: Cloud Database Foundation (Est: 2-3 hours)

**Objective**: Set up Neon Serverless PostgreSQL connection, SQLModel models, and Alembic migrations

**Tasks**:
1. Configure Neon database engine (`app/database/engine.py`)
   - Create async SQLAlchemy engine with Neon-optimized settings
   - Implement connection pooling for serverless (pool_size=5, max_overflow=10, pool_recycle=300)
   - Add startup/shutdown handlers

2. Implement session management (`app/database/session.py`)
   - Create async session factory
   - Implement `get_db()` dependency with proper cleanup

3. Define Task SQLModel (`app/database/models.py`)
   - All fields: id, user_id, title, description, completed, version, created_at, updated_at
   - UUID primary key and foreign key
   - Optimistic locking with version field
   - Indexes on user_id and (user_id, completed)

4. Initialize Alembic
   ```bash
   alembic init alembic
   ```

5. Configure Alembic (`alembic/env.py`)
   - Import SQLModel metadata
   - Override sqlalchemy.url with environment variable
   - Configure target_metadata for autogenerate

6. Create initial migration
   ```bash
   alembic revision --autogenerate -m "Create tasks table"
   ```

7. Apply migration to Neon database
   ```bash
   alembic upgrade head
   ```

8. Verify schema in Neon dashboard
   - Check table exists with correct columns
   - Verify indexes created
   - Test connection from FastAPI

**Completion Criteria**:
- [x] SQLAlchemy async engine created with Neon URL
- [x] Session factory implemented with proper lifecycle
- [x] Task model defined with all required fields and indexes
- [x] Alembic initialized and configured
- [x] Initial migration generated and applied successfully
- [x] Schema visible in Neon dashboard
- [x] FastAPI startup connects to Neon without errors

**Spec Alignment**: Database schema compliance (FR-024 to FR-028)

**Tests**:
```python
# tests/test_database.py
import pytest
from app.database.models import Task
from uuid import uuid4

@pytest.mark.asyncio
async def test_create_task(db_session):
    task = Task(
        user_id=uuid4(),
        title="Test Task",
        description="Test Description"
    )
    db_session.add(task)
    await db_session.commit()

    assert task.id is not None
    assert task.version == 1
    assert task.completed is False

@pytest.mark.asyncio
async def test_task_ownership_query(db_session):
    user_id = uuid4()
    task = Task(user_id=user_id, title="My Task")
    db_session.add(task)
    await db_session.commit()

    result = await db_session.execute(
        select(Task).where(Task.user_id == user_id)
    )
    tasks = result.scalars().all()
    assert len(tasks) == 1
    assert tasks[0].title == "My Task"
```

---

### Phase 3: Authentication Infrastructure (Est: 3-4 hours)

**Objective**: Implement JWT verification with JWKS public key caching

**Tasks**:
1. Implement JWKS cache (`app/auth/jwks.py`)
   - Fetch public keys from Better Auth JWKS endpoint
   - Cache in-memory with 1-hour TTL
   - Refresh on expiry or verification failure
   - Handle network errors gracefully

2. Implement JWT handler (`app/auth/jwt_handler.py`)
   - Parse Authorization header
   - Verify RS256 signature using JWKS keys
   - Extract user_id from JWT claims
   - Handle expired/invalid tokens

3. Create auth dependencies (`app/auth/dependencies.py`)
   - `get_current_user_id()` dependency
   - Extract user_id from verified JWT
   - Validate UUID format
   - Return HTTP 401 for missing/invalid tokens

4. Add request ID middleware (`app/middleware/request_id.py`)
   - Generate unique correlation ID
   - Store in request.state
   - Add to response headers

5. Add structured logging middleware (`app/middleware/logging.py`)
   - Log requests/responses in JSON format
   - Include correlation ID, user_id, endpoint, status code, duration
   - Log authentication failures with reasons

6. Register middleware in main.py
   - Add all middleware in correct order
   - Test middleware execution

**Completion Criteria**:
- [x] JWKS cache fetches and caches public keys
- [x] JWT handler verifies RS256 signatures
- [x] Auth dependency extracts user_id from valid JWTs
- [x] Invalid JWTs return HTTP 401
- [x] Missing JWTs return HTTP 401
- [x] Correlation IDs generated for all requests
- [x] Structured logs emitted for all requests

**Spec Alignment**: Authentication spec compliance (FR-001 to FR-007, FR-040 to FR-045)

**Tests**:
```python
# tests/test_auth.py
import pytest
from app.auth.jwt_handler import verify_jwt

@pytest.mark.asyncio
async def test_valid_jwt():
    # Create valid test JWT
    token = create_test_jwt(user_id="123e4567-e89b-12d3-a456-426614174000")
    payload = await verify_jwt(token)
    assert payload["sub"] == "123e4567-e89b-12d3-a456-426614174000"

@pytest.mark.asyncio
async def test_invalid_jwt():
    with pytest.raises(HTTPException) as exc_info:
        await verify_jwt("invalid.jwt.token")
    assert exc_info.value.status_code == 401

@pytest.mark.asyncio
async def test_expired_jwt():
    token = create_expired_test_jwt()
    with pytest.raises(HTTPException) as exc_info:
        await verify_jwt(token)
    assert exc_info.value.status_code == 401
```

---

### Phase 4: Core Task CRUD Operations (Est: 4-5 hours)

**Objective**: Implement all task API endpoints with ownership enforcement and optimistic locking

**Tasks**:
1. Create Pydantic schemas (`app/routers/tasks.py`)
   - TaskCreate (title, description)
   - TaskUpdate (title, description, version)
   - TaskResponse (all fields)

2. Implement `POST /{user_id}/tasks` (Create)
   - Validate input with Pydantic
   - Enforce ownership (user_id matching)
   - Generate UUID and timestamps
   - Return HTTP 201 with created task

3. Implement `GET /{user_id}/tasks` (List)
   - Enforce ownership
   - Query tasks scoped to user_id
   - Return empty array if no tasks

4. Implement `GET /{user_id}/tasks/{task_id}` (Get Single)
   - Enforce ownership
   - Return HTTP 404 if not found
   - Return HTTP 403 if owned by different user

5. Implement `PUT /{user_id}/tasks/{task_id}` (Update)
   - Enforce ownership
   - Check version for optimistic locking
   - Return HTTP 409 if version mismatch
   - Increment version on successful update
   - Update updated_at timestamp

6. Implement `DELETE /{user_id}/tasks/{task_id}` (Delete)
   - Enforce ownership
   - Return HTTP 404 if not found
   - Return HTTP 204 on successful deletion

7. Implement `PATCH /{user_id}/tasks/{task_id}/complete` (Toggle)
   - Enforce ownership
   - Toggle completed field (idempotent)
   - Increment version
   - Return updated task

8. Add input validation
   - Title: 1-200 characters
   - Description: 0-500 characters
   - UUID validation for path parameters

**Completion Criteria**:
- [x] All 6 task endpoints implemented
- [x] Ownership enforcement returns HTTP 403
- [x] Optimistic locking returns HTTP 409
- [x] Not found returns HTTP 404
- [x] Invalid input returns HTTP 422
- [x] All endpoints tested with valid/invalid inputs

**Spec Alignment**: Task CRUD and API endpoint specs (FR-008 to FR-023, FR-029 to FR-032)

**Tests**:
```python
# tests/test_tasks.py
import pytest
from uuid import uuid4

@pytest.mark.asyncio
async def test_create_task(client, auth_headers):
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Buy milk", "description": "2% milk"},
        headers=auth_headers(user_id)
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Buy milk"
    assert response.json()["version"] == 1

@pytest.mark.asyncio
async def test_list_tasks_ownership(client, auth_headers):
    user1_id = str(uuid4())
    user2_id = str(uuid4())

    # Create task for user1
    client.post(
        f"/api/{user1_id}/tasks",
        json={"title": "User 1 Task"},
        headers=auth_headers(user1_id)
    )

    # Try to list with user2 credentials
    response = client.get(
        f"/api/{user1_id}/tasks",
        headers=auth_headers(user2_id)
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_update_with_stale_version(client, auth_headers):
    user_id = str(uuid4())

    # Create task
    create_resp = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Original"},
        headers=auth_headers(user_id)
    )
    task_id = create_resp.json()["id"]

    # Update once (version 1 → 2)
    client.put(
        f"/api/{user_id}/tasks/{task_id}",
        json={"title": "Updated", "description": "", "version": 1},
        headers=auth_headers(user_id)
    )

    # Try to update with stale version
    response = client.put(
        f"/api/{user_id}/tasks/{task_id}",
        json={"title": "Stale Update", "description": "", "version": 1},
        headers=auth_headers(user_id)
    )
    assert response.status_code == 409
```

---

### Phase 5: Security Hardening (Est: 2-3 hours)

**Objective**: Implement rate limiting, enhanced error handling, and security headers

**Tasks**:
1. Implement rate limiting middleware (`app/middleware/rate_limit.py`)
   - Track requests per user_id (100/minute)
   - Sliding window algorithm
   - Return HTTP 429 when exceeded
   - Add rate limit headers (X-RateLimit-*)

2. Add global exception handlers
   - HTTPException → proper JSON error response
   - ValidationError → HTTP 422 with field details
   - Database errors → HTTP 500 (no sensitive details)
   - Unexpected errors → HTTP 500 with correlation ID

3. Add security headers middleware
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block

4. Enhance CORS configuration
   - Validate origins from environment
   - Allow credentials
   - Specify allowed methods and headers

5. Add input sanitization
   - Strip leading/trailing whitespace
   - Prevent SQL injection (SQLModel handles this)
   - Validate UUID formats

**Completion Criteria**:
- [x] Rate limiting enforced (100 req/min per user)
- [x] HTTP 429 returned when limit exceeded
- [x] Rate limit headers present in responses
- [x] All errors return consistent JSON format
- [x] Security headers present in all responses
- [x] CORS properly configured

**Spec Alignment**: Security and rate limiting (FR-046 to FR-050)

**Tests**:
```python
# tests/test_security.py
import pytest

@pytest.mark.asyncio
async def test_rate_limiting(client, auth_headers):
    user_id = str(uuid4())
    headers = auth_headers(user_id)

    # Make 100 requests (should succeed)
    for _ in range(100):
        response = client.get(f"/api/{user_id}/tasks", headers=headers)
        assert response.status_code == 200

    # 101st request should be rate limited
    response = client.get(f"/api/{user_id}/tasks", headers=headers)
    assert response.status_code == 429
    assert "Retry-After" in response.headers

@pytest.mark.asyncio
async def test_security_headers(client):
    response = client.get("/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
```

---

### Phase 6: Testing & Documentation (Est: 3-4 hours)

**Objective**: Achieve comprehensive test coverage and production-ready documentation

**Tasks**:
1. Write unit tests
   - Database models (Task creation, version increment)
   - JWKS cache (fetch, cache, refresh)
   - JWT verification (valid, invalid, expired)
   - Auth dependencies (user_id extraction)

2. Write integration tests
   - End-to-end task CRUD flows
   - Multi-user isolation
   - Optimistic locking conflicts
   - Rate limiting enforcement

3. Write contract tests
   - API request/response schemas
   - Error response formats
   - HTTP status codes

4. Configure pytest
   - Async test support (pytest-asyncio)
   - Test fixtures (client, db_session, auth_headers)
   - Coverage reporting (pytest-cov)

5. Generate test coverage report
   ```bash
   pytest --cov=app --cov-report=html
   ```

6. Update OpenAPI documentation
   - Add descriptions to endpoints
   - Document request/response schemas
   - Add authentication requirements
   - Include example requests/responses

7. Write README.md
   - Project overview
   - Setup instructions
   - Environment variables
   - Running locally
   - Running tests
   - Deployment guide

8. Create deployment checklist
   - Environment variables configured
   - Database migrations applied
   - JWKS endpoint accessible
   - CORS origins configured
   - Rate limiting tuned

**Completion Criteria**:
- [x] Test coverage ≥ 80%
- [x] All user stories have integration tests
- [x] API contract tests pass
- [x] OpenAPI docs complete and accurate
- [x] README.md comprehensive
- [x] Deployment checklist ready

**Spec Alignment**: All success criteria (SC-001 to SC-011)

**Tests**:
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.main import app
from app.database.models import SQLModel

@pytest.fixture
async def db_session():
    # Use in-memory SQLite for tests
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers():
    def _headers(user_id: str):
        token = create_test_jwt(user_id)
        return {"Authorization": f"Bearer {token}"}
    return _headers
```

---

## 4. Dependencies & Critical Path

**Dependency Graph**:

```
Phase 1: Foundation
    ↓
Phase 2: Database (depends on Foundation)
    ↓
Phase 3: Authentication (depends on Foundation)
    ↓
Phase 4: CRUD (depends on Database + Authentication)
    ↓
Phase 5: Security (depends on Authentication)
    ↓
Phase 6: Testing (depends on all previous phases)
```

**Critical Path**:
1. **Configuration** must be complete before any other component
2. **Database engine** must be initialized before session management
3. **SQLModel models** must be defined before migrations
4. **Migrations** must be applied before CRUD operations
5. **JWKS cache** must work before JWT verification
6. **JWT verification** must work before protected endpoints
7. **Auth dependencies** must work before task endpoints
8. **Middleware** must be registered before they take effect

**Blocking Dependencies**:
- Neon database URL required for Phase 2
- Better Auth JWKS endpoint required for Phase 3
- Frontend CORS origins required for Phase 1

---

## 5. Design Decisions Requiring ADRs

### 5.1 Neon Serverless PostgreSQL Integration Strategy

**Context**: Using Neon Serverless PostgreSQL instead of traditional self-hosted PostgreSQL

**Decision**: Optimize connection pooling and configuration for Neon's serverless architecture

**Alternatives**:
1. **Standard PostgreSQL configuration** (pool_size=20, no recycling)
   - Pros: Simpler, standard approach
   - Cons: Wastes connections in serverless environment, higher costs

2. **Neon-optimized configuration** (pool_size=5, pool_recycle=300, pre_ping)
   - Pros: Efficient serverless connection usage, lower costs, handles idle disconnects
   - Cons: Slightly more complex configuration

**Decision: Option 2 (Neon-optimized)**

**Rationale**:
- Neon provides built-in connection pooling infrastructure
- Serverless connections can be terminated on idle
- Small local pool reduces overhead
- Connection recycling prevents timeout issues
- Pre-ping ensures connection validity before use

**Impact**:
- Lower Neon billing (fewer concurrent connections)
- Better cold start performance
- Resilient to serverless connection timeouts
- Requires careful monitoring of pool exhaustion

**ADR**: `docs/adr/001-neon-serverless-connection-strategy.md`

---

### 5.2 JWT Verification Strategy

**Context**: Backend must verify JWTs issued by Better Auth frontend

**Decision**: Use JWKS endpoint with RS256 asymmetric verification

**Alternatives**:
1. **Shared symmetric secret (HS256)**
   - Pros: Simpler implementation, no network calls
   - Cons: Backend and frontend share same secret (security risk), no key rotation

2. **JWKS endpoint with RS256**
   - Pros: Asymmetric keys (frontend signs, backend verifies), supports key rotation, industry standard
   - Cons: Requires network calls, caching complexity

**Decision: Option 2 (JWKS with RS256)**

**Rationale**:
- Asymmetric cryptography is more secure (backend never has signing key)
- Supports key rotation without backend redeployment
- Aligns with Better Auth's default JWT strategy
- Caching mitigates network call overhead

**Impact**:
- Initial request latency for JWKS fetch (mitigated by 1-hour cache)
- Dependency on Better Auth JWKS endpoint availability
- More complex implementation than symmetric approach

**ADR**: `docs/adr/002-jwks-rs256-verification.md`

---

### 5.3 JWKS Caching Strategy

**Context**: Fetching JWKS on every request is inefficient

**Decision**: In-memory cache with 1-hour TTL and refresh-on-failure

**Alternatives**:
1. **No caching** (fetch on every request)
   - Pros: Always up-to-date keys
   - Cons: High latency, JWKS endpoint load, network dependency

2. **In-memory cache with TTL**
   - Pros: Low latency, reduced network calls, simple implementation
   - Cons: Stale keys possible (mitigated by refresh-on-failure)

3. **External cache (Redis)**
   - Pros: Shared cache across multiple backend instances
   - Cons: Added infrastructure, complexity, cost

**Decision: Option 2 (In-memory with TTL)**

**Rationale**:
- Phase II runs single backend instance (no need for shared cache)
- 1-hour TTL balances freshness vs performance
- Refresh-on-failure handles key rotation gracefully
- Simpler than external cache (no Redis dependency)

**Impact**:
- Up to 1-hour delay in recognizing rotated keys (acceptable for Phase II)
- Automatic recovery from key rotation via refresh-on-failure
- No additional infrastructure required

**ADR**: `docs/adr/003-jwks-in-memory-cache.md`

---

### 5.4 Task Ownership Enforcement

**Context**: Prevent users from accessing other users' tasks

**Decision**: Application-level enforcement with user_id scoping in every query

**Alternatives**:
1. **Database-level enforcement** (row-level security policies)
   - Pros: Impossible to bypass, defense-in-depth
   - Cons: Complex setup, Neon limitations, harder to test

2. **Application-level enforcement**
   - Pros: Explicit in code, easier to test, portable across databases
   - Cons: Vulnerable to coding errors, must be applied consistently

3. **Hybrid approach**
   - Pros: Defense-in-depth
   - Cons: Most complex, potentially redundant

**Decision: Option 2 (Application-level)**

**Rationale**:
- Explicit ownership checks in every endpoint
- Easier to test and reason about
- Portable across databases (not Neon-specific)
- Sufficient for Phase II security requirements

**Impact**:
- Ownership checks must be added to every query (enforcement via code review)
- Comprehensive tests required to verify enforcement
- No database-level fallback (single point of failure)

**ADR**: `docs/adr/004-application-level-ownership.md`

---

### 5.5 Concurrency Handling

**Context**: Multiple requests may update the same task simultaneously

**Decision**: Optimistic locking with version field

**Alternatives**:
1. **Last-write-wins** (no conflict detection)
   - Pros: Simple, no additional fields required
   - Cons: Silent data loss, poor user experience

2. **Optimistic locking** (version field)
   - Pros: Detects conflicts, explicit HTTP 409 response, scales well
   - Cons: Requires version field, client must handle conflicts

3. **Pessimistic locking** (SELECT FOR UPDATE)
   - Pros: Prevents conflicts upfront
   - Cons: Reduces concurrency, deadlock risk, poor for serverless

**Decision: Option 2 (Optimistic locking)**

**Rationale**:
- Detects concurrent updates explicitly
- HTTP 409 signals client to refresh and retry
- Scales well with serverless architecture
- Standard pattern for REST APIs

**Impact**:
- Version field added to Task model
- Clients must include version in update requests
- Clients must handle HTTP 409 responses

**ADR**: `docs/adr/005-optimistic-locking-strategy.md`

---

### 5.6 Error Handling Convention

**Context**: Consistent error responses improve client integration

**Decision**: Standardized JSON error format with correlation ID

**Alternatives**:
1. **FastAPI default** (plain text or simple JSON)
   - Pros: No custom code required
   - Cons: Inconsistent format, no correlation ID

2. **Custom JSON error format**
   - Pros: Consistent structure, includes correlation ID, better debugging
   - Cons: Requires custom exception handlers

**Decision: Option 2 (Custom JSON format)**

**Format**:
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "status_code": 403
}
```

**Rationale**:
- Consistent structure across all errors
- Correlation ID enables request tracing
- Better client integration and debugging
- Minimal implementation overhead

**Impact**:
- Global exception handlers required
- All errors must use consistent format
- Clients can rely on consistent error structure

**ADR**: `docs/adr/006-error-response-format.md`

---

## 6. Validation & Quality Gates

### 6.1 Authentication & Authorization Gates

**Gate 1: JWT Authentication**
- ✅ All protected endpoints reject requests without JWT (HTTP 401)
- ✅ Malformed JWTs return HTTP 401 with descriptive error
- ✅ Expired JWTs return HTTP 401
- ✅ Invalid signatures return HTTP 401
- ✅ JWKS endpoint failures trigger cache refresh

**Gate 2: Ownership Enforcement**
- ✅ User can only access tasks with their user_id
- ✅ Mismatched user_id in URL returns HTTP 403
- ✅ Cross-user access attempts logged with user_ids
- ✅ All queries filtered by authenticated user_id

**Test Coverage**:
```python
# Authentication tests
test_missing_jwt_returns_401()
test_invalid_jwt_returns_401()
test_expired_jwt_returns_401()
test_jwks_cache_refresh_on_failure()

# Authorization tests
test_user_cannot_list_others_tasks()
test_user_cannot_get_others_task()
test_user_cannot_update_others_task()
test_user_cannot_delete_others_task()
```

---

### 6.2 Data Integrity Gates

**Gate 3: Input Validation**
- ✅ Empty title returns HTTP 422
- ✅ Title >200 chars returns HTTP 422
- ✅ Description >500 chars returns HTTP 422
- ✅ Invalid UUID in path returns HTTP 400
- ✅ Missing required fields return HTTP 422

**Gate 4: Optimistic Locking**
- ✅ Concurrent updates detected (HTTP 409)
- ✅ Version incremented on every update
- ✅ Version included in all responses
- ✅ Stale version updates rejected

**Test Coverage**:
```python
# Validation tests
test_empty_title_rejected()
test_long_title_rejected()
test_long_description_rejected()
test_invalid_uuid_rejected()

# Concurrency tests
test_concurrent_update_conflict()
test_version_incremented_on_update()
test_stale_version_rejected()
```

---

### 6.3 API Compliance Gates

**Gate 5: Endpoint Behavior**
- ✅ All endpoints return JSON
- ✅ Status codes match spec (200, 201, 400, 401, 403, 404, 409, 429, 500)
- ✅ Response schemas match TaskResponse
- ✅ CRUD operations work as specified

**Gate 6: Error Handling**
- ✅ Errors return consistent JSON format
- ✅ Correlation ID included in error responses
- ✅ Database errors return HTTP 500 (no sensitive details)
- ✅ Not found returns HTTP 404

**Test Coverage**:
```python
# API compliance tests
test_list_returns_json_array()
test_create_returns_201()
test_update_returns_200()
test_delete_returns_204()
test_not_found_returns_404()
test_error_format_consistent()
```

---

### 6.4 Performance Gates

**Gate 7: Response Times**
- ✅ Task list (<1000 tasks) responds within 200ms
- ✅ Single task GET responds within 100ms
- ✅ Task create/update responds within 150ms
- ✅ JWKS cache hit latency <5ms

**Gate 8: Database Performance**
- ✅ Queries use indexes (no full table scans)
- ✅ Connection pool doesn't exhaust
- ✅ No N+1 query problems

**Test Coverage**:
```python
# Performance tests
test_list_tasks_under_200ms()
test_get_task_under_100ms()
test_create_task_under_150ms()
test_query_uses_indexes()
```

---

### 6.5 Security Gates

**Gate 9: Rate Limiting**
- ✅ Per-user limit enforced (100 req/min)
- ✅ HTTP 429 returned when exceeded
- ✅ Rate limit headers present
- ✅ Different users have separate limits

**Gate 10: Security Headers**
- ✅ CORS configured with allowed origins
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ No sensitive data in error messages

**Test Coverage**:
```python
# Security tests
test_rate_limit_enforced()
test_rate_limit_headers_present()
test_cors_allows_configured_origins()
test_security_headers_present()
test_errors_hide_sensitive_data()
```

---

### 6.6 Observability Gates

**Gate 11: Logging**
- ✅ All requests logged with correlation ID
- ✅ Authentication failures logged with reason
- ✅ Authorization failures logged with user_ids
- ✅ Structured JSON logs emitted
- ✅ No sensitive data in logs (no JWT tokens)

**Test Coverage**:
```python
# Logging tests
test_request_logged_with_correlation_id()
test_auth_failure_logged()
test_authz_failure_logged()
test_logs_are_json_formatted()
test_no_sensitive_data_logged()
```

---

## 7. Technology Stack & Constraints

### 7.1 Core Technologies

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Language** | Python | 3.13+ | Modern features, type hints, async/await |
| **Framework** | FastAPI | 0.110+ | Async support, auto docs, Pydantic validation |
| **ORM** | SQLModel | 0.0.14+ | Type-safe, SQLAlchemy integration, async support |
| **Database** | Neon Serverless PostgreSQL | Latest | Cloud-native, auto-scaling, branching |
| **HTTP Client** | httpx | 0.27+ | Async support for JWKS fetching |
| **JWT Library** | python-jose | 3.3+ | RS256 verification, JWKS support |
| **Settings** | pydantic-settings | 2.2+ | Type-safe config, env validation |
| **ASGI Server** | uvicorn | 0.28+ | Production-ready, fast, reliable |

### 7.2 Development Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **uv** | Dependency management | Latest | Fast, reliable, modern |
| **pytest** | Testing framework | 8.1+ | Async support, fixtures |
| **pytest-asyncio** | Async test support | 0.23+ | Required for async tests |
| **httpx** | Test client | 0.27+ | FastAPI testing |
| **black** | Code formatting | 24.2+ | Consistent style |
| **mypy** | Type checking | 1.9+ | Static type analysis |
| **ruff** | Linting | 0.3+ | Fast, comprehensive |
| **alembic** | Migrations | 1.13+ | Database versioning |

### 7.3 Dependency Management Constraints

**Strict uv-only policy**:
- ❌ NO pip
- ❌ NO poetry
- ❌ NO pipenv
- ✅ ONLY uv

**Commands**:
```bash
# Add dependency
uv add package-name

# Add dev dependency
uv add --dev package-name

# Update dependencies
uv sync

# Lock dependencies
uv lock

# Run script
uv run python script.py
```

### 7.4 Database Constraints

**Neon Serverless PostgreSQL**:
- Must use `psycopg[binary]` driver (NOT psycopg2)
- Connection string format: `postgresql://user:pass@ep-xxx.neon.tech/dbname`
- Connection pooling: Small local pool (5-10 connections)
- Connection recycling: Every 300 seconds
- Pre-ping: Enabled to handle serverless disconnects

**Migration Constraints**:
- All schema changes via Alembic
- Reversible migrations required
- Migration testing mandatory
- No manual SQL (use autogenerate)

### 7.5 Environment Variable Requirements

**Required Variables**:
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname

# Authentication (Better Auth JWKS)
BETTER_AUTH_JWKS_URL=https://your-frontend.com/.well-known/jwks.json

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend.com
```

**Optional Variables** (with defaults):
```env
# JWKS Cache
JWKS_CACHE_TTL=3600  # 1 hour

# Rate Limiting
RATE_LIMIT_REQUESTS=100  # per user
RATE_LIMIT_WINDOW=60  # seconds

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Application
APP_PORT=8000
APP_HOST=0.0.0.0
```

---

## 8. Project Initialization

### 8.1 Step-by-Step Setup

**Step 1: Create Backend Directory**
```bash
cd /home/hamza_ahmed/fullstack-todo-app
mkdir backend && cd backend
```

**Step 2: Initialize with uv**
```bash
uv init
uv venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate    # Windows
```

**Step 3: Install Dependencies**
```bash
# Core dependencies
uv add fastapi uvicorn[standard] sqlmodel "psycopg[binary]" python-jose[cryptography] python-multipart httpx pydantic-settings

# Development dependencies
uv add --dev pytest pytest-asyncio httpx black mypy ruff alembic
```

**Step 4: Create Project Structure**
```bash
mkdir -p app/{database,auth,routers,middleware}
mkdir -p tests
mkdir -p alembic/versions
touch app/__init__.py app/main.py app/config.py
touch app/database/{__init__.py,engine.py,session.py,models.py}
touch app/auth/{__init__.py,jwks.py,jwt_handler.py,dependencies.py}
touch app/routers/{__init__.py,tasks.py}
touch app/middleware/{__init__.py,request_id.py,logging.py,rate_limit.py}
touch tests/{__init__.py,conftest.py,test_tasks.py}
touch README.md .env.example .gitignore
```

**Step 5: Configure .gitignore**
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
ENV/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
htmlcov/
.coverage

# Database
*.db
*.sqlite

# Alembic
alembic/versions/*.pyc
```

**Step 6: Create .env.example**
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname

# Authentication (Better Auth JWKS)
BETTER_AUTH_JWKS_URL=https://your-frontend.com/.well-known/jwks.json

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend.com

# Optional Settings
JWKS_CACHE_TTL=3600
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
LOG_LEVEL=INFO
LOG_FORMAT=json
APP_PORT=8000
APP_HOST=0.0.0.0
```

**Step 7: Copy to .env and Configure**
```bash
cp .env.example .env
# Edit .env with actual values
```

**Step 8: Initialize Alembic**
```bash
alembic init alembic
```

**Step 9: Verify Setup**
```bash
uv run uvicorn app.main:app --reload
# Navigate to http://localhost:8000/docs
```

---

## 9. Neon Cloud-Native Specific Considerations

### 9.1 Connection Management

**Serverless Connection Lifecycle**:
- Neon may terminate idle connections after a period
- Use `pool_pre_ping=True` to validate connections before use
- Use `pool_recycle=300` to proactively recycle connections every 5 minutes
- Small pool size (5-10) because Neon provides pooling infrastructure

**Configuration**:
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Validate before use
    pool_size=5,  # Small pool for serverless
    max_overflow=10,  # Allow burst
    pool_recycle=300,  # Recycle every 5 min
)
```

### 9.2 Branch/Clone Features

**Development Workflow**:
1. **Production**: Main branch in Neon
2. **Staging**: Create staging branch from main
3. **Development**: Create dev branches for isolated testing
4. **CI/CD**: Ephemeral branches for test runs

**Benefits**:
- Isolated testing environments
- Fast branch creation (instant clone)
- Cost-effective (pay for storage once)
- Safe schema testing

**Usage**:
```bash
# Create development branch via Neon dashboard or CLI
# Use branch-specific DATABASE_URL in .env
DATABASE_URL=postgresql://user:pass@ep-xxx-dev.neon.tech/dbname
```

### 9.3 Auto-Scaling

**Neon Auto-Scaling**:
- Compute scales based on load
- Automatically adjusts resources
- No manual intervention required

**Optimization**:
- Use connection pooling to minimize connections
- Monitor connection usage in Neon dashboard
- Set appropriate pool_size and max_overflow

### 9.4 Geographic Distribution

**Multi-Region Deployment**:
- Neon supports multi-region databases
- Choose region closest to application deployment
- Consider read replicas for global distribution (future)

**Latency Optimization**:
- Deploy backend in same region as Neon database
- Use read replicas for read-heavy workloads (Phase III)

### 9.5 Billing Optimization

**Connection Management**:
- Minimize concurrent connections (small pool_size)
- Use connection recycling to avoid idle connections
- Monitor connection duration in Neon dashboard

**Storage Optimization**:
- Use branches for development (storage shared)
- Clean up unused branches periodically
- Monitor storage usage

**Compute Optimization**:
- Auto-scaling handles compute efficiently
- Monitor query performance to optimize expensive queries
- Use indexes to reduce compute load

---

## 10. Success Metrics

### 10.1 Functional Completeness

- ✅ All 5 user stories implemented and tested
- ✅ All 50 functional requirements satisfied
- ✅ All API endpoints match specification exactly
- ✅ Multi-user isolation verified
- ✅ JWT authentication working with Better Auth

### 10.2 Security & Authorization

- ✅ 100% authentication enforcement (no unprotected endpoints)
- ✅ 100% ownership enforcement (no cross-user access)
- ✅ Rate limiting active (100 req/min per user)
- ✅ JWKS verification working with RS256
- ✅ No secrets hardcoded in source code

### 10.3 Data Integrity

- ✅ Optimistic locking prevents data loss
- ✅ Concurrent updates detected (HTTP 409)
- ✅ Database constraints enforced
- ✅ Tasks persist across restarts

### 10.4 Performance

- ✅ Task list (<1000 tasks) responds within 200ms
- ✅ JWKS cache hit latency <5ms
- ✅ Connection pool doesn't exhaust
- ✅ Queries use indexes (no full table scans)

### 10.5 Observability

- ✅ All requests logged with correlation ID
- ✅ Authentication failures logged with reasons
- ✅ Authorization failures logged with user_ids
- ✅ Structured JSON logs emitted
- ✅ No sensitive data in logs

### 10.6 Testing

- ✅ Test coverage ≥ 80%
- ✅ All user stories have integration tests
- ✅ API contract tests pass
- ✅ Edge cases covered

### 10.7 Documentation

- ✅ OpenAPI documentation complete
- ✅ README.md comprehensive
- ✅ Environment variables documented
- ✅ Deployment checklist ready

### 10.8 Production Readiness

- ✅ Backend deployable with environment variables only
- ✅ Alembic migrations reversible
- ✅ Error handling comprehensive
- ✅ Security audit passed (no critical vulnerabilities)
- ✅ Neon database connection stable

---

## 11. Risk Assessment & Mitigation

### 11.1 Technical Risks

**Risk 1: Neon Connection Instability**
- **Likelihood**: Low
- **Impact**: High (backend unavailable)
- **Mitigation**:
  - Connection pre-ping enabled
  - Connection recycling every 5 minutes
  - Retry logic for transient failures
  - Monitoring and alerting on connection errors

**Risk 2: JWKS Endpoint Unavailability**
- **Likelihood**: Medium
- **Impact**: High (authentication broken)
- **Mitigation**:
  - 1-hour cache TTL (continued operation during outages)
  - Refresh-on-failure logic
  - Structured logging for JWKS failures
  - Monitoring and alerting on JWKS fetch errors

**Risk 3: Rate Limiting Memory Exhaustion**
- **Likelihood**: Low
- **Impact**: Medium (DoS vulnerability)
- **Mitigation**:
  - Sliding window with automatic cleanup
  - Periodic cleanup of old entries
  - Monitor memory usage
  - Consider external cache (Redis) for Phase III

### 11.2 Security Risks

**Risk 4: JWT Signature Bypass**
- **Likelihood**: Low
- **Impact**: Critical (authentication bypass)
- **Mitigation**:
  - Use python-jose with RS256 verification
  - Never skip signature verification
  - Comprehensive authentication tests
  - Security code review

**Risk 5: Cross-User Data Leak**
- **Likelihood**: Medium
- **Impact**: Critical (data breach)
- **Mitigation**:
  - Ownership enforcement in every query
  - Comprehensive authorization tests
  - Code review for every endpoint
  - Penetration testing

### 11.3 Operational Risks

**Risk 6: Migration Failures**
- **Likelihood**: Medium
- **Impact**: High (data loss, downtime)
- **Mitigation**:
  - Test migrations on Neon dev branch first
  - Reversible migrations required
  - Database backup before migration
  - Rollback plan documented

**Risk 7: Performance Degradation**
- **Likelihood**: Medium
- **Impact**: Medium (poor UX)
- **Mitigation**:
  - Performance tests in CI/CD
  - Database query optimization
  - Monitoring and alerting on latency
  - Index optimization

---

## 12. Next Steps After Plan Approval

1. **Approve Plan**: Review and approve this plan document
2. **Create ADRs**: Document architectural decisions in `docs/adr/`
3. **Generate Tasks**: Run `/sp.tasks` to break down phases into executable tasks
4. **Implement Phase 1**: Initialize project foundation
5. **Iterate**: Complete phases sequentially, testing after each
6. **Deploy**: Deploy to production after Phase 6 complete

---

**Plan Status**: Draft → Ready for Review

**Next Command**: `/sp.tasks` (after plan approval)

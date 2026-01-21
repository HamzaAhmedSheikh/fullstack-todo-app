# Research: Backend Phase 0 - JWT Security & TDD Patterns

**Feature**: Backend Phase 0 - Verification and Initial Setup
**Date**: 2026-01-07
**Status**: Complete

## Decision 1: JWT Verification with PyJWT

**Decision**: Use PyJWT with HS256 algorithm for JWT signature verification

**Rationale**:
- Better Auth uses HS256 by default with shared secret (BETTER_AUTH_SECRET)
- PyJWT is the industry-standard Python JWT library with strong security track record
- Simple integration with FastAPI dependency injection pattern
- Supports all required JWT operations: encode, decode, verify signature, handle expiration

**Code Example**:
```python
import jwt
import os
from datetime import datetime, timedelta
from fastapi import HTTPException, status

def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token signature and extract payload

    Args:
        token: JWT token string from Authorization header

    Returns:
        dict: Decoded JWT payload containing user information

    Raises:
        HTTPException: 401 if token is invalid, expired, or signature fails
    """
    try:
        secret = os.getenv("BETTER_AUTH_SECRET")
        if not secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="BETTER_AUTH_SECRET not configured"
            )

        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"]
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

**Alternatives Considered**:
- **python-jose**: More features (JWE, JWK support) but heavier dependency. Not needed for Better Auth's simple HS256 approach.
- **Manual JWT parsing**: Major security risk, reinventing the wheel. PyJWT is battle-tested and maintained.
- **authlib**: Comprehensive but overkill for our use case. PyJWT is simpler and focused.

---

## Decision 2: FastAPI Dependency Injection for Authentication

**Decision**: Use FastAPI's `Depends()` with Security(HTTPBearer()) for JWT extraction and verification

**Rationale**:
- FastAPI's dependency injection is designed for this exact pattern
- Clean separation of concerns: auth logic separate from business logic
- Reusable across all authenticated endpoints
- Type-safe with proper IDE support
- Testable: easy to mock dependencies in tests

**Code Example**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and verify JWT token, return user_id

    This dependency is used on all authenticated endpoints.
    It extracts the token from Authorization header, verifies signature,
    and returns the authenticated user's ID.

    Args:
        credentials: Automatically injected by FastAPI from Authorization header

    Returns:
        str: Authenticated user's ID from JWT payload

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        secret = os.getenv("BETTER_AUTH_SECRET")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")  # 'sub' is standard JWT claim for user ID

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user ID"
            )

        return user_id

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# Usage in endpoint:
# @app.get("/api/{user_id}/tasks")
# async def get_tasks(
#     user_id: str,
#     current_user: str = Depends(get_current_user)
# ):
#     if user_id != current_user:
#         raise HTTPException(status_code=403, detail="Forbidden")
#     # ... fetch tasks filtered by user_id
```

**Alternatives Considered**:
- **Middleware approach**: Global middleware for all routes, but harder to test and doesn't compose well. Dependencies are more flexible.
- **Manual header parsing**: Repeating auth logic in every endpoint. Violates DRY principle.
- **OAuth2PasswordBearer**: Designed for OAuth2 password flow, not JWT Bearer tokens. HTTPBearer is correct choice.

---

## Decision 3: Pytest Configuration for FastAPI Testing

**Decision**: Use pytest with FastAPI TestClient and pytest-asyncio for async support

**Rationale**:
- FastAPI documentation recommends TestClient from starlette
- pytest is Python testing standard with rich ecosystem
- TestClient doesn't require actual server, tests run in-process (faster)
- pytest fixtures perfect for reusable test setup (test DB, mock tokens)
- pytest-cov for coverage reporting

**Code Example**:
```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
import jwt
import os
from datetime import datetime, timedelta

@pytest.fixture
def test_client():
    """FastAPI test client fixture"""
    return TestClient(app)

@pytest.fixture
def mock_jwt_token():
    """Generate valid JWT token for testing"""
    secret = os.getenv("BETTER_AUTH_SECRET", "test-secret-key")
    payload = {
        "sub": "test-user-123",  # user_id
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token

@pytest.fixture
def auth_headers(mock_jwt_token):
    """Authorization headers with valid JWT"""
    return {"Authorization": f"Bearer {mock_jwt_token}"}

# test_auth.py
def test_protected_endpoint_with_valid_token(test_client, auth_headers):
    response = test_client.get("/api/test-user-123/tasks", headers=auth_headers)
    assert response.status_code == 200

def test_protected_endpoint_without_token(test_client):
    response = test_client.get("/api/test-user-123/tasks")
    assert response.status_code == 401
```

**pytest.ini Configuration**:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts = -v --tb=short --cov=app --cov-report=term-missing
markers =
    unit: Unit tests
    integration: Integration tests
    auth: Authentication tests
```

**Alternatives Considered**:
- **unittest**: Built-in but less Pythonic, verbose setup. pytest is cleaner.
- **httpx directly**: Lower level, requires more setup. TestClient wraps this nicely.
- **Real server**: Slower, introduces network dependencies. TestClient is faster and isolated.

---

## Decision 4: SQLModel + Neon PostgreSQL Connection Patterns

**Decision**: Use SQLModel with synchronous engine for Neon PostgreSQL, async not required for Phase 0

**Rationale**:
- SQLModel combines SQLAlchemy (ORM) with Pydantic (validation) - best of both worlds
- Neon supports standard PostgreSQL connection string
- Synchronous engine sufficient for MVP, can upgrade to async later if needed
- Connection pooling handled by SQLAlchemy engine
- Environment-based connection string from DATABASE_URL

**Code Example**:
```python
# app/db.py
from sqlmodel import Session, create_engine
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries in development
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Connection pool size
    max_overflow=10  # Max connections beyond pool_size
)

def get_db():
    """
    Database session dependency for FastAPI

    Yields a SQLModel Session that automatically commits on success
    and rolls back on exception. Always closes connection.

    Usage:
        @app.get("/api/{user_id}/tasks")
        def get_tasks(db: Session = Depends(get_db)):
            tasks = db.exec(select(Task).where(Task.user_id == user_id)).all()
            return tasks
    """
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
```

**Neon Connection String Format**:
```
postgresql://user:password@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**Alternatives Considered**:
- **Async SQLModel**: More complex, requires async/await throughout stack. Not needed for current scale.
- **Raw psycopg2**: Lower level, missing ORM benefits. SQLModel provides better developer experience.
- **Django ORM**: Too heavyweight, tight coupling with Django framework. SQLModel is standalone.

---

## Decision 5: User Isolation Query Filtering Patterns

**Decision**: ALWAYS filter queries by `user_id` using SQLModel's WHERE clause, validate path user_id matches JWT user_id

**Rationale**:
- Security-critical: prevents users from accessing other users' data
- SQLModel makes filtering explicit and visible in code
- Double-check: validate path parameter matches JWT claim before query
- Return 403 Forbidden if user_id mismatch (not 404, which leaks existence)
- All task queries MUST include `.where(Task.user_id == current_user)`

**Code Example**:
```python
from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from app.dependencies import get_current_user, get_db
from app.models import Task

@app.get("/api/{user_id}/tasks")
def get_user_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tasks for authenticated user

    SECURITY: Validates path user_id matches JWT user_id
    ISOLATION: Filters query by authenticated user only
    """
    # CRITICAL: Validate path parameter matches authenticated user
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other users' data"
        )

    # CRITICAL: ALWAYS filter by user_id
    statement = select(Task).where(Task.user_id == current_user)
    tasks = db.exec(statement).all()

    return tasks

# ❌ FORBIDDEN PATTERN - Never do this:
# tasks = db.exec(select(Task)).all()  # Exposes all users' tasks!

# ✅ REQUIRED PATTERN - Always do this:
# tasks = db.exec(select(Task).where(Task.user_id == current_user)).all()
```

**Error Handling**:
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Valid token but accessing wrong user_id
- **404 Not Found**: Resource doesn't exist for authenticated user
  - ONLY return 404 after verifying user owns the resource
  - Never return 404 for wrong user_id (leaks data existence)

**Testing User Isolation**:
```python
def test_user_cannot_access_other_user_tasks(test_client):
    # User A's token
    token_a = create_jwt_for_user("user-a")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Try to access User B's tasks with User A's token
    response = test_client.get("/api/user-b/tasks", headers=headers_a)

    # Should return 403 Forbidden, not 200 or 404
    assert response.status_code == 403
    assert "Cannot access other users' data" in response.json()["detail"]
```

**Alternatives Considered**:
- **Row-level security in PostgreSQL**: More robust but adds complexity. SQLModel filtering sufficient for MVP.
- **Implicit filtering via middleware**: Hidden security is dangerous. Explicit WHERE clauses are clearer.
- **Return 404 for wrong user_id**: Leaks information about other users' data. 403 is correct.

---

## Decision 6: TDD Workflow Documentation

**Decision**: Strict Red-Green-Refactor cycle for all implementation, tests written BEFORE code

**Rationale**:
- TDD prevents bugs by defining expected behavior first
- Tests serve as living documentation of requirements
- Refactoring is safe with comprehensive test coverage
- FastAPI + pytest makes TDD fast and enjoyable
- Forces thinking about API design before implementation

**Red-Green-Refactor Cycle**:

**1. RED Phase**: Write failing test
```python
# tests/test_tasks.py
def test_create_task_for_user(test_client, auth_headers):
    """Test creating a new task for authenticated user"""
    task_data = {
        "title": "Buy groceries",
        "description": "Milk, eggs, bread"
    }

    response = test_client.post(
        "/api/test-user-123/tasks",
        json=task_data,
        headers=auth_headers
    )

    assert response.status_code == 201  # FAILS - endpoint doesn't exist yet
    assert response.json()["title"] == "Buy groceries"
    assert response.json()["user_id"] == "test-user-123"
```

**2. GREEN Phase**: Write minimal code to pass test
```python
# app/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.dependencies import get_current_user, get_db
from app.models import Task
from app.schemas import TaskCreate, TaskResponse

router = APIRouter()

@router.post("/api/{user_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate user_id matches authenticated user
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Create task
    task = Task(
        user_id=current_user,
        title=task_data.title,
        description=task_data.description
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return task  # Now test PASSES
```

**3. REFACTOR Phase**: Improve code while keeping tests green
```python
# Extract validation to reusable function
def validate_user_owns_resource(path_user_id: str, jwt_user_id: str):
    """Reusable user_id validation"""
    if path_user_id != jwt_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other users' resources"
        )

@router.post("/api/{user_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    validate_user_owns_resource(user_id, current_user)  # Cleaner!

    task = Task(user_id=current_user, **task_data.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
```

**Test Organization**:
```
tests/
├── conftest.py          # Shared fixtures
├── test_auth.py         # JWT verification tests
├── test_tasks.py        # Task CRUD tests
└── test_user_isolation.py  # User data isolation tests
```

**Running Tests**:
```bash
# All tests
pytest

# Specific test file
pytest tests/test_auth.py

# Specific test
pytest tests/test_auth.py::test_invalid_token_returns_401

# With coverage
pytest --cov=app --cov-report=html

# Watch mode (requires pytest-watch)
ptw
```

**Alternatives Considered**:
- **Code-first, tests later**: Tests become afterthought, poor coverage. TDD prevents this.
- **Integration tests only**: Slow feedback loop. Unit + integration tests together are optimal.
- **No refactor step**: Code becomes messy over time. Refactoring with tests is safe.

---

## Summary

All 6 research decisions complete:

1. ✅ JWT Verification: PyJWT with HS256
2. ✅ Auth Pattern: FastAPI Depends() + HTTPBearer
3. ✅ Testing: pytest + TestClient + pytest-asyncio
4. ✅ Database: SQLModel + Neon PostgreSQL with connection pooling
5. ✅ Security: Explicit user_id filtering, 403 for mismatches
6. ✅ Workflow: Strict TDD Red-Green-Refactor cycle

**Ready for Phase 1 Implementation**: All technical decisions documented with code examples and rationale.

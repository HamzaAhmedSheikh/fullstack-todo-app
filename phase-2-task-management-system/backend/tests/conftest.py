"""
Pytest Configuration and Global Fixtures
Fixed to handle async engine initialization properly
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport
from sqlmodel import SQLModel
from uuid import uuid4, UUID
import jwt
from datetime import datetime, timedelta
import pytest_asyncio

# Import after setting up test environment
import os

# Set test environment before importing app
os.environ["ENVIRONMENT"] = "test"
# Use Neon DB with asyncpg driver for tests
os.environ["DATABASE_URL"] = "postgresql+asyncpg://default:SM21ZdGIVovT@ep-muddy-resonance-215657-pooler.us-east-1.aws.neon.tech/phase2-fullstack-todo-app?ssl=require"

from app.main import app
from app.database.session import get_db
from app.database.models import Task


# Pytest configuration
def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line("markers", "asyncio: mark test as async")


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# T024: Test database session fixture using in-memory SQLite
@pytest_asyncio.fixture
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Create in-memory SQLite database for testing.
    Using SQLite instead of PostgreSQL for fast, isolated tests.
    """
    # Create in-memory SQLite engine
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create session factory
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    # Provide session
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

    # Cleanup
    await engine.dispose()


# T025: Test client fixture for FastAPI app
@pytest_asyncio.fixture
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create test client with database override.
    Overrides get_db dependency to use test database.
    """

    # Override get_db dependency
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    # Create test client
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    # Cleanup
    app.dependency_overrides.clear()


# T026: Auth headers fixture generating test JWTs with user_id
@pytest.fixture
def test_user_id() -> UUID:
    """Generate test user ID"""
    return uuid4()


@pytest.fixture
def auth_headers(test_user_id: UUID) -> dict:
    """
    Generate test JWT auth headers.
    Creates a valid JWT token for testing authenticated endpoints.

    Note: In real tests with JWKS validation, you'll need to mock the verification.
    """
    # Create test JWT payload
    payload = {
        "sub": str(test_user_id),
        "user_id": str(test_user_id),
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow(),
    }

    # Create unsigned token (for testing without JWKS validation)
    token = jwt.encode(payload, "test-secret-key", algorithm="HS256")

    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_task(test_db: AsyncSession, test_user_id: UUID) -> Task:
    """
    Create a test task in database.
    Useful for testing update/delete operations.
    """
    task = Task(
        user_id=test_user_id,
        title="Test Task",
        description="Test Description",
        completed=False,
        version=1,
    )
    test_db.add(task)
    await test_db.commit()
    await test_db.refresh(task)
    return task

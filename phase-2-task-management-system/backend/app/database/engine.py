"""
Database Engine Configuration for Neon Serverless PostgreSQL
Optimized for cloud-native serverless environment
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.core.config import settings

# Create async engine with Neon-optimized settings
# IMPORTANT: Use postgresql+asyncpg:// for async operations
engine = create_async_engine(
    settings.DATABASE_URL,  # Must be: postgresql+asyncpg://user:pass@host/db
    echo=(settings.LOG_LEVEL == "DEBUG"),  # Log SQL queries in debug mode
    pool_size=5,  # Connection pool size (Neon recommends 5-10)
    max_overflow=10,  # Max connections beyond pool_size
    pool_pre_ping=True,  # Verify connections before use (critical for serverless)
    pool_recycle=300,  # Recycle connections every 5 minutes (prevent serverless timeout)
    connect_args={
        "server_settings": {
            "application_name": "fastapi-task-backend",
            "jit": "off",  # Disable JIT compilation for faster cold starts
        }
    },
)

# Create async session factory using async_sessionmaker (SQLAlchemy 2.0+ style)
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep objects usable after commit
    autocommit=False,  # Explicit transaction control
    autoflush=False,  # Manual flush control
)


async def init_db() -> None:
    """
    Initialize database tables.
    Creates all tables defined in SQLModel metadata.

    Note: Only use in development/testing.
    Production should use Alembic migrations.
    """
    async with engine.begin() as conn:
        # Use run_sync to execute synchronous metadata operations
        await conn.run_sync(SQLModel.metadata.create_all)
        print("✅ Database tables created successfully")


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database session management.

    Provides async session with automatic cleanup and connection pooling.
    Use as: session: AsyncSession = Depends(get_session)

    Yields:
        AsyncSession: Database session for request lifecycle
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            # Rollback on error
            await session.rollback()
            raise
        finally:
            # Always close the session
            await session.close()


async def close_db() -> None:
    """
    Cleanup database connections on application shutdown.
    Disposes the engine and closes all pooled connections.
    """
    await engine.dispose()
    print("✅ Database connections closed")

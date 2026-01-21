"""
Database Session Management with Dependency Injection
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database.engine import engine

# Create async session factory using async_sessionmaker (SQLAlchemy 2.0+)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep objects usable after commit
    autocommit=False,  # Explicit transaction control
    autoflush=False,  # Manual flush control
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for database session management.

    Provides async session with automatic cleanup and transaction handling.

    Usage in FastAPI endpoints:
        from fastapi import Depends
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.database.session import get_db

        @router.post("/tasks/")
        async def create_task(
            task_data: dict,
            db: AsyncSession = Depends(get_db)
        ):
            # Your code here
            pass

    Yields:
        AsyncSession: Database session for request lifecycle
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Only commit if no exception occurred
            await session.commit()
        except Exception:
            # Rollback on any error
            await session.rollback()
            raise
        finally:
            # Always close the session
            await session.close()

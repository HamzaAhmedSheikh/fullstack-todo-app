"""
FastAPI Dependencies for Authentication
Provides dependency injection for protected endpoints
"""
from uuid import UUID
from fastapi import Depends
from app.middleware.jwt import get_current_user


def get_current_user_uuid(
    current_user: dict = Depends(get_current_user),
) -> UUID:
    """
    Extract UUID from authenticated user information.

    This dependency extracts the user_id from the JWT token
    and converts it to UUID for use in route handlers.

    Args:
        current_user: User information from JWT token

    Returns:
        UUID: Authenticated user's ID as UUID
    """
    return UUID(current_user["user_id"])

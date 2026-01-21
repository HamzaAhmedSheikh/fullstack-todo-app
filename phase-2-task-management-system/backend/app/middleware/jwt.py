"""
FastAPI JWT Dependency
Extracts and verifies JWT tokens from Authorization header
"""
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.utils.auth import verify_jwt_token

logger = logging.getLogger("jwt_middleware")

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Extract and verify JWT token, return user information

    This dependency is used on all authenticated endpoints.
    It extracts the token from Authorization header, verifies signature,
    and returns the authenticated user's information.

    Behavior:
    - Missing token: 401
    - Invalid token: 401
    - Expired token: 401
    - Valid token: user info returned

    Args:
        credentials: Automatically injected by FastAPI from Authorization header

    Returns:
        dict: User information {"user_id": str, "email": str}

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    token = credentials.credentials
    logger.debug(f"Received token for verification (length: {len(token)})")

    try:
        result = verify_jwt_token(token)
        logger.debug(f"Token verified successfully: user_id={result.get('user_id')}")
        return result

    except Exception as e:
        logger.error(f"Token verification failed: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

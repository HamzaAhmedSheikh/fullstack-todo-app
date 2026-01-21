"""
JWKS Client and JWT Verification Logic
Fetches and caches public keys from the frontend JWKS endpoint
"""
import logging
from jwt import PyJWKClient
from functools import lru_cache
from app.core.config import settings
import jwt
from typing import Dict

logger = logging.getLogger("auth")


def get_jwk_client() -> PyJWKClient:
    """
    Get PyJWKClient instance for JWKS endpoint

    Returns:
        PyJWKClient: Client configured with Better Auth JWKS URL
    """
    jwks_url = f"{settings.BETTER_AUTH_URL}/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


@lru_cache(maxsize=1)
def get_cached_jwk_client() -> PyJWKClient:
    """
    Get cached PyJWKClient instance

    JWKS keys are cached to reduce network calls
    Backend never stores keys locally
    JWKS endpoint is owned by frontend

    Returns:
        PyJWKClient: Cached client instance
    """
    return get_jwk_client()


def verify_jwt_token(token: str) -> Dict[str, str]:
    """
    Verify JWT token signature and extract payload

    Extracts kid automatically from token header
    Verifies signature using public key
    Supports Better Auth algorithms (EdDSA, RS256)
    Extracts user_id from sub claim

    Args:
        token: JWT token string from Authorization header

    Returns:
        dict: Decoded JWT payload containing user information
              {"user_id": str, "email": str}

    Raises:
        ValueError: If token is invalid, expired, or missing user_id
    """
    jwks_url = f"{settings.BETTER_AUTH_URL}/.well-known/jwks.json"
    logger.debug(f"Verifying JWT token, JWKS URL: {jwks_url}")
    logger.debug(f"Token prefix: {token[:50]}..." if len(token) > 50 else f"Token: {token}")

    try:
        # First, decode without verification to see the token structure
        unverified_header = jwt.get_unverified_header(token)
        logger.debug(f"Token header: {unverified_header}")

        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        logger.debug(f"Token payload (unverified): {unverified_payload}")

        jwk_client = get_cached_jwk_client()
        logger.debug(f"Got JWK client for URL: {jwks_url}")

        signing_key = jwk_client.get_signing_key_from_jwt(token)
        logger.debug(f"Got signing key with kid: {signing_key.key_id}")

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "RS256"],
            options={"verify_aud": False},
        )
        logger.debug(f"Token verified successfully, payload: {payload}")

        user_id = payload.get("sub") or payload.get("user_id")
        email = payload.get("email", "")

        if not user_id:
            logger.error(f"Missing user_id in token payload: {payload}")
            raise ValueError("Missing user_id in token")

        logger.info(f"JWT verified for user_id: {user_id}")
        return {"user_id": user_id, "email": email}

    except jwt.exceptions.DecodeError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise ValueError(f"Invalid token format: {str(e)}")
    except jwt.exceptions.PyJWKClientError as e:
        logger.error(f"JWKS client error (fetching keys from {jwks_url}): {str(e)}")
        raise ValueError(f"Failed to fetch JWKS: {str(e)}")
    except jwt.exceptions.PyJWKClientConnectionError as e:
        logger.error(f"JWKS connection error (fetching keys from {jwks_url}): {str(e)}")
        raise ValueError(f"Failed to connect to JWKS endpoint: {str(e)}")
    except jwt.PyJWTError as e:
        logger.error(f"JWT verification error: {str(e)}")
        raise ValueError(f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during JWT verification: {type(e).__name__}: {str(e)}")
        raise ValueError(f"Token verification failed: {str(e)}")

"""
Request ID Middleware
Generates unique correlation ID for each request
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from uuid import uuid4
from contextvars import ContextVar


# Context variable for request ID (accessible throughout request lifecycle)
request_id_context_var: ContextVar[str] = ContextVar("request_id", default="")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Add unique request ID to each request

    - Generates UUID for each request
    - Adds X-Request-ID header to response
    - Stores in context variable for logging
    """

    async def dispatch(self, request: Request, call_next):
        # Generate unique request ID
        request_id = str(uuid4())

        # Store in context variable (accessible to logging, etc.)
        request_id_context_var.set(request_id)

        # Add to request state for access in routes
        request.state.request_id = request_id

        # Process request
        response: Response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response


def get_request_id() -> str:
    """Get current request ID from context"""
    return request_id_context_var.get()

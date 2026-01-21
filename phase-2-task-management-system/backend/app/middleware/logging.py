"""
Structured Logging Middleware
Logs all requests/responses in JSON format
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
import logging
import json
from typing import Callable
from app.middleware.request_id import get_request_id
from app.core.config import settings


# Configure JSON logging
logger = logging.getLogger("fastapi")
logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log all requests and responses in structured JSON format

    Logs include:
    - Request ID (correlation)
    - HTTP method and path
    - Status code
    - Response time
    - User ID (if authenticated)
    """

    async def dispatch(self, request: Request, call_next: Callable):
        # Start timer
        start_time = time.time()

        # Extract basic request info
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else None

        # Process request
        try:
            response: Response = await call_next(request)
            status_code = response.status_code
            error = None
        except Exception as e:
            status_code = 500
            error = str(e)
            raise
        finally:
            # Calculate response time
            duration_ms = (time.time() - start_time) * 1000

            # Build structured log entry
            log_entry = {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "request_id": get_request_id(),
                "method": method,
                "path": path,
                "query_params": query_params,
                "status_code": status_code,
                "duration_ms": round(duration_ms, 2),
                "user_id": getattr(request.state, "user_id", None),
            }

            if error:
                log_entry["error"] = error

            # Log based on status code
            if settings.LOG_FORMAT == "json":
                log_message = json.dumps(log_entry)
            else:
                log_message = f"{method} {path} - {status_code} ({duration_ms:.2f}ms)"

            if status_code >= 500:
                logger.error(log_message)
            elif status_code >= 400:
                logger.warning(log_message)
            else:
                logger.info(log_message)

        return response

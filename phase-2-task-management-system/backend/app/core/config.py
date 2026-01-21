"""
Application Configuration using Pydantic Settings
"""
import os
from pathlib import Path
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    model_config = SettingsConfigDict(
        env_file=os.path.join(Path(__file__).parent.parent.parent, ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://user:password@localhost/dbname",
        description="Neon PostgreSQL connection string",
    )

    # Authentication
    BETTER_AUTH_URL: str = Field(
        default="http://localhost:3000",
        description="Better Auth frontend URL (points to frontend)",
    )
    BETTER_AUTH_SECRET: str = Field(
        default="your-secret-key-here",
        description="Better Auth shared secret (must match frontend)",
    )
    JWKS_CACHE_TTL: int = Field(
        default=3600,
        description="JWKS cache TTL in seconds (default: 1 hour)",
    )

    # CORS
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins",
    )

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(
        default=100,
        description="Maximum requests per user per window",
    )
    RATE_LIMIT_WINDOW: int = Field(
        default=60,
        description="Rate limit window in seconds",
    )

    # Logging
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level",
    )
    LOG_FORMAT: str = Field(
        default="json",
        description="Log format (json or text)",
    )

    # Application
    APP_PORT: int = Field(
        default=8000,
        description="Application port",
    )
    APP_HOST: str = Field(
        default="0.0.0.0",
        description="Application host",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate DATABASE_URL format"""
        valid_prefixes = [
            "postgresql://",
            "postgresql+asyncpg://",
            "sqlite+aiosqlite://",  # For testing
        ]
        if not any(v.startswith(prefix) for prefix in valid_prefixes):
            raise ValueError(f"DATABASE_URL must start with one of: {', '.join(valid_prefixes)}")
        return v

    @field_validator("BETTER_AUTH_URL")
    @classmethod
    def validate_auth_url(cls, v: str) -> str:
        """Validate BETTER_AUTH_URL is valid URL"""
        if not v.startswith("https://") and not v.startswith("http://"):
            raise ValueError("BETTER_AUTH_URL must be a valid HTTP/HTTPS URL")
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


# Global settings instance
settings = Settings()

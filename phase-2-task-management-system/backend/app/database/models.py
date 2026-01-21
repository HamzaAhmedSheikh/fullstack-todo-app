"""
SQLModel Database Models
"""
from sqlmodel import SQLModel, Field
from sqlalchemy import Index
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class User(SQLModel, table=True):
    """
    User model for authentication with Better Auth

    Attributes:
        id: UUID primary key (auto-generated)
        email: User email (unique, required)
        name: User display name (optional)
        email_verified: Whether email is verified (default False)
        image: Profile image URL (optional)
        created_at: Creation timestamp (auto-generated)
        updated_at: Last update timestamp (auto-updated)
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email", unique=True),
    )

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    # Authentication
    email: str = Field(
        unique=True,
        index=True,
        nullable=False,
        description="User email address",
    )
    hashed_password: str = Field(
        nullable=False,
        description="Bcrypt hashed password",
    )
    name: Optional[str] = Field(
        default=None,
        max_length=100,
        description="User display name",
    )
    email_verified: bool = Field(
        default=False,
        nullable=False,
        description="Whether email is verified",
    )
    image: Optional[str] = Field(
        default=None,
        description="Profile image URL",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "email": "user@example.com",
                "name": "John Doe",
                "email_verified": False,
                "image": None,
                "created_at": "2025-12-19T10:00:00Z",
                "updated_at": "2025-12-19T10:00:00Z",
            }
        }


class Session(SQLModel, table=True):
    """
    Session model for Better Auth JWT sessions

    Attributes:
        id: UUID primary key (auto-generated)
        user_id: UUID foreign key to user (owner)
        token: JWT session token
        expires_at: Session expiration timestamp
        ip_address: IP address of session creation (optional)
        user_agent: User agent of session creation (optional)
        created_at: Creation timestamp (auto-generated)
    """

    __tablename__ = "sessions"
    __table_args__ = (
        Index("ix_sessions_user_id", "user_id"),
        Index("ix_sessions_token", "token", unique=True),
    )

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    # Ownership
    user_id: UUID = Field(
        index=True,
        nullable=False,
        description="User ID of session owner",
    )

    # Session Data
    token: str = Field(
        unique=True,
        index=True,
        nullable=False,
        description="JWT session token",
    )
    expires_at: datetime = Field(
        nullable=False,
        description="Session expiration timestamp",
    )
    ip_address: Optional[str] = Field(
        default=None,
        description="IP address at session creation",
    )
    user_agent: Optional[str] = Field(
        default=None,
        description="User agent at session creation",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Creation timestamp",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "token": "eyJhbGciOiJSUzI1NiIs...",
                "expires_at": "2025-12-26T10:00:00Z",
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0...",
                "created_at": "2025-12-19T10:00:00Z",
            }
        }


class Task(SQLModel, table=True):
    """
    Task model for todo items with user ownership

    Attributes:
        id: UUID primary key (auto-generated)
        user_id: UUID foreign key to user (owner)
        title: Task title (required, max 200 chars)
        description: Task description (optional, max 500 chars)
        completed: Completion status (default False)
        version: Optimistic locking version field (default 1)
        created_at: Creation timestamp (auto-generated)
        updated_at: Last update timestamp (auto-updated)
    """

    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_user_completed", "user_id", "completed"),
    )

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    # Ownership
    user_id: UUID = Field(
        index=True,
        nullable=False,
        description="User ID of task owner",
    )

    # Task Data
    title: str = Field(
        max_length=200,
        nullable=False,
        description="Task title",
    )

    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Task description",
    )

    completed: bool = Field(
        default=False,
        nullable=False,
        description="Task completion status",
    )

    # Optimistic Locking
    version: int = Field(
        default=1,
        nullable=False,
        description="Version for optimistic locking",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Creation timestamp",
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "version": 1,
                "created_at": "2025-12-19T10:00:00Z",
                "updated_at": "2025-12-19T10:00:00Z",
            }
        }

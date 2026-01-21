"""
Task Management Endpoints
User Story 2-5: CRUD operations for tasks with ownership enforcement
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlmodel import SQLModel
from pydantic import Field, field_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.database.models import Task
from app.dependencies import get_current_user_uuid
from app.middleware.request_id import get_request_id

logger = logging.getLogger("tasks")

router = APIRouter(prefix="/api", tags=["tasks"])


# ============================================================================
# Pydantic Schemas (T049-T050)
# ============================================================================

class TaskCreate(SQLModel):
    """
    Schema for creating a new task (T049)

    Attributes:
        title: Task title (1-200 chars, required)
        description: Task description (0-500 chars, optional)
    """
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title",
        json_schema_extra={"example": "Buy groceries"}
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Task description",
        json_schema_extra={"example": "Milk, eggs, bread"}
    )

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip()


class TaskResponse(SQLModel):
    """
    Schema for task responses (T050)

    Includes all task fields for API responses
    """
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskUpdate(SQLModel):
    """
    Schema for updating a task (T069 - US3)

    All fields optional, version required for optimistic locking
    """
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Task description"
    )
    version: int = Field(
        ...,
        description="Current version for optimistic locking"
    )

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip() if v else v


# ============================================================================
# Helper Functions
# ============================================================================

def verify_ownership(user_id_from_path: UUID, authenticated_user_id: UUID) -> None:
    """
    Verify that the authenticated user owns the resource (T053, T058)

    Raises HTTPException 403 if user_id doesn't match
    """
    if user_id_from_path != authenticated_user_id:
        logger.warning(
            f"Authorization failure: user {authenticated_user_id} attempted to access "
            f"resources of user {user_id_from_path} | request_id={get_request_id()}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks",
        )


# ============================================================================
# US2: Create and View Tasks (T051-T057)
# ============================================================================

@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task for the authenticated user",
)
async def create_task(
    user_id: UUID,
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    authenticated_user_id: UUID = Depends(get_current_user_uuid),
) -> TaskResponse:
    """
    Create a new task (T051)

    - Verifies user_id matches authenticated user
    - Creates task with auto-generated UUID and timestamps
    - Returns created task with 201 status
    """
    # T053: Verify ownership
    verify_ownership(user_id, authenticated_user_id)

    # Create new task (T056: UUID generation and timestamps)
    task = Task(
        user_id=authenticated_user_id,
        title=task_data.title,
        description=task_data.description,
        completed=False,
        version=1,
    )

    db.add(task)
    await db.commit()
    await db.refresh(task)

    # T059: Log task creation
    logger.info(
        f"Task created: id={task.id} user_id={authenticated_user_id} | "
        f"request_id={get_request_id()}"
    )

    return TaskResponse.model_validate(task)


@router.get(
    "/{user_id}/tasks",
    response_model=List[TaskResponse],
    summary="List user's tasks",
    description="Get all tasks for the authenticated user",
)
async def list_tasks(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    authenticated_user_id: UUID = Depends(get_current_user_uuid),
) -> List[TaskResponse]:
    """
    List all tasks for the authenticated user (T052)

    - Verifies user_id matches authenticated user
    - Returns only tasks owned by the user (cross-user isolation)
    - Returns empty array if no tasks (T057)
    """
    # T053: Verify ownership
    verify_ownership(user_id, authenticated_user_id)

    # T052: Query tasks filtered by user_id
    result = await db.execute(
        select(Task)
        .where(Task.user_id == authenticated_user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()

    # T059: Log task listing
    logger.info(
        f"Tasks listed: count={len(tasks)} user_id={authenticated_user_id} | "
        f"request_id={get_request_id()}"
    )

    # T057: Return empty array if no tasks
    return [TaskResponse.model_validate(task) for task in tasks]


# ============================================================================
# US3: Update and Delete Tasks (T070-T077)
# ============================================================================

@router.get(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Get a specific task",
    description="Get a specific task by ID for the authenticated user",
)
async def get_task(
    user_id: UUID,
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    authenticated_user_id: UUID = Depends(get_current_user_uuid),
) -> TaskResponse:
    """
    Get a specific task by ID (T100 - US5)

    - Verifies user_id matches authenticated user
    - Returns 404 if task not found or doesn't belong to user
    """
    verify_ownership(user_id, authenticated_user_id)

    # Query task by id and user_id (ownership-scoped)
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == authenticated_user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    return TaskResponse.model_validate(task)


@router.put(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    description="Update a task with optimistic locking",
)
async def update_task(
    user_id: UUID,
    task_id: UUID,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    authenticated_user_id: UUID = Depends(get_current_user_uuid),
) -> TaskResponse:
    """
    Update a task with optimistic locking (T070)

    - Verifies user_id matches authenticated user
    - Checks version for optimistic locking (T072)
    - Returns 409 on version mismatch (T074)
    - Returns 404 if task not found (T075)
    """
    verify_ownership(user_id, authenticated_user_id)

    # Query task
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == authenticated_user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    # T072: Version check for optimistic locking
    if task.version != task_data.version:
        logger.warning(
            f"Optimistic lock conflict: task_id={task_id} expected_version={task_data.version} "
            f"actual_version={task.version} | request_id={get_request_id()}"
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Version conflict: task was modified by another request. "
                   f"Expected version {task_data.version}, found {task.version}",
        )

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description

    # T073: Increment version and update timestamp
    task.version += 1
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)

    # T078: Log update
    logger.info(
        f"Task updated: id={task_id} version={task.version} user_id={authenticated_user_id} | "
        f"request_id={get_request_id()}"
    )

    return TaskResponse.model_validate(task)


@router.delete(
    "/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    description="Delete a task owned by the authenticated user",
)
async def delete_task(
    user_id: UUID,
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    authenticated_user_id: UUID = Depends(get_current_user_uuid),
) -> None:
    """
    Delete a task (T071)

    - Verifies user_id matches authenticated user
    - Returns 404 if task not found (T075)
    - Returns 204 on successful deletion (T076)
    """
    verify_ownership(user_id, authenticated_user_id)

    # Query task
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == authenticated_user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    await db.delete(task)
    await db.commit()

    # T078: Log deletion
    logger.info(
        f"Task deleted: id={task_id} user_id={authenticated_user_id} | "
        f"request_id={get_request_id()}"
    )


# ============================================================================
# US4: Toggle Task Completion (T087-T093)
# ============================================================================

@router.patch(
    "/{user_id}/tasks/{task_id}/complete",
    response_model=TaskResponse,
    summary="Toggle task completion",
    description="Toggle the completion status of a task",
)
async def toggle_task_completion(
    user_id: UUID,
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    authenticated_user_id: UUID = Depends(get_current_user_uuid),
) -> TaskResponse:
    """
    Toggle task completion status (T087)

    - Verifies user_id matches authenticated user (T088)
    - Toggles completed: False → True or True → False (T089)
    - Increments version (T090)
    - Updates updated_at timestamp (T091)
    - Returns updated task (T092)
    """
    verify_ownership(user_id, authenticated_user_id)

    # Query task
    result = await db.execute(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == authenticated_user_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    # T089: Toggle completed field
    task.completed = not task.completed

    # T090: Increment version
    task.version += 1

    # T091: Update timestamp
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)

    # T094: Log completion toggle
    logger.info(
        f"Task toggled: id={task_id} completed={task.completed} "
        f"user_id={authenticated_user_id} | request_id={get_request_id()}"
    )

    return TaskResponse.model_validate(task)

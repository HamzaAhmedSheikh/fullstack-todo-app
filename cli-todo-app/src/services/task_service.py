"""Business logic service for task operations."""

from typing import Optional
from src.models.task import TaskList


class TaskService:
    """
    Service layer for task management operations.

    This service provides a clean API for the CLI to interact with tasks,
    abstracting the underlying TaskList implementation.
    """

    def __init__(self) -> None:
        """Initialize the TaskService with an empty task list."""
        self.task_list = TaskList()

    def create_task(self, title: str, description: Optional[str] = None) -> dict:
        """
        Create a new task.

        Args:
            title: Task title (1-200 chars, basic ASCII)
            description: Optional task description (max 500 chars)

        Returns:
            Dictionary with task data

        Raises:
            ValueError: If validation fails
        """
        task = self.task_list.add_task(title, description)
        return task.to_dict()

    def get_all_tasks(self) -> list[dict]:
        """
        Retrieve all tasks.

        Returns:
            List of task dictionaries
        """
        tasks = self.task_list.get_all_tasks()
        return [task.to_dict() for task in tasks]

    def get_task_by_id(self, task_id: int) -> Optional[dict]:
        """
        Retrieve a specific task by ID.

        Args:
            task_id: The task ID to search for

        Returns:
            Task dictionary if found, None otherwise
        """
        task = self.task_list.get_task_by_id(task_id)
        return task.to_dict() if task else None

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[dict]:
        """
        Update an existing task.

        Args:
            task_id: ID of task to update
            title: New title (if provided)
            description: New description (if provided)

        Returns:
            Updated task dictionary if found, None otherwise

        Raises:
            ValueError: If validation fails
        """
        success = self.task_list.update_task(task_id, title, description)
        if not success:
            return None

        task = self.task_list.get_task_by_id(task_id)
        return task.to_dict() if task else None

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task.

        Args:
            task_id: ID of task to delete

        Returns:
            True if deleted, False if not found
        """
        return self.task_list.delete_task(task_id)

    def toggle_task_status(self, task_id: int) -> Optional[dict]:
        """
        Toggle the completion status of a task.

        Args:
            task_id: ID of task to toggle

        Returns:
            Updated task dictionary if found, None otherwise
        """
        success = self.task_list.toggle_task_status(task_id)
        if not success:
            return None

        task = self.task_list.get_task_by_id(task_id)
        return task.to_dict() if task else None

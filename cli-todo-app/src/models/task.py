"""Data models for tasks in the CLI Todo Application."""

from typing import Optional
from src.lib.validators import title_validator, description_validator


class Task:
    """
    Represents a single todo item.

    Attributes:
        id: Auto-generated sequential identifier
        title: Required task title (max 200 chars, basic ASCII)
        description: Optional task description (max 500 chars)
        status: Task completion status (True=completed, False=pending)
    """

    def __init__(
        self,
        task_id: int,
        title: str,
        description: Optional[str] = None,
        status: bool = False
    ) -> None:
        """
        Initialize a Task instance.

        Args:
            task_id: Unique task identifier
            title: Task title
            description: Optional task description
            status: Completion status (default False/pending)

        Raises:
            ValueError: If validation fails for title or description
        """
        if not title_validator(title):
            raise ValueError(
                "Title validation failed: must be 1-200 characters, basic ASCII only"
            )

        if description and not description_validator(description):
            raise ValueError("Description validation failed: max 500 characters")

        self.id = task_id
        self.title = title.strip()
        self.description = description.strip() if description else None
        self.status = status

    def toggle_status(self) -> None:
        """Toggle the completion status of the task."""
        self.status = not self.status

    def update(self, title: Optional[str] = None, description: Optional[str] = None) -> None:
        """
        Update task attributes.

        Args:
            title: New title (if provided)
            description: New description (if provided)

        Raises:
            ValueError: If validation fails
        """
        if title is not None:
            if not title_validator(title):
                raise ValueError(
                    "Title validation failed: must be 1-200 characters, basic ASCII only"
                )
            self.title = title.strip()

        if description is not None:
            if description and not description_validator(description):
                raise ValueError("Description validation failed: max 500 characters")
            self.description = description.strip() if description else None

    def to_dict(self) -> dict:
        """
        Convert task to dictionary representation.

        Returns:
            Dictionary with task data
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status
        }


class TaskList:
    """
    Collection of Task entities managed in-memory.

    Attributes:
        tasks: List of Task objects
        next_id: Counter for generating next available ID
    """

    def __init__(self) -> None:
        """Initialize an empty TaskList."""
        self.tasks: list[Task] = []
        self.next_id: int = 1

    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Create and add a new task to the collection.

        Args:
            title: Task title
            description: Optional task description

        Returns:
            The created Task instance

        Raises:
            ValueError: If validation fails or max tasks exceeded
        """
        if len(self.tasks) >= 1000:
            raise ValueError("Maximum task limit (1000) reached")

        task = Task(self.next_id, title, description)
        self.tasks.append(task)
        self.next_id += 1
        return task

    def get_all_tasks(self) -> list[Task]:
        """
        Retrieve all tasks in the collection.

        Returns:
            List of all Task objects
        """
        return self.tasks.copy()

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a specific task by its ID.

        Args:
            task_id: The task ID to search for

        Returns:
            Task object if found, None otherwise
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> bool:
        """
        Update an existing task's attributes.

        Args:
            task_id: ID of the task to update
            title: New title (if provided)
            description: New description (if provided)

        Returns:
            True if task was updated, False if not found

        Raises:
            ValueError: If validation fails
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        task.update(title, description)
        return True

    def delete_task(self, task_id: int) -> bool:
        """
        Remove a task from the collection.

        Args:
            task_id: ID of the task to delete

        Returns:
            True if task was deleted, False if not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        self.tasks.remove(task)
        return True

    def toggle_task_status(self, task_id: int) -> bool:
        """
        Toggle the completion status of a task.

        Args:
            task_id: ID of the task to toggle

        Returns:
            True if task was toggled, False if not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        task.toggle_status()
        return True

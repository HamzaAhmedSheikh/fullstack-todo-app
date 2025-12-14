"""Unit tests for Task and TaskList models."""

import pytest
from src.models.task import Task, TaskList


class TestTask:
    """Unit tests for Task model."""

    def test_task_creation(self):
        """Test creating a valid task."""
        task = Task(1, "Buy groceries", "Milk, eggs, bread")
        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.description == "Milk, eggs, bread"
        assert task.status is False

    def test_task_creation_without_description(self):
        """Test creating a task without description."""
        task = Task(2, "Call dentist")
        assert task.id == 2
        assert task.title == "Call dentist"
        assert task.description is None
        assert task.status is False

    def test_task_invalid_title_empty(self):
        """Test task creation with empty title fails."""
        with pytest.raises(ValueError, match="Title validation failed"):
            Task(1, "")

    def test_task_invalid_title_too_long(self):
        """Test task creation with title > 200 chars fails."""
        long_title = "a" * 201
        with pytest.raises(ValueError, match="Title validation failed"):
            Task(1, long_title)

    def test_task_invalid_description_too_long(self):
        """Test task creation with description > 500 chars fails."""
        long_desc = "a" * 501
        with pytest.raises(ValueError, match="Description validation failed"):
            Task(1, "Valid title", long_desc)

    def test_task_to_dict(self):
        """Test converting task to dictionary."""
        task = Task(1, "Test task", "Test description", True)
        task_dict = task.to_dict()
        assert task_dict == {
            "id": 1,
            "title": "Test task",
            "description": "Test description",
            "status": True
        }


class TestTaskList:
    """Unit tests for TaskList model."""

    def test_get_all_tasks_empty(self):
        """Test getting all tasks from empty list."""
        task_list = TaskList()
        tasks = task_list.get_all_tasks()
        assert tasks == []
        assert len(tasks) == 0

    def test_get_all_tasks_with_items(self):
        """Test getting all tasks when tasks exist."""
        task_list = TaskList()
        task_list.add_task("Task 1", "Description 1")
        task_list.add_task("Task 2", "Description 2")

        tasks = task_list.get_all_tasks()
        assert len(tasks) == 2
        assert tasks[0].title == "Task 1"
        assert tasks[1].title == "Task 2"

    def test_add_task(self):
        """Test adding a task to the list."""
        task_list = TaskList()
        task = task_list.add_task("New task", "Task description")

        assert task.id == 1
        assert task.title == "New task"
        assert task.description == "Task description"
        assert len(task_list.get_all_tasks()) == 1

    def test_add_task_increments_id(self):
        """Test that task IDs increment sequentially."""
        task_list = TaskList()
        task1 = task_list.add_task("Task 1")
        task2 = task_list.add_task("Task 2")
        task3 = task_list.add_task("Task 3")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_toggle_task_status(self):
        """Test toggling task completion status."""
        task_list = TaskList()
        task = task_list.add_task("Test task")

        # Initially pending
        assert task.status is False

        # Toggle to completed
        result = task_list.toggle_task_status(task.id)
        assert result is True
        assert task.status is True

        # Toggle back to pending
        result = task_list.toggle_task_status(task.id)
        assert result is True
        assert task.status is False

    def test_toggle_nonexistent_task(self):
        """Test toggling status of non-existent task."""
        task_list = TaskList()
        result = task_list.toggle_task_status(999)
        assert result is False

    def test_update_task(self):
        """Test updating a task."""
        task_list = TaskList()
        task = task_list.add_task("Original title", "Original description")

        result = task_list.update_task(task.id, "Updated title", "Updated description")
        assert result is True
        assert task.title == "Updated title"
        assert task.description == "Updated description"

    def test_update_task_title_only(self):
        """Test updating only the task title."""
        task_list = TaskList()
        task = task_list.add_task("Original title", "Original description")

        result = task_list.update_task(task.id, title="New title")
        assert result is True
        assert task.title == "New title"
        assert task.description == "Original description"

    def test_update_nonexistent_task(self):
        """Test updating non-existent task."""
        task_list = TaskList()
        result = task_list.update_task(999, "New title")
        assert result is False

    def test_delete_task(self):
        """Test deleting a task."""
        task_list = TaskList()
        task = task_list.add_task("Task to delete")

        assert len(task_list.get_all_tasks()) == 1
        result = task_list.delete_task(task.id)
        assert result is True
        assert len(task_list.get_all_tasks()) == 0

    def test_delete_nonexistent_task(self):
        """Test deleting non-existent task."""
        task_list = TaskList()
        result = task_list.delete_task(999)
        assert result is False

    def test_get_task_by_id(self):
        """Test retrieving a task by ID."""
        task_list = TaskList()
        task1 = task_list.add_task("Task 1")
        task2 = task_list.add_task("Task 2")

        retrieved = task_list.get_task_by_id(task2.id)
        assert retrieved is not None
        assert retrieved.id == task2.id
        assert retrieved.title == "Task 2"

    def test_get_task_by_id_nonexistent(self):
        """Test retrieving non-existent task by ID."""
        task_list = TaskList()
        retrieved = task_list.get_task_by_id(999)
        assert retrieved is None

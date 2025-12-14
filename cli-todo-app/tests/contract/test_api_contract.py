"""Contract tests for TaskService API."""

import pytest
from src.services.task_service import TaskService


class TestTaskServiceContract:
    """Contract tests verifying TaskService API behavior."""

    def test_get_all_tasks_returns_list(self):
        """Test get_all_tasks returns a list."""
        service = TaskService()
        result = service.get_all_tasks()
        assert isinstance(result, list)

    def test_get_all_tasks_empty_list(self):
        """Test get_all_tasks returns empty list when no tasks."""
        service = TaskService()
        result = service.get_all_tasks()
        assert result == []

    def test_get_all_tasks_returns_task_dicts(self):
        """Test get_all_tasks returns list of task dictionaries."""
        service = TaskService()
        service.create_task("Test task", "Test description")

        result = service.get_all_tasks()
        assert len(result) == 1
        assert isinstance(result[0], dict)
        assert "id" in result[0]
        assert "title" in result[0]
        assert "description" in result[0]
        assert "status" in result[0]

    def test_create_task_returns_dict(self):
        """Test create_task returns task dictionary."""
        service = TaskService()
        result = service.create_task("New task", "Task description")

        assert isinstance(result, dict)
        assert result["title"] == "New task"
        assert result["description"] == "Task description"
        assert result["status"] is False
        assert "id" in result

    def test_create_task_without_description(self):
        """Test create_task without description."""
        service = TaskService()
        result = service.create_task("Task without description")

        assert isinstance(result, dict)
        assert result["title"] == "Task without description"
        assert result["description"] is None

    def test_create_task_validates_title(self):
        """Test create_task validates title."""
        service = TaskService()
        with pytest.raises(ValueError):
            service.create_task("")

    def test_create_task_validates_title_length(self):
        """Test create_task validates title length."""
        service = TaskService()
        long_title = "a" * 201
        with pytest.raises(ValueError):
            service.create_task(long_title)

    def test_toggle_task_status_returns_dict(self):
        """Test toggle_task_status returns updated task dict."""
        service = TaskService()
        task = service.create_task("Test task")

        result = service.toggle_task_status(task["id"])
        assert isinstance(result, dict)
        assert result["status"] is True

    def test_toggle_task_status_nonexistent_returns_none(self):
        """Test toggle_task_status returns None for non-existent task."""
        service = TaskService()
        result = service.toggle_task_status(999)
        assert result is None

    def test_update_task_returns_dict(self):
        """Test update_task returns updated task dict."""
        service = TaskService()
        task = service.create_task("Original title")

        result = service.update_task(task["id"], title="Updated title")
        assert isinstance(result, dict)
        assert result["title"] == "Updated title"

    def test_update_task_nonexistent_returns_none(self):
        """Test update_task returns None for non-existent task."""
        service = TaskService()
        result = service.update_task(999, title="New title")
        assert result is None

    def test_delete_task_returns_bool(self):
        """Test delete_task returns boolean."""
        service = TaskService()
        task = service.create_task("Task to delete")

        result = service.delete_task(task["id"])
        assert isinstance(result, bool)
        assert result is True

    def test_delete_task_nonexistent_returns_false(self):
        """Test delete_task returns False for non-existent task."""
        service = TaskService()
        result = service.delete_task(999)
        assert result is False

    def test_get_task_by_id_returns_dict(self):
        """Test get_task_by_id returns task dict."""
        service = TaskService()
        task = service.create_task("Test task")

        result = service.get_task_by_id(task["id"])
        assert isinstance(result, dict)
        assert result["id"] == task["id"]

    def test_get_task_by_id_nonexistent_returns_none(self):
        """Test get_task_by_id returns None for non-existent task."""
        service = TaskService()
        result = service.get_task_by_id(999)
        assert result is None

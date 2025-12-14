"""Integration tests for CLI flows."""

import pytest
import questionary
from unittest.mock import patch, MagicMock
from src.cli.main import view_tasks, add_task
from src.services.task_service import TaskService
from io import StringIO


class TestViewTasksFlow:
    """Integration tests for viewing tasks."""

    @patch('src.cli.main.Console')
    def test_view_tasks_empty_list(self, mock_console_class):
        """Test viewing tasks when list is empty."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()

        # Execute
        view_tasks(service)

        # Verify print was called (shows friendly message)
        mock_console.print.assert_called_once()

    @patch('src.cli.main.Console')
    def test_view_tasks_with_items(self, mock_console_class):
        """Test viewing tasks when tasks exist."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()
        service.create_task("Task 1", "Description 1")
        service.create_task("Task 2", "Description 2")

        # Execute
        view_tasks(service)

        # Verify table is printed
        mock_console.print.assert_called()

    @patch('src.cli.main.Console')
    def test_view_tasks_shows_completed_and_pending(self, mock_console_class):
        """Test viewing tasks shows different statuses."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()
        task1 = service.create_task("Pending task")
        task2 = service.create_task("Completed task")
        service.toggle_task_status(task2["id"])

        # Execute
        view_tasks(service)

        # Verify both tasks are displayed
        mock_console.print.assert_called()


class TestAddTaskFlow:
    """Integration tests for adding tasks."""

    @patch('src.cli.main.questionary')
    @patch('src.cli.main.Console')
    def test_add_task_with_description(self, mock_console_class, mock_questionary):
        """Test adding a task with title and description."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()

        # Mock questionary responses
        mock_questionary.text.return_value.ask.side_effect = [
            "Buy groceries",  # title
            "Milk, eggs, bread"  # description
        ]

        # Execute
        add_task(service)

        # Verify task was added
        tasks = service.get_all_tasks()
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Buy groceries"
        assert tasks[0]["description"] == "Milk, eggs, bread"

        # Verify success message was shown
        mock_console.print.assert_called()

    @patch('src.cli.main.questionary')
    @patch('src.cli.main.Console')
    def test_add_task_without_description(self, mock_console_class, mock_questionary):
        """Test adding a task without description."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()

        # Mock questionary responses
        mock_questionary.text.return_value.ask.side_effect = [
            "Call dentist",  # title
            ""  # empty description
        ]

        # Execute
        add_task(service)

        # Verify task was added
        tasks = service.get_all_tasks()
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Call dentist"
        assert tasks[0]["description"] is None


class TestToggleCompletionFlow:
    """Integration tests for toggling task completion."""

    @patch('src.cli.main.questionary')
    @patch('src.cli.main.Console')
    def test_toggle_completion(self, mock_console_class, mock_questionary):
        """Test toggling task completion status."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()
        task = service.create_task("Test task")

        # Mock questionary select - return the task ID directly
        mock_questionary.select.return_value.ask.return_value = task["id"]
        mock_questionary.Choice = questionary.Choice  # Use real Choice class

        # Execute
        from src.cli.main import toggle_completion
        toggle_completion(service)

        # Verify status was toggled
        updated_task = service.get_task_by_id(task["id"])
        assert updated_task["status"] is True


class TestUpdateTaskFlow:
    """Integration tests for updating tasks."""

    @patch('src.cli.main.questionary')
    @patch('src.cli.main.Console')
    def test_update_task(self, mock_console_class, mock_questionary):
        """Test updating a task."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()
        task = service.create_task("Original title", "Original description")

        # Mock questionary responses - return task ID from select
        mock_questionary.select.return_value.ask.return_value = task["id"]
        mock_questionary.Choice = questionary.Choice  # Use real Choice class
        mock_questionary.text.return_value.ask.side_effect = [
            "Updated title",
            "Updated description"
        ]

        # Execute
        from src.cli.main import update_task_menu
        update_task_menu(service)

        # Verify task was updated
        updated_task = service.get_task_by_id(task["id"])
        assert updated_task["title"] == "Updated title"
        assert updated_task["description"] == "Updated description"


class TestDeleteTaskFlow:
    """Integration tests for deleting tasks."""

    @patch('src.cli.main.questionary')
    @patch('src.cli.main.Console')
    def test_delete_task(self, mock_console_class, mock_questionary):
        """Test deleting a task."""
        # Setup
        mock_console = MagicMock()
        mock_console_class.return_value = mock_console
        service = TaskService()
        task = service.create_task("Task to delete")

        # Mock questionary responses - return task ID from select
        mock_questionary.select.return_value.ask.return_value = task["id"]
        mock_questionary.Choice = questionary.Choice  # Use real Choice class
        mock_questionary.confirm.return_value.ask.return_value = True  # Confirm deletion

        # Execute
        from src.cli.main import delete_task_menu
        delete_task_menu(service)

        # Verify task was deleted
        tasks = service.get_all_tasks()
        assert len(tasks) == 0

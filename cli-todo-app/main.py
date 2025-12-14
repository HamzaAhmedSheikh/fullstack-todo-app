"""Main CLI interface for the Todo Application."""

from typing import Optional

import questionary
from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from src.lib.validators import (
    create_questionary_description_validator,
    create_questionary_title_validator,
)
from src.services.task_service import TaskService


def view_tasks(service: TaskService) -> None:
    """
    Display all tasks in a formatted Rich table.

    Args:
        service: TaskService instance to retrieve tasks from
    """
    console = Console()
    tasks = service.get_all_tasks()

    if not tasks:
        console.print(
            Panel(
                "[yellow]No tasks found. Add your first task to get started![/yellow]",
                title="Task List",
                border_style="blue",
            )
        )
        return

    # Create table with rounded box style
    table = Table(
        title="📝 Your Tasks",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold cyan",
    )

    # Add columns
    table.add_column("ID", style="dim", width=6)
    table.add_column("Title", style="bold", no_wrap=False)
    table.add_column("Description", no_wrap=False)
    table.add_column("Status", justify="center", width=15)

    # Add rows with color formatting
    for task in tasks:
        task_id = str(task["id"])
        title = task["title"]
        description = task["description"] or ""

        # Color formatting for status
        if task["status"]:
            status = "[green]✓ Completed[/green]"
        else:
            status = "[yellow]● Pending[/yellow]"

        table.add_row(task_id, title, description, status)

    console.print(table)


def add_task(service: TaskService) -> None:
    """
    Add a new task via questionary prompts.

    Args:
        service: TaskService instance to create the task
    """
    console = Console()

    console.print("\n[bold cyan]Add New Task[/bold cyan]\n")

    # Get title with validation
    title = questionary.text(
        "Task title:", validate=create_questionary_title_validator()
    ).ask()

    # Get description (optional)
    description = questionary.text(
        "Description (optional, press Enter to skip):",
        validate=create_questionary_description_validator(),
    ).ask()

    # Handle empty description
    if description == "":
        description = None

    try:
        # Create the task
        task = service.create_task(title, description)

        # Show success message
        console.print(
            Panel(
                f"[green]✓ Task created successfully![/green]\n\n"
                f"ID: {task['id']}\n"
                f"Title: {task['title']}\n"
                f"Description: {task['description'] or '(none)'}",
                title="Success",
                border_style="green",
            )
        )
    except ValueError as e:
        console.print(
            Panel(
                f"[red]Error: {str(e)}[/red]",
                title="Validation Error",
                border_style="red",
            )
        )


def toggle_completion(service: TaskService) -> None:
    """
    Toggle completion status of a task.

    Args:
        service: TaskService instance
    """
    console = Console()
    tasks = service.get_all_tasks()

    if not tasks:
        console.print("[yellow]No tasks available to toggle.[/yellow]")
        return

    # Create choices for questionary
    choices = [
        questionary.Choice(title=f"[{task['id']}] {task['title']}", value=task["id"])
        for task in tasks
    ]

    task_id = questionary.select(
        "Select a task to toggle completion:", choices=choices
    ).ask()

    if task_id:
        result = service.toggle_task_status(task_id)
        if result:
            status_text = "completed" if result["status"] else "pending"
            console.print(f"[green]✓ Task marked as {status_text}[/green]")
        else:
            console.print("[red]Error: Task not found[/red]")


def update_task_menu(service: TaskService) -> None:
    """
    Update an existing task.

    Args:
        service: TaskService instance
    """
    console = Console()
    tasks = service.get_all_tasks()

    if not tasks:
        console.print("[yellow]No tasks available to update.[/yellow]")
        return

    # Create choices for questionary
    choices = [
        questionary.Choice(title=f"[{task['id']}] {task['title']}", value=task["id"])
        for task in tasks
    ]

    task_id = questionary.select("Select a task to update:", choices=choices).ask()

    if task_id:
        current_task = service.get_task_by_id(task_id)

        # Get new title
        new_title = questionary.text(
            f"New title (current: {current_task['title']}):",
            default=current_task["title"],
            validate=create_questionary_title_validator(),
        ).ask()

        # Get new description
        new_description = questionary.text(
            f"New description (current: {current_task['description'] or '(none)'}):",
            default=current_task["description"] or "",
            validate=create_questionary_description_validator(),
        ).ask()

        if new_description == "":
            new_description = None

        result = service.update_task(task_id, new_title, new_description)
        if result:
            console.print("[green]✓ Task updated successfully[/green]")
        else:
            console.print("[red]Error: Task not found[/red]")


def delete_task_menu(service: TaskService) -> None:
    """
    Delete a task with confirmation.

    Args:
        service: TaskService instance
    """
    console = Console()
    tasks = service.get_all_tasks()

    if not tasks:
        console.print("[yellow]No tasks available to delete.[/yellow]")
        return

    # Create choices for questionary
    choices = [
        questionary.Choice(title=f"[{task['id']}] {task['title']}", value=task["id"])
        for task in tasks
    ]

    task_id = questionary.select("Select a task to delete:", choices=choices).ask()

    if task_id:
        confirm = questionary.confirm(
            "Are you sure? This cannot be undone.", default=False
        ).ask()

        if confirm:
            result = service.delete_task(task_id)
            if result:
                console.print("[green]✓ Task deleted successfully[/green]")
            else:
                console.print("[red]Error: Task not found[/red]")
        else:
            console.print("[yellow]Deletion cancelled[/yellow]")


def main() -> None:
    """Main entry point for the CLI application."""
    console = Console()
    service = TaskService()

    console.print(
        Panel(
            "[bold cyan]Welcome to CLI Todo Application![/bold cyan]",
            border_style="green",
        )
    )

    while True:
        # Main menu
        choice = questionary.select(
            "\nWhat would you like to do?",
            choices=[
                "View all tasks",
                "Add new task",
                "Toggle completion",
                "Update task",
                "Delete task",
                "Exit",
            ],
        ).ask()

        if choice == "View all tasks":
            view_tasks(service)
        elif choice == "Add new task":
            add_task(service)
        elif choice == "Toggle completion":
            toggle_completion(service)
        elif choice == "Update task":
            update_task_menu(service)
        elif choice == "Delete task":
            delete_task_menu(service)
        elif choice == "Exit":
            console.print(
                "\n[cyan]Thank you for using CLI Todo Application! Goodbye![/cyan]\n"
            )
            break


if __name__ == "__main__":
    main()

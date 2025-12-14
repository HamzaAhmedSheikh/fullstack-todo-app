"""Input validation utilities for the CLI Todo Application."""

import re
from typing import Callable


def title_validator(title: str) -> bool:
    """
    Validate task title input.

    Args:
        title: The title string to validate

    Returns:
        True if valid, False otherwise

    Validation Rules:
        - Required (not empty)
        - Max 200 characters
        - Basic ASCII with common punctuation only
    """
    if not title or not title.strip():
        return False

    if len(title) > 200:
        return False

    # Check for basic ASCII with common punctuation (printable ASCII)
    # Allow letters, numbers, spaces, and common punctuation
    if not re.match(r'^[\x20-\x7E]+$', title):
        return False

    return True


def description_validator(description: str) -> bool:
    """
    Validate task description input.

    Args:
        description: The description string to validate

    Returns:
        True if valid, False otherwise

    Validation Rules:
        - Optional (can be empty)
        - Max 500 characters if provided
    """
    if not description:
        return True  # Description is optional

    if len(description) > 500:
        return False

    return True


def create_questionary_title_validator() -> Callable[[str], bool | str]:
    """
    Create a validator function for questionary prompts for title input.

    Returns:
        Validator function that returns True if valid or error message string
    """
    def validator(text: str) -> bool | str:
        if not text or not text.strip():
            return "Title is required"
        if len(text) > 200:
            return "Title must be 200 characters or less"
        if not re.match(r'^[\x20-\x7E]+$', text):
            return "Title must contain only basic ASCII characters with common punctuation"
        return True
    return validator


def create_questionary_description_validator() -> Callable[[str], bool | str]:
    """
    Create a validator function for questionary prompts for description input.

    Returns:
        Validator function that returns True if valid or error message string
    """
    def validator(text: str) -> bool | str:
        if text and len(text) > 500:
            return "Description must be 500 characters or less"
        return True
    return validator

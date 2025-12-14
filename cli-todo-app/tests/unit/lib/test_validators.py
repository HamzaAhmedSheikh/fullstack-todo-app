"""Unit tests for input validators."""

import pytest
from src.lib.validators import (
    create_questionary_description_validator,
    create_questionary_title_validator,
    description_validator,
    title_validator,
)


class TestTitleValidator:
    """Unit tests for title_validator function."""

    def test_valid_title(self):
        """Test validation passes for valid title."""
        assert title_validator("Buy groceries") is True

    def test_valid_title_with_punctuation(self):
        """Test validation passes for title with punctuation."""
        assert title_validator("Call dentist @ 2pm!") is True

    def test_valid_title_max_length(self):
        """Test validation passes for title at max length (200 chars)."""
        title = "a" * 200
        assert title_validator(title) is True

    def test_invalid_title_empty(self):
        """Test validation fails for empty title."""
        assert title_validator("") is False

    def test_invalid_title_whitespace_only(self):
        """Test validation fails for whitespace-only title."""
        assert title_validator("   ") is False

    def test_invalid_title_too_long(self):
        """Test validation fails for title > 200 chars."""
        title = "a" * 201
        assert title_validator(title) is False

    def test_invalid_title_non_ascii(self):
        """Test validation fails for non-ASCII characters."""
        assert title_validator("Task with emoji 😀") is False


class TestDescriptionValidator:
    """Unit tests for description_validator function."""

    def test_valid_description(self):
        """Test validation passes for valid description."""
        assert description_validator("This is a task description") is True

    def test_valid_description_empty(self):
        """Test validation passes for empty description (optional)."""
        assert description_validator("") is True
        assert description_validator(None) is True

    def test_valid_description_max_length(self):
        """Test validation passes for description at max length (500 chars)."""
        desc = "a" * 500
        assert description_validator(desc) is True

    def test_invalid_description_too_long(self):
        """Test validation fails for description > 500 chars."""
        desc = "a" * 501
        assert description_validator(desc) is False


class TestQuestionaryValidators:
    """Unit tests for questionary validator creators."""

    def test_questionary_title_validator_valid(self):
        """Test questionary title validator returns True for valid input."""
        validator = create_questionary_title_validator()
        assert validator("Valid title") is True

    def test_questionary_title_validator_empty(self):
        """Test questionary title validator returns error for empty input."""
        validator = create_questionary_title_validator()
        result = validator("")
        assert isinstance(result, str)
        assert "required" in result.lower()

    def test_questionary_title_validator_too_long(self):
        """Test questionary title validator returns error for long input."""
        validator = create_questionary_title_validator()
        result = validator("a" * 201)
        assert isinstance(result, str)
        assert "200" in result

    def test_questionary_description_validator_valid(self):
        """Test questionary description validator returns True for valid input."""
        validator = create_questionary_description_validator()
        assert validator("Valid description") is True

    def test_questionary_description_validator_empty(self):
        """Test questionary description validator allows empty input."""
        validator = create_questionary_description_validator()
        assert validator("") is True

    def test_questionary_description_validator_too_long(self):
        """Test questionary description validator returns error for long input."""
        validator = create_questionary_description_validator()
        result = validator("a" * 501)
        assert isinstance(result, str)
        assert "500" in result

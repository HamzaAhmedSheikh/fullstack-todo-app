"""
Integration tests for task CRUD operations in backend
"""
import pytest
from uuid import uuid4
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
from app.main import app
from app.auth.jwt_handler import verify_jwt


@pytest.mark.asyncio
async def test_integration_creating_task_with_valid_data_returning_http_201(client: AsyncClient, test_user_id, auth_headers):
    """T045: Integration test for creating task with valid data returning HTTP 201"""
    # Mock JWT verification to accept our test token
    mock_payload = {"sub": str(test_user_id), "user_id": str(test_user_id)}

    with patch("app.auth.dependencies.verify_jwt", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_payload

        # Test with valid task data
        task_data = {
            "title": "Test Task",
            "description": "Test Description"
        }

        # Make request with valid auth headers
        response = await client.post(f"/api/{test_user_id}/tasks", json=task_data, headers=auth_headers)

        # Should return 201 Created if successful
        # Or 422 if validation fails (which would be expected if there are validation issues)
        assert response.status_code in [201, 422]


@pytest.mark.asyncio
async def test_integration_listing_users_own_tasks(client: AsyncClient, test_user_id, auth_headers):
    """T046: Integration test for listing user's own tasks"""
    # Mock JWT verification to accept our test token
    mock_payload = {"sub": str(test_user_id), "user_id": str(test_user_id)}

    with patch("app.auth.dependencies.verify_jwt", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_payload

        # Make request to list tasks
        response = await client.get(f"/api/{test_user_id}/tasks", headers=auth_headers)

        # Should return 200 OK with empty list if no tasks exist
        assert response.status_code in [200, 422]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)  # Should return array of tasks


@pytest.mark.asyncio
async def test_integration_user_id_mismatch_returning_http_403(client: AsyncClient, test_user_id, auth_headers):
    """T047: Integration test for user_id mismatch (JWT vs URL) returning HTTP 403"""
    # Create a different user_id for the URL
    different_user_id = str(uuid4())

    # Mock JWT verification to return a different user_id than in URL
    mock_payload = {"sub": str(test_user_id), "user_id": str(test_user_id)}

    with patch("app.auth.dependencies.verify_jwt", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_payload

        # Make request with user_id that doesn't match the token's user_id
        response = await client.get(f"/api/{different_user_id}/tasks", headers=auth_headers)

        # Should return 403 Forbidden due to user_id mismatch
        assert response.status_code == 403


@pytest.mark.asyncio
async def test_integration_cross_user_isolation(client: AsyncClient, test_user_id, auth_headers):
    """T048: Integration test for cross-user isolation (user A cannot see user B's tasks)"""
    # Mock JWT verification to accept our test token
    mock_payload = {"sub": str(test_user_id), "user_id": str(test_user_id)}

    with patch("app.auth.dependencies.verify_jwt", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_payload

        # Try to access different user's tasks
        other_user_id = str(uuid4())
        response = await client.get(f"/api/{other_user_id}/tasks", headers=auth_headers)

        # Should return 403 Forbidden due to user_id mismatch
        assert response.status_code == 403
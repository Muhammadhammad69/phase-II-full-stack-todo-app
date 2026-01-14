from uuid import UUID

import pytest


@pytest.mark.asyncio
async def test_create_task(test_client, mock_token):
    """Test creating a new task"""
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "medium",
        "due_date": "2023-12-31T23:59:59"
    }

    response = await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task"
    assert data["priority"] == "medium"
    assert data["is_completed"] is False
    assert UUID(data["id"])  # Verify it's a valid UUID


@pytest.mark.asyncio
async def test_list_tasks(test_client, mock_token):
    """Test listing tasks"""
    # First create a task
    task_data = {
        "title": "List Test Task",
        "description": "Task for listing test",
        "priority": "high"
    }

    await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert "total_count" in data
    assert "page" in data
    assert "page_size" in data
    assert len(data["tasks"]) >= 1
    assert any(task["title"] == "List Test Task" for task in data["tasks"])


@pytest.mark.asyncio
async def test_get_single_task(test_client, mock_token):
    """Test getting a single task"""
    # First create a task
    task_data = {
        "title": "Single Task",
        "description": "Task for single retrieval test"
    }

    create_response = await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    task_id = create_response.json()["id"]

    response = await test_client.get(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Single Task"
    assert data["description"] == "Task for single retrieval test"


@pytest.mark.asyncio
async def test_update_task(test_client, mock_token):
    """Test updating a task"""
    # First create a task
    task_data = {
        "title": "Original Task",
        "description": "Original description"
    }

    create_response = await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    task_id = create_response.json()["id"]

    # Update the task
    update_data = {
        "title": "Updated Task",
        "description": "Updated description",
        "priority": "high"
    }

    response = await test_client.put(
        f"/api/v1/tasks/{task_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task"
    assert data["description"] == "Updated description"
    assert data["priority"] == "high"


@pytest.mark.asyncio
async def test_delete_task(test_client, mock_token):
    """Test deleting a task"""
    # First create a task
    task_data = {
        "title": "Task to Delete",
        "description": "This task will be deleted"
    }

    create_response = await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    task_id = create_response.json()["id"]

    # Delete the task
    response = await test_client.delete(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Task deleted successfully"

    # Verify the task is gone
    get_response = await test_client.get(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {mock_token}"}
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_toggle_completion(test_client, mock_token):
    """Test toggling task completion status"""
    # First create a task
    task_data = {
        "title": "Completion Test Task",
        "description": "Task to test completion toggle"
    }

    create_response = await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    task_id = create_response.json()["id"]

    # Toggle completion (should mark as complete)
    response = await test_client.patch(
        f"/api/v1/tasks/{task_id}/complete",
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is True
    assert data["completed_at"] is not None

    # Toggle again (should mark as incomplete)
    response = await test_client.patch(
        f"/api/v1/tasks/{task_id}/complete",
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is False
    assert data["completed_at"] is None


@pytest.mark.asyncio
async def test_authentication_failure(test_client):
    """Test that requests without valid token fail"""
    response = await test_client.get("/api/v1/tasks/")
    assert response.status_code == 401  # Should return unauthorized

    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_validation_errors(test_client, mock_token):
    """Test validation errors"""
    # Try to create a task without required title
    task_data = {
        "description": "Task without title"
    }

    response = await test_client.post(
        "/api/v1/tasks/",
        json=task_data,
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    assert response.status_code == 422  # Validation error

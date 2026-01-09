---
name: fastapi-testing
description: Write unit tests and integration tests for FastAPI applications using TestClient. Ensure code quality and API reliability. Use this skill when Claude needs to work with testing FastAPI applications, TestClient setup, testing different HTTP methods, testing error cases, test organization, or pytest integration in FastAPI applications.
---

# Testing FastAPI Applications

## Overview
Testing is crucial for maintaining the quality and reliability of FastAPI applications. FastAPI provides excellent testing support through the TestClient, which allows you to make requests to your application without starting a server. This enables fast and reliable testing of your API endpoints.

## Setting Up TestClient

Basic setup for testing FastAPI applications:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

# TestClient for testing
def test_read_main():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}
```

## Testing GET Requests

Test GET endpoints with different parameters:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id, "name": f"User {user_id}"}

@app.get("/search")
def search_items(q: str = None, limit: int = 10):
    return {"query": q, "limit": limit, "results": []}

# Testing GET requests
def test_get_user():
    client = TestClient(app)

    response = client.get("/users/42")
    assert response.status_code == 200
    assert response.json() == {"user_id": 42, "name": "User 42"}

def test_search_with_params():
    client = TestClient(app)

    response = client.get("/search?q=python&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "python"
    assert data["limit"] == 5

def test_search_without_params():
    client = TestClient(app)

    response = client.get("/search")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] is None
    assert data["limit"] == 10
```

## Testing POST Requests

Test POST endpoints with JSON payloads:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    description: str = None

@app.post("/items/", status_code=201)
def create_item(item: Item):
    return {"id": 123, **item.dict()}

# Testing POST requests
def test_create_item():
    client = TestClient(app)

    item_data = {
        "name": "Foo",
        "price": 35.4,
        "description": "A nice item"
    }

    response = client.post("/items/", json=item_data)
    assert response.status_code == 201

    data = response.json()
    assert data["id"] == 123
    assert data["name"] == "Foo"
    assert data["price"] == 35.4

def test_create_item_invalid():
    client = TestClient(app)

    invalid_data = {
        "name": "Foo",
        # Missing required 'price' field
    }

    response = client.post("/items/", json=invalid_data)
    assert response.status_code == 422  # Validation error
```

## Testing PUT and PATCH Requests

Test update operations:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    description: str = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

# Sample in-memory storage for testing
items_db = {
    1: {"id": 1, "name": "Original Item", "price": 10.0, "description": "Original"}
}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items_db:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    if item_id not in items_db:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")

    items_db[item_id] = {"id": item_id, **item.dict()}
    return items_db[item_id]

@app.patch("/items/{item_id}")
def partial_update_item(item_id: int, item_update: ItemUpdate):
    if item_id not in items_db:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")

    stored_item = items_db[item_id]
    update_data = item_update.dict(exclude_unset=True)
    stored_item.update(update_data)
    return stored_item

# Testing PUT and PATCH
def test_put_item():
    client = TestClient(app)

    update_data = {
        "name": "Updated Item",
        "price": 25.0,
        "description": "Updated description"
    }

    response = client.put("/items/1", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Updated Item"
    assert data["price"] == 25.0

def test_patch_item():
    client = TestClient(app)

    patch_data = {
        "name": "Partially Updated Item"
    }

    response = client.patch("/items/1", json=patch_data)
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Partially Updated Item"
    # Price should remain unchanged
    assert data["price"] == 25.0
```

## Testing DELETE Requests

Test delete operations:

```python
@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    if item_id not in items_db:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")

    del items_db[item_id]
    return  # 204 No Content

def test_delete_item():
    client = TestClient(app)

    # First, add an item to delete
    items_db[999] = {"id": 999, "name": "To Delete", "price": 5.0}

    response = client.delete("/items/999")
    assert response.status_code == 204
    assert 999 not in items_db

def test_delete_nonexistent_item():
    client = TestClient(app)

    response = client.delete("/items/9999")
    assert response.status_code == 404
```

## Testing with Dependencies

Test endpoints that use dependencies:

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

def get_current_user():
    return {"username": "testuser", "id": 123}

@app.get("/protected")
def protected_endpoint(current_user: dict = Depends(get_current_user)):
    return {"user": current_user, "message": "Access granted"}

def test_protected_endpoint():
    client = TestClient(app)

    response = client.get("/protected")
    assert response.status_code == 200

    data = response.json()
    assert data["user"]["username"] == "testuser"
    assert data["message"] == "Access granted"
```

## Overriding Dependencies for Testing

Override dependencies to make testing easier:

```python
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

def get_db_connection():
    # In real app, this would connect to a real database
    return {"connection": "real_db_connection"}

def get_current_user():
    return {"username": "real_user", "id": 999}

@app.get("/users/me")
def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    return current_user

# Override dependencies for testing
def override_get_current_user():
    return {"username": "test_user", "id": 1}

def test_with_overrides():
    app.dependency_overrides[get_current_user] = override_get_current_user

    client = TestClient(app)
    response = client.get("/users/me")

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "test_user"
    assert data["id"] == 1

    # Clean up overrides
    app.dependency_overrides.clear()
```

## Testing Error Cases

Test error scenarios and status codes:

```python
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/error/{error_type}")
def error_endpoint(error_type: str):
    if error_type == "404":
        raise HTTPException(status_code=404, detail="Item not found")
    elif error_type == "400":
        raise HTTPException(status_code=400, detail="Bad request")
    elif error_type == "500":
        raise ValueError("Internal server error")
    return {"message": "Success"}

def test_404_error():
    client = TestClient(app)

    response = client.get("/error/404")
    assert response.status_code == 404
    assert response.json() == {"detail": "Item not found"}

def test_400_error():
    client = TestClient(app)

    response = client.get("/error/400")
    assert response.status_code == 400
    assert response.json() == {"detail": "Bad request"}

def test_500_error():
    client = TestClient(app)

    response = client.get("/error/500")
    assert response.status_code == 500
```

## Testing with Pytest

Organize tests using pytest:

```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from main import app  # Assuming your FastAPI app is in main.py

@pytest.fixture
def client():
    return TestClient(app)

# test_main.py
def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

def test_create_item(client):
    item_data = {
        "name": "Test Item",
        "price": 15.5,
        "description": "A test item"
    }

    response = client.post("/items/", json=item_data)
    assert response.status_code == 201

    data = response.json()
    assert data["name"] == "Test Item"
    assert data["price"] == 15.5

# Parametrized tests
@pytest.mark.parametrize("item_id,expected_name", [
    (1, "User 1"),
    (2, "User 2"),
    (5, "User 5"),
])
def test_get_user_parametrized(client, item_id, expected_name):
    response = client.get(f"/users/{item_id}")
    assert response.status_code == 200
    assert response.json()["name"] == expected_name
```

## Testing Authentication

Test endpoints with authentication:

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
from fastapi.testclient import TestClient

app = FastAPI()
security = HTTPBearer()

def verify_token(credentials: str = Depends(lambda: "valid_token")):
    # Simplified token verification for testing
    if credentials != "valid_token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return "test_user"

@app.get("/secure-data")
def get_secure_data(username: str = Depends(verify_token)):
    return {"data": "secure", "user": username}

def test_authenticated_endpoint():
    client = TestClient(app)

    # Test with valid token
    response = client.get("/secure-data", headers={"Authorization": "Bearer valid_token"})
    assert response.status_code == 200
    assert response.json()["user"] == "test_user"

def test_unauthenticated_access():
    client = TestClient(app)

    # Test without token
    response = client.get("/secure-data")
    assert response.status_code == 403  # or 401 depending on implementation
```

## Testing with Database

Test endpoints that interact with a database (using in-memory or test database):

```python
import sqlite3
from contextlib import contextmanager
from fastapi import FastAPI
from fastapi.testclient import TestClient
import tempfile
import os

app = FastAPI()

# Create a temporary database for testing
def create_test_database():
    # In memory SQLite for testing
    conn = sqlite3.connect(":memory:")
    conn.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    """)
    conn.execute("INSERT INTO users (name, email) VALUES (?, ?)", ("Test User", "test@example.com"))
    return conn

@contextmanager
def get_test_db():
    conn = create_test_database()
    try:
        yield conn
    finally:
        conn.close()

def get_db():
    # This would normally return the actual database connection
    # For testing, we'll override this dependency
    pass

@app.get("/users/{user_id}")
def get_user(user_id: int):
    with get_test_db() as conn:
        cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return {"id": row[0], "name": row[1], "email": row[2]}
        else:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="User not found")

def test_get_user_with_db():
    # This test would need to override the database dependency
    # Similar to how we override other dependencies
    pass
```

## Testing Response Models

Test that responses conform to expected models:

```python
from pydantic import BaseModel
from typing import List

class User(BaseModel):
    id: int
    name: str
    email: str

class UserList(BaseModel):
    users: List[User]
    total: int

@app.get("/users/", response_model=UserList)
def get_users():
    users = [
        {"id": 1, "name": "John", "email": "john@example.com"},
        {"id": 2, "name": "Jane", "email": "jane@example.com"}
    ]
    return {"users": users, "total": len(users)}

def test_response_model():
    client = TestClient(app)

    response = client.get("/users/")
    assert response.status_code == 200

    # The response will be validated against the UserList model
    data = response.json()
    assert "users" in data
    assert "total" in data
    assert len(data["users"]) == 2
    assert data["total"] == 2

    # Each user should have the expected fields
    for user in data["users"]:
        assert "id" in user
        assert "name" in user
        assert "email" in user
```

## Common Testing Patterns

### Setup and Teardown
```python
import pytest
from fastapi.testclient import TestClient

@pytest.fixture(scope="module")
def client():
    # Setup: Create test client
    client = TestClient(app)
    yield client
    # Teardown: Clean up if needed

@pytest.fixture
def sample_item():
    return {
        "name": "Test Item",
        "price": 10.99,
        "description": "A test item"
    }
```

### Testing Multiple Scenarios
```python
@pytest.mark.parametrize("input_data,expected_status,expected_message", [
    ({"name": "Valid", "price": 10.0}, 201, "success"),
    ({"name": "", "price": 10.0}, 422, "validation_error"),
    ({"name": "Valid", "price": -5.0}, 422, "validation_error"),
])
def test_create_item_scenarios(client, input_data, expected_status, expected_message):
    response = client.post("/items/", json=input_data)
    assert response.status_code == expected_status
```

## Testing Best Practices

1. **Test Happy Paths**: Ensure your endpoints work correctly with valid input
2. **Test Error Cases**: Verify that your error handling works as expected
3. **Test Edge Cases**: Test boundary conditions and unusual inputs
4. **Use Descriptive Test Names**: Make it clear what is being tested
5. **Keep Tests Independent**: Each test should be able to run independently
6. **Test Response Status Codes**: Verify that the correct status codes are returned
7. **Test Response Content**: Validate that the response contains expected data
8. **Mock External Dependencies**: Isolate your tests from external services

## Real-World Testing Example

Complete test suite for a blog API:

```python
import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from main import app  # Assuming your app is in main.py

client = TestClient(app)

class TestBlogAPI:
    def test_create_post(self):
        """Test creating a new blog post"""
        post_data = {
            "title": "Test Post",
            "content": "This is a test post content",
            "author": "Test Author"
        }

        response = client.post("/posts/", json=post_data)
        assert response.status_code == 201

        data = response.json()
        assert data["title"] == "Test Post"
        assert data["author"] == "Test Author"
        assert "id" in data
        assert "created_at" in data

    def test_get_post(self):
        """Test retrieving a specific blog post"""
        # First create a post
        post_data = {
            "title": "Get Test Post",
            "content": "Content for get test",
            "author": "Test Author"
        }

        create_response = client.post("/posts/", json=post_data)
        post_id = create_response.json()["id"]

        # Then retrieve it
        response = client.get(f"/posts/{post_id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == post_id
        assert data["title"] == "Get Test Post"

    def test_get_nonexistent_post(self):
        """Test retrieving a nonexistent post"""
        response = client.get("/posts/999999")
        assert response.status_code == 404

    def test_update_post(self):
        """Test updating an existing post"""
        # Create a post first
        post_data = {
            "title": "Original Title",
            "content": "Original content",
            "author": "Test Author"
        }

        create_response = client.post("/posts/", json=post_data)
        post_id = create_response.json()["id"]

        # Update the post
        update_data = {
            "title": "Updated Title",
            "content": "Updated content",
            "author": "Updated Author"
        }

        response = client.put(f"/posts/{post_id}", json=update_data)
        assert response.status_code == 200

        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["content"] == "Updated content"

    def test_delete_post(self):
        """Test deleting a post"""
        # Create a post first
        post_data = {
            "title": "Post to Delete",
            "content": "Content to delete",
            "author": "Test Author"
        }

        create_response = client.post("/posts/", json=post_data)
        post_id = create_response.json()["id"]

        # Delete the post
        response = client.delete(f"/posts/{post_id}")
        assert response.status_code == 204

        # Verify it's gone
        get_response = client.get(f"/posts/{post_id}")
        assert get_response.status_code == 404

    def test_list_posts(self):
        """Test listing all posts"""
        response = client.get("/posts/")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)

    def test_invalid_input_validation(self):
        """Test validation with invalid input"""
        invalid_data = {
            "title": "",  # Empty title
            "content": "Valid content",
            "author": "Valid author"
        }

        response = client.post("/posts/", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_authentication_required(self):
        """Test that authentication is required for certain endpoints"""
        response = client.post("/admin/posts/", json={"title": "Admin post"})
        # Should return 401 or 403 depending on your auth setup
        assert response.status_code in [401, 403]

@pytest.fixture
def sample_post_data():
    """Fixture to provide sample post data"""
    return {
        "title": "Sample Post",
        "content": "Sample content for testing",
        "author": "Test Author"
    }

def test_with_fixture(sample_post_data):
    """Test using a fixture"""
    response = client.post("/posts/", json=sample_post_data)
    assert response.status_code == 201
```

## Running Tests

Commands to run your tests:

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run specific test file
pytest tests/test_main.py

# Run tests matching a pattern
pytest -k "test_create"

# Run tests and show coverage
pytest --cov=main

# Run tests in parallel (install pytest-xdist first)
pytest -n auto
```

## Quick Reference

- **TestClient**: `TestClient(app)` to create a test client
- **GET requests**: `client.get("/endpoint")`
- **POST requests**: `client.post("/endpoint", json=data)`
- **PUT requests**: `client.put("/endpoint", json=data)`
- **PATCH requests**: `client.patch("/endpoint", json=data)`
- **DELETE requests**: `client.delete("/endpoint")`
- **Check status**: `assert response.status_code == 200`
- **Check content**: `assert response.json() == expected_data`
- **Override dependencies**: `app.dependency_overrides[dep] = override_func`
- **Pytest fixtures**: Use `@pytest.fixture` to create reusable test data
- **Parametrized tests**: Use `@pytest.mark.parametrize` for multiple test cases

## Common Testing Scenarios

1. **Status Codes**: Verify correct HTTP status codes are returned
2. **Response Content**: Validate the structure and content of responses
3. **Input Validation**: Test that invalid input is properly rejected
4. **Authentication**: Test that protected endpoints require authentication
5. **Authorization**: Test that users can only access authorized resources
6. **Error Handling**: Verify that errors are handled gracefully
7. **Edge Cases**: Test boundary conditions and unusual inputs
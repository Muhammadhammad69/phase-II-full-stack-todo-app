---
name: fastapi-basics
description: Learn how to create a basic FastAPI application with GET routes, understand the framework structure, and run your first API server. Use this skill when Claude needs to work with basic FastAPI applications, setting up simple routes, or understanding the fundamental structure of FastAPI projects.
---

# FastAPI Basics

## Overview
FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. It's designed to be easy to use while providing powerful features for building robust APIs.

## Prerequisites
- Python 3.7 or higher
- pip package manager

## Installation

To install FastAPI, you'll also need an ASGI server like `uvicorn`:

```bash
pip install "fastapi[all]"
```

Or install FastAPI and uvicorn separately:

```bash
pip install fastapi
pip install "uvicorn[standard]"
```

## Creating Your First FastAPI Application

Create a file called `main.py` with the following content:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

### Code Breakdown:
1. `from fastapi import FastAPI` - Import the FastAPI class
2. `app = FastAPI()` - Create an instance of the FastAPI class
3. `@app.get("/")` - Decorator that tells FastAPI which path the function should handle
4. `def read_root():` - Function that will be called when the API receives a request to the specified path
5. The return value is automatically converted to JSON

## Running Your Application

### Development Server
To run your application in development mode with auto-reload:

```bash
uvicorn main:app --reload
```

### Alternative: Using fastapi CLI
If you have installed FastAPI with the all extra, you can use:

```bash
fastapi dev main.py
```

## Accessing Interactive Documentation

One of FastAPI's greatest strengths is its automatic interactive API documentation:

- **Swagger UI (Interactive)**: Navigate to `http://127.0.0.1:8000/docs` in your browser
- **ReDoc (Alternative)**: Navigate to `http://127.0.0.1:8000/redoc` in your browser
- **API Schema**: View the OpenAPI schema at `http://127.0.0.1:8000/openapi.json`

## Adding More Routes

You can add different types of routes to your application:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

@app.get("/users/{user_id}")
def read_user(user_id: int, q: str = None):
    return {"user_id": user_id, "query": q}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Path Operations (HTTP Methods)

FastAPI supports all standard HTTP methods:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items")          # GET request
def get_items():
    return {"method": "GET"}

@app.post("/items")         # POST request
def create_item():
    return {"method": "POST"}

@app.put("/items/{item_id}")  # PUT request
def update_item(item_id: int):
    return {"method": "PUT", "id": item_id}

@app.delete("/items/{item_id}")  # DELETE request
def delete_item(item_id: int):
    return {"method": "DELETE", "id": item_id}
```

## Common Mistakes to Avoid

1. **Forgetting Type Hints**: FastAPI relies heavily on Python type hints for validation and documentation
2. **Not Using Async Functions**: When dealing with I/O operations, consider using async/await
3. **Ignoring Path Parameter Types**: Always specify the type for path parameters (int, str, etc.)
4. **Not Testing Documentation**: Always verify your API documentation works as expected

## Real-World Use Case

A basic blog API might look like this:

```python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# Sample data (in real apps, this would come from a database)
posts = [
    {"id": 1, "title": "First Post", "content": "This is the first post"},
    {"id": 2, "title": "Second Post", "content": "This is the second post"}
]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Blog API"}

@app.get("/posts")
def get_posts():
    return {"posts": posts}

@app.get("/posts/{post_id}")
def get_post(post_id: int):
    for post in posts:
        if post["id"] == post_id:
            return {"post": post}
    return {"error": "Post not found"}

@app.get("/posts/search")
def search_posts(q: Optional[str] = None):
    if q:
        filtered_posts = [post for post in posts if q.lower() in post["title"].lower()]
        return {"posts": filtered_posts}
    return {"posts": posts}
```

## Quick Reference

- **Import FastAPI**: `from fastapi import FastAPI`
- **Create app instance**: `app = FastAPI()`
- **Define routes**: `@app.get("/path")`, `@app.post("/path")`, etc.
- **Run with uvicorn**: `uvicorn main:app --reload`
- **Interactive docs**: Visit `/docs` endpoint
- **Path parameters**: `{parameter_name}` in path string
- **Query parameters**: Function parameters with default values
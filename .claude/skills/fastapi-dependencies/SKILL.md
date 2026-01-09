---
name: fastapi-dependencies
description: Create reusable dependencies using FastAPI's dependency injection system. Share common logic across routes and reduce code duplication. Use this skill when Claude needs to work with dependency injection, reusable code patterns, authentication, logging, database connections, or shared validation logic in FastAPI applications.
---

# Dependencies & Reusable Code in FastAPI

## Overview
FastAPI's dependency injection system allows you to define reusable components that can be shared across multiple routes. Dependencies help reduce code duplication, centralize common logic, and improve testability.

## Basic Dependencies

Define a dependency as a simple function that returns a value:

```python
from fastapi import FastAPI, Depends

app = FastAPI()

def get_current_user():
    # Simulate getting user from token or session
    return {"username": "john_doe", "id": 123}

@app.get("/items/")
def read_items(user: dict = Depends(get_current_user)):
    return {"user": user, "items": ["item1", "item2"]}
```

## Dependencies with Parameters

Dependencies can accept parameters and use other dependencies:

```python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

def get_current_user(token: str):
    if token != "valid_token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": "john_doe", "id": 123}

def get_user_permissions(user: dict = Depends(get_current_user)):
    # Check user permissions based on user info
    return {"can_read": True, "can_write": user["id"] == 123}

@app.get("/items/")
def read_items(
    user: dict = Depends(get_current_user),
    permissions: dict = Depends(get_user_permissions)
):
    if not permissions["can_read"]:
        raise HTTPException(status_code=403, detail="No read permission")
    return {"user": user, "items": ["item1", "item2"]}
```

## Class-Based Dependencies

Create dependencies using classes for more complex logic:

```python
from fastapi import FastAPI, Depends

app = FastAPI()

class DatabaseSession:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.connection = None

    def __call__(self):
        # This method makes the class instance callable
        if not self.connection:
            # Simulate database connection
            self.connection = f"Connected to {self.db_url}"
        return self.connection

# Create a dependency instance
get_db = DatabaseSession("postgresql://localhost:5432/mydb")

@app.get("/users/")
def read_users(db: str = Depends(get_db)):
    return {"database": db, "users": ["user1", "user2"]}
```

## Nested Dependencies

Dependencies can depend on other dependencies:

```python
from fastapi import FastAPI, Depends

app = FastAPI()

def get_token():
    return "valid_token"

def get_current_user(token: str = Depends(get_token)):
    if token == "valid_token":
        return {"username": "john_doe", "id": 123}
    return None

def get_user_role(user: dict = Depends(get_current_user)):
    if user:
        return "admin" if user["id"] == 123 else "user"
    return "guest"

@app.get("/dashboard/")
def get_dashboard(
    user: dict = Depends(get_current_user),
    role: str = Depends(get_user_role)
):
    return {"user": user, "role": role, "dashboard": "accessible"}
```

## Dependencies with Query Parameters

Dependencies can use query parameters and other FastAPI features:

```python
from fastapi import FastAPI, Depends, Query

app = FastAPI()

def get_pagination(skip: int = Query(0, ge=0), limit: int = Query(10, le=100)):
    return {"skip": skip, "limit": limit}

def get_filtered_data(
    pagination: dict = Depends(get_pagination),
    category: str = Query(None)
):
    return {
        "data": ["item1", "item2", "item3"],
        "pagination": pagination,
        "filter": {"category": category}
    }

@app.get("/items/")
def read_items(filtered_data: dict = Depends(get_filtered_data)):
    return filtered_data
```

## Shared Authentication Dependency

Create a reusable authentication dependency:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from typing import Optional

app = FastAPI()

def get_current_user_from_token(token: str = None) -> Optional[dict]:
    """Simulate token validation and user retrieval"""
    if not token:
        return None

    # In a real app, validate token and retrieve user
    if token == "valid_token":
        return {"username": "john_doe", "id": 123, "role": "user"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials"
    )

def get_current_active_user(current_user: dict = Depends(get_current_user_from_token)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return current_user

# Protected endpoint using the dependency
@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return current_user

# Optional authentication
@app.get("/public-content")
def read_public_content(current_user: dict = Depends(get_current_user_from_token)):
    if current_user:
        return {"content": "private", "user": current_user["username"]}
    return {"content": "public", "user": None}
```

## Database Session Dependency

Create a reusable database session dependency:

```python
from fastapi import FastAPI, Depends
from contextlib import contextmanager
from typing import Generator

app = FastAPI()

# Simulate a database session
class DatabaseSession:
    def __init__(self):
        self.is_active = False

    def connect(self):
        self.is_active = True
        return self

    def close(self):
        self.is_active = False

@contextmanager
def get_db_session() -> Generator[DatabaseSession, None, None]:
    db = DatabaseSession()
    try:
        db.connect()
        yield db
    finally:
        db.close()

def get_database():
    return get_db_session()

@app.get("/users/{user_id}")
def get_user(user_id: int, db_session: DatabaseSession = Depends(get_database)):
    # Use the database session
    if db_session.is_active:
        return {"id": user_id, "name": f"User {user_id}", "db_active": True}
    return {"error": "Database not available"}
```

## Configuration Dependencies

Create dependencies for configuration values:

```python
from fastapi import FastAPI, Depends
from typing import Dict, Any

app = FastAPI()

class Config:
    def __init__(self):
        self.settings = {
            "debug": True,
            "database_url": "postgresql://localhost:5432/mydb",
            "api_version": "1.0.0"
        }

    def get(self, key: str, default=None):
        return self.settings.get(key, default)

def get_config() -> Config:
    return Config()

def get_database_url(config: Config = Depends(get_config)) -> str:
    return config.get("database_url")

def get_api_version(config: Config = Depends(get_config)) -> str:
    return config.get("api_version")

@app.get("/info")
def get_info(
    db_url: str = Depends(get_database_url),
    api_version: str = Depends(get_api_version)
):
    return {"database_url": db_url, "api_version": api_version}
```

## Dependency with Request Context

Access request information in dependencies:

```python
from fastapi import FastAPI, Depends, Request
from typing import Dict

app = FastAPI()

def get_client_info(request: Request) -> Dict[str, str]:
    return {
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent", ""),
        "method": request.method,
        "url": str(request.url)
    }

@app.get("/analytics")
def get_analytics(client_info: Dict[str, str] = Depends(get_client_info)):
    return {"client_info": client_info, "event": "page_view"}
```

## Multiple Dependencies Pattern

Combine multiple dependencies for complex scenarios:

```python
from fastapi import FastAPI, Depends, HTTPException
from typing import Dict, Optional

app = FastAPI()

def get_current_user():
    return {"id": 123, "username": "john_doe", "role": "admin"}

def get_user_permissions(user: dict = Depends(get_current_user)):
    return {
        "can_read": True,
        "can_write": user["role"] in ["admin", "editor"],
        "can_delete": user["role"] == "admin"
    }

def check_write_permission(permissions: dict = Depends(get_user_permissions)):
    if not permissions["can_write"]:
        raise HTTPException(status_code=403, detail="Write permission required")

def check_delete_permission(permissions: dict = Depends(get_user_permissions)):
    if not permissions["can_delete"]:
        raise HTTPException(status_code=403, detail="Delete permission required")

@app.post("/items/", dependencies=[Depends(check_write_permission)])
def create_item():
    return {"message": "Item created"}

@app.delete("/items/{item_id}", dependencies=[Depends(check_delete_permission)])
def delete_item(item_id: int):
    return {"message": f"Item {item_id} deleted"}
```

## Dependency with Caching

Create dependencies that cache expensive operations:

```python
from fastapi import FastAPI, Depends
from typing import Dict
import time

app = FastAPI()

class CachedUserService:
    def __init__(self):
        self.cache: Dict[int, Dict] = {}
        self.cache_time: Dict[int, float] = {}
        self.cache_ttl = 30  # 30 seconds TTL

    def get_user(self, user_id: int):
        current_time = time.time()

        # Check if user is in cache and not expired
        if user_id in self.cache and \
           (current_time - self.cache_time.get(user_id, 0)) < self.cache_ttl:
            return self.cache[user_id]

        # Simulate expensive user lookup
        user_data = {"id": user_id, "name": f"User {user_id}", "timestamp": current_time}

        # Cache the result
        self.cache[user_id] = user_data
        self.cache_time[user_id] = current_time

        return user_data

def get_user_service():
    return CachedUserService()

@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    user_service: CachedUserService = Depends(get_user_service)
):
    return user_service.get_user(user_id)
```

## Common Mistakes to Avoid

1. **Not Using Dependencies for Shared Logic**: Extract common functionality into dependencies instead of duplicating code
2. **Dependencies with Side Effects**: Dependencies should be idempotent and not have side effects
3. **Circular Dependencies**: Avoid creating circular dependency chains
4. **Not Handling Dependency Failures**: Always handle potential exceptions in dependencies
5. **Overcomplicating Dependencies**: Keep dependencies focused on a single responsibility
6. **Not Testing Dependencies**: Dependencies should be tested independently
7. **Global Dependencies**: Be careful with global dependencies that affect all routes

## Real-World Use Cases

### Authentication and Authorization System
```python
from fastapi import FastAPI, Depends, HTTPException, status
from typing import Dict, List

app = FastAPI()

class AuthService:
    def __init__(self):
        self.valid_tokens = {"valid_token": {"user_id": 123, "role": "admin"}}

    def verify_token(self, token: str = None) -> Dict:
        if not token or token not in self.valid_tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing token"
            )
        return self.valid_tokens[token]

def get_auth_service():
    return AuthService()

def get_current_user(auth_service: AuthService = Depends(get_auth_service)):
    # Extract token from header, query, or cookie
    # For this example, we'll simulate getting it from a header
    token = "valid_token"  # In real app, get from request headers
    return auth_service.verify_token(token)

def require_role(required_role: str):
    def role_checker(current_user: Dict = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {required_role} required"
            )
        return current_user
    return role_checker

@app.get("/admin-panel", dependencies=[Depends(require_role("admin"))])
def get_admin_panel():
    return {"content": "Admin panel", "accessible": True}
```

### Rate Limiting Dependency
```python
from fastapi import FastAPI, Depends, HTTPException, status
from typing import Dict
import time

class RateLimiter:
    def __init__(self, requests: int = 10, window: int = 60):
        self.requests = requests
        self.window = window
        self.requests_log: Dict[str, List[float]] = {}

    def check_rate_limit(self, identifier: str = "default") -> bool:
        current_time = time.time()

        # Clean old requests
        if identifier in self.requests_log:
            self.requests_log[identifier] = [
                req_time for req_time in self.requests_log[identifier]
                if current_time - req_time < self.window
            ]
        else:
            self.requests_log[identifier] = []

        # Check if limit exceeded
        if len(self.requests_log[identifier]) >= self.requests:
            return False

        # Record this request
        self.requests_log[identifier].append(current_time)
        return True

def get_rate_limiter():
    return RateLimiter(requests=5, window=60)  # 5 requests per minute

@app.get("/api/data")
def get_data(
    rate_limiter: RateLimiter = Depends(get_rate_limiter),
    client_ip: str = "127.0.0.1"  # In real app, get from request
):
    if not rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )

    return {"data": "protected content", "timestamp": time.time()}
```

## Quick Reference

- **Basic dependency**: `def dependency_func(): return value`
- **Use dependency**: `param = Depends(dependency_func)`
- **Class dependency**: Class with `__call__` method
- **Nested dependencies**: Dependencies can depend on other dependencies
- **Parameter dependencies**: Dependencies can accept parameters
- **Global dependencies**: Use `dependencies` parameter in route decorators
- **Context managers**: Use for resources that need cleanup
- **Caching**: Implement caching within dependencies for expensive operations

## Best Practices

1. **Single Responsibility**: Each dependency should have one clear purpose
2. **Error Handling**: Dependencies should handle errors gracefully
3. **Testing**: Dependencies should be easily testable in isolation
4. **Documentation**: Document what each dependency provides
5. **Performance**: Be mindful of expensive operations in dependencies
6. **Security**: Validate and sanitize data in dependencies
---
name: sqlmodel-fastapi-integration
description: Complete integration of SQLModel with FastAPI - learn how to create APIs with SQLModel models, dependency injection, session management, and validation. Use this skill when Claude needs to build FastAPI applications with SQLModel database integration, API endpoints, request/response models, or database session management.
---

# SQLModel FastAPI Integration

## Overview

This skill covers the complete integration of SQLModel with FastAPI, including model definitions, API endpoints, dependency injection for database sessions, request/response validation, and best practices for building robust APIs with SQLModel as the ORM.

## Basic FastAPI with SQLModel Setup

### Application Structure
```python
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List
from contextlib import asynccontextmanager

# Database setup
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
```

### Model Definitions
```python
class UserBase(SQLModel):
    name: str
    email: str

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    age: Optional[int] = Field(default=None)

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
```

## Database Session Dependency

### Session Management
```python
def get_session():
    with Session(engine) as session:
        yield session

# Alternative using async context manager
from contextlib import contextmanager

@contextmanager
def get_session_context():
    with Session(engine) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
```

## CRUD Endpoints

### Create Endpoint
```python
@app.post("/users/", response_model=UserRead)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    """Create a new user."""
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
```

### Read Endpoints
```python
@app.get("/users/{user_id}", response_model=UserRead)
def read_user(user_id: int, session: Session = Depends(get_session)):
    """Get a user by ID."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/", response_model=List[UserRead])
def read_users(
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get all users with pagination."""
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users
```

### Update Endpoint
```python
@app.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user: UserUpdate,
    session: Session = Depends(get_session)
):
    """Update a user."""
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(db_user, key, value)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
```

### Delete Endpoint
```python
@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    """Delete a user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}
```

## Advanced FastAPI Patterns with SQLModel

### Query Parameters and Filtering
```python
from typing import Optional

@app.get("/users/search", response_model=List[UserRead])
def search_users(
    name: Optional[str] = None,
    min_age: Optional[int] = None,
    email_domain: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Search users with optional filters."""
    query = select(User)

    if name:
        query = query.where(User.name.contains(name))
    if min_age:
        query = query.where(User.age >= min_age)
    if email_domain:
        query = query.where(User.email.contains(f"@{email_domain}"))

    users = session.exec(query).all()
    return users
```

### Request/Response Models with Relationships
```python
from typing import List

class UserWithPosts(UserRead):
    posts: List["PostRead"] = []

class PostBase(SQLModel):
    title: str
    content: str
    user_id: int

class Post(PostBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user: User = Relationship()

class PostCreate(PostBase):
    pass

class PostRead(PostBase):
    id: int

# Endpoint that returns user with related posts
@app.get("/users/{user_id}/with-posts", response_model=UserWithPosts)
def read_user_with_posts(user_id: int, session: Session = Depends(get_session)):
    """Get a user with their posts."""
    from sqlalchemy.orm import selectinload

    user = session.exec(
        select(User)
        .options(selectinload(User.posts))
        .where(User.id == user_id)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
```

## Error Handling and Validation

### Custom Exception Handlers
```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": f"Internal server error: {str(exc)}"}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)}
    )
```

### Validation with Pydantic
```python
from pydantic import field_validator

class UserCreate(UserBase):
    age: Optional[int] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Email must contain @')
        return v

    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        if v is not None and v < 0:
            raise ValueError('Age cannot be negative')
        return v
```

## Middleware and Security

### Database Session Middleware
```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class DatabaseSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.db_session = Session(engine)
        try:
            response = await call_next(request)
        finally:
            request.state.db_session.close()
        return response

app.add_middleware(DatabaseSessionMiddleware)
```

### Authentication with SQLModel
```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class UserWithPassword(User):
    hashed_password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@app.post("/auth/login")
def login(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Implementation would validate credentials against database
    pass
```

## Performance Optimization

### Caching with FastAPI
```python
from fastapi import Query
import time

# Simple in-memory cache
cache = {}

@app.get("/users/{user_id}/cached")
def read_user_cached(user_id: int, session: Session = Depends(get_session)):
    """Get a user with simple caching."""
    cache_key = f"user_{user_id}"
    cached_result = cache.get(cache_key)

    if cached_result:
        # Check if cache is still valid (e.g., less than 5 minutes old)
        result, timestamp = cached_result
        if time.time() - timestamp < 300:  # 5 minutes
            return result

    # Fetch from database
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Cache the result
    cache[cache_key] = (user, time.time())
    return user
```

### Connection Pooling Configuration
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

def create_engine_with_pool():
    """Create engine with optimized connection pooling."""
    return create_engine(
        sqlite_url,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=True
    )
```

## Testing FastAPI with SQLModel

### Test Setup
```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session
from sqlalchemy.pool import StaticPool

# Test database setup
test_sqlite_url = "sqlite:///./test.db"

test_engine = create_engine(
    test_sqlite_url,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

def override_get_session():
    with Session(test_engine) as session:
        yield session

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    app.dependency_overrides[get_session] = lambda: session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
```

### API Tests
```python
def test_create_user(client: TestClient):
    """Test creating a user."""
    user_data = {"name": "John Doe", "email": "john@example.com", "age": 30}
    response = client.post("/users/", json=user_data)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == user_data["name"]
    assert data["email"] == user_data["email"]
    assert data["age"] == user_data["age"]

def test_read_user(client: TestClient, session: Session):
    """Test reading a user."""
    # Create a user first
    user = User(name="Jane Doe", email="jane@example.com", age=25)
    session.add(user)
    session.commit()
    session.refresh(user)

    # Read the user
    response = client.get(f"/users/{user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == user.name
    assert data["email"] == user.email
```

## Production Deployment Considerations

### Environment Configuration
```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key")

    class Config:
        env_file = ".env"

settings = Settings()

def get_engine():
    """Get database engine based on environment."""
    if settings.debug:
        return create_engine(settings.database_url, echo=True)
    else:
        return create_engine(
            settings.database_url,
            pool_size=20,
            max_overflow=30,
            pool_pre_ping=True,
            pool_recycle=3600
        )
```

### Health Checks
```python
@app.get("/health")
def health_check(session: Session = Depends(get_session)):
    """Health check endpoint."""
    try:
        # Simple query to check database connectivity
        session.exec(select(User).limit(1)).first()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "error", "error": str(e)}
```

## Best Practices

1. **Separate concerns**: Keep database models separate from API models
2. **Use dependency injection**: Always inject database sessions using Depends
3. **Handle errors gracefully**: Use HTTPException for API errors
4. **Validate input**: Use Pydantic models for request validation
5. **Use transactions**: Wrap related operations in transactions
6. **Implement pagination**: Always paginate large result sets
7. **Use proper HTTP status codes**: Follow REST conventions
8. **Secure your API**: Implement authentication and authorization
9. **Monitor performance**: Use logging and monitoring tools
10. **Write tests**: Always test your API endpoints

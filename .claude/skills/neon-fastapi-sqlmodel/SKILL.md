---
name: Neon with FastAPI and SQLModel - Building Production APIs
description: Integrate Neon database with FastAPI and SQLModel for production-ready applications. Learn database URL configuration, connection pooling, dependency injection, async operations, error handling, health checks, and monitoring. Use when building FastAPI applications with Neon, configuring SQLModel with Neon, implementing async database operations, setting up dependency injection, handling database errors, implementing health checks, and monitoring database performance.
---

# Neon with FastAPI and SQLModel - Building Production APIs

## Setting Up FastAPI with Neon

### Installing Required Packages
```bash
pip install fastapi uvicorn sqlmodel asyncpg python-dotenv
```

### Environment Configuration
```bash
# .env
NEON_DATABASE_URL="postgresql://user:pass@ep-host.region.neon.tech/dbname?sslmode=require"
NEON_POOLED_DATABASE_URL="postgresql://user:pass@ep-host-pooler.region.neon.tech/dbname?sslmode=require"
```

## Database Configuration with SQLModel

### Creating the Database Engine
```python
# database.py
from sqlmodel import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from typing import AsyncGenerator

# Get the Neon connection string
DATABASE_URL = os.getenv("NEON_DATABASE_URL")
# For connection pooling, use the pooled connection string:
# DATABASE_URL = os.getenv("NEON_POOLED_DATABASE_URL")

# Replace postgresql:// with postgresql+asyncpg:// for async operations
ASYNC_DATABASE_URL = DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before use (important for Neon)
    pool_recycle=3600,   # Recycle connections after 1 hour
    pool_size=5,         # Base pool size
    max_overflow=10      # Additional connections if needed
)

# Create async session maker
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

### Defining Models with SQLModel
```python
# models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, min_length=3, max_length=50)
    email: str = Field(unique=True, min_length=5, max_length=100)
    hashed_password: str = Field(min_length=8)
    role: UserRole = Field(default=UserRole.USER)
    is_active: bool = Field(default=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    # Relationship with posts
    posts: list["Post"] = Relationship(back_populates="author")

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    author_id: int = Field(foreign_key="user.id")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: Optional[datetime.datetime] = Field(default=None)

    # Relationship with user
    author: User = Relationship(back_populates="posts")
```

## Dependency Injection Setup

### Creating Database Dependencies
```python
# dependencies.py
from typing import Annotated
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import Depends
from .database import get_async_session

AsyncSessionDep = Annotated[AsyncSession, Depends(get_async_session)]
```

### Main Application Setup
```python
# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlmodel import select
from contextlib import asynccontextmanager
from typing import List, Optional

from .models import User, UserCreate, UserRead, UserUpdate
from .database import engine
from .dependencies import AsyncSessionDep

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    # Shutdown: Close engine
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "FastAPI with Neon and SQLModel"}

@app.get("/users/", response_model=List[UserRead])
async def read_users(session: AsyncSessionDep):
    statement = select(User)
    result = await session.execute(statement)
    users = result.scalars().all()
    return users

@app.post("/users/", response_model=UserRead)
async def create_user(user: UserCreate, session: AsyncSessionDep):
    db_user = User.from_orm(user)
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user
```

## Async Database Operations

### CRUD Operations with SQLModel
```python
# crud.py
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
from .models import User, Post

async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_users(session: AsyncSession, offset: int = 0, limit: int = 100) -> List[User]:
    statement = select(User).offset(offset).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()

async def create_user(session: AsyncSession, user: User) -> User:
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def update_user(session: AsyncSession, user_id: int, user_update: dict) -> Optional[User]:
    db_user = await get_user_by_id(session, user_id)
    if db_user:
        for key, value in user_update.items():
            setattr(db_user, key, value)
        await session.commit()
        await session.refresh(db_user)
        return db_user
    return None

async def delete_user(session: AsyncSession, user_id: int) -> bool:
    db_user = await get_user_by_id(session, user_id)
    if db_user:
        await session.delete(db_user)
        await session.commit()
        return True
    return False

# Post operations
async def get_posts_by_author(session: AsyncSession, author_id: int) -> List[Post]:
    statement = select(Post).where(Post.author_id == author_id).order_by(desc(Post.created_at))
    result = await session.execute(statement)
    return result.scalars().all()
```

## Error Handling and Transactions

### Comprehensive Error Handling
```python
# error_handlers.py
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.error(f"Integrity error: {exc}")

    # Check for specific constraint violations
    if "duplicate key value violates unique constraint" in str(exc.orig):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "A record with this unique value already exists"}
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An integrity error occurred"}
    )

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"}
    )
```

### Transaction Management
```python
# transaction_example.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

async def transfer_funds(
    session: AsyncSession,
    from_account_id: int,
    to_account_id: int,
    amount: float
):
    """
    Example of transaction management with Neon
    """
    try:
        # Perform the transaction within the same session
        # (assuming Account model exists)
        from_account = await session.get(Account, from_account_id)
        to_account = await session.get(Account, to_account_id)

        if not from_account or not to_account:
            raise HTTPException(status_code=404, detail="Account not found")

        if from_account.balance < amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")

        from_account.balance -= amount
        to_account.balance += amount

        # Commit the transaction
        await session.commit()

    except SQLAlchemyError as e:
        # Rollback on error
        await session.rollback()
        logger.error(f"Transaction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transaction failed"
        )
```

## Connection Pooling Configuration

### Optimizing for Neon
```python
# optimized_database.py
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import AsyncAdaptedQueuePool
import os

DATABASE_URL = os.getenv("NEON_POOLED_DATABASE_URL").replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Optimized engine for Neon's serverless nature
engine = create_async_engine(
    DATABASE_URL,
    # Pool settings optimized for Neon
    poolclass=AsyncAdaptedQueuePool,
    pool_size=5,           # Base connections (adjust based on traffic)
    max_overflow=10,       # Additional connections during traffic spikes
    pool_pre_ping=True,    # Verify connections before use (handles compute restarts)
    pool_recycle=3600,     # Recycle connections every hour (prevents stale connections)
    pool_timeout=30,       # Wait 30 seconds before giving up on connection
    echo=False,            # Set to True for SQL debugging in development
    # Connection arguments specific to Neon
    connect_args={
        "server_settings": {
            "application_name": "my-fastapi-app",
        }
    }
)
```

## Health Checks and Monitoring

### Application Health Endpoints
```python
# health.py
import asyncio
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from .database import engine

router = APIRouter(prefix="/health")

@router.get("/ready")
async def readiness_check():
    """
    Readiness check - verify the app is ready to serve traffic
    """
    try:
        # Test database connectivity
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ready", "checks": {"database": "ok"}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "checks": {"database": "failed", "error": str(e)}}
        )

@router.get("/live")
async def liveness_check():
    """
    Liveness check - verify the app is running
    """
    return {"status": "alive", "timestamp": datetime.datetime.utcnow()}

# Add to main app
app.include_router(router)
```

### Query Performance Monitoring
```python
# middleware.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)

class QueryTimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Log request timing
        request.state.process_time = process_time
        logger.info(f"Request {request.method} {request.url.path} took {process_time:.3f}s")

        # Add timing header to response
        response.headers["X-Process-Time"] = f"{process_time:.3f}s"

        return response

# Add to app
app.add_middleware(QueryTimingMiddleware)
```

## Performance Optimization

### Query Optimization Techniques
```python
# optimized_queries.py
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from typing import Tuple

async def get_user_with_posts_optimized(session: AsyncSession, user_id: int):
    """
    Optimized query using selectinload to prevent N+1 queries
    """
    statement = (
        select(User)
        .options(selectinload(User.posts))
        .where(User.id == user_id)
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()

async def get_paginated_users(
    session: AsyncSession,
    offset: int = 0,
    limit: int = 20
) -> Tuple[List[User], int]:
    """
    Paginated query with count
    """
    # Get total count
    count_statement = select(func.count(User.id))
    count_result = await session.execute(count_statement)
    total_count = count_result.scalar_one()

    # Get paginated results
    statement = select(User).offset(offset).limit(limit)
    result = await session.execute(statement)
    users = result.scalars().all()

    return users, total_count

async def search_users(session: AsyncSession, search_term: str):
    """
    Search users with ILIKE for case-insensitive search
    """
    statement = select(User).where(
        (User.username.ilike(f"%{search_term}%")) |
        (User.email.ilike(f"%{search_term}%"))
    )
    result = await session.execute(statement)
    return result.scalars().all()
```

## Production Considerations

### Configuration for Different Environments
```python
# config.py
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Database settings
    neon_database_url: str = os.getenv("NEON_DATABASE_URL")
    neon_pooled_database_url: str = os.getenv("NEON_POOLED_DATABASE_URL")

    # App settings
    app_name: str = "FastAPI with Neon"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")

    # Connection pool settings
    pool_size: int = int(os.getenv("POOL_SIZE", "5"))
    max_overflow: int = int(os.getenv("MAX_OVERFLOW", "10"))
    pool_recycle: int = int(os.getenv("POOL_RECYCLE", "3600"))

    # API settings
    api_v1_prefix: str = "/api/v1"
    cors_origins: list = os.getenv("CORS_ORIGINS", "").split(",")

    class Config:
        env_file = ".env"

settings = Settings()
```

### Docker Configuration for Production
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Environment-Specific Settings
```python
# production_database.py
from sqlalchemy.ext.asyncio import create_async_engine
from .config import settings

def create_production_engine():
    """
    Create database engine optimized for production
    """
    database_url = settings.neon_pooled_database_url.replace(
        "postgresql://", "postgresql+asyncpg://"
    )

    return create_async_engine(
        database_url,
        pool_size=settings.pool_size,
        max_overflow=settings.max_overflow,
        pool_pre_ping=True,
        pool_recycle=settings.pool_recycle,
        pool_timeout=30,
        echo=False,  # Never enable echo in production
        # Additional production optimizations
        pool_reset_on_return="commit",
        max_identifier_length=30,
    )
```

## Testing with Neon

### Test Configuration
```python
# conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel

from main import app
from database import get_async_session

# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        # Use StaticPool for SQLite in-memory database
        poolclass=StaticPool,
        # Enable foreign key constraints for SQLite
        connect_args={"check_same_thread": False}
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    yield engine
    await engine.dispose()

@pytest.fixture(scope="function")
async def async_session(test_engine):
    async with AsyncSession(test_engine) as session:
        yield session

@pytest.fixture(scope="function")
async def client(async_session):
    async def override_get_async_session():
        yield async_session

    app.dependency_overrides[get_async_session] = override_get_async_session

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

## Monitoring with Neon

### Query Logging and Performance
```python
# monitoring.py
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time
import logging

logger = logging.getLogger(__name__)

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 1.0:  # Log queries that take longer than 1 second
        logger.warning(f"Slow query detected ({total:.2f}s): {statement[:100]}...")
```

## Quick Reference

### Essential Configuration for Neon + FastAPI + SQLModel
```python
# Essential setup for Neon
DATABASE_URL = os.getenv("NEON_POOLED_DATABASE_URL").replace(
    "postgresql://", "postgresql+asyncpg://"
)

engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Critical for Neon's serverless nature
    pool_recycle=3600,       # Prevent stale connections
    pool_size=5,             # Adjust based on traffic
    max_overflow=10          # Handle traffic spikes
)

# Always use async sessions with Neon
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

### Common Connection Issues and Solutions
- **Issue**: "Connection was closed by the remote end"
  - **Solution**: Use `pool_pre_ping=True` and pooled connections
- **Issue**: "SSL connection has been closed unexpectedly"
  - **Solution**: Ensure SSL mode is properly set and use connection pooling
- **Issue**: "No more connections allowed"
  - **Solution**: Use connection pooling and ensure proper session closure

### Performance Tips
- Always use pooled connections for web applications
- Implement `pool_pre_ping=True` to handle compute restarts
- Use async operations throughout your application
- Implement proper session management with context managers
- Monitor query performance and add indexes as needed
- Use selectinload to prevent N+1 query problems
- Implement pagination for large datasets
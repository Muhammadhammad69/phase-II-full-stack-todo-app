---
name: sqlmodel-best-practices
description: SQLModel best practices for production applications - learn how to structure models, optimize performance, handle security, and maintain code quality. Use this skill when Claude needs to implement production-ready SQLModel applications following industry best practices for security, performance, and maintainability.
---

# SQLModel Best Practices

## Overview

This skill covers best practices for building production-ready SQLModel applications, including security patterns, performance optimization, code organization, testing strategies, and maintainability guidelines. Learn how to structure applications for scale, security, and long-term maintenance.

## Model Design Best Practices

### Proper Model Structure
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class BaseModel(SQLModel):
    """Base model with common fields."""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel, table=True):
    """User model with proper constraints and validation."""
    __tablename__ = "users"

    # Essential fields
    username: str = Field(
        sa_column_kwargs={"unique": True, "index": True},
        min_length=3,
        max_length=50
    )
    email: str = Field(
        sa_column_kwargs={"unique": True, "index": True},
        regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )

    # Optional fields
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)

    # Security-related fields
    is_verified: bool = Field(default=False)
    last_login: Optional[datetime] = Field(default=None)
```

### Model Validation Patterns
```python
from pydantic import field_validator, model_validator
from typing import Union

class Product(BaseModel, table=True):
    __tablename__ = "products"

    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(gt=0)
    stock_quantity: int = Field(ge=0)
    sku: str = Field(regex=r'^[A-Z0-9-]+$', max_length=50)
    category_id: int = Field(foreign_key="categories.id")

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than zero')
        if v > 1000000:  # Arbitrary limit
            raise ValueError('Price seems unreasonably high')
        return round(v, 2)  # Normalize to 2 decimal places

    @field_validator('sku')
    @classmethod
    def validate_sku(cls, v):
        if not v.isupper():
            raise ValueError('SKU must be in uppercase')
        return v

    @model_validator(mode='after')
    def validate_stock_price_relationship(self):
        """Ensure that out-of-stock items are not marked as active."""
        if self.stock_quantity == 0 and self.price > 0:
            # Could add logic to handle out-of-stock scenarios
            pass
        return self
```

## Security Best Practices

### Secure Model Patterns
```python
from passlib.context import CryptContext
from pydantic import EmailStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecureUser(BaseModel, table=True):
    __tablename__ = "secure_users"

    username: str = Field(
        sa_column_kwargs={"unique": True, "index": True},
        min_length=3,
        max_length=50
    )
    email: EmailStr = Field(sa_column_kwargs={"unique": True, "index": True})
    hashed_password: str = Field(exclude=True)  # Exclude from responses
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    failed_login_attempts: int = Field(default=0, ge=0, le=10)
    locked_until: Optional[datetime] = Field(default=None)

    def set_password(self, password: str):
        """Hash and set password."""
        self.hashed_password = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify password against hash."""
        return pwd_context.verify(password, self.hashed_password)

    @model_validator(mode='before')
    @classmethod
    def validate_password_strength(cls, values):
        """Validate password strength before creation."""
        password = values.get('password')
        if password:
            if len(password) < 8:
                raise ValueError('Password must be at least 8 characters long')
            if not any(c.isupper() for c in password):
                raise ValueError('Password must contain at least one uppercase letter')
            if not any(c.islower() for c in password):
                raise ValueError('Password must contain at least one lowercase letter')
            if not any(c.isdigit() for c in password):
                raise ValueError('Password must contain at least one digit')
        return values
```

### SQL Injection Prevention
```python
from sqlmodel import select
from sqlalchemy import and_

class SecureUserService:
    def __init__(self, session):
        self.session = session

    def search_users_secure(self, search_params: dict):
        """Secure user search using parameterized queries."""
        query = select(User)

        conditions = []
        if search_params.get('username'):
            # Use proper parameter binding - never string formatting
            conditions.append(User.username == search_params['username'])
        if search_params.get('email'):
            conditions.append(User.email == search_params['email'])
        if search_params.get('min_id'):
            conditions.append(User.id >= search_params['min_id'])

        if conditions:
            query = query.where(and_(*conditions))

        return self.session.exec(query).all()

    def get_user_by_id(self, user_id: int):
        """Safe user retrieval by ID."""
        # Using session.get() is safe against injection
        return self.session.get(User, user_id)
```

## Performance Best Practices

### Query Optimization
```python
from sqlalchemy.orm import selectinload, joinedload

class OptimizedUserService:
    def __init__(self, session):
        self.session = session

    def get_user_with_posts_efficient(self, user_id: int):
        """Get user with posts using optimized loading."""
        # Use selectinload to avoid N+1 queries
        result = self.session.exec(
            select(User)
            .options(selectinload(User.posts))
            .where(User.id == user_id)
        ).first()
        return result

    def get_users_with_counts(self):
        """Get users with post counts without loading posts."""
        from sqlalchemy import func

        return self.session.exec(
            select(
                User.id,
                User.username,
                func.count(Post.id).label('post_count')
            )
            .join(Post, isouter=True)
            .group_by(User.id)
            .order_by(func.count(Post.id).desc())
        ).all()

    def get_paginated_users(self, page: int = 1, per_page: int = 20):
        """Get paginated users with proper indexing."""
        offset = (page - 1) * per_page

        # Get total count
        total = self.session.exec(
            select(func.count(User.id))
        ).one()

        # Get paginated results
        users = self.session.exec(
            select(User)
            .offset(offset)
            .limit(per_page)
            .order_by(User.created_at.desc())
        ).all()

        return {
            'users': users,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }
```

### Connection Pooling and Session Management
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import contextlib

class DatabaseManager:
    def __init__(self, database_url: str):
        self.engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=20,
            max_overflow=30,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )
        self.SessionLocal = sessionmaker(bind=self.engine)

    @contextlib.contextmanager
    def get_session(self):
        """Context manager for database sessions."""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_session_dependency(self):
        """FastAPI dependency for sessions."""
        with self.get_session() as session:
            yield session
```

## Error Handling and Logging

### Robust Error Handling
```python
import logging
from typing import Optional
from sqlalchemy.exc import IntegrityError, DataError
from pydantic import ValidationError

logger = logging.getLogger(__name__)

class RobustUserService:
    def __init__(self, session):
        self.session = session

    def create_user_safe(self, user_data: dict) -> Optional[User]:
        """Create user with comprehensive error handling."""
        try:
            # Validate input
            user = User.model_validate(user_data)

            # Check for duplicates
            existing_user = self.session.exec(
                select(User).where(
                    (User.email == user.email) | (User.username == user.username)
                )
            ).first()

            if existing_user:
                logger.warning(f"User creation failed: duplicate email or username: {user.email}")
                return None

            # Add and commit
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)

            logger.info(f"User created successfully: {user.id}")
            return user

        except ValidationError as e:
            logger.error(f"Validation error during user creation: {e}")
            return None
        except IntegrityError as e:
            logger.error(f"Database integrity error during user creation: {e}")
            self.session.rollback()
            return None
        except DataError as e:
            logger.error(f"Data error during user creation: {e}")
            self.session.rollback()
            return None
        except Exception as e:
            logger.error(f"Unexpected error during user creation: {e}")
            self.session.rollback()
            return None

    def get_user_with_error_handling(self, user_id: int) -> Optional[User]:
        """Get user with error handling."""
        try:
            user = self.session.get(User, user_id)
            if user:
                logger.info(f"User retrieved: {user_id}")
            else:
                logger.info(f"User not found: {user_id}")
            return user
        except Exception as e:
            logger.error(f"Error retrieving user {user_id}: {e}")
            return None
```

## Testing Best Practices

### Comprehensive Testing Strategy
```python
import pytest
from sqlmodel import create_engine, Session
from sqlalchemy.pool import StaticPool
from unittest.mock import patch

@pytest.fixture(name="session")
def session_fixture():
    """Create test database session."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session

def test_user_creation_valid_data(session: Session):
    """Test user creation with valid data."""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
    }

    user_service = UserService(session)
    created_user = user_service.create_user(user_data)

    assert created_user is not None
    assert created_user.username == "testuser"
    assert created_user.email == "test@example.com"
    assert created_user.id is not None

def test_user_creation_duplicate_email(session: Session):
    """Test user creation with duplicate email."""
    # Create first user
    user1_data = {
        "username": "testuser1",
        "email": "test@example.com"
    }

    user_service = UserService(session)
    user_service.create_user(user1_data)

    # Try to create another user with same email
    user2_data = {
        "username": "testuser2",
        "email": "test@example.com"  # Same email as user1
    }

    result = user_service.create_user(user2_data)
    assert result is None  # Should fail due to duplicate email

@patch('your_app.utils.send_verification_email')
def test_user_verification_flow(mock_send_email, session: Session):
    """Test user verification flow with mocked email service."""
    user_data = {
        "username": "testuser",
        "email": "test@example.com"
    }

    user_service = UserService(session)
    user = user_service.create_user(user_data)

    # Verify user
    user_service.verify_user(user.id)

    # Check that email was sent
    mock_send_email.assert_called_once_with(user.email)
```

## Code Organization and Architecture

### Service Layer Pattern
```python
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class ServiceInterface(ABC):
    """Abstract service interface."""

    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Any:
        pass

    @abstractmethod
    def get_by_id(self, id: int) -> Optional[Any]:
        pass

class UserService(ServiceInterface):
    """User service implementing business logic."""

    def __init__(self, session: Session):
        self.session = session

    def create(self, data: Dict[str, Any]) -> User:
        """Create a new user."""
        user = User.model_validate(data)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.session.exec(
            select(User).where(User.email == email)
        ).first()

    def update(self, user_id: int, **kwargs) -> Optional[User]:
        """Update user fields."""
        user = self.session.get(User, user_id)
        if not user:
            return None

        for field, value in kwargs.items():
            if hasattr(user, field):
                setattr(user, field, value)

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user_id: int) -> bool:
        """Delete user by ID."""
        user = self.session.get(User, user_id)
        if not user:
            return False

        self.session.delete(user)
        self.session.commit()
        return True

    def search(self, **filters) -> List[User]:
        """Search users with filters."""
        query = select(User)

        for field, value in filters.items():
            if hasattr(User, field) and value is not None:
                query = query.where(getattr(User, field) == value)

        return self.session.exec(query).all()
```

### Repository Pattern
```python
from typing import TypeVar, Generic, Type, List, Optional

T = TypeVar('T', bound=SQLModel)

class BaseRepository(Generic[T]):
    """Generic repository base class."""

    def __init__(self, model: Type[T], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> Optional[T]:
        """Get entity by ID."""
        return self.session.get(self.model, id)

    def get_all(self, offset: int = 0, limit: int = 100) -> List[T]:
        """Get all entities with pagination."""
        return self.session.exec(
            select(self.model).offset(offset).limit(limit)
        ).all()

    def create(self, entity: T) -> T:
        """Create new entity."""
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def update(self, entity: T) -> T:
        """Update entity."""
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        """Delete entity."""
        self.session.delete(entity)
        self.session.commit()

class UserRepository(BaseRepository[User]):
    """User-specific repository."""

    def __init__(self, session: Session):
        super().__init__(User, session)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.session.exec(
            select(User).where(User.email == email)
        ).first()

    def get_active_users(self) -> List[User]:
        """Get all active users."""
        return self.session.exec(
            select(User).where(User.is_active == True)
        ).all()
```

## Monitoring and Observability

### Query Performance Monitoring
```python
import time
import logging
from functools import wraps
from sqlmodel import select

logger = logging.getLogger(__name__)

def monitor_query_time(func):
    """Decorator to monitor query execution time."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()

        execution_time = end_time - start_time
        if execution_time > 1.0:  # Log slow queries (> 1 second)
            logger.warning(
                f"Slow query detected in {func.__name__}: {execution_time:.2f}s"
            )

        return result
    return wrapper

class MonitoredUserService:
    def __init__(self, session: Session):
        self.session = session

    @monitor_query_time
    def get_users_with_posts(self):
        """Get users with posts (monitored for performance)."""
        return self.session.exec(
            select(User)
            .options(selectinload(User.posts))
        ).all()

    @monitor_query_time
    def complex_user_report(self):
        """Generate complex user report (monitored)."""
        from sqlalchemy import func

        return self.session.exec(
            select(
                User.id,
                User.username,
                func.count(Post.id).label('post_count'),
                func.avg(func.length(Post.content)).label('avg_content_length')
            )
            .join(Post, isouter=True)
            .group_by(User.id)
            .having(func.count(Post.id) > 0)
        ).all()
```

## Configuration and Environment Management

### Settings Management
```python
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Application settings."""
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    database_pool_size: int = int(os.getenv("DATABASE_POOL_SIZE", "20"))
    database_pool_max_overflow: int = int(os.getenv("DATABASE_POOL_MAX_OVERFLOW", "30"))

    # Security
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Application
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")

    # Performance
    default_page_size: int = int(os.getenv("DEFAULT_PAGE_SIZE", "20"))
    max_page_size: int = int(os.getenv("MAX_PAGE_SIZE", "100"))

    class Config:
        env_file = ".env"

settings = Settings()

def get_engine():
    """Get database engine based on settings."""
    return create_engine(
        settings.database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_pool_max_overflow,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=settings.debug
    )
```

## Deployment Best Practices

### Health Checks and Monitoring
```python
import time
from datetime import datetime
from typing import Dict, Any
from sqlmodel import select

class HealthCheckService:
    def __init__(self, session: Session):
        self.session = session

    def database_health_check(self) -> Dict[str, Any]:
        """Check database connectivity and performance."""
        try:
            start_time = time.time()

            # Simple query to test connectivity
            self.session.exec(select(User).limit(1)).first()

            response_time = time.time() - start_time

            return {
                "status": "healthy",
                "response_time_ms": round(response_time * 1000, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def application_health_check(self) -> Dict[str, Any]:
        """Comprehensive application health check."""
        db_health = self.database_health_check()

        return {
            "overall_status": "healthy" if db_health["status"] == "healthy" else "unhealthy",
            "database": db_health,
            "application_uptime": "running",
            "version": os.getenv("APP_VERSION", "unknown"),
            "timestamp": datetime.utcnow().isoformat()
        }
```

## Best Practices Summary

1. **Security First**: Always validate input, use parameterized queries, and implement proper authentication/authorization
2. **Performance Optimization**: Use proper indexing, connection pooling, and efficient query patterns
3. **Error Handling**: Implement comprehensive error handling with proper logging
4. **Testing**: Write comprehensive tests including unit, integration, and end-to-end tests
5. **Code Organization**: Use patterns like Service Layer and Repository Pattern for maintainability
6. **Configuration Management**: Use environment variables and settings management
7. **Monitoring**: Implement health checks and performance monitoring
8. **Documentation**: Document your models, APIs, and business logic clearly
9. **Version Control**: Use proper database migration strategies
10. **Code Quality**: Follow consistent naming conventions and code standards

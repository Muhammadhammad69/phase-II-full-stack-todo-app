---
name: sqlmodel-testing
description: Comprehensive testing strategies for SQLModel applications - learn how to test models, queries, CRUD operations, and database interactions. Use this skill when Claude needs to implement unit tests, integration tests, test fixtures, or testing strategies for SQLModel projects.
---

# SQLModel Testing

## Overview

This skill covers comprehensive testing strategies for SQLModel applications, including unit tests for models, integration tests for database operations, test fixture management, and testing best practices. Learn how to create robust test suites that ensure data integrity and application reliability.

## Unit Testing SQLModel Models

### Basic Model Testing
```python
import pytest
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

def test_user_creation():
    """Test basic user model creation."""
    user = User(name="John Doe", email="john@example.com")
    assert user.name == "John Doe"
    assert user.email == "john@example.com"
    assert user.id is None  # ID will be assigned by the database

def test_user_validation():
    """Test user model validation."""
    # Test that required fields are enforced
    with pytest.raises(ValueError):
        User()  # Should fail without required fields

    # Valid user creation
    user = User(name="Jane Doe", email="jane@example.com")
    assert user.name == "Jane Doe"
    assert user.email == "jane@example.com"
```

### Model Validation Testing
```python
from pydantic import ValidationError
from sqlmodel import Field
import pytest

class ValidatedUser(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=50)
    email: str = Field(regex=r'^[^@]+@[^@]+\.[^@]+$')
    age: Optional[int] = Field(default=None, ge=0, le=150)

def test_user_field_validation():
    """Test field validation rules."""
    # Valid user
    user = ValidatedUser(name="John", email="john@example.com", age=30)
    assert user.name == "John"
    assert user.email == "john@example.com"
    assert user.age == 30

    # Invalid name (too short)
    with pytest.raises(ValidationError):
        ValidatedUser(name="J", email="j@example.com")

    # Invalid email format
    with pytest.raises(ValidationError):
        ValidatedUser(name="John", email="invalid-email")

    # Invalid age (negative)
    with pytest.raises(ValidationError):
        ValidatedUser(name="John", email="john@example.com", age=-5)

    # Invalid age (too high)
    with pytest.raises(ValidationError):
        ValidatedUser(name="John", email="john@example.com", age=200)
```

## Testing with In-Memory Databases

### SQLite In-Memory Database Setup
```python
import pytest
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import StaticPool

@pytest.fixture(name="session")
def session_fixture():
    """Create an in-memory database session for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

def test_create_user(session: Session):
    """Test creating a user in the database."""
    user = User(name="Test User", email="test@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.id is not None
    assert user.name == "Test User"
    assert user.email == "test@example.com"

def test_read_user(session: Session):
    """Test reading a user from the database."""
    # Create a user first
    user = User(name="Test User", email="test@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    # Retrieve the user
    retrieved_user = session.get(User, user.id)
    assert retrieved_user is not None
    assert retrieved_user.name == user.name
    assert retrieved_user.email == user.email
```

### Test Database with Multiple Records
```python
@pytest.fixture(name="session_with_data")
def session_with_data_fixture():
    """Create a test database with predefined data."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Add test data
        users = [
            User(name="Alice", email="alice@example.com"),
            User(name="Bob", email="bob@example.com"),
            User(name="Charlie", email="charlie@example.com"),
        ]

        for user in users:
            session.add(user)
        session.commit()

        yield session

def test_read_multiple_users(session_with_data: Session):
    """Test reading multiple users."""
    from sqlmodel import select

    users = session_with_data.exec(select(User)).all()
    assert len(users) == 3

    names = {user.name for user in users}
    assert names == {"Alice", "Bob", "Charlie"}

def test_filter_users(session_with_data: Session):
    """Test filtering users."""
    from sqlmodel import select

    # Filter by name
    result = session_with_data.exec(
        select(User).where(User.name == "Alice")
    ).first()

    assert result is not None
    assert result.email == "alice@example.com"
```

## Integration Testing

### CRUD Operation Testing
```python
from sqlmodel import select

class UserService:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, name: str, email: str) -> User:
        user = User(name=name, email=email)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.session.get(User, user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.session.exec(
            select(User).where(User.email == email)
        ).first()

    def update_user(self, user_id: int, name: str = None, email: str = None) -> Optional[User]:
        user = self.session.get(User, user_id)
        if not user:
            return None

        if name:
            user.name = name
        if email:
            user.email = email

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete_user(self, user_id: int) -> bool:
        user = self.session.get(User, user_id)
        if not user:
            return False

        self.session.delete(user)
        self.session.commit()
        return True

def test_user_service_crud(session: Session):
    """Test complete CRUD operations with User service."""
    service = UserService(session)

    # CREATE
    created_user = service.create_user("Test User", "test@example.com")
    assert created_user.id is not None
    assert created_user.name == "Test User"
    assert created_user.email == "test@example.com"

    # READ by ID
    read_user = service.get_user_by_id(created_user.id)
    assert read_user is not None
    assert read_user.id == created_user.id

    # READ by email
    read_by_email = service.get_user_by_email("test@example.com")
    assert read_by_email is not None
    assert read_by_email.id == created_user.id

    # UPDATE
    updated_user = service.update_user(created_user.id, name="Updated Name")
    assert updated_user is not None
    assert updated_user.name == "Updated Name"
    assert updated_user.email == "test@example.com"  # Unchanged

    # DELETE
    deleted = service.delete_user(created_user.id)
    assert deleted is True

    # Verify deletion
    deleted_user = service.get_user_by_id(created_user.id)
    assert deleted_user is None
```

## Testing Relationships

### Relationship Testing
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")

    category: Optional[Category] = Relationship()

@pytest.fixture(name="session_with_relationships")
def session_with_relationships_fixture():
    """Create test database with related data."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Create category
        electronics = Category(name="Electronics")
        session.add(electronics)
        session.commit()
        session.refresh(electronics)

        # Create products in that category
        laptop = Product(name="Laptop", price=999.99, category_id=electronics.id)
        phone = Product(name="Phone", price=599.99, category_id=electronics.id)

        session.add(laptop)
        session.add(phone)
        session.commit()

        yield session

def test_relationship_loading(session_with_relationships: Session):
    """Test loading related objects."""
    from sqlmodel import select

    # Get a product and its category
    product = session_with_relationships.exec(
        select(Product)
        .where(Product.name == "Laptop")
    ).first()

    assert product is not None
    assert product.category_id is not None

    # Load the category separately
    category = session_with_relationships.get(Category, product.category_id)
    assert category is not None
    assert category.name == "Electronics"

def test_eager_loading(session_with_relationships: Session):
    """Test eager loading of relationships."""
    from sqlmodel import select
    from sqlalchemy.orm import selectinload

    # Using SQLAlchemy's relationship loading (would work similarly with SQLModel)
    # This is more complex with pure SQLModel, so we test the concept
    product = session_with_relationships.exec(
        select(Product)
        .where(Product.name == "Laptop")
    ).first()

    # Access the relationship (this triggers a separate query)
    assert product.category is not None
    assert product.category.name == "Electronics"
```

## Mocking and Isolation

### Mocking Database Dependencies
```python
from unittest.mock import Mock, MagicMock
import pytest

def test_user_service_with_mocked_session():
    """Test service layer with mocked database session."""
    # Create a mock session
    mock_session = Mock(spec=Session)

    # Mock the get method
    mock_user = User(id=1, name="Mock User", email="mock@example.com")
    mock_session.get.return_value = mock_user

    # Create service with mocked session
    service = UserService(mock_session)

    # Test reading user
    result = service.get_user_by_id(1)
    assert result is not None
    assert result.name == "Mock User"

    # Verify the session.get method was called correctly
    mock_session.get.assert_called_once_with(User, 1)

def test_create_user_with_mocked_commit():
    """Test create operation with mocked commit."""
    mock_session = Mock(spec=Session)

    # Setup return values
    new_user = User(id=1, name="New User", email="new@example.com")
    mock_session.add.return_value = None
    mock_session.commit.return_value = None
    mock_session.refresh.return_value = None

    service = UserService(mock_session)
    result = service.create_user("New User", "new@example.com")

    # We can't easily test the refresh result in a mock scenario,
    # so we focus on verifying the calls were made
    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()
```

## Test Fixtures and Factories

### Test Data Factory
```python
from dataclasses import dataclass
from faker import Faker

fake = Faker()

@dataclass
class UserDataFactory:
    """Factory for creating test user data."""

    @staticmethod
    def create_user(
        name: str = None,
        email: str = None,
        age: int = None
    ) -> User:
        """Create a user with optional overrides."""
        return User(
            name=name or fake.name(),
            email=email or fake.email(),
            age=age or fake.random_int(min=18, max=80)
        )

    @staticmethod
    def create_users(count: int) -> List[User]:
        """Create multiple users."""
        return [UserDataFactory.create_user() for _ in range(count)]

def test_with_factory_data(session: Session):
    """Test using the data factory."""
    factory_user = UserDataFactory.create_user(
        name="Factory User",
        email="factory@example.com"
    )

    session.add(factory_user)
    session.commit()
    session.refresh(factory_user)

    assert factory_user.name == "Factory User"
    assert factory_user.email == "factory@example.com"
    assert factory_user.age is not None

def test_multiple_users_with_factory(session: Session):
    """Test creating multiple users with factory."""
    users = UserDataFactory.create_users(5)

    for user in users:
        session.add(user)
    session.commit()

    # Verify all users were created
    from sqlmodel import select
    saved_users = session.exec(select(User)).all()
    assert len(saved_users) == 5
```

## Testing Queries and Complex Operations

### Query Testing
```python
def test_complex_queries(session: Session):
    """Test complex query operations."""
    from sqlmodel import select
    from sqlalchemy import func

    # Add test data
    users = [
        User(name="Alice", email="alice@example.com"),
        User(name="Bob", email="bob@example.com"),
        User(name="Alice Cooper", email="alice.cooper@example.com"),
    ]

    for user in users:
        session.add(user)
    session.commit()

    # Test query with LIKE
    alice_users = session.exec(
        select(User)
        .where(User.name.like("%Alice%"))
    ).all()

    assert len(alice_users) == 2

    # Test aggregation
    user_count = session.exec(
        select(func.count(User.id))
    ).one()

    assert user_count == 3

def test_query_with_joins(session: Session):
    """Test queries with joins (conceptual, since we don't have relationships here)."""
    from sqlmodel import select

    # Create test data
    user = User(name="Test User", email="test@example.com")
    session.add(user)
    session.commit()
    session.refresh(user)

    # Simulate a join-like operation
    result = session.exec(
        select(User)
        .where(User.id == user.id)
    ).first()

    assert result is not None
    assert result.id == user.id
```

## Testing Best Practices

### Parameterized Tests
```python
import pytest

@pytest.mark.parametrize("name,email", [
    ("Valid Name", "valid@example.com"),
    ("Another User", "another@test.org"),
    ("Test User", "test@domain.co.uk"),
])
def test_valid_user_creation(session: Session, name: str, email: str):
    """Test user creation with various valid inputs."""
    user = User(name=name, email=email)
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.name == name
    assert user.email == email

@pytest.mark.parametrize("name,email,error_type", [
    ("", "valid@example.com", ValueError),  # Empty name
    ("Valid", "", ValueError),              # Empty email
    ("A", "valid@example.com", ValidationError),  # Name too short
])
def test_invalid_user_creation(session: Session, name: str, email: str, error_type):
    """Test user creation with invalid inputs."""
    with pytest.raises(error_type):
        User(name=name, email=email)
```

### Test Cleanup and Teardown
```python
@pytest.fixture(name="clean_session")
def clean_session_fixture():
    """Create a session that's cleaned up after each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session

        # Clean up by dropping all data after test
        session.exec(select(User).where(User.id > 0))  # Just to access the table
        session.rollback()  # Though rollback may not work as expected in this context
        # For in-memory DB, it's automatically cleaned up when the engine is disposed

def test_with_clean_session(clean_session: Session):
    """Test with guaranteed clean session."""
    # Start with empty database
    from sqlmodel import select
    users_before = clean_session.exec(select(User)).all()
    assert len(users_before) == 0

    # Add a user
    user = User(name="Clean Test", email="clean@example.com")
    clean_session.add(user)
    clean_session.commit()

    # Verify user was added
    users_after = clean_session.exec(select(User)).all()
    assert len(users_after) == 1
```

## Pytest Configuration for SQLModel Testing

### conftest.py Configuration
```python
# conftest.py
import pytest
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import StaticPool

@pytest.fixture(scope="session")
def engine():
    """Create database engine once for the test session."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture
def session(engine):
    """Create a new database session for each test."""
    with Session(engine) as session:
        yield session

# Custom pytest markers
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
```

### Running Tests with Coverage
```bash
# Install coverage tools
pip install pytest-cov

# Run tests with coverage
pytest --cov=your_app --cov-report=html --cov-report=term

# Run only integration tests
pytest -m integration

# Run all tests except slow ones
pytest -m "not slow"
```

## Best Practices

1. **Use in-memory databases**: For faster unit tests, use SQLite in-memory databases
2. **Isolate test data**: Each test should start with a clean state
3. **Test both positive and negative cases**: Include tests for validation failures
4. **Use fixtures for common setup**: Reduce duplication with pytest fixtures
5. **Parameterize tests**: Test multiple scenarios with different inputs
6. **Test edge cases**: Empty results, boundary values, null values
7. **Mock external dependencies**: Isolate database tests from other services
8. **Use factories for test data**: Create consistent test data easily
9. **Test relationships**: Verify foreign key constraints and relationship loading
10. **Run tests in isolation**: Ensure tests don't depend on each other

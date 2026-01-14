import asyncio
from datetime import datetime, timedelta

import httpx
import jwt
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.config import settings
from app.main import app
from app.models.task import Task
from app.models.user import User


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db():
    """
    Create a test database session with in-memory SQLite
    """
    # Create an in-memory SQLite async engine for testing
    test_async_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False}
    )

    async with test_async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(test_async_engine) as session:
        yield session

    await test_async_engine.dispose()


@pytest.fixture(scope="function")
async def test_client(test_db):
    """
    Create a test client for the FastAPI app
    """
    from app.db.database import get_session

    # Override the get_session dependency to use the test database session
    app.dependency_overrides[get_session] = lambda: test_db

    # Create the test user in the database
    test_user = User(
        email="test@example.com",
        username="testuser"
    )
    test_db.add(test_user)
    await test_db.commit()
    await test_db.refresh(test_user)

    async with AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    # Clean up the dependency override after the test
    app.dependency_overrides.clear()


@pytest.fixture
def mock_token():
    """
    Create a mock JWT token for testing
    """
    payload = {
        "sub": "test@example.com",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return token


@pytest.fixture
def sample_user():
    """
    Create a sample user for testing
    """
    return User(
        email="test@example.com",
        username="testuser",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


@pytest.fixture
def sample_task():
    """
    Create a sample task for testing
    """
    return Task(
        user_email="test@example.com",
        title="Test Task",
        description="This is a test task",
        priority="medium",
        is_completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

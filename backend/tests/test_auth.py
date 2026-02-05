from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.config import settings


@pytest.mark.asyncio
async def test_token_decoding_valid(test_client, mock_token):
    """Test that valid tokens are properly decoded"""
    # The mock_token fixture already creates a valid token
    # Test by making a request that requires authentication
    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {mock_token}"}
    )
    # Should not return 401 (unauthorized) for valid token
    assert response.status_code != 401


@pytest.mark.asyncio
async def test_token_decoding_invalid(test_client):
    """Test that invalid tokens return appropriate error"""
    invalid_token = "invalid.token.here"

    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {invalid_token}"}
    )

    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "TOKEN_INVALID"


@pytest.mark.asyncio
async def test_token_expired(test_client):
    """Test that expired tokens return appropriate error"""
    expired_payload = {
        "sub": "test@example.com",
        "exp": datetime.now(timezone.utc) - timedelta(hours=1)  # Expired 1 hour ago
    }
    expired_token = jwt.encode(
        expired_payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )

    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {expired_token}"}
    )

    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "TOKEN_EXPIRED"


@pytest.mark.asyncio
async def test_unregistered_user(test_client):
    """Test that tokens with unregistered users return appropriate error"""
    # Create a token for a user that doesn't exist in the database
    payload = {
        "sub": "nonexistent@example.com",  # This user doesn't exist
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )

    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "USER_NOT_FOUND"


@pytest.mark.asyncio
async def test_bearer_token_format(test_client, mock_token):
    """Test that requests work with proper Bearer token format"""
    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {mock_token}"}
    )

    # Should not return 403 (forbidden) if token is properly formatted
    assert response.status_code != 403


@pytest.mark.asyncio
async def test_missing_token(test_client):
    """Test that requests without tokens are rejected"""
    response = await test_client.get("/api/v1/tasks/")

    assert response.status_code == 401  # Should return unauthorized


@pytest.mark.asyncio
async def test_malformed_token(test_client):
    """Test that malformed tokens are handled properly"""
    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": "Bearer"}
    )

    assert response.status_code == 401  # Should return unauthorized for malformed token


@pytest.mark.asyncio
async def test_wrong_auth_scheme(test_client, mock_token):
    """Test that non-Bearer auth schemes are rejected"""
    response = await test_client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Basic {mock_token}"}
    )

    # Should return unauthorized for wrong auth scheme
    assert response.status_code == 401

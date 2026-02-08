#!/usr/bin/env python3
"""
Script to create a test user in the database.
"""

import asyncio
from sqlmodel import select

# Import both models to resolve circular reference
from app.models import user, task  # noqa: F401
from app.db.database import get_session
from app.models.user import User


async def create_test_user():
    """Create a test user in the database."""
    async for session in get_session():
        try:
            # Check if user already exists
            statement = select(User).where(User.email == 'test@example.com')
            result = await session.exec(statement)
            existing_user = result.first()

            if not existing_user:
                # Create a new test user
                test_user = User(email='test@example.com', username='testuser')
                session.add(test_user)
                await session.commit()
                await session.refresh(test_user)
                print(f'Test user created successfully! User ID: {test_user.email}')
            else:
                print(f'Test user already exists! User ID: {existing_user.email}')
            break  # Exit the async generator
        except Exception as e:
            print(f'Error creating test user: {e}')
            await session.rollback()
            break


if __name__ == "__main__":
    asyncio.run(create_test_user())
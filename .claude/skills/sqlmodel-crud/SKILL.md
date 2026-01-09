---
name: sqlmodel-crud
description: Complete CRUD operations with SQLModel - Create, Read, Update, Delete operations for database records. Use this skill when Claude needs to implement database operations, data manipulation, record management, or basic database interactions using SQLModel.
---

# SQLModel CRUD Operations

## Overview

This skill covers the complete Create, Read, Update, and Delete (CRUD) operations with SQLModel. Learn how to implement all basic database operations efficiently while maintaining type safety and validation.

## Create Operations

### Basic Record Creation
```python
from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

def create_user(session: Session, user_data: User) -> User:
    """Create a new user record."""
    user = User(name=user_data.name, email=user_data.email)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# Usage
with Session(engine) as session:
    new_user = User(name="John Doe", email="john@example.com")
    created_user = create_user(session, new_user)
    print(f"Created user: {created_user}")
```

### Bulk Creation
```python
def create_multiple_users(session: Session, users_data: list[User]) -> list[User]:
    """Create multiple user records in a single transaction."""
    users = []
    for user_data in users_data:
        user = User(name=user_data.name, email=user_data.email)
        users.append(user)

    session.add_all(users)
    session.commit()

    # Refresh all users to get their IDs
    for user in users:
        session.refresh(user)

    return users

# Usage
users_to_create = [
    User(name="Alice", email="alice@example.com"),
    User(name="Bob", email="bob@example.com"),
    User(name="Charlie", email="charlie@example.com")
]

with Session(engine) as session:
    created_users = create_multiple_users(session, users_to_create)
```

## Read Operations

### Single Record Retrieval
```python
def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    """Get a single user by ID."""
    return session.get(User, user_id)

def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get a single user by email."""
    return session.exec(
        User.select().where(User.email == email)
    ).first()

# Usage
with Session(engine) as session:
    user = get_user_by_id(session, 1)
    if user:
        print(f"Found user: {user}")
    else:
        print("User not found")
```

### Multiple Records Retrieval
```python
from sqlmodel import select

def get_all_users(session: Session) -> list[User]:
    """Get all users."""
    users = session.exec(select(User)).all()
    return users

def get_users_with_pagination(session: Session, offset: int = 0, limit: int = 10) -> list[User]:
    """Get users with pagination."""
    users = session.exec(
        select(User).offset(offset).limit(limit)
    ).all()
    return users

def get_users_by_name_prefix(session: Session, prefix: str) -> list[User]:
    """Get users whose names start with the given prefix."""
    users = session.exec(
        select(User).where(User.name.startswith(prefix))
    ).all()
    return users

# Usage
with Session(engine) as session:
    all_users = get_all_users(session)
    paginated_users = get_users_with_pagination(session, offset=0, limit=5)
    users_with_a = get_users_by_name_prefix(session, "A")
```

### Advanced Filtering
```python
from datetime import datetime
from sqlmodel import select, and_, or_

def get_users_with_filters(
    session: Session,
    name_contains: Optional[str] = None,
    email_domain: Optional[str] = None,
    created_after: Optional[datetime] = None
) -> list[User]:
    """Get users with multiple filters."""
    query = select(User)

    if name_contains:
        query = query.where(User.name.contains(name_contains))

    if email_domain:
        query = query.where(User.email.contains(f"@{email_domain}"))

    if created_after:
        # Assuming there's a created_at field in User model
        query = query.where(User.created_at > created_after)

    users = session.exec(query).all()
    return users

def complex_user_query(session: Session, min_age: int, active_only: bool = True) -> list[User]:
    """Example of complex query with multiple conditions."""
    query = select(User)

    # Assuming User has age and is_active fields
    conditions = []

    if min_age:
        # Assuming there's an age field in User model
        conditions.append(User.age >= min_age)

    if active_only:
        # Assuming there's an is_active field in User model
        conditions.append(User.is_active == True)

    if conditions:
        query = query.where(and_(*conditions))

    users = session.exec(query).all()
    return users
```

## Update Operations

### Single Record Update
```python
def update_user(session: Session, user_id: int, update_data: dict) -> Optional[User]:
    """Update a user with the given data."""
    user = session.get(User, user_id)
    if not user:
        return None

    # Update fields dynamically
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def update_user_partial(session: Session, user_id: int, name: Optional[str] = None, email: Optional[str] = None) -> Optional[User]:
    """Update specific fields of a user."""
    user = session.get(User, user_id)
    if not user:
        return None

    if name is not None:
        user.name = name
    if email is not None:
        user.email = email

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# Usage
with Session(engine) as session:
    updated_user = update_user_partial(session, 1, name="John Smith")
    if updated_user:
        print(f"Updated user: {updated_user}")
```

### Bulk Updates
```python
from sqlalchemy import update

def bulk_update_users(session: Session, user_ids: list[int], update_data: dict) -> int:
    """Update multiple users at once."""
    # Using SQLAlchemy's update statement for bulk operations
    stmt = (
        update(User)
        .where(User.id.in_(user_ids))
        .values(**update_data)
    )

    result = session.exec(stmt)
    session.commit()
    return result.rowcount

def activate_users(session: Session, user_ids: list[int]) -> int:
    """Activate multiple users."""
    stmt = (
        update(User)
        .where(User.id.in_(user_ids))
        .values(is_active=True)
    )

    result = session.exec(stmt)
    session.commit()
    return result.rowcount

# Usage
with Session(engine) as session:
    affected_count = bulk_update_users(session, [1, 2, 3], {"is_active": True})
    print(f"Updated {affected_count} users")
```

## Delete Operations

### Single Record Deletion
```python
def delete_user(session: Session, user_id: int) -> bool:
    """Delete a user by ID."""
    user = session.get(User, user_id)
    if not user:
        return False

    session.delete(user)
    session.commit()
    return True

def delete_user_by_email(session: Session, email: str) -> bool:
    """Delete a user by email."""
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        return False

    session.delete(user)
    session.commit()
    return True

# Usage
with Session(engine) as session:
    success = delete_user(session, 1)
    if success:
        print("User deleted successfully")
    else:
        print("User not found")
```

### Bulk Deletion
```python
from sqlalchemy import delete

def delete_users_by_ids(session: Session, user_ids: list[int]) -> int:
    """Delete multiple users by their IDs."""
    stmt = delete(User).where(User.id.in_(user_ids))
    result = session.exec(stmt)
    session.commit()
    return result.rowcount

def delete_inactive_users(session: Session, days_inactive: int) -> int:
    """Delete users who have been inactive for specified number of days."""
    from datetime import datetime, timedelta

    cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)

    stmt = delete(User).where(User.last_login < cutoff_date)
    result = session.exec(stmt)
    session.commit()
    return result.rowcount

# Usage
with Session(engine) as session:
    deleted_count = delete_users_by_ids(session, [1, 2, 3])
    print(f"Deleted {deleted_count} users")
```

## Complete CRUD Service Pattern

### User Service Class
```python
from typing import List, Optional
from sqlmodel import Session, select
from contextlib import contextmanager

class UserService:
    def __init__(self, session: Session):
        self.session = session

    def create(self, user_data: User) -> User:
        """Create a new user."""
        user = User.model_validate(user_data)
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

    def get_all(self, offset: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination."""
        return self.session.exec(
            select(User).offset(offset).limit(limit)
        ).all()

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

# Usage
with Session(engine) as session:
    user_service = UserService(session)

    # Create
    new_user = User(name="Jane Doe", email="jane@example.com")
    created_user = user_service.create(new_user)

    # Read
    user = user_service.get_by_id(created_user.id)

    # Update
    updated_user = user_service.update(created_user.id, name="Jane Smith")

    # Delete
    deleted = user_service.delete(created_user.id)
```

## Error Handling and Transactions

### Safe CRUD Operations with Error Handling
```python
from typing import Optional
import logging

def safe_create_user(session: Session, user_data: User) -> Optional[User]:
    """Safely create a user with error handling."""
    try:
        user = User.model_validate(user_data)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        session.rollback()
        logging.error(f"Error creating user: {e}")
        return None

def safe_update_user(session: Session, user_id: int, **kwargs) -> Optional[User]:
    """Safely update a user with error handling."""
    try:
        user = session.get(User, user_id)
        if not user:
            return None

        for field, value in kwargs.items():
            if hasattr(user, field):
                setattr(user, field, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        session.rollback()
        logging.error(f"Error updating user {user_id}: {e}")
        return None

def safe_delete_user(session: Session, user_id: int) -> bool:
    """Safely delete a user with error handling."""
    try:
        user = session.get(User, user_id)
        if not user:
            return False

        session.delete(user)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        logging.error(f"Error deleting user {user_id}: {e}")
        return False
```

## Performance Optimization

### Using Eager Loading
```python
from sqlmodel import select
from sqlalchemy.orm import selectinload

def get_user_with_related_data(session: Session, user_id: int):
    """Get user with related data using eager loading."""
    # Assuming User has relationships to posts and comments
    result = session.exec(
        select(User)
        .options(selectinload(User.posts))
        .options(selectinload(User.comments))
        .where(User.id == user_id)
    ).first()
    return result
```

### Batch Operations
```python
def batch_create_users(session: Session, users_data: List[dict], batch_size: int = 100) -> List[User]:
    """Create users in batches for better performance."""
    all_created_users = []

    for i in range(0, len(users_data), batch_size):
        batch = users_data[i:i + batch_size]
        batch_users = [User.model_validate(data) for data in batch]

        session.add_all(batch_users)
        session.flush()  # Get IDs without committing

        all_created_users.extend(batch_users)

    session.commit()
    return all_created_users
```

## Best Practices

1. **Always use transactions**: Wrap related operations in transactions
2. **Handle errors gracefully**: Use try-catch blocks and rollback on errors
3. **Validate input**: Always validate data before inserting to database
4. **Use pagination**: For large datasets, always implement pagination
5. **Optimize queries**: Use indexes and avoid N+1 query problems
6. **Close sessions properly**: Use context managers or ensure proper cleanup
7. **Return consistent types**: Always return the same data types from similar functions
8. **Use meaningful function names**: Make CRUD operations clear from function names

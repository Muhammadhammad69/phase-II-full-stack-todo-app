---
name: sqlmodel-advanced-features
description: Advanced SQLModel features including custom types, custom fields, async operations, performance optimization, and advanced querying techniques. Use this skill when Claude needs to work with advanced SQLModel capabilities, custom data types, async database operations, or performance optimization techniques.
---

# SQLModel Advanced Features

## Overview

This skill covers advanced SQLModel features including custom types, async operations, performance optimization techniques, and advanced querying patterns. Learn how to leverage SQLModel's full capabilities for complex applications and performance-critical scenarios.

## Custom Types and Fields

### Custom SQL Types
```python
from sqlalchemy.types import TypeDecorator, String
from sqlmodel import SQLModel, Field
from typing import Optional
import json

class JSONList(TypeDecorator):
    """Custom type for storing lists as JSON."""
    impl = String

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return value

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tags: Optional[list[str]] = Field(default=None, sa_column=JSONList(1000))
```

### Custom Field Types
```python
from sqlalchemy.types import TypeDecorator
from sqlmodel import SQLModel, Field
from typing import Optional
import uuid

class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        return dialect.type_descriptor(String(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif isinstance(value, uuid.UUID):
            return value.hex
        else:
            # Assume it's a string that's already hex
            return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return uuid.UUID(value)

class Record(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        sa_column_kwargs={"type_": GUID()}
    )
    name: str
```

### Custom Field Constraints
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy import CheckConstraint

class Product(SQLModel, table=True):
    __table_args__ = (
        CheckConstraint("price > 0", name="positive_price"),
        CheckConstraint("quantity >= 0", name="non_negative_quantity"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float = Field(gt=0)  # Greater than 0
    quantity: int = Field(ge=0)  # Greater than or equal to 0
    description: Optional[str] = Field(default=None, max_length=1000)
```

## Async Operations

### Async Database Operations
```python
import asyncio
from sqlmodel import SQLModel, Field, create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession as SQLAlchemyAsyncSession
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

# Create async engine
async_engine = create_async_engine("sqlite+aiosqlite:///./test.db")

async def create_user_async(user_data: dict):
    """Create a user asynchronously."""
    async with AsyncSession(async_engine) as session:
        user = User(**user_data)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

async def get_user_async(user_id: int):
    """Get a user asynchronously."""
    async with AsyncSession(async_engine) as session:
        user = await session.get(User, user_id)
        return user

async def get_all_users_async():
    """Get all users asynchronously."""
    from sqlmodel import select

    async with AsyncSession(async_engine) as session:
        result = await session.exec(select(User))
        users = result.all()
        return users

# Usage
async def main():
    # Create tables
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create a user
    user_data = {"name": "John Doe", "email": "john@example.com"}
    user = await create_user_async(user_data)
    print(f"Created user: {user}")

    # Get the user
    retrieved_user = await get_user_async(user.id)
    print(f"Retrieved user: {retrieved_user}")

    # Get all users
    all_users = await get_all_users_async()
    print(f"Total users: {len(all_users)}")

# Run the async function
# asyncio.run(main())
```

### Async CRUD Service
```python
from typing import List, Optional
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

class AsyncUserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_data: dict) -> User:
        """Create a new user asynchronously."""
        user = User.model_validate(user_data)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID asynchronously."""
        return await self.session.get(User, user_id)

    async def get_all(self, offset: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination asynchronously."""
        result = await self.session.exec(
            select(User).offset(offset).limit(limit)
        )
        return result.all()

    async def update(self, user_id: int, **kwargs) -> Optional[User]:
        """Update user fields asynchronously."""
        user = await self.session.get(User, user_id)
        if not user:
            return None

        for field, value in kwargs.items():
            if hasattr(user, field):
                setattr(user, field, value)

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        """Delete user by ID asynchronously."""
        user = await self.session.get(User, user_id)
        if not user:
            return False

        await self.session.delete(user)
        await self.session.commit()
        return True
```

## Performance Optimization

### Connection Pooling and Engine Configuration
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlmodel import SQLModel

def create_optimized_engine(database_url: str):
    """Create an optimized database engine with proper pooling."""
    return create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=20,           # Number of connections to maintain
        max_overflow=30,        # Additional connections beyond pool_size
        pool_pre_ping=True,     # Verify connections before use
        pool_recycle=3600,      # Recycle connections after 1 hour
        echo=False,             # Set to True for debugging
        connect_args={
            "check_same_thread": False  # Needed for SQLite
        }
    )

# For async
from sqlalchemy.ext.asyncio import create_async_engine

def create_optimized_async_engine(database_url: str):
    """Create an optimized async database engine."""
    return create_async_engine(
        database_url,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
```

### Query Optimization Techniques
```python
from sqlalchemy.orm import selectinload, joinedload
from sqlmodel import select

class OptimizedUserService:
    def __init__(self, session):
        self.session = session

    async def get_user_with_posts_optimized(self, user_id: int):
        """Get user with posts using optimized loading."""
        # Use selectinload for efficient loading of related objects
        result = await self.session.exec(
            select(User)
            .options(selectinload(User.posts))
            .where(User.id == user_id)
        )
        return result.first()

    async def get_users_batch_optimized(self, user_ids: list[int]):
        """Get multiple users efficiently."""
        result = await self.session.exec(
            select(User)
            .where(User.id.in_(user_ids))
            .options(selectinload(User.posts))
        )
        return result.all()

    def get_users_with_counts_only(self):
        """Get users with post counts without loading posts."""
        from sqlalchemy import func

        return self.session.exec(
            select(
                User.id,
                User.name,
                func.count(Post.id).label('post_count')
            )
            .join(Post, isouter=True)
            .group_by(User.id)
        ).all()
```

### Batch Operations
```python
async def batch_create_users_async(session, users_data: list[dict], batch_size: int = 100):
    """Create users in batches for better performance."""
    all_created_users = []

    for i in range(0, len(users_data), batch_size):
        batch = users_data[i:i + batch_size]
        batch_users = [User.model_validate(data) for data in batch]

        session.add_all(batch_users)
        await session.flush()  # Get IDs without committing

        all_created_users.extend(batch_users)

    await session.commit()
    return all_created_users

async def batch_update_users_async(session, updates: list[dict]):
    """Update multiple users efficiently."""
    from sqlalchemy import update

    for update_data in updates:
        user_id = update_data.pop('id')
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(**update_data)
        )
        await session.exec(stmt)

    await session.commit()
```

## Advanced Querying Techniques

### Raw SQL Queries
```python
from sqlalchemy import text

class AdvancedQueryService:
    def __init__(self, session):
        self.session = session

    async def complex_aggregation_raw_sql(self):
        """Execute complex aggregation using raw SQL."""
        raw_sql = text("""
            SELECT
                u.name,
                COUNT(p.id) as post_count,
                AVG(LENGTH(p.content)) as avg_content_length,
                MAX(p.created_at) as latest_post
            FROM user u
            LEFT JOIN post p ON u.id = p.user_id
            GROUP BY u.id, u.name
            HAVING COUNT(p.id) > 0
            ORDER BY post_count DESC
            LIMIT 10
        """)

        result = await self.session.exec(raw_sql)
        return result.fetchall()

    def raw_sql_with_parameters(self, min_posts: int):
        """Execute raw SQL with parameters."""
        raw_sql = text("""
            SELECT u.id, u.name, u.email
            FROM user u
            WHERE u.id IN (
                SELECT user_id
                FROM post
                GROUP BY user_id
                HAVING COUNT(*) >= :min_posts
            )
        """)

        result = self.session.exec(raw_sql, {"min_posts": min_posts})
        return result.all()
```

### Advanced Filtering and Search
```python
from sqlalchemy import and_, or_, func
from datetime import datetime

class SearchService:
    def __init__(self, session):
        self.session = session

    async def advanced_user_search(self,
                                 name_pattern: Optional[str] = None,
                                 min_age: Optional[int] = None,
                                 email_domains: Optional[list[str]] = None,
                                 created_after: Optional[datetime] = None):
        """Advanced user search with multiple optional filters."""
        query = select(User)

        conditions = []
        if name_pattern:
            conditions.append(User.name.ilike(f"%{name_pattern}%"))
        if min_age:
            conditions.append(User.age >= min_age)
        if email_domains:
            email_conditions = [User.email.like(f"%@{domain}") for domain in email_domains]
            conditions.append(or_(*email_conditions))
        if created_after:
            conditions.append(User.created_at >= created_after)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.session.exec(query)
        return result.all()

    def full_text_search(self, search_term: str):
        """Perform full-text search (PostgreSQL example)."""
        # This is PostgreSQL specific
        search_sql = text("""
            SELECT * FROM user
            WHERE to_tsvector('english', name || ' ' || email)
            @@ plainto_tsquery('english', :search_term)
        """)

        result = self.session.exec(search_sql, {"search_term": search_term})
        return result.all()
```

## Custom Model Behaviors

### Model Events and Hooks
```python
from sqlalchemy import event
from datetime import datetime

class TimestampMixin:
    """Mixin to add timestamp fields."""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(TimestampMixin, SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

# SQLAlchemy events for automatic timestamp updates
@event.listens_for(User, "before_update")
def before_update(mapper, connection, target):
    target.updated_at = datetime.utcnow()

@event.listens_for(User, "before_insert")
def before_insert(mapper, connection, target):
    if not hasattr(target, 'created_at') or target.created_at is None:
        target.created_at = datetime.utcnow()
    target.updated_at = datetime.utcnow()
```

### Custom Model Methods
```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    is_active: bool = True

    def is_valid_email(self) -> bool:
        """Check if email format is valid."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, self.email) is not None

    def get_display_name(self) -> str:
        """Get display name for the user."""
        return self.name or self.email.split('@')[0]

    @classmethod
    def create_inactive_user(cls, name: str, email: str):
        """Factory method for creating inactive users."""
        return cls(name=name, email=email, is_active=False)

    def to_dict(self, exclude: set = None) -> dict:
        """Convert model to dictionary with optional exclusions."""
        if exclude is None:
            exclude = set()

        # Get all field names
        field_names = {field.name for field in self.__fields__.values()}
        data = {}

        for field_name in field_names:
            if field_name not in exclude:
                data[field_name] = getattr(self, field_name)

        return data
```

## Advanced Relationship Patterns

### Dynamic Relationships
```python
from sqlalchemy.ext.associationproxy import association_proxy

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class UserGroupLink(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    group_id: int = Field(foreign_key="group.id", primary_key=True)
    role: str = "member"

# Many-to-many with association object
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    # Relationship through association object
    group_links: List["UserGroupLink"] = Relationship(back_populates="user")
    groups: List["Group"] = Relationship(
        back_populates="users",
        link_model="UserGroupLink"
    )

    # Association proxy to get roles directly
    roles: List[str] = association_proxy("group_links", "role")

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    user_links: List["UserGroupLink"] = Relationship(back_populates="group")
    users: List["User"] = Relationship(
        back_populates="groups",
        link_model="UserGroupLink"
    )
```

### Polymorphic Associations
```python
from sqlalchemy.ext.declarative import declared_attr

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str

    # Generic foreign key
    item_id: int
    item_type: str  # 'post', 'product', etc.

    @declared_attr
    def item(cls):
        """Dynamically determine the relationship based on item_type."""
        # This is more complex in practice and may require additional logic
        return Relationship()

# Alternative approach with separate relationships
class PostComment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    post_id: int = Field(foreign_key="post.id")
    user_id: int = Field(foreign_key="user.id")

class ProductComment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    product_id: int = Field(foreign_key="product.id")
    user_id: int = Field(foreign_key="user.id")
```

## Caching Strategies

### Simple In-Memory Caching
```python
import time
from functools import wraps

# Simple cache implementation
class SimpleCache:
    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self.cache = {}
        self.default_ttl = default_ttl

    def get(self, key: str):
        if key in self.cache:
            value, timestamp, ttl = self.cache[key]
            if time.time() - timestamp < ttl:
                return value
            else:
                # Expired, remove from cache
                del self.cache[key]
        return None

    def set(self, key: str, value, ttl: int = None):
        if ttl is None:
            ttl = self.default_ttl
        self.cache[key] = (value, time.time(), ttl)

    def delete(self, key: str):
        if key in self.cache:
            del self.cache[key]

# Global cache instance
model_cache = SimpleCache()

def cached_query(cache_key: str, ttl: int = 300):
    """Decorator to cache query results."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Try to get from cache first
            cached_result = model_cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Execute the function and cache the result
            result = await func(*args, **kwargs)
            model_cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

# Usage
@cached_query("all_users", ttl=600)  # Cache for 10 minutes
async def get_all_users_cached(session):
    result = await session.exec(select(User))
    return result.all()
```

## Best Practices

1. **Use appropriate loading strategies**: Choose between lazy, selectin, and joined loading based on use case
2. **Implement proper connection pooling**: Configure pool size and recycling for production
3. **Batch operations when possible**: Use bulk operations for multiple records
4. **Use indexes wisely**: Create indexes for frequently queried columns
5. **Avoid N+1 queries**: Always consider the query pattern when accessing relationships
6. **Implement caching for read-heavy operations**: Use appropriate caching strategies
7. **Use async operations for I/O bound tasks**: Leverage async for better performance
8. **Optimize complex queries**: Use raw SQL when ORM abstractions become limiting
9. **Implement proper error handling**: Handle database-specific exceptions
10. **Monitor query performance**: Use tools to analyze slow queries

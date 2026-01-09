---
name: fastapi-database
description: Connect FastAPI to SQL databases using SQLAlchemy. Learn ORM patterns and database CRUD operations. Use this skill when Claude needs to work with database integration, SQLAlchemy setup, database models, session management, CRUD operations with database, or relationships in FastAPI applications.
---

# Database Integration in FastAPI

## Overview
Database integration is a fundamental aspect of most web applications. FastAPI works seamlessly with SQLAlchemy, the popular Python SQL toolkit and Object-Relational Mapping (ORM) library. This guide covers setting up database connections, defining models, performing CRUD operations, and managing database sessions.

## SQLAlchemy Setup

Basic SQLAlchemy setup with FastAPI:

```python
from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database URL - adjust for your database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# Database model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
```

## Database Session Dependency

Create a dependency to handle database sessions:

```python
from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Use the dependency in your routes
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Creating Database Models

Define SQLAlchemy models for your data:

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to posts
    posts = relationship("Post", back_populates="owner")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationship back to user
    owner = relationship("User", back_populates="posts")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

## CRUD Operations

Implement Create, Read, Update, and Delete operations:

```python
from pydantic import BaseModel
from typing import List, Optional

# Pydantic models for API
class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

# CRUD functions
def create_user(db: Session, user: UserCreate):
    db_user = User(
        email=user.email,
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return False

    db.delete(db_user)
    db.commit()
    return True

# API endpoints using CRUD functions
@app.post("/users/", response_model=User)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@app.get("/users/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, user_id)
    if not db_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users/", response_model=List[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users
```

## Advanced Querying

Perform complex database queries:

```python
from sqlalchemy import and_, or_, desc, func

@app.get("/users/search")
def search_users(
    email: Optional[str] = None,
    name: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if email:
        query = query.filter(User.email.contains(email))
    if name:
        query = query.filter(User.name.contains(name))
    if active_only:
        query = query.filter(User.is_active == True)

    return query.all()

@app.get("/users/stats")
def get_user_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users
    }

@app.get("/users/sorted")
def get_sorted_users(
    sort_by: str = "name",
    order: str = "asc",
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if sort_by == "name":
        if order == "desc":
            query = query.order_by(desc(User.name))
        else:
            query = query.order_by(User.name)
    elif sort_by == "email":
        if order == "desc":
            query = query.order_by(desc(User.email))
        else:
            query = query.order_by(User.email)

    return query.all()
```

## Relationships and Joins

Work with related data using SQLAlchemy relationships:

```python
# Pydantic models with relationships
class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class UserWithPosts(User):
    posts: List[Post] = []

# CRUD for posts
def create_post(db: Session, post: PostCreate, user_id: int):
    db_post = Post(**post.dict(), owner_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.post("/users/{user_id}/posts/", response_model=Post)
def create_post_for_user(
    user_id: int,
    post: PostCreate,
    db: Session = Depends(get_db)
):
    db_user = get_user(db, user_id)
    if not db_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    return create_post(db, post, user_id)

@app.get("/users/{user_id}/posts", response_model=List[Post])
def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    return db.query(Post).filter(Post.owner_id == user_id).all()

@app.get("/users-with-posts", response_model=List[UserWithPosts])
def get_users_with_posts(db: Session = Depends(get_db)):
    return db.query(User).options().all()  # This will include posts if properly configured
```

## Database Migrations

Set up Alembic for database migrations:

```python
# alembic.ini (simplified)
# This would be in a separate file
# [alembic]
# script_location = alembic
# sqlalchemy.url = sqlite:///./test.db

# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Import your models
from main import Base

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
```

## Async Database Operations

Use async database libraries like databases and asyncpg:

```python
import databases
import sqlalchemy
from fastapi import FastAPI
from pydantic import BaseModel

# For async operations
DATABASE_URL = "postgresql://user:password@localhost/dbname"
database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String(50)),
    sqlalchemy.Column("email", sqlalchemy.String(120)),
)

engine = sqlalchemy.create_engine(DATABASE_URL)

metadata.create_all(engine)

app = FastAPI()

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

class UserIn(BaseModel):
    name: str
    email: str

@app.post("/users/")
async def create_user(user: UserIn):
    query = users.insert().values(name=user.name, email=user.email)
    user_id = await database.execute(query)
    return {"id": user_id, **user.dict()}
```

## Connection Pooling

Configure connection pooling for better performance:

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Production database URL
DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,  # Number of connections to maintain
    max_overflow=20,  # Additional connections beyond pool_size
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
)
```

## Database Session Management Best Practices

Implement proper session management:

```python
from contextlib import contextmanager
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

@contextmanager
def get_db_session():
    """
    Context manager for database sessions.
    Ensures session is properly closed even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Alternative dependency with error handling
def get_db_with_error_handling():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

# Use in your endpoints
@app.get("/users/{user_id}")
def get_user_safe(user_id: int, db: Session = Depends(get_db_with_error_handling)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Database Testing

Test your database operations:

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, User, Base

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create tables
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_user():
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "name": "Test User"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"

def test_get_user():
    # First create a user
    create_response = client.post(
        "/users/",
        json={"email": "get@example.com", "name": "Get User"}
    )
    user_id = create_response.json()["id"]

    # Then retrieve it
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "get@example.com"
    assert data["name"] == "Get User"
```

## Common Database Patterns

### Repository Pattern
```python
class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> User:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_create: UserCreate) -> User:
        db_user = User(**user_create.dict())
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: int, user_update: UserUpdate) -> User:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None

        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete(self, user_id: int) -> bool:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return False

        self.db.delete(db_user)
        self.db.commit()
        return True

# Use in your endpoints
@app.post("/users/", response_model=User)
def create_user_endpoint(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    return user_repo.create(user)
```

## Common Mistakes to Avoid

1. **Not Closing Sessions**: Always close database sessions to prevent connection leaks
2. **Not Using Transactions**: Use transactions for operations that need to be atomic
3. **N+1 Query Problem**: Use eager loading to avoid multiple queries
4. **SQL Injection**: SQLAlchemy's ORM protects against injection, but be careful with raw queries
5. **Not Indexing Properly**: Add database indexes for frequently queried columns
6. **Not Using Connection Pooling**: Configure proper connection pooling for production
7. **Not Handling Concurrency**: Consider optimistic locking for concurrent updates

## Real-World Use Cases

### E-commerce Product Catalog
```python
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.sql import func
from typing import List, Optional

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"))
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", back_populates="products")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    image_url = Column(String)
    is_primary = Column(Boolean, default=False)

# Pydantic models
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    stock_quantity: int

class Product(ProductBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

# API endpoints
@app.get("/products/", response_model=List[Product])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)

    return query.offset(skip).limit(limit).all()

@app.get("/categories/{category_id}/products", response_model=List[Product])
def get_category_products(category_id: int, db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.category_id == category_id).all()
```

### Blog Platform
```python
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    author = relationship("User", back_populates="blog_posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("blog_posts.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="comments")
    post = relationship("BlogPost", back_populates="comments")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

# Many-to-many relationship
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("blog_posts.id")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)

# Add relationships to BlogPost
BlogPost.tags = relationship("Tag", secondary=post_tags, back_populates="posts")
Tag.posts = relationship("BlogPost", secondary=post_tags, back_populates="tags")
```

## Quick Reference

- **SQLAlchemy Setup**: `create_engine()`, `sessionmaker()`, `declarative_base()`
- **Database URL**: Format depends on database type (PostgreSQL, MySQL, SQLite)
- **Session Dependency**: Use `Depends(get_db)` for session management
- **CRUD Operations**: `db.add()`, `db.commit()`, `db.refresh()`, `db.delete()`
- **Queries**: `db.query(Model).filter()`, `.all()`, `.first()`, `.offset().limit()`
- **Relationships**: Use `relationship()` and `ForeignKey()` for related models
- **Pydantic Config**: Set `orm_mode = True` to work with SQLAlchemy models
- **Error Handling**: Always close sessions and handle exceptions properly

## Performance Tips

1. **Use Indexes**: Add database indexes to frequently queried columns
2. **Eager Loading**: Use `joinedload()` to avoid N+1 query problems
3. **Connection Pooling**: Configure proper connection pooling for production
4. **Query Optimization**: Use `options()` to load related data efficiently
5. **Batch Operations**: Use bulk operations for multiple record updates
6. **Caching**: Consider caching frequently accessed data
7. **Pagination**: Always implement pagination for large datasets
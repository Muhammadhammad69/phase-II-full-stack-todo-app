---
name: sqlmodel-basics
description: Introduction to SQLModel - the Python library that combines SQLAlchemy and Pydantic. Learn how to define models, connect to databases, and perform basic operations. Use this skill when Claude needs to work with SQLModel for database modeling, basic CRUD operations, model definitions, or initial setup of SQLModel projects.
---

# SQLModel Basics

## Overview

SQLModel is a Python library that combines the power of SQLAlchemy for database operations with Pydantic for data validation. It's designed to provide the best of both worlds: type hints, data validation, and serialization from Pydantic, with the robust database capabilities of SQLAlchemy.

## Quick Start with SQLModel

Basic SQLModel setup and usage:

```python
from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional

# Define a model
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    age: Optional[int] = Field(default=None)

# Create engine and tables
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

# Create tables
SQLModel.metadata.create_all(engine)

# Create a session and add a user
with Session(engine) as session:
    new_user = User(name="John Doe", email="john@example.com", age=30)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    print(f"Created user: {new_user}")
```

## Model Definition Patterns

### Basic Model with Constraints
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100, index=True)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(gt=0)  # Greater than 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
```

### Using Different Field Types
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum

class Category(str, Enum):
    ELECTRONICS = "electronics"
    BOOKS = "books"
    CLOTHING = "clothing"

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: Decimal = Field(decimal_places=2, max_digits=10)
    category: Category
    created_at: datetime = Field(default_factory=datetime.utcnow)
    rating: Optional[float] = Field(default=None, ge=0, le=5)  # Between 0 and 5
```

## Database Connection Patterns

### SQLite Setup
```python
from sqlmodel import create_engine

# For development/testing
sqlite_url = "sqlite:///./test.db"
engine = create_engine(sqlite_url, echo=True)  # echo=True for debugging
```

### PostgreSQL Setup
```python
from sqlmodel import create_engine

# For production
database_url = "postgresql://user:password@localhost/dbname"
engine = create_engine(database_url)
```

### MySQL Setup
```python
from sqlmodel import create_engine

# For MySQL
database_url = "mysql://user:password@localhost/dbname"
engine = create_engine(database_url)
```

## Session Management

### Context Manager Pattern
```python
from sqlmodel import Session

def create_user(user_data: User):
    with Session(engine) as session:
        user = User(**user_data.dict())
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
```

### Dependency Injection for FastAPI
```python
from fastapi import Depends
from sqlmodel import Session, create_engine

def get_session():
    with Session(engine) as session:
        yield session

# In your FastAPI routes
@app.post("/users/")
def create_user(user: User, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
```

## Common Field Configurations

### Primary Keys and Indexes
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    # Auto-incrementing primary key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Indexed fields for faster queries
    email: str = Field(unique=True, index=True)
    name: str = Field(index=True)

    # Custom primary key (if needed)
    # custom_id: str = Field(primary_key=True)
```

### Foreign Keys
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    user_id: int = Field(foreign_key="user.id")  # Reference to User table
    user: User = Relationship()  # Relationship object
```

## Validation and Constraints

### Built-in Validators
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=50)
    email: str = Field(regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    age: Optional[int] = Field(default=None, ge=0, le=150)  # Greater/equal 0, less/equal 150
    salary: Optional[float] = Field(default=None, gt=0)  # Greater than 0
```

### Custom Validation
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from pydantic import validator

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    age: Optional[int] = None

    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Email must contain @')
        return v
```

## Best Practices

1. **Use Optional[int] for auto-incrementing IDs**: This allows the database to auto-generate the ID
2. **Always specify constraints**: Use Field parameters like min_length, max_length, gt, ge, etc.
3. **Use index=True for frequently queried fields**: Improves query performance
4. **Use unique=True for fields that should be unique**: Enforces uniqueness at the database level
5. **Use context managers for sessions**: Ensures proper cleanup
6. **Separate model definition from database operations**: Keep models clean and focused

---
name: sqlmodel-basics-db-models
description: Learn the fundamentals of SQLModel and how it combines SQLAlchemy and Pydantic for database models with full type hint support. Use when Claude needs to work with SQLModel for database modeling, basic CRUD operations, model definitions, or initial setup of SQLModel projects. Covers installation, basic model structure, Field() function, type hints, creating model instances, editor support, and key differences from pure SQLAlchemy or Pydantic. Prerequisites: Python Basics, FastAPI Basics.
---

# SQLModel Basics - Database Models with Type Hints

## Overview

SQLModel is a Python library that combines SQLAlchemy and Pydantic to provide database models with full type hint support. This skill covers the fundamentals of SQLModel including model definition, field configuration, and basic usage patterns.

## Installation and Setup

### Installation
```bash
pip install sqlmodel
```

### Basic Model Structure
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None

hero_1 = Hero(name="Deadpond", secret_name="Dive Wilson")
```

## Model Definition Patterns

### Basic Model with Primary Key
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None
```

### Using Field() Function Parameters
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # Creates database index
    secret_name: str = Field(unique=True)  # Enforces uniqueness
    age: int | None = Field(default=None, ge=0)  # Greater than or equal to 0
```

### Type Hints for Database Columns
```python
from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
```

## Field() Function and Parameters

### Primary Key Definition
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    # Alternative syntax for auto-incrementing primary key
    # id: Optional[int] = Field(default=None, primary_key=True)
```

### Nullable Fields and Default Values
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str  # Required field
    secret_name: str  # Required field
    age: int | None = None  # Optional field with default None
    rating: float = Field(default=0.0)  # Optional field with default value
```

## Creating Model Instances

### Basic Instance Creation
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None

# Creating instances
hero_1 = Hero(name="Deadpond", secret_name="Dive Wilson")
hero_2 = Hero(name="Spider-Boy", secret_name="Pedro Parqueador", age=15)
```

### Real-World Use Cases

#### Blog Post Models
```python
from sqlmodel import Field, SQLModel
from datetime import datetime

class BlogPost(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    author: str
    created_at: datetime = Field(default_factory=datetime.now)
    published: bool = Field(default=False)
```

#### E-commerce Product Models
```python
from sqlmodel import Field, SQLModel
from decimal import Decimal

class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    price: Decimal
    stock: int = Field(default=0)
    category: str
```

#### User Profile Models
```python
from sqlmodel import Field, SQLModel

class UserProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True)
    phone: str | None = None
    first_name: str
    last_name: str
```

## Key Differences from Pure SQLAlchemy or Pydantic

### SQLModel vs SQLAlchemy
- SQLModel uses Python type hints for column types (str, int, etc.)
- SQLAlchemy requires explicit type specification (String, Integer, etc.)
- SQLModel combines model definition and validation in one class
- SQLAlchemy separates table definition from ORM model

### SQLModel vs Pydantic
- SQLModel models can be used as database tables with `table=True`
- Pydantic models are for data validation only
- SQLModel supports database-specific features like primary keys, foreign keys
- Pydantic focuses on data serialization and validation

## Common Mistakes to Avoid

1. **Not using Field() for primary keys**: Always use `Field(default=None, primary_key=True)` for auto-incrementing primary keys
2. **Mixing Pydantic-only and database columns**: Use Field() for database columns, avoid mixing with pure Pydantic fields
3. **Forgetting to import SQLModel classes**: Import Field, SQLModel from sqlmodel module
4. **Incorrect nullability**: Use `int | None` or `Optional[int]` for nullable fields

## Quick Reference

### Basic Model Anatomy
```python
from sqlmodel import Field, SQLModel

class ModelName(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)  # Primary key
    required_field: str  # Required field
    optional_field: str | None = None  # Optional field
    field_with_default: int = Field(default=0)  # Field with default value
```

### Common Field Types
- `str` - String/Text fields
- `int` - Integer fields
- `float` - Float/Decimal fields
- `bool` - Boolean fields
- `datetime` - DateTime fields
- `Optional[type]` or `type | None` - Nullable fields

### Primary Key Definition
```python
id: int | None = Field(default=None, primary_key=True)
```

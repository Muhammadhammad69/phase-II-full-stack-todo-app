---
name: sqlmodel-db-engine-sessions
description: Master database connections, engine creation, and session management in SQLModel for reliable database operations. Use when Claude needs to work with database connections, engine creation, session management, or database setup for SQLModel projects. Covers creating SQLite, PostgreSQL, and MySQL engines, engine connection strings, SQLModel.metadata.create_all(), session creation, context managers, and connection pooling. Prerequisites: SQLModel Basics.
---

# Database Engine and Sessions - Connecting to Databases

## Overview

This skill covers how to connect to databases using SQLModel, including creating engines for different database systems, managing sessions, and properly handling database connections. You'll learn about different database engines, session management, and best practices for database connection handling.

## Creating Database Engines

### SQLite Engine
```python
from sqlmodel import create_engine

# Basic SQLite connection
engine = create_engine("sqlite:///database.db")

# SQLite in-memory (for testing)
engine = create_engine("sqlite:///:memory:")
```

### PostgreSQL Engine
```python
from sqlmodel import create_engine

# Basic PostgreSQL connection
engine = create_engine("postgresql://user:password@localhost/dbname")

# With additional parameters
engine = create_engine(
    "postgresql://user:password@localhost/dbname",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True  # Validates connections before use
)
```

### MySQL Engine
```python
from sqlmodel import create_engine

# Basic MySQL connection
engine = create_engine("mysql://user:password@localhost/dbname")

# MySQL with PyMySQL driver
engine = create_engine("mysql+pymysql://user:password@localhost/dbname")
```

## Creating Database Tables

### Creating All Tables
```python
from sqlmodel import SQLModel, create_engine

# Create engine
engine = create_engine("sqlite:///database.db")

# Create all tables defined in your models
SQLModel.metadata.create_all(engine)
```

### Specific Table Creation
```python
from sqlmodel import SQLModel

# Only create specific tables if needed
SQLModel.metadata.tables["hero"].create(engine, checkfirst=True)
```

## Session Management

### Basic Session Usage
```python
from sqlmodel import Session, create_engine

engine = create_engine("sqlite:///database.db")

# Create and use a session
with Session(engine) as session:
    # Perform database operations here
    # Session will be automatically closed
    pass
```

### Session Context Manager Pattern
```python
from sqlmodel import Session, create_engine

def get_session():
    engine = create_engine("sqlite:///database.db")
    with Session(engine) as session:
        yield session

# Using the session
engine = create_engine("sqlite:///database.db")
with Session(engine) as session:
    # Add, query, update, or delete data
    session.add(some_model_instance)
    session.commit()
```

## Real-World Scenarios

### Setting Up Local Development Database
```python
from sqlmodel import create_engine

# For local development
def create_dev_engine():
    return create_engine(
        "sqlite:///./dev_database.db",
        echo=True  # Log SQL statements for debugging
    )
```

### Connecting to Production PostgreSQL
```python
import os
from sqlmodel import create_engine

# Production PostgreSQL with environment variables
def create_prod_engine():
    database_url = os.getenv("DATABASE_URL")
    return create_engine(
        database_url,
        pool_size=20,
        max_overflow=40,
        pool_pre_ping=True,
        pool_recycle=300  # Recycle connections every 5 minutes
    )
```

### Managing Multiple Database Environments
```python
import os
from sqlmodel import create_engine

def get_engine():
    env = os.getenv("ENVIRONMENT", "development")

    if env == "production":
        return create_engine(os.getenv("DATABASE_URL"))
    elif env == "testing":
        return create_engine("sqlite:///:memory:")
    else:
        return create_engine("sqlite:///./development.db")
```

## Best Practices

### Always Use Context Managers for Sessions
```python
from sqlmodel import Session

# Good: Using context manager
engine = create_engine("sqlite:///database.db")
with Session(engine) as session:
    # Operations are automatically committed/closed
    pass

# Avoid: Manual session management
session = Session(engine)
try:
    # operations
    session.commit()
finally:
    session.close()
```

### Store Connection Strings in Environment Variables
```python
import os
from sqlmodel import create_engine

# Good: Using environment variables
def get_engine():
    database_url = os.getenv("DATABASE_URL")
    return create_engine(database_url)

# Avoid: Hardcoded credentials
engine = create_engine("postgresql://user:password@localhost/dbname")
```

### Use Connection Pooling for Production
```python
from sqlmodel import create_engine

# Production-ready engine with connection pooling
def create_production_engine():
    return create_engine(
        "postgresql://user:password@localhost/dbname",
        pool_size=20,           # Number of connections to maintain
        max_overflow=40,        # Additional connections beyond pool_size
        pool_pre_ping=True,     # Validate connections before use
        pool_recycle=3600,      # Recycle connections after 1 hour
        echo=False              # Disable SQL logging in production
    )
```

## Quick Reference

### Engine Creation Strings
- **SQLite**: `"sqlite:///database.db"`
- **PostgreSQL**: `"postgresql://user:password@localhost/dbname"`
- **MySQL**: `"mysql://user:password@localhost/dbname"`

### Session Context Pattern
```python
from sqlmodel import Session

engine = create_engine("your_connection_string")
with Session(engine) as session:
    # Database operations
    session.commit()  # Only if you made changes
```

### Table Creation
```python
from sqlmodel import SQLModel

# Create all defined tables
SQLModel.metadata.create_all(engine)
```

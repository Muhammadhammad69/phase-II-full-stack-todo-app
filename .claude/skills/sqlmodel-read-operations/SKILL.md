---
name: sqlmodel-read-operations
description: Master reading data from databases using SELECT queries with filtering, sorting, and pagination in SQLModel. Use when Claude needs to work with SELECT operations, querying data, filtering, sorting, or pagination in SQLModel projects. Covers select() statements, .where() for filtering, .offset() and .limit() for pagination, .order_by() for sorting, session.exec() to execute queries, and methods like .first(), .all(), .one(). Prerequisites: CREATE Operations.
---

# READ Operations - Querying Data Effectively

## Overview

This skill covers how to read data from databases using SQLModel. You'll learn how to write SELECT queries, filter results using WHERE clauses, implement pagination with LIMIT and OFFSET, sort results with ORDER BY, and retrieve single or multiple records efficiently.

## Basic SELECT Queries

### Importing the select Function
```python
from sqlmodel import Session, select
```

### Getting All Records
```python
from sqlmodel import Session, select, create_engine

engine = create_engine("sqlite:///database.db")

with Session(engine) as session:
    # Get all heroes
    statement = select(Hero)
    heroes = session.exec(statement).all()

    for hero in heroes:
        print(f"{hero.name}: {hero.secret_name}")
```

### Getting a Single Record
```python
from sqlmodel import Session, select

with Session(engine) as session:
    # Get the first hero
    statement = select(Hero)
    hero = session.exec(statement).first()

    if hero:
        print(f"Found hero: {hero.name}")
    else:
        print("No hero found")
```

## Filtering with WHERE Clauses

### Basic Filtering
```python
from sqlmodel import Session, select

with Session(engine) as session:
    # Filter specific hero by name
    statement = select(Hero).where(Hero.name == "Spider-Boy")
    hero = session.exec(statement).first()

    if hero:
        print(f"Found hero: {hero.name}")
    else:
        print("Hero not found")
```

### Multiple Conditions
```python
from sqlmodel import Session, select

with Session(engine) as session:
    # Filter heroes with age greater than 30
    statement = select(Hero).where(Hero.age > 30)
    heroes = session.exec(statement).all()

    for hero in heroes:
        print(f"{hero.name} is {hero.age} years old")
```

### Complex Filtering with AND/OR Logic
```python
from sqlmodel import Session, select
from sqlalchemy import and_, or_

with Session(engine) as session:
    # Using AND logic
    statement = select(Hero).where(
        and_(Hero.age > 20, Hero.name.contains("Man"))
    )
    heroes = session.exec(statement).all()

    # Using OR logic
    statement = select(Hero).where(
        or_(Hero.name == "Spider-Boy", Hero.name == "Deadpond")
    )
    heroes = session.exec(statement).all()
```

## Pagination with LIMIT and OFFSET

### Basic Pagination
```python
from sqlmodel import Session, select

def get_paginated_heroes(offset: int, limit: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).offset(offset).limit(limit)
        heroes = session.exec(statement).all()
        return heroes

# Get first 10 heroes
first_page = get_paginated_heroes(offset=0, limit=10)

# Get next 10 heroes
second_page = get_paginated_heroes(offset=10, limit=10)
```

### Pagination Helper Function
```python
from sqlmodel import Session, select
from sqlalchemy import func
from typing import List

def paginate_results(model, page: int, page_size: int = 10):
    offset = (page - 1) * page_size

    engine = create_engine("sqlite:///database.db")
    with Session(engine) as session:
        # Get total count
        count_statement = select(func.count(model.id))
        total_count = session.exec(count_statement).one()

        # Get paginated results
        statement = select(model).offset(offset).limit(page_size)
        results = session.exec(statement).all()

        return {
            "results": results,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size
        }

# Usage
paginated_data = paginate_results(Hero, page=1, page_size=5)
```

## Sorting with ORDER BY

### Basic Sorting
```python
from sqlmodel import Session, select

with Session(engine) as session:
    # Sort heroes by name (ascending)
    statement = select(Hero).order_by(Hero.name)
    heroes = session.exec(statement).all()

    # Sort heroes by age (descending)
    statement = select(Hero).order_by(Hero.age.desc())
    heroes = session.exec(statement).all()
```

### Multiple Sort Criteria
```python
from sqlmodel import Session, select

with Session(engine) as session:
    # Sort by age descending, then by name ascending
    statement = select(Hero).order_by(Hero.age.desc(), Hero.name.asc())
    heroes = session.exec(statement).all()

    for hero in heroes:
        print(f"{hero.name} ({hero.age})")
```

## Query Execution Methods

### .all() Method - Get All Matching Records
```python
from sqlmodel import Session, select

with Session(engine) as session:
    statement = select(Hero).where(Hero.age > 25)
    heroes = session.exec(statement).all()

    print(f"Found {len(heroes)} heroes older than 25")
```

### .first() Method - Get First Matching Record
```python
from sqlmodel import Session, select

with Session(engine) as session:
    statement = select(Hero).where(Hero.name.contains("Man"))
    hero = session.exec(statement).first()

    if hero:
        print(f"First hero containing 'Man': {hero.name}")
```

### .one() Method - Get Exactly One Record (Raises Exception if Zero or Multiple)
```python
from sqlmodel import Session, select

with Session(engine) as session:
    try:
        statement = select(Hero).where(Hero.id == 1)
        hero = session.exec(statement).one()
        print(f"Found hero: {hero.name}")
    except Exception as e:
        print(f"Error: {e}")
```

### .one_or_none() Method - Get One Record or None
```python
from sqlmodel import Session, select

with Session(engine) as session:
    statement = select(Hero).where(Hero.name == "Nonexistent Hero")
    hero = session.exec(statement).one_or_none()

    if hero:
        print(f"Found hero: {hero.name}")
    else:
        print("Hero not found")
```

## Real-World Scenarios

### Searching for Users by Email
```python
from sqlmodel import Session, select

def find_user_by_email(email: str):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        return user

# Usage
user = find_user_by_email("john@example.com")
if user:
    print(f"User found: {user.username}")
```

### Displaying Paginated Product Lists
```python
from sqlmodel import Session, select
from typing import List

def get_products(page: int = 1, page_size: int = 10):
    offset = (page - 1) * page_size
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Product).offset(offset).limit(page_size)
        products = session.exec(statement).all()
        return products

# Get first page of products
products = get_products(page=1, page_size=10)
for product in products:
    print(f"{product.name}: ${product.price}")
```

### Filtering by Date Ranges
```python
from sqlmodel import Session, select
from datetime import datetime, timedelta

def get_recent_orders(days_back: int = 7):
    cutoff_date = datetime.now() - timedelta(days=days_back)

    engine = create_engine("sqlite:///database.db")
    with Session(engine) as session:
        statement = select(Order).where(Order.created_at >= cutoff_date)
        recent_orders = session.exec(statement).all()
        return recent_orders

# Get orders from the last week
recent_orders = get_recent_orders(days_back=7)
```

### Sorting Products by Price
```python
from sqlmodel import Session, select

def get_products_sorted_by_price(ascending: bool = True):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        if ascending:
            statement = select(Product).order_by(Product.price.asc())
        else:
            statement = select(Product).order_by(Product.price.desc())

        products = session.exec(statement).all()
        return products

# Get cheapest products first
cheapest_first = get_products_sorted_by_price(ascending=True)

# Get most expensive products first
expensive_first = get_products_sorted_by_price(ascending=False)
```

## Performance Tips

### Index Frequently Filtered Columns
```python
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)  # Index for fast lookups
    username: str = Field(index=True)  # Index for fast searches
    created_at: datetime = Field(index=True)  # Index for date range queries
```

### Use LIMIT for Large Datasets
```python
from sqlmodel import Session, select

# Good: Limit results to avoid loading too much data
with Session(engine) as session:
    statement = select(Hero).limit(100)
    heroes = session.exec(statement).all()
```

### Understand N+1 Query Problems
```python
# Avoid N+1 queries when loading related data
from sqlmodel import Session, select

# Problem: This causes N+1 queries if each hero has a team relationship
with Session(engine) as session:
    heroes = session.exec(select(Hero)).all()
    for hero in heroes:
        print(f"{hero.name} belongs to team {hero.team.name}")  # Separate query for each!

# Solution: Use JOIN or eager loading (covered in Relationships skill)
```

## Quick Reference

### Basic SELECT Operations
```python
from sqlmodel import Session, select

with Session(engine) as session:
    # Get all records
    all_heroes = session.exec(select(Hero)).all()

    # Filter records
    filtered_heroes = session.exec(select(Hero).where(Hero.age > 25)).all()

    # Get single record
    hero = session.exec(select(Hero).where(Hero.id == 1)).first()
```

### Pagination Pattern
```python
# Pagination pattern
statement = select(Hero).offset(0).limit(10)
heroes = session.exec(statement).all()
```

### Sorting Pattern
```python
# Sorting patterns
statement = select(Hero).order_by(Hero.name.asc())  # Ascending
statement = select(Hero).order_by(Hero.name.desc())  # Descending
```

### Execution Methods
- `.all()` - Get all matching records
- `.first()` - Get first matching record (or None)
- `.one()` - Get exactly one record (raises exception if zero or multiple)
- `.one_or_none()` - Get one record or None (raises exception if multiple)
```

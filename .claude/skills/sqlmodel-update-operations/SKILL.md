---
name: sqlmodel-update-operations
description: Learn how to update existing database records efficiently. Master partial updates, batch updates, and handling change tracking. Use when Claude needs to work with UPDATE operations, modifying existing records, or performing partial updates in SQLModel projects. Covers fetching records before updating, direct attribute modification, session.add() after modification, session.commit() for persistence, batch update patterns, partial updates, handling concurrent updates, validation during updates, and refresh() after updates. Prerequisites: READ Operations.
---

# UPDATE Operations - Modifying Existing Data

## Overview

This skill covers how to update existing database records using SQLModel. You'll learn how to fetch and modify records, perform single and multiple field updates, execute batch updates, handle change detection, work with database constraints during updates, and properly use refresh() after updates.

## Basic Update Pattern

### Fetch and Modify Existing Records
```python
from sqlmodel import Session, select, create_engine

engine = create_engine("sqlite:///database.db")

with Session(engine) as session:
    # Get existing hero
    statement = select(Hero).where(Hero.id == 1)
    hero = session.exec(statement).one()

    # Update fields
    hero.age = 50
    hero.name = "Updated Hero"

    # Save changes
    session.add(hero)
    session.commit()
    session.refresh(hero)
    print(f"Updated hero: {hero}")
```

### Complete Update Pattern
```python
from sqlmodel import Session, select, create_engine

def update_hero(hero_id: int, name: str = None, age: int = None):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Get hero by ID
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Update provided fields
        if name is not None:
            hero.name = name
        if age is not None:
            hero.age = age

        # Save changes
        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero

# Usage
updated_hero = update_hero(hero_id=1, name="New Name", age=35)
```

## Partial Updates

### Updating Specific Fields Only
```python
from sqlmodel import Session, select

def update_hero_name(hero_id: int, new_name: str):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Only update the name field
        hero.name = new_name

        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero

def update_hero_age(hero_id: int, new_age: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Only update the age field
        hero.age = new_age

        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero
```

### Conditional Updates
```python
from sqlmodel import Session, select

def update_hero_if_needed(hero_id: int, new_name: str = None, new_age: int = None):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Only update if values are provided
        if new_name is not None:
            hero.name = new_name
        if new_age is not None:
            hero.age = new_age

        # Only commit if changes were made
        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero
```

## Batch Updates

### Update Multiple Records with Filters
```python
from sqlmodel import Session, select

def bulk_update_heroes_by_age(min_age: int, new_status: str):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Get all heroes with age greater than min_age
        statement = select(Hero).where(Hero.age > min_age)
        heroes = session.exec(statement).all()

        # Update each hero
        for hero in heroes:
            hero.status = new_status  # Assuming Hero has a status field
            session.add(hero)

        session.commit()

        # Refresh to get updated data
        for hero in heroes:
            session.refresh(hero)

        return heroes
```

### Update Multiple Fields at Once
```python
from sqlmodel import Session, select

def bulk_update_heroes(hero_updates: list[dict]):
    """
    Update multiple heroes with different values
    hero_updates: list of dictionaries with hero_id and fields to update
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        for update_data in hero_updates:
            hero_id = update_data['id']
            statement = select(Hero).where(Hero.id == hero_id)
            hero = session.exec(statement).one()

            # Update fields based on the update_data
            for field, value in update_data.items():
                if field != 'id':  # Skip the ID field
                    setattr(hero, field, value)

            session.add(hero)

        session.commit()

        # Refresh all updated heroes
        for update_data in hero_updates:
            hero_id = update_data['id']
            statement = select(Hero).where(Hero.id == hero_id)
            hero = session.exec(statement).one()
            session.refresh(hero)

# Usage
updates = [
    {'id': 1, 'name': 'New Hero 1', 'age': 30},
    {'id': 2, 'name': 'New Hero 2', 'age': 35},
    {'id': 3, 'name': 'New Hero 3', 'age': 40}
]
bulk_update_heroes(updates)
```

## Practical Use Cases

### Updating User Profile Information
```python
from sqlmodel import Session, select, Field, SQLModel
from datetime import datetime

class UserProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    updated_at: datetime = Field(default_factory=datetime.now)

def update_user_profile(user_id: int, **kwargs):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(UserProfile).where(UserProfile.id == user_id)
        user = session.exec(statement).one()

        # Update provided fields
        for field, value in kwargs.items():
            if hasattr(user, field):
                setattr(user, field, value)

        # Update timestamp
        user.updated_at = datetime.now()

        session.add(user)
        session.commit()
        session.refresh(user)
        return user

# Usage
updated_user = update_user_profile(
    user_id=1,
    first_name="John",
    last_name="Doe",
    phone="+1234567890"
)
```

### Changing Product Prices
```python
from sqlmodel import Session, select

def update_product_price(product_id: int, new_price: float):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Product).where(Product.id == product_id)
        product = session.exec(statement).one()

        old_price = product.price
        product.price = new_price
        product.updated_at = datetime.now()

        session.add(product)
        session.commit()
        session.refresh(product)

        print(f"Price updated from {old_price} to {product.price}")
        return product
```

### Updating Order Statuses
```python
from sqlmodel import Session, select

def update_order_status(order_id: int, new_status: str):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Order).where(Order.id == order_id)
        order = session.exec(statement).one()

        old_status = order.status
        order.status = new_status
        order.updated_at = datetime.now()

        session.add(order)
        session.commit()
        session.refresh(order)

        print(f"Order {order_id} status updated from {old_status} to {new_status}")
        return order
```

## Validation During Update

### Field Constraints Validation
```python
from sqlmodel import Session, select, Field
from pydantic import validator

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=50)
    age: int | None = Field(default=None, ge=0, le=150)  # Greater/equal 0, less/equal 150

def safe_update_hero(hero_id: int, name: str = None, age: int = None):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Update with validation
        if name is not None:
            hero.name = name  # This will validate the name constraints
        if age is not None:
            hero.age = age    # This will validate the age constraints

        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero
```

### Business Logic Validation
```python
from sqlmodel import Session, select

def update_hero_with_business_logic(hero_id: int, new_age: int = None):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Business logic: prevent setting age to negative
        if new_age is not None and new_age < 0:
            raise ValueError("Age cannot be negative")

        # Business logic: prevent decreasing age
        if new_age is not None and hero.age is not None and new_age < hero.age:
            raise ValueError("Age cannot be decreased")

        if new_age is not None:
            hero.age = new_age

        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero
```

## Handling Change Detection

### Detecting What Changed
```python
from sqlmodel import Session, select

def update_hero_with_change_detection(hero_id: int, **updates):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Store original values for comparison
        original_values = {}
        for field, new_value in updates.items():
            original_values[field] = getattr(hero, field)
            setattr(hero, field, new_value)

        # Log changes
        for field, new_value in updates.items():
            old_value = original_values[field]
            if old_value != new_value:
                print(f"Field '{field}' changed from '{old_value}' to '{new_value}'")

        session.add(hero)
        session.commit()
        session.refresh(hero)
        return hero
```

## Quick Reference

### Basic Update Pattern
```python
from sqlmodel import Session, select

# Basic update pattern
with Session(engine) as session:
    # 1. Fetch the record
    statement = select(Hero).where(Hero.id == 1)
    hero = session.exec(statement).one()

    # 2. Modify the fields
    hero.name = "New Name"
    hero.age = 30

    # 3. Add back to session
    session.add(hero)

    # 4. Commit the changes
    session.commit()

    # 5. Refresh to get updated data
    session.refresh(hero)
```

### Safe Update with Error Handling
```python
from sqlmodel import Session, select

def safe_update_hero(hero_id: int, **updates):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            statement = select(Hero).where(Hero.id == hero_id)
            hero = session.exec(statement).one()

            for field, value in updates.items():
                setattr(hero, field, value)

            session.add(hero)
            session.commit()
            session.refresh(hero)
            return hero
        except Exception as e:
            session.rollback()
            raise e
```

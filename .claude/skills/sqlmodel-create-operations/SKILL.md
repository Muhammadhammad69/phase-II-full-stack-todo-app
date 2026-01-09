---
name: sqlmodel-create-operations
description: Learn how to insert (CREATE) data into your database using SQLModel. Master adding single and multiple records efficiently. Use when Claude needs to work with INSERT operations, adding new records to databases, or performing CREATE operations in SQLModel projects. Covers creating model instances, session.add(), session.add_all(), session.commit(), automatic ID generation, using refresh() to get updated objects with IDs, and transaction rollbacks. Prerequisites: Database Engine and Sessions.
---

# CREATE Operations - Inserting Data into Databases

## Overview

This skill covers how to insert data into databases using SQLModel. You'll learn how to add single records, batch insert multiple records, handle auto-generated IDs, manage database commits and transactions, and properly use refresh() to get updated data with auto-generated values.

## Creating Model Instances

### Basic Model Instance Creation
```python
from sqlmodel import Field, SQLModel

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None

# Create model instances
hero_1 = Hero(name="Deadpond", secret_name="Dive Wilson")
hero_2 = Hero(name="Spider-Boy", secret_name="Pedro Parqueador")
hero_3 = Hero(name="Rusty-Man", secret_name="Tommy Sharp", age=48)
```

## Single Record Insertion

### Using session.add() for Single Records
```python
from sqlmodel import Session, create_engine

engine = create_engine("sqlite:///database.db")

hero = Hero(name="Deadpond", secret_name="Dive Wilson")

with Session(engine) as session:
    session.add(hero)
    session.commit()
    session.refresh(hero)  # Refresh to get auto-generated ID
    print(f"Created hero with ID: {hero.id}")
```

### Complete Single Insertion Pattern
```python
from sqlmodel import Session, create_engine

def create_hero(hero_data: Hero) -> Hero:
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        session.add(hero_data)
        session.commit()
        session.refresh(hero_data)
        return hero_data

# Usage
new_hero = Hero(name="Captain America", secret_name="Steve Rogers")
created_hero = create_hero(new_hero)
```

## Multiple Record Insertion

### Using session.add_all() for Multiple Records
```python
from sqlmodel import Session, create_engine

engine = create_engine("sqlite:///database.db")

hero_1 = Hero(name="Deadpond", secret_name="Dive Wilson")
hero_2 = Hero(name="Spider-Boy", secret_name="Pedro Parqueador")
hero_3 = Hero(name="Rusty-Man", secret_name="Tommy Sharp", age=48)

with Session(engine) as session:
    session.add_all([hero_1, hero_2, hero_3])
    session.commit()

    # Refresh all objects to get their IDs
    session.refresh(hero_1)
    session.refresh(hero_2)
    session.refresh(hero_3)

    print(f"Created heroes with IDs: {hero_1.id}, {hero_2.id}, {hero_3.id}")
```

### Batch Insertion Pattern
```python
from sqlmodel import Session, create_engine

def create_multiple_heroes(heroes: list[Hero]) -> list[Hero]:
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        session.add_all(heroes)
        session.commit()

        # Refresh all objects to get updated data
        for hero in heroes:
            session.refresh(hero)

        return heroes

# Usage
heroes_to_create = [
    Hero(name="Iron Man", secret_name="Tony Stark"),
    Hero(name="Thor", secret_name="Donald Blake"),
    Hero(name="Hulk", secret_name="Bruce Banner")
]

created_heroes = create_multiple_heroes(heroes_to_create)
```

## Transaction Management

### Commit and Rollback Operations
```python
from sqlmodel import Session, create_engine

engine = create_engine("sqlite:///database.db")

with Session(engine) as session:
    try:
        hero = Hero(name="Wolverine", secret_name="Logan")
        session.add(hero)
        session.commit()  # Persist changes to database
        print(f"Successfully created hero: {hero.name}")
    except Exception as e:
        session.rollback()  # Undo changes if error occurs
        print(f"Error occurred: {e}")
```

### Transaction Safety with Multiple Operations
```python
from sqlmodel import Session, create_engine

def create_hero_and_associated_data(hero_data: Hero, powers: list[str]):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            # Add the hero
            session.add(hero_data)
            session.commit()
            session.refresh(hero_data)

            # Add associated powers (assuming Power model exists)
            for power_name in powers:
                power = Power(name=power_name, hero_id=hero_data.id)
                session.add(power)

            session.commit()
            print(f"Successfully created hero {hero_data.name} with powers")

        except Exception as e:
            session.rollback()
            print(f"Transaction failed: {e}")
            raise
```

## Working with Auto-Generated IDs

### Using refresh() to Get Updated Objects
```python
from sqlmodel import Session, create_engine

engine = create_engine("sqlite:///database.db")

hero = Hero(name="Black Widow", secret_name="Natasha Romanoff")

with Session(engine) as session:
    session.add(hero)
    session.commit()

    # The hero object doesn't have an ID yet
    print(f"Hero ID before refresh: {hero.id}")  # None

    # Refresh to get the auto-generated ID
    session.refresh(hero)
    print(f"Hero ID after refresh: {hero.id}")  # Now has the assigned ID
```

## Practical Examples

### Creating User Accounts with Auto-Generated IDs
```python
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    email: str = Field(unique=True)
    created_at: datetime = Field(default_factory=datetime.now)

def create_user(username: str, email: str) -> User:
    engine = create_engine("sqlite:///database.db")
    user = User(username=username, email=email)

    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

# Create user and get auto-generated ID
new_user = create_user("john_doe", "john@example.com")
print(f"Created user with ID: {new_user.id}")
```

### Bulk Importing Data from CSV Files
```python
import csv
from sqlmodel import Session, create_engine

def bulk_import_heroes_from_csv(csv_file_path: str):
    engine = create_engine("sqlite:///database.db")

    heroes = []
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            hero = Hero(
                name=row['name'],
                secret_name=row['secret_name'],
                age=int(row['age']) if row['age'] else None
            )
            heroes.append(hero)

    # Insert all heroes in one transaction
    with Session(engine) as session:
        session.add_all(heroes)
        session.commit()

        # Refresh to get IDs
        for hero in heroes:
            session.refresh(hero)

        print(f"Successfully imported {len(heroes)} heroes")
```

## Error Handling

### Handling Duplicate Entries
```python
from sqlmodel import Session, create_engine
from sqlalchemy.exc import IntegrityError

def create_unique_hero(hero_data: Hero):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            session.add(hero_data)
            session.commit()
            session.refresh(hero_data)
            return hero_data
        except IntegrityError:
            session.rollback()
            raise ValueError(f"Hero with name '{hero_data.name}' already exists")
```

### Constraint Violations
```python
from sqlmodel import Session, create_engine
from sqlalchemy.exc import IntegrityError

def create_hero_safe(hero_data: Hero):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            session.add(hero_data)
            session.commit()
            session.refresh(hero_data)
            return hero_data
        except IntegrityError as e:
            session.rollback()
            print(f"Constraint violation: {e.orig}")
            raise
```

## Quick Reference

### Basic INSERT Operations
```python
from sqlmodel import Session

# Single record insertion
with Session(engine) as session:
    hero = Hero(name="Sample", secret_name="Secret")
    session.add(hero)
    session.commit()
    session.refresh(hero)  # Get auto-generated ID
```

### Multiple Record Insertion
```python
# Multiple records insertion
with Session(engine) as session:
    heroes = [Hero(name="A", secret_name="B"), Hero(name="C", secret_name="D")]
    session.add_all(heroes)
    session.commit()
    for hero in heroes:
        session.refresh(hero)  # Refresh each object
```

### Transaction Pattern
```python
# Safe transaction pattern
with Session(engine) as session:
    try:
        # Add operations
        session.add(hero)
        session.commit()  # Persist changes
    except Exception:
        session.rollback()  # Undo on error
        raise
```

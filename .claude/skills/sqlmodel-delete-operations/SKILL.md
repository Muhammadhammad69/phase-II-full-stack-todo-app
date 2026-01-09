---
name: sqlmodel-delete-operations
description: Master safe and efficient deletion of database records. Learn about cascade delete, soft deletes, and data cleanup strategies. Use when Claude needs to work with DELETE operations, removing records from databases, or performing data cleanup in SQLModel projects. Covers session.delete() for removing records, finding records before deletion, cascade delete relationships, soft delete pattern, constraints that prevent deletion, transaction safety, backing up before bulk deletions, using transactions, verifying before deleting, implementing soft deletes for important data, and cascade options. Prerequisites: UPDATE Operations.
---

# DELETE Operations - Removing Data Safely

## Overview

This skill covers how to safely delete database records using SQLModel. You'll learn how to delete single and multiple records, understand cascade delete behavior, implement soft delete patterns, handle deletion constraints, and use transactions for safe deletions.

## Basic Deletion Pattern

### Delete Single Records
```python
from sqlmodel import Session, select, create_engine

engine = create_engine("sqlite:///database.db")

with Session(engine) as session:
    # Get hero to delete
    statement = select(Hero).where(Hero.id == 1)
    hero = session.exec(statement).one()

    # Delete the record
    session.delete(hero)
    session.commit()
    print(f"Deleted hero: {hero.name}")
```

### Safe Delete with Verification
```python
from sqlmodel import Session, select

def safe_delete_hero(hero_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Find the hero first
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        if hero:
            print(f"About to delete hero: {hero.name}")
            confirm = input("Are you sure? (y/N): ")
            if confirm.lower() == 'y':
                session.delete(hero)
                session.commit()
                print(f"Successfully deleted hero: {hero.name}")
            else:
                print("Deletion cancelled")
        else:
            print(f"No hero found with ID: {hero_id}")
```

## Multiple Record Deletion

### Delete Multiple Records with Filters
```python
from sqlmodel import Session, select

def delete_heroes_by_age(max_age: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Get all heroes with age less than max_age
        statement = select(Hero).where(Hero.age < max_age)
        heroes = session.exec(statement).all()

        print(f"Found {len(heroes)} heroes to delete")

        # Delete each hero
        for hero in heroes:
            session.delete(hero)

        session.commit()
        print(f"Successfully deleted {len(heroes)} heroes")
```

### Bulk Delete with Transaction Safety
```python
from sqlmodel import Session, select

def bulk_delete_heroes(hero_ids: list[int]):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            deleted_count = 0
            for hero_id in hero_ids:
                statement = select(Hero).where(Hero.id == hero_id)
                hero = session.exec(statement).one()

                if hero:
                    session.delete(hero)
                    deleted_count += 1

            session.commit()
            print(f"Successfully deleted {deleted_count} heroes")
        except Exception as e:
            session.rollback()
            print(f"Error during deletion: {e}")
            raise
```

## Cascade Delete Behavior

### Understanding Foreign Key Constraints
```python
from sqlmodel import Field, Relationship, SQLModel
from typing import Optional

class Team(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    heroes: list["Hero"] = Relationship(back_populates="team")

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    team_id: int | None = Field(default=None, foreign_key="team.id")
    team: Optional[Team] = Relationship(back_populates="heroes")
```

### Handling Cascade Deletes
```python
from sqlmodel import Session, select

def delete_team_with_heroes(team_id: int):
    """
    Delete a team and all associated heroes (cascade delete)
    This requires proper foreign key constraints with CASCADE option
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Delete all heroes associated with the team first
        heroes_statement = select(Hero).where(Hero.team_id == team_id)
        heroes = session.exec(heroes_statement).all()

        for hero in heroes:
            session.delete(hero)

        # Then delete the team
        team_statement = select(Team).where(Team.id == team_id)
        team = session.exec(team_statement).one()
        session.delete(team)

        session.commit()
        print(f"Deleted team and {len(heroes)} associated heroes")
```

## Soft Delete Pattern

### Implementing Soft Delete
```python
from sqlmodel import Field, SQLModel
from datetime import datetime

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None
    deleted_at: datetime | None = Field(default=None)  # For soft deletes

def soft_delete_hero(hero_id: int):
    """
    Mark a hero as deleted instead of actually deleting from database
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        hero.deleted_at = datetime.now()
        session.add(hero)
        session.commit()
        session.refresh(hero)
        print(f"Hero {hero.name} marked as deleted")

def get_non_deleted_heroes():
    """
    Get only heroes that haven't been soft deleted
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.deleted_at == None)
        heroes = session.exec(statement).all()
        return heroes
```

### Querying with Soft Delete Consideration
```python
from sqlmodel import Session, select

def get_hero_by_id(hero_id: int, include_deleted: bool = False):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)

        if not include_deleted:
            statement = statement.where(Hero.deleted_at == None)

        hero = session.exec(statement).one_or_none()
        return hero

def hard_delete_hero(hero_id: int):
    """
    Actually remove a hero from the database (hard delete)
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()
        session.delete(hero)
        session.commit()
        print(f"Permanently deleted hero: {hero.name}")
```

## Real-World Scenarios

### Soft Deleting User Accounts
```python
from sqlmodel import Field, SQLModel
from datetime import datetime

class UserAccount(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    email: str
    is_active: bool = Field(default=True)
    deleted_at: datetime | None = Field(default=None)
    deleted_reason: str | None = Field(default=None)

def soft_delete_user_account(user_id: int, reason: str = "User requested"):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(UserAccount).where(UserAccount.id == user_id)
        user = session.exec(statement).one()

        user.deleted_at = datetime.now()
        user.is_active = False
        user.deleted_reason = reason

        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"User account {user.username} marked as deleted")
```

### Cascading Deletes in Blog Posts and Comments
```python
from sqlmodel import Field, Relationship, SQLModel
from typing import Optional

class BlogPost(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    comments: list["Comment"] = Relationship(back_populates="post")

class Comment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str
    post_id: int = Field(foreign_key="blogpost.id")
    post: BlogPost = Relationship(back_populates="comments")

def delete_post_with_comments(post_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Delete all comments first
        comments_statement = select(Comment).where(Comment.post_id == post_id)
        comments = session.exec(comments_statement).all()

        for comment in comments:
            session.delete(comment)

        # Then delete the post
        post_statement = select(BlogPost).where(BlogPost.id == post_id)
        post = session.exec(post_statement).one()
        session.delete(post)

        session.commit()
        print(f"Deleted post and {len(comments)} associated comments")
```

### Archiving Historical Data
```python
from sqlmodel import Field, SQLModel
from datetime import datetime, timedelta

class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    customer_id: int
    total_amount: float
    created_at: datetime = Field(default_factory=datetime.now)
    archived_at: datetime | None = Field(default=None)

def archive_old_orders(older_than_days: int = 365):
    """
    Move old orders to archived status instead of deleting
    """
    cutoff_date = datetime.now() - timedelta(days=older_than_days)
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = select(Order).where(
            Order.created_at < cutoff_date,
            Order.archived_at == None
        )
        old_orders = session.exec(statement).all()

        for order in old_orders:
            order.archived_at = datetime.now()
            session.add(order)

        session.commit()
        print(f"Archived {len(old_orders)} old orders")
```

## Safety Practices

### Backing Up Before Bulk Deletions
```python
import json
from sqlmodel import Session, select
from datetime import datetime

def backup_and_delete_heroes(hero_ids: list[int]):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # First, backup the data to be deleted
        backup_data = []
        for hero_id in hero_ids:
            statement = select(Hero).where(Hero.id == hero_id)
            hero = session.exec(statement).one()
            backup_data.append({
                'id': hero.id,
                'name': hero.name,
                'secret_name': hero.secret_name,
                'age': hero.age
            })

        # Save backup to file
        with open(f'hero_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json', 'w') as f:
            json.dump(backup_data, f, indent=2, default=str)

        # Now perform the deletion
        for hero_id in hero_ids:
            statement = select(Hero).where(Hero.id == hero_id)
            hero = session.exec(statement).one()
            session.delete(hero)

        session.commit()
        print(f"Backed up and deleted {len(hero_ids)} heroes")
```

### Using Transactions for Safe Deletions
```python
from sqlmodel import Session, select

def delete_hero_with_related_data(hero_id: int):
    """
    Delete a hero and all related data in a transaction
    If any part fails, everything is rolled back
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            # Get the hero
            statement = select(Hero).where(Hero.id == hero_id)
            hero = session.exec(statement).one()

            # Delete related records (e.g., powers, missions, etc.)
            # This is pseudocode - adjust based on your actual relationships
            # Example: If there's a HeroPower table
            # powers_statement = select(HeroPower).where(HeroPower.hero_id == hero_id)
            # powers = session.exec(powers_statement).all()
            # for power in powers:
            #     session.delete(power)

            # Delete the hero
            session.delete(hero)

            # Commit all changes together
            session.commit()
            print(f"Successfully deleted hero {hero.name} and related data")

        except Exception as e:
            # If anything fails, rollback all changes
            session.rollback()
            print(f"Deletion failed, rolled back: {e}")
            raise
```

### Verifying Before Deleting
```python
from sqlmodel import Session, select

def conditional_delete_hero(hero_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Get the hero
        statement = select(Hero).where(Hero.id == hero_id)
        hero = session.exec(statement).one()

        # Check if it's safe to delete
        if hero.age and hero.age < 18:
            print(f"Cannot delete hero {hero.name} - underage")
            return False

        # Confirm deletion
        print(f"About to delete: {hero.name}")
        print(f"ID: {hero.id}, Age: {hero.age}")
        confirm = input("Confirm deletion (type 'DELETE'): ")

        if confirm == 'DELETE':
            session.delete(hero)
            session.commit()
            print(f"Successfully deleted {hero.name}")
            return True
        else:
            print("Deletion cancelled")
            return False
```

## Quick Reference

### Basic Deletion Pattern
```python
from sqlmodel import Session, select

# Basic deletion pattern
with Session(engine) as session:
    # 1. Find the record
    statement = select(Hero).where(Hero.id == 1)
    hero = session.exec(statement).one()

    # 2. Delete the record
    session.delete(hero)

    # 3. Commit the transaction
    session.commit()
```

### Soft Delete Pattern
```python
# Soft delete pattern
with Session(engine) as session:
    statement = select(Hero).where(Hero.id == 1)
    hero = session.exec(statement).one()

    # Mark as deleted instead of removing
    hero.deleted_at = datetime.now()
    session.add(hero)
    session.commit()
    session.refresh(hero)
```

### Safe Bulk Deletion
```python
# Safe bulk deletion with transaction
def safe_bulk_delete(hero_ids: list[int]):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        try:
            for hero_id in hero_ids:
                statement = select(Hero).where(Hero.id == hero_id)
                hero = session.exec(statement).one()
                session.delete(hero)

            session.commit()
        except Exception:
            session.rollback()
            raise
```

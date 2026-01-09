---
name: sqlmodel-many-to-many-relationships
description: Master many-to-many relationships using link tables. Create flexible data models for complex real-world scenarios. Use when Claude needs to work with many-to-many relationships, complex data models with junction tables, or scenarios requiring extra fields on relationships in SQLModel projects. Covers many-to-many table structures, creating explicit link models, accessing related objects through link table, adding data to many-to-many relationships, querying through many-to-many, extra fields on link tables, cascade delete strategies, getting all teams for a hero, getting all heroes in a team, and filtering by relationship criteria. Prerequisites: Relationships - One-to-Many and Many-to-One.
---

# Many-to-Many Relationships - Complex Data Models

## Overview

This skill covers how to implement many-to-many relationships in SQLModel using link tables. You'll learn how to create flexible data models for complex real-world scenarios where entities can be associated with multiple other entities.

## Many-to-Many Table Structures

### Basic Many-to-Many Relationship
```python
from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional
from datetime import datetime

class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str

class Team(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    headquarters: str

# Link table for many-to-many relationship
class HeroTeamLink(SQLModel, table=True):
    hero_id: int | None = Field(default=None, foreign_key="hero.id", primary_key=True)
    team_id: int | None = Field(default=None, foreign_key="team.id", primary_key=True)

# Many-to-many relationships using the link table
class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    teams: List["Team"] = Relationship(
        back_populates="heroes",
        link_model=HeroTeamLink
    )

class Team(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    headquarters: str
    heroes: List["Hero"] = Relationship(
        back_populates="teams",
        link_model=HeroTeamLink
    )
```

### Link Table with Additional Fields
```python
from datetime import datetime

class HeroTeamLink(SQLModel, table=True):
    hero_id: int | None = Field(default=None, foreign_key="hero.id", primary_key=True)
    team_id: int | None = Field(default=None, foreign_key="team.id", primary_key=True)
    # Additional fields on the relationship
    date_joined: datetime = Field(default_factory=datetime.now)
    role: str = Field(default="member")  # leader, member, etc.
    is_active: bool = Field(default=True)
```

## Creating Explicit Link Models

### Complete Many-to-Many Setup
```python
from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional
from datetime import datetime

# Link table with additional data
class HeroTeamLink(SQLModel, table=True):
    hero_id: int | None = Field(default=None, foreign_key="hero.id", primary_key=True)
    team_id: int | None = Field(default=None, foreign_key="team.id", primary_key=True)
    date_joined: datetime = Field(default_factory=datetime.now)
    role: str = Field(default="member")
    is_active: bool = Field(default=True)

# Hero model with many-to-many relationship
class Hero(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: int | None = None

    # Many-to-many relationship through link model
    teams: List["Team"] = Relationship(
        back_populates="heroes",
        link_model=HeroTeamLink
    )

# Team model with many-to-many relationship
class Team(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    headquarters: str

    # Many-to-many relationship through link model
    heroes: List["Hero"] = Relationship(
        back_populates="teams",
        link_model=HeroTeamLink
    )
```

## Accessing Related Objects Through Link Table

### Getting Related Objects
```python
from sqlmodel import Session, select, create_engine

def get_hero_with_teams(hero_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        hero = session.get(Hero, hero_id)
        if hero:
            # Access related teams
            teams = hero.teams
            for team in teams:
                print(f"Hero {hero.name} is in team {team.name}")
        return hero

def get_team_with_heroes(team_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        team = session.get(Team, team_id)
        if team:
            # Access related heroes
            heroes = team.heroes
            for hero in heroes:
                print(f"Team {team.name} has hero {hero.name}")
        return team
```

### Working with Link Table Data
```python
from sqlmodel import Session, select, create_engine

def get_hero_team_memberships(hero_id: int):
    """
    Get all team memberships for a hero including link table data
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Query the link table directly to get additional relationship data
        statement = select(HeroTeamLink).where(HeroTeamLink.hero_id == hero_id)
        memberships = session.exec(statement).all()

        for membership in memberships:
            print(f"Hero ID {hero_id} joined team ID {membership.team_id} "
                  f"on {membership.date_joined} as {membership.role}")

        return memberships
```

## Adding Data to Many-to-Many Relationships

### Adding Relationships
```python
from sqlmodel import Session, select, create_engine

def add_hero_to_team(hero_id: int, team_id: int, role: str = "member"):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Create a new link record to establish the relationship
        hero_team_link = HeroTeamLink(
            hero_id=hero_id,
            team_id=team_id,
            role=role
        )

        session.add(hero_team_link)
        session.commit()
        print(f"Added hero {hero_id} to team {team_id} as {role}")

def remove_hero_from_team(hero_id: int, team_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Find the specific link record
        statement = select(HeroTeamLink).where(
            HeroTeamLink.hero_id == hero_id,
            HeroTeamLink.team_id == team_id
        )
        link = session.exec(statement).one_or_none()

        if link:
            session.delete(link)
            session.commit()
            print(f"Removed hero {hero_id} from team {team_id}")
        else:
            print("No relationship found between hero and team")
```

### Batch Adding Relationships
```python
from sqlmodel import Session, select, create_engine

def assign_multiple_heroes_to_team(hero_ids: list[int], team_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        for hero_id in hero_ids:
            # Check if relationship already exists
            statement = select(HeroTeamLink).where(
                HeroTeamLink.hero_id == hero_id,
                HeroTeamLink.team_id == team_id
            )
            existing = session.exec(statement).one_or_none()

            if not existing:
                link = HeroTeamLink(
                    hero_id=hero_id,
                    team_id=team_id,
                    role="member"
                )
                session.add(link)

        session.commit()
        print(f"Assigned {len(hero_ids)} heroes to team {team_id}")
```

## Querying Through Many-to-Many

### Complex Queries with Joins
```python
from sqlmodel import Session, select, create_engine

def get_heroes_in_team(team_name: str):
    """
    Get all heroes that belong to a specific team
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = (
            select(Hero)
            .join(HeroTeamLink)
            .join(Team)
            .where(Team.name == team_name)
        )
        heroes = session.exec(statement).all()
        return heroes

def get_teams_for_hero(hero_name: str):
    """
    Get all teams that a specific hero belongs to
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = (
            select(Team)
            .join(HeroTeamLink)
            .join(Hero)
            .where(Hero.name == hero_name)
        )
        teams = session.exec(statement).all()
        return teams

def get_heroes_with_multiple_teams(min_team_count: int = 2):
    """
    Get heroes that belong to at least min_team_count teams
    """
    from sqlalchemy import func

    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = (
            select(Hero)
            .join(HeroTeamLink)
            .group_by(Hero.id)
            .having(func.count(HeroTeamLink.team_id) >= min_team_count)
        )
        heroes = session.exec(statement).all()
        return heroes
```

### Filtering by Relationship Criteria
```python
from sqlmodel import Session, select, create_engine

def get_active_members_of_team(team_id: int):
    """
    Get all active members of a specific team
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = (
            select(Hero)
            .join(HeroTeamLink)
            .where(
                HeroTeamLink.team_id == team_id,
                HeroTeamLink.is_active == True
            )
        )
        heroes = session.exec(statement).all()
        return heroes

def get_heroes_by_role_in_team(team_id: int, role: str):
    """
    Get heroes with a specific role in a team
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        statement = (
            select(Hero)
            .join(HeroTeamLink)
            .where(
                HeroTeamLink.team_id == team_id,
                HeroTeamLink.role == role
            )
        )
        heroes = session.exec(statement).all()
        return heroes
```

## Real-World Use Cases

### Students Enrolled in Multiple Courses
```python
from sqlmodel import Field, Relationship, SQLModel
from typing import List
from datetime import datetime

class Student(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    courses: List["Course"] = Relationship(
        back_populates="students",
        link_model="StudentCourseEnrollment"
    )

class Course(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    code: str
    students: List["Student"] = Relationship(
        back_populates="courses",
        link_model="StudentCourseEnrollment"
    )

class StudentCourseEnrollment(SQLModel, table=True):
    student_id: int = Field(foreign_key="student.id", primary_key=True)
    course_id: int = Field(foreign_key="course.id", primary_key=True)
    enrollment_date: datetime = Field(default_factory=datetime.now)
    grade: str | None = Field(default=None)
    status: str = Field(default="enrolled")  # enrolled, completed, dropped

def enroll_student_in_course(student_id: int, course_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        enrollment = StudentCourseEnrollment(
            student_id=student_id,
            course_id=course_id
        )
        session.add(enrollment)
        session.commit()
        print(f"Student {student_id} enrolled in course {course_id}")
```

### Users Following Multiple Tags
```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    email: str
    following_tags: List["Tag"] = Relationship(
        back_populates="followers",
        link_model="UserTagFollow"
    )

class Tag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    followers: List["User"] = Relationship(
        back_populates="following_tags",
        link_model="UserTagFollow"
    )

class UserTagFollow(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
```

### Articles with Multiple Categories
```python
class Article(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    categories: List["Category"] = Relationship(
        back_populates="articles",
        link_model="ArticleCategory"
    )

class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    articles: List["Article"] = Relationship(
        back_populates="categories",
        link_model="ArticleCategory"
    )

class ArticleCategory(SQLModel, table=True):
    article_id: int = Field(foreign_key="article.id", primary_key=True)
    category_id: int = Field(foreign_key="category.id", primary_key=True)
    assigned_at: datetime = Field(default_factory=datetime.now)
    is_primary: bool = Field(default=False)
```

## Cascade Delete Strategies

### Handling Deletions in Many-to-Many
```python
from sqlmodel import Session, select, create_engine

def delete_hero_and_remove_from_teams(hero_id: int):
    """
    Delete a hero and automatically remove them from all teams
    (due to foreign key constraints in the link table)
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # First, delete the link records (or rely on cascade delete)
        # Then delete the hero
        hero = session.get(Hero, hero_id)
        if hero:
            # Get team memberships before deletion
            team_count = len(hero.teams)

            session.delete(hero)
            session.commit()
            print(f"Deleted hero and removed from {team_count} teams")
```

### Preventing Orphaned Link Records
```python
from sqlmodel import Session, select, create_engine

def safe_delete_team(team_id: int):
    """
    Safely delete a team and handle its relationships
    """
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        # Get all link records for this team
        statement = select(HeroTeamLink).where(HeroTeamLink.team_id == team_id)
        links = session.exec(statement).all()

        print(f"Removing {len(links)} heroes from team before deletion")

        # Delete all link records first
        for link in links:
            session.delete(link)

        # Then delete the team itself
        team = session.get(Team, team_id)
        if team:
            session.delete(team)

        session.commit()
        print(f"Team {team_id} deleted successfully")
```

## Query Examples

### Get All Teams for a Hero
```python
from sqlmodel import Session, create_engine

def get_teams_for_hero_by_id(hero_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        hero = session.get(Hero, hero_id)
        if hero:
            teams = hero.teams
            print(f"Hero {hero.name} belongs to {len(teams)} teams:")
            for team in teams:
                print(f"  - {team.name}")
            return teams
        return []
```

### Get All Heroes in a Team
```python
from sqlmodel import Session, create_engine

def get_heroes_in_team_by_id(team_id: int):
    engine = create_engine("sqlite:///database.db")

    with Session(engine) as session:
        team = session.get(Team, team_id)
        if team:
            heroes = team.heroes
            print(f"Team {team.name} has {len(heroes)} heroes:")
            for hero in heroes:
                print(f"  - {hero.name}")
            return heroes
        return []
```

## Quick Reference

### Many-to-Many Structure
```python
# Link table
class ModelALink(SQLModel, table=True):
    model_a_id: int = Field(foreign_key="modela.id", primary_key=True)
    model_b_id: int = Field(foreign_key="modelb.id", primary_key=True)
    # Optional: additional fields on the relationship

# Model A
class ModelA(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    model_bs: List["ModelB"] = Relationship(
        back_populates="model_as",
        link_model=ModelALink
    )

# Model B
class ModelB(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    model_as: List["ModelA"] = Relationship(
        back_populates="model_bs",
        link_model=ModelALink
    )
```

### Adding Relationships
```python
# Add relationship
link = ModelALink(model_a_id=a_id, model_b_id=b_id)
session.add(link)
session.commit()
```

### Querying Relationships
```python
# Get related objects from ModelA perspective
model_a = session.get(ModelA, a_id)
related_bs = model_a.model_bs

# Get related objects from ModelB perspective
model_b = session.get(ModelB, b_id)
related_as = model_b.model_as
```

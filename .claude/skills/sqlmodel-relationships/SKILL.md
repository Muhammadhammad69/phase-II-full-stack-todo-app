---
name: sqlmodel-relationships
description: SQLModel relationships and associations - learn how to define and work with one-to-many, many-to-many, and self-referencing relationships. Use this skill when Claude needs to work with related data models, complex database schemas, or relationship-based queries in SQLModel projects.
---

# SQLModel Relationships

## Overview

This skill covers how to define and work with relationships between SQLModel entities. Learn how to create one-to-many, many-to-many, and self-referencing relationships while maintaining data integrity and efficient querying.

## One-to-Many Relationships

### Basic One-to-Many Setup
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

    # One-to-many relationship: One author has many books
    books: List["Book"] = Relationship(back_populates="author")

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author_id: int = Field(foreign_key="author.id")

    # Back reference to author
    author: Author = Relationship(back_populates="books")
```

### Working with One-to-Many Relationships
```python
from sqlmodel import Session, select

def get_author_with_books(session: Session, author_id: int):
    """Get an author and all their books."""
    author = session.exec(
        select(Author)
        .where(Author.id == author_id)
    ).first()

    # The books are loaded lazily, so we need to access them
    if author:
        # This will trigger a separate query to load books
        books = author.books
    return author

def create_author_with_books(session: Session, author_data: dict, book_data_list: list[dict]):
    """Create an author and their books in a single transaction."""
    author = Author(**author_data)
    session.add(author)
    session.flush()  # Get the author ID without committing

    for book_data in book_data_list:
        book = Book(author_id=author.id, **book_data)
        session.add(book)

    session.commit()
    return author
```

## Many-to-Many Relationships

### Association Table Pattern
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List

# Association table for many-to-many relationship
class BookAuthorLink(SQLModel, table=True):
    book_id: int = Field(foreign_key="book.id", primary_key=True)
    author_id: int = Field(foreign_key="author.id", primary_key=True)
    # Additional fields can be added to the association table
    role: str = "writer"  # e.g., "writer", "editor", "illustrator"

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

    # Many-to-many relationship through association table
    books: List["Book"] = Relationship(
        back_populates="authors",
        link_model=BookAuthorLink
    )

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    isbn: str

    # Many-to-many relationship through association table
    authors: List[Author] = Relationship(
        back_populates="books",
        link_model=BookAuthorLink
    )
```

### Working with Many-to-Many Relationships
```python
def create_book_with_multiple_authors(session: Session, book_data: dict, author_ids: list[int]):
    """Create a book with multiple authors."""
    book = Book(**book_data)
    session.add(book)
    session.flush()  # Get book ID without committing

    # Create association records
    for author_id in author_ids:
        link = BookAuthorLink(book_id=book.id, author_id=author_id)
        session.add(link)

    session.commit()
    return book

def get_book_with_authors(session: Session, book_id: int):
    """Get a book with all its authors."""
    book = session.exec(
        select(Book)
        .where(Book.id == book_id)
    ).first()
    return book

def add_author_to_book(session: Session, book_id: int, author_id: int, role: str = "writer"):
    """Add an author to a book."""
    link = BookAuthorLink(book_id=book_id, author_id=author_id, role=role)
    session.add(link)
    session.commit()
```

### Many-to-Many with Additional Data
```python
# More complex example with additional data in the association table
class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    courses: List["Course"] = Relationship(
        back_populates="students",
        link_model="StudentCourseEnrollment"
    )

class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: str

    students: List[Student] = Relationship(
        back_populates="courses",
        link_model="StudentCourseEnrollment"
    )

class StudentCourseEnrollment(SQLModel, table=True):
    student_id: int = Field(foreign_key="student.id", primary_key=True)
    course_id: int = Field(foreign_key="course.id", primary_key=True)

    enrollment_date: datetime = Field(default_factory=datetime.utcnow)
    grade: Optional[str] = Field(default=None)
    completed: bool = False
```

## Self-Referencing Relationships

### Hierarchical Data
```python
class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = Field(default=None)

    # Self-referencing foreign key
    parent_id: Optional[int] = Field(default=None, foreign_key="category.id")

    # Relationships
    parent: Optional["Category"] = Relationship(
        back_populates="subcategories",
        sa_relationship_kwargs={
            "remote_side": "Category.id"
        }
    )
    subcategories: List["Category"] = Relationship(back_populates="parent")

# Example usage:
def get_category_tree(session: Session, category_id: int):
    """Get a category and its subcategories recursively."""
    category = session.get(Category, category_id)
    return category
```

### Employee-Manager Relationship
```python
class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    position: str
    salary: float

    # Self-referencing foreign key for manager
    manager_id: Optional[int] = Field(default=None, foreign_key="employee.id")

    # Relationships
    manager: Optional["Employee"] = Relationship(
        back_populates="subordinates",
        sa_relationship_kwargs={
            "remote_side": "Employee.id"
        }
    )
    subordinates: List["Employee"] = Relationship(back_populates="manager")
```

## Relationship Loading Strategies

### Lazy Loading (Default)
```python
# By default, relationships are loaded lazily
author = session.get(Author, 1)
# At this point, author.books is not loaded yet
# It will be loaded when accessed: len(author.books)
```

### Eager Loading with selectinload
```python
from sqlalchemy.orm import selectinload

def get_author_with_books_eager(session: Session, author_id: int):
    """Get author with books using eager loading."""
    statement = (
        select(Author)
        .options(selectinload(Author.books))
        .where(Author.id == author_id)
    )
    author = session.exec(statement).first()
    return author

def get_authors_with_books_eager(session: Session):
    """Get multiple authors with their books efficiently."""
    statement = select(Author).options(selectinload(Author.books))
    authors = session.exec(statement).all()
    return authors
```

### Eager Loading with joinedload
```python
from sqlalchemy.orm import joinedload

def get_author_with_books_joined(session: Session, author_id: int):
    """Get author with books using JOIN."""
    statement = (
        select(Author)
        .options(joinedload(Author.books))
        .where(Author.id == author_id)
    )
    author = session.exec(statement).first()
    return author
```

## Advanced Relationship Patterns

### One-to-One Relationship
```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str

class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)  # Unique constraint makes it one-to-one
    bio: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None)

    user: User = Relationship(back_populates="profile")

# Add the back reference to User
User.profile = Relationship(back_populates="user", uselist=False)
```

### Polymorphic Relationships
```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    author_id: int = Field(foreign_key="user.id")
    author: User = Relationship()

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    user_id: int = Field(foreign_key="user.id")

    # Generic foreign key for different item types
    item_id: int
    item_type: str  # 'post' or 'product'

    user: User = Relationship()
```

## Relationship Constraints and Validation

### Cascading Operations
```python
class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    # Cascade delete: when author is deleted, all their books are also deleted
    books: List["Book"] = Relationship(
        back_populates="author",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        }
    )

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author_id: int = Field(foreign_key="author.id")
    author: Author = Relationship(back_populates="books")
```

### Relationship Validation
```python
from pydantic import validator

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author_id: int = Field(foreign_key="author.id")

    # Custom validation to ensure author exists
    @validator('author_id')
    def validate_author_exists(cls, v, values):
        # This would be validated at the database level with foreign keys
        # But you can add application-level validation here if needed
        return v
```

## Working with Relationships in Practice

### Creating Related Objects
```python
def create_author_and_first_book(session: Session, author_data: dict, book_data: dict):
    """Create an author and their first book."""
    author = Author(**author_data)
    session.add(author)
    session.flush()  # Get the author ID

    book = Book(author_id=author.id, **book_data)
    session.add(book)

    session.commit()
    return author, book

def add_book_to_existing_author(session: Session, author_id: int, book_data: dict):
    """Add a book to an existing author."""
    author = session.get(Author, author_id)
    if not author:
        raise ValueError("Author not found")

    book = Book(author_id=author_id, **book_data)
    session.add(book)
    session.commit()
    return book
```

### Querying with Relationships
```python
def get_authors_with_book_count(session: Session):
    """Get authors with the count of their books."""
    from sqlalchemy import func

    statement = (
        select(Author, func.count(Book.id).label('book_count'))
        .join(Book, isouter=True)
        .group_by(Author.id)
    )

    results = session.exec(statement).all()
    return results

def get_books_with_author_info(session: Session):
    """Get books with their author information."""
    statement = select(Book, Author).join(Author)
    results = session.exec(statement).all()
    return results
```

## Performance Considerations

### Avoiding N+1 Query Problems
```python
# BAD: This causes N+1 queries
authors = session.exec(select(Author)).all()
for author in authors:
    print(f"{author.name} has {len(author.books)} books")  # Each access triggers a query!

# GOOD: Use eager loading to avoid N+1
authors = session.exec(
    select(Author).options(selectinload(Author.books))
).all()
for author in authors:
    print(f"{author.name} has {len(author.books)} books")  # No additional queries
```

### Using Contains Eager for Complex Queries
```python
from sqlalchemy.orm import contains_eager

def get_authors_with_filtered_books(session: Session, min_pages: int):
    """Get authors with books that have more than min_pages pages."""
    statement = (
        select(Author)
        .join(Book)
        .options(contains_eager(Author.books))
        .where(Book.pages > min_pages)
    )
    authors = session.exec(statement).all()
    return authors
```

## Best Practices

1. **Choose the right loading strategy**: Use lazy loading for single records, eager loading for collections
2. **Be aware of N+1 queries**: Always consider the query pattern when accessing relationships
3. **Use appropriate constraints**: Foreign keys, unique constraints, and check constraints
4. **Consider performance**: For frequently accessed relationships, consider denormalization
5. **Handle circular references**: Be careful with bidirectional relationships in serialization
6. **Use association tables for many-to-many**: When you need additional data on the relationship
7. **Validate relationship integrity**: Ensure referential integrity at both database and application level
8. **Use cascading operations appropriately**: Understand the implications of cascade options

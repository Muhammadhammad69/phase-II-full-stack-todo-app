---
name: sqlmodel-models
description: Advanced SQLModel model definitions - learn how to create complex models with relationships, inheritance, and advanced field configurations. Use this skill when Claude needs to work with complex SQLModel model structures, model inheritance, advanced relationships, or complex field configurations in SQLModel projects.
---

# SQLModel Models - Advanced Patterns

## Overview

This skill covers advanced SQLModel model patterns including inheritance, complex relationships, and advanced field configurations. Learn how to structure complex data models effectively while maintaining type safety and validation.

## Model Inheritance Patterns

### Single Table Inheritance
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class BaseUser(SQLModel):
    name: str
    email: str

class Customer(BaseUser, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: str
    loyalty_points: int = 0

class Employee(BaseUser, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: str
    department: str
    salary: float
```

### Abstract Base Models
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class TimestampMixin:
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AuditMixin:
    created_by: Optional[str] = Field(default=None)
    updated_by: Optional[str] = Field(default=None)

class BaseModel(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)

class Product(BaseModel, TimestampMixin, AuditMixin, table=True):
    name: str
    price: float
    description: Optional[str] = Field(default=None)
```

## Advanced Field Configurations

### JSON Fields
```python
from sqlmodel import SQLModel, Field
from typing import Optional, Dict, Any
from sqlalchemy import JSON

class UserConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    preferences: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": JSON})
    settings: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": JSON})
```

### Array Fields (PostgreSQL)
```python
from sqlmodel import SQLModel, Field
from typing import Optional, List
from sqlalchemy.dialects.postgresql import ARRAY
import sqlalchemy as sa

class TaggedItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tags: Optional[List[str]] = Field(default=None, sa_column=sa.Column(ARRAY(sa.String)))
```

### Computed Fields
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    discount_percent: float = 0.0
    # Computed field - calculated at the database level
    discounted_price: Optional[float] = Field(
        sa_column_kwargs={
            "server_default": sa.text("(price * (1 - discount_percent / 100))")
        }
    )
```

## Complex Relationships

### Many-to-Many Relationships
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

# Association table for many-to-many relationship
class TeamHeroLink(SQLModel, table=True):
    team_id: int = Field(foreign_key="team.id", primary_key=True)
    hero_id: int = Field(foreign_key="hero.id", primary_key=True)
    is_team_leader: bool = False

class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    headquarters: str

    heroes: List["Hero"] = Relationship(back_populates="teams", link_model=TeamHeroLink)

class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: Optional[int] = None

    teams: List[Team] = Relationship(back_populates="heroes", link_model=TeamHeroLink)
```

### Self-Referencing Models
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

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
```

### Polymorphic Relationships
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str

    # Generic foreign key using integer
    item_id: int
    item_type: str  # 'post' or 'product'

    # Relationship to the user who made the comment
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship()
```

## Model Validation Patterns

### Cross-field Validation
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from pydantic import validator

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    sale_price: Optional[float] = None
    sale_start: Optional[datetime] = None
    sale_end: Optional[datetime] = None

    @validator('sale_price')
    def validate_sale_price(cls, v, values):
        if v is not None and 'price' in values and v > values['price']:
            raise ValueError('Sale price must be less than regular price')
        return v

    @validator('sale_end')
    def validate_sale_dates(cls, v, values):
        if v and 'sale_start' in values and values['sale_start']:
            if v < values['sale_start']:
                raise ValueError('Sale end must be after sale start')
        return v
```

### Custom Validators with Complex Logic
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from pydantic import validator
import re

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    password: str
    role: str = "user"

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v

    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['user', 'admin', 'moderator', 'guest']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v
```

## Model Configuration Options

### Table Configuration
```python
from sqlmodel import SQLModel, Field
from typing import Optional
import sqlalchemy as sa

class Product(SQLModel, table=True):
    __tablename__ = "products"
    __table_args__ = (
        sa.UniqueConstraint("name", "category_id"),
        sa.Index("idx_product_category", "category_id"),
        sa.CheckConstraint("price > 0", name="check_positive_price"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category_id: int
    price: float
```

### Index Configuration
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy import Index

class User(SQLModel, table=True):
    __table_args__ = (
        Index("idx_user_email_domain", "email", postgresql_using="hash"),
        Index("idx_user_name_gin", "name", postgresql_using="gin"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # Single column index
    email: str = Field(unique=True, index=True)  # Unique index
    full_name: str = Field(sa_column_kwargs={"name": "full_name"})
```

## Model Lifecycle Events

### Using SQLAlchemy Events with SQLModel
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy import event
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# SQLAlchemy event listeners
@event.listens_for(User, "before_update")
def before_update(mapper, connection, target):
    target.updated_at = datetime.utcnow()

@event.listens_for(User, "before_insert")
def before_insert(mapper, connection, target):
    if not hasattr(target, 'created_at') or target.created_at is None:
        target.created_at = datetime.utcnow()
```

## Model Relationships Best Practices

### Eager Loading Configuration
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    # Define relationship with specific loading strategy
    books: List["Book"] = Relationship(
        back_populates="author",
        sa_relationship_kwargs={
            "lazy": "selectin"  # Use selectin loading for better performance
        }
    )

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author_id: int = Field(foreign_key="author.id")

    author: Author = Relationship(back_populates="books")
```

### Relationship Cascade Options
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    # Cascade options for related data
    posts: List["Post"] = Relationship(
        back_populates="author",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",  # Delete posts when user is deleted
            " passive_deletes": True
        }
    )

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    author_id: int = Field(foreign_key="user.id")

    author: User = Relationship(back_populates="posts")
```

## Model Patterns for Different Use Cases

### Audit Trail Model
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    table_name: str
    record_id: int
    action: str  # 'CREATE', 'UPDATE', 'DELETE'
    old_values: Optional[dict] = Field(default=None, sa_column_kwargs={"type_": JSON})
    new_values: Optional[dict] = Field(default=None, sa_column_kwargs={"type_": JSON})
    changed_by: Optional[str] = Field(default=None)
    changed_at: datetime = Field(default_factory=datetime.utcnow)
```

### Soft Delete Pattern
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class BaseModel(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    deleted_at: Optional[datetime] = Field(default=None)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

class Product(BaseModel, table=True):
    __table_args__ = (
        # Only show non-deleted records by default
        sa.CheckConstraint("deleted_at IS NULL", name="not_deleted"),
    )

    name: str
    price: float
    description: Optional[str] = Field(default=None)
```

## Performance Considerations

### Large Text Fields
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy import Text

class Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    # Use Text for large content to optimize storage
    content: Optional[str] = Field(default=None, sa_column=sa.Column(Text))
    summary: Optional[str] = Field(default=None, max_length=500)
```

### Enum Fields for Performance
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum

class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    status: Status = Field(default=Status.PENDING)
```

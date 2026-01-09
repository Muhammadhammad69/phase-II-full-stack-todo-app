---
name: sqlmodel-migrations
description: Database migrations with SQLModel using Alembic - learn how to create, run, and manage schema migrations. Use this skill when Claude needs to work with database schema evolution, version control for database changes, migration generation, or schema management in SQLModel projects.
---

# SQLModel Migrations

## Overview

This skill covers database migrations with SQLModel using Alembic, the database migration tool for SQLAlchemy. Learn how to generate, apply, and manage schema changes in a controlled and versioned manner, ensuring data integrity and application stability during database evolution.

## Alembic Setup for SQLModel

### Installation and Configuration
```bash
pip install alembic
```

### Alembic Configuration (alembic.ini)
```ini
[alembic]
# path to migration scripts
script_location = alembic

# template used to generate migration files
# file_template = %%(rev)s_%%(slug)s

# sys.path path, will be prepended to sys.path if present.
# defaults to the current working directory.
prepend_sys_path = .

# timezone to use when rendering the date within the migration file
# as well as the filename.
# If specified, requires the python-dateutil library that can be
# installed by adding `alembic[tz]` to the pip requirements
# string value is passed to dateutil.tz.gettz()
# leave blank for localtime
# timezone =

# max length of characters to apply to the
# "slug" field
# max_length = 40

# set to 'true' to run the environment during
# the 'revision' command, regardless of autogenerate
# revision_environment = false

# set to 'true' to allow .pyc and .pyo files without
# a source .py file to be detected as revisions in the
# versions/ directory
# sourceless = false

# version number format
version_num_format = %04d

# version path separator; As mentioned above, this is the character used to split
# version_locations. The default within new alembic.ini files is "os", which uses
# os.pathsep. If this key is omitted entirely, it falls back to the legacy
# behavior of splitting on spaces and/or commas.
# Valid values for version_path_separator are:
#
# version_path_separator = :
# version_path_separator = ;
# version_path_separator = space
version_path_separator = os

# the output encoding used when revision files
# are written from script.py.mako
# output_encoding = utf-8

sqlalchemy.url = sqlite:///./database.db
```

### Alembic Environment Configuration (alembic/env.py)
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Import your SQLModel models
from main import SQLModel  # Import your SQLModel metadata

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = SQLModel.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## SQLModel Model Definitions for Migrations

### Basic Model Setup
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    age: Optional[int] = Field(default=None)
```

### Model with Relationships for Migrations
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)

class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    price: float
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")

    # Relationship (won't affect migrations but good to define)
    category: Optional[Category] = Relationship()
```

## Migration Workflow

### Initialize Alembic
```bash
alembic init alembic
```

### Generate Initial Migration
```bash
# Generate an initial migration from your models
alembic revision --autogenerate -m "Initial migration"
```

### Apply Migrations
```bash
# Apply the migration to the database
alembic upgrade head
```

## Common Migration Scenarios

### Adding a New Column
```python
# In your model
from datetime import datetime

class User(SQLModel, table=True):
    # ... existing fields ...
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
```

Then generate and apply migration:
```bash
alembic revision --autogenerate -m "Add created_at and is_active to User"
alembic upgrade head
```

### Modifying Column Properties
```python
# Change a field definition
class User(SQLModel, table=True):
    # ... other fields ...
    email: str = Field(unique=True, index=True, max_length=255)  # Added max_length
```

### Adding a New Table
```python
# Add a new model
from datetime import datetime

class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    total_amount: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### Adding Indexes
```python
from sqlalchemy import Index

class User(SQLModel, table=True):
    __tablename__ = "users"

    # Define table indexes
    __table_args__ = (
        Index("idx_user_email_domain", "email"),
        Index("idx_user_name", "name"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
```

## Advanced Migration Patterns

### Custom Migration Operations
```python
# Manual migration file (alembic/versions/xxx_add_user_status.py)
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql  # If using PostgreSQL

def upgrade() -> None:
    # Add a new column with a default value
    op.add_column('users', sa.Column('status', sa.String(), server_default='active', nullable=False))

    # Create an index
    op.create_index('idx_users_status', 'users', ['status'])

    # Add a check constraint
    op.create_check_constraint('check_positive_age', 'users', 'age >= 0')

def downgrade() -> None:
    # Remove the check constraint
    op.drop_constraint('check_positive_age', 'users', type_='check')

    # Drop the index
    op.drop_index('idx_users_status')

    # Remove the column
    op.drop_column('users', 'status')
```

### Data Migrations
```python
# Migration that also modifies data
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String

def upgrade() -> None:
    # Add new column
    op.add_column('users', sa.Column('display_name', String(), nullable=True))

    # Update existing records
    users_table = table('users',
        column('display_name', String()),
        column('name', String())
    )

    op.execute(
        users_table.update().values(
            display_name=users_table.c.name
        )
    )

    # Make the column non-nullable
    op.alter_column('users', 'display_name', nullable=False)

def downgrade() -> None:
    op.drop_column('users', 'display_name')
```

## Migration Best Practices

### Migration File Structure
```python
# Example migration file
"""Add user preferences

Revision ID: abc123def456
Revises: 7a8b9c0d1e2f
Create Date: 2023-06-15 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel  # This might be needed depending on your setup

# revision identifiers, used by Alembic.
revision = 'abc123def456'
down_revision = '7a8b9c0d1e2f'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Migration operations
    pass

def downgrade() -> None:
    # Rollback operations
    pass
```

### Handling Relationships in Migrations
```python
def upgrade() -> None:
    # Create related tables in the right order (referenced first)
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.create_table('products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('products')
    op.drop_table('categories')
```

## Migration Management Commands

### Common Alembic Commands
```bash
# Check current migration status
alembic current

# Show migration history
alembic history

# Show available migrations
alembic heads

# Generate a new migration
alembic revision --autogenerate -m "Description of change"

# Apply migrations up to a specific version
alembic upgrade <revision_id>

# Rollback to a previous version
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base

# Show current database revision
alembic current
```

## Environment-Specific Migrations

### Multiple Database Configuration
```python
# alembic/env.py - Multiple databases
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Import all your models
from main import SQLModel

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# For multiple databases
def run_migrations_online():
    """Run migrations in 'online' mode for multiple databases."""

    # Define multiple URLs for different databases
    databases = {
        'main': config.get_main_option("sqlalchemy.url"),
        'analytics': config.get_main_option("sqlalchemy.analytics_url"),
    }

    for db_name, db_url in databases.items():
        connectable = engine_from_config(
            {"sqlalchemy.url": db_url},
            prefix="",
            poolclass=pool.NullPool,
        )

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=SQLModel.metadata,
                # Use a prefix to distinguish between databases
                version_table=f"{db_name}_alembic_version"
            )

            with context.begin_transaction():
                context.run_migrations()
```

## Migration Testing

### Testing Migration Scripts
```python
import pytest
from alembic.command import upgrade, downgrade
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def test_migration_up_down():
    """Test that migrations can be applied and rolled back."""
    # Setup test database
    test_db_url = "sqlite:///./test_migration.db"
    engine = create_engine(test_db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Configure alembic
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", test_db_url)

    # Upgrade to latest
    upgrade(alembic_cfg, "head")

    # Verify tables exist
    with engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        assert "users" in tables

    # Downgrade to base
    downgrade(alembic_cfg, "base")

    # Verify tables are removed
    with engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        assert "users" not in tables
```

## Production Deployment Strategies

### Zero-Downtime Migration Strategy
```python
# Example of backward-compatible migration
def upgrade() -> None:
    # 1. Add new column with default value
    op.add_column('users', sa.Column('new_field', sa.String(), server_default='', nullable=False))

    # 2. Update existing records in batches (for large tables)
    # This can be done in the application code before or after migration

    # 3. Create new indexes
    op.create_index('idx_users_new_field', 'users', ['new_field'])

def downgrade() -> None:
    # Remove new elements in reverse order
    op.drop_index('idx_users_new_field')
    op.drop_column('users', 'new_field')
```

### Migration Validation
```python
def validate_migration():
    """Validate that the migration was applied correctly."""
    # Check that all expected tables exist
    # Check that all expected columns exist
    # Check that data integrity is maintained
    pass
```

## Best Practices

1. **Always backup before migrating**: Create database backups before running migrations in production
2. **Test migrations thoroughly**: Test both upgrade and downgrade operations
3. **Use transactions**: Wrap migration operations in transactions when possible
4. **Handle data migrations carefully**: Large data migrations should be done in batches
5. **Maintain backward compatibility**: During deployment, ensure old and new code can work together
6. **Document migration impact**: Note any breaking changes or required application updates
7. **Use meaningful migration messages**: Write clear descriptions of what each migration does
8. **Review auto-generated migrations**: Always review and modify auto-generated migrations as needed
9. **Plan for rollbacks**: Ensure you can rollback migrations if issues occur
10. **Run migrations during maintenance windows**: For production systems, schedule migrations carefully

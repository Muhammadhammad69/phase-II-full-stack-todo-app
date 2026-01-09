---
name: sqlmodel-queries
description: Advanced SQLModel querying techniques - learn how to build complex queries, aggregations, joins, and subqueries. Use this skill when Claude needs to work with complex data retrieval, advanced filtering, aggregations, or performance-optimized queries in SQLModel projects.
---

# SQLModel Queries - Advanced Techniques

## Overview

This skill covers advanced querying techniques with SQLModel, including complex filtering, aggregations, joins, subqueries, and performance optimization strategies. Learn how to write efficient queries that leverage the full power of SQL while maintaining type safety.

## Basic Query Patterns

### Select Queries
```python
from sqlmodel import SQLModel, Field, select
from typing import Optional, List

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    age: int

def get_all_users(session):
    """Get all users."""
    statement = select(User)
    users = session.exec(statement).all()
    return users

def get_user_by_id(session, user_id: int):
    """Get a single user by ID."""
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    return user

def get_users_by_age_range(session, min_age: int, max_age: int):
    """Get users within an age range."""
    statement = select(User).where(User.age >= min_age, User.age <= max_age)
    users = session.exec(statement).all()
    return users
```

### Complex Filtering
```python
from sqlalchemy import and_, or_, not_

def get_active_users_with_conditions(session):
    """Get users with complex conditions."""
    statement = select(User).where(
        and_(
            User.age >= 18,
            or_(
                User.email.contains("@gmail.com"),
                User.email.contains("@yahoo.com")
            ),
            not_(User.name.startswith("Test"))
        )
    )
    users = session.exec(statement).all()
    return users

def search_users(session, name_pattern: str = None, min_age: int = None, email_domain: str = None):
    """Search users with optional filters."""
    statement = select(User)

    if name_pattern:
        statement = statement.where(User.name.contains(name_pattern))
    if min_age:
        statement = statement.where(User.age >= min_age)
    if email_domain:
        statement = statement.where(User.email.contains(f"@{email_domain}"))

    users = session.exec(statement).all()
    return users
```

## Aggregation Queries

### Count, Sum, Average
```python
from sqlalchemy import func

def get_user_count(session):
    """Get total count of users."""
    statement = select(func.count(User.id))
    count = session.exec(statement).one()
    return count

def get_average_age(session):
    """Get average age of users."""
    statement = select(func.avg(User.age))
    avg_age = session.exec(statement).one()
    return avg_age

def get_age_statistics(session):
    """Get various age statistics."""
    statement = select(
        func.count(User.id).label('total_users'),
        func.avg(User.age).label('avg_age'),
        func.min(User.age).label('min_age'),
        func.max(User.age).label('max_age'),
        func.sum(User.age).label('sum_age')
    )
    result = session.exec(statement).one()
    return {
        'total_users': result.total_users,
        'avg_age': float(result.avg_age) if result.avg_age else 0,
        'min_age': result.min_age,
        'max_age': result.max_age,
        'sum_age': result.sum_age
    }
```

### Group By Operations
```python
def get_users_by_age_group(session):
    """Group users by age ranges."""
    statement = select(
        func.floor(User.age / 10) * 10,
        func.count(User.id)
    ).group_by(func.floor(User.age / 10)).order_by(func.floor(User.age / 10))

    results = session.exec(statement).all()
    return [(int(age_range * 10), count) for age_range, count in results]

def get_users_by_email_domain(session):
    """Group users by email domain."""
    statement = select(
        func.substring(User.email, func.position('@', User.email) + 1),
        func.count(User.id)
    ).group_by(func.substring(User.email, func.position('@', User.email) + 1))

    results = session.exec(statement).all()
    return results
```

## Join Queries

### Simple Joins
```python
class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship()

def get_posts_with_authors(session):
    """Get posts with their authors."""
    statement = select(Post, User).join(User)
    results = session.exec(statement).all()
    return results

def get_users_with_post_count(session):
    """Get users with their post counts."""
    from sqlalchemy import func

    statement = (
        select(User, func.count(Post.id).label('post_count'))
        .join(Post, isouter=True)
        .group_by(User.id)
        .order_by(func.count(Post.id).desc())
    )
    results = session.exec(statement).all()
    return results
```

### Complex Joins with Multiple Tables
```python
class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

class PostCategory(SQLModel, table=True):
    post_id: int = Field(foreign_key="post.id", primary_key=True)
    category_id: int = Field(foreign_key="category.id", primary_key=True)

def get_posts_with_authors_and_categories(session):
    """Get posts with authors and categories."""
    statement = (
        select(Post, User, Category)
        .join(User)
        .join(PostCategory)
        .join(Category)
    )
    results = session.exec(statement).all()
    return results

def get_authors_with_category_stats(session):
    """Get authors with category statistics."""
    statement = (
        select(
            User.name,
            Category.name,
            func.count(Post.id).label('post_count')
        )
        .join(Post)
        .join(PostCategory)
        .join(Category)
        .group_by(User.id, Category.id)
    )
    results = session.exec(statement).all()
    return results
```

## Subqueries and CTEs

### Subqueries
```python
def get_users_with_above_average_posts(session):
    """Get users who have more posts than the average."""
    avg_posts_subquery = (
        select(func.avg(func.count(Post.id)))
        .join(User)
        .group_by(Post.user_id)
        .scalar_subquery()
    )

    statement = (
        select(User)
        .join(Post)
        .group_by(User.id)
        .having(func.count(Post.id) > avg_posts_subquery)
    )
    users = session.exec(statement).all()
    return users

def get_users_with_most_recent_posts(session):
    """Get users with their most recent post."""
    from sqlalchemy import desc

    # Subquery to find the most recent post date for each user
    latest_posts = (
        select(Post.user_id, func.max(Post.id).label('latest_post_id'))
        .group_by(Post.user_id)
        .subquery()
    )

    statement = (
        select(User, Post)
        .join(latest_posts, User.id == latest_posts.c.user_id)
        .join(Post, Post.id == latest_posts.c.latest_post_id)
    )
    results = session.exec(statement).all()
    return results
```

### Common Table Expressions (CTEs)
```python
def get_user_post_rankings(session):
    """Get users ranked by post count using CTE."""
    post_counts_cte = (
        select(
            User.id.label('user_id'),
            User.name.label('user_name'),
            func.count(Post.id).label('post_count')
        )
        .join(Post, isouter=True)
        .group_by(User.id, User.name)
        .cte()
    )

    statement = (
        select(
            post_counts_cte.c.user_name,
            post_counts_cte.c.post_count,
            func.rank().over(order_by=post_counts_cte.c.post_count.desc()).label('rank')
        )
        .select_from(post_counts_cte)
    )
    results = session.exec(statement).all()
    return results
```

## Advanced Query Techniques

### Window Functions
```python
def get_users_with_rankings(session):
    """Get users with various rankings using window functions."""
    statement = (
        select(
            User.name,
            User.age,
            func.row_number().over(order_by=User.age).label('age_rank'),
            func.rank().over(order_by=User.age).label('age_dense_rank'),
            func.percent_rank().over(order_by=User.age).label('age_percent_rank')
        )
    )
    results = session.exec(statement).all()
    return results

def get_users_with_moving_average(session):
    """Get users with moving average of age."""
    statement = (
        select(
            User.name,
            User.age,
            func.avg(User.age).over(
                order_by=User.id,
                rows=(-1, 1)  # Current row + 1 before and 1 after
            ).label('moving_avg_age')
        )
    )
    results = session.exec(statement).all()
    return results
```

### Case Statements
```python
def get_users_with_age_categories(session):
    """Get users with age-based categories."""
    from sqlalchemy import case

    age_category = case(
        (User.age < 18, 'minor'),
        (User.age < 30, 'young_adult'),
        (User.age < 50, 'adult'),
        else_='senior'
    ).label('age_category')

    statement = select(User.name, User.age, age_category)
    results = session.exec(statement).all()
    return results

def get_users_with_status_flags(session):
    """Get users with calculated status flags."""
    from sqlalchemy import case

    active_flag = case(
        (User.age >= 18, True),
        else_=False
    ).label('is_adult')

    premium_flag = case(
        (User.email.contains('@premium.com'), True),
        else_=False
    ).label('is_premium')

    statement = select(User.name, User.email, active_flag, premium_flag)
    results = session.exec(statement).all()
    return results
```

## Performance Optimization

### Query Optimization Techniques
```python
def get_users_optimized(session, offset: int = 0, limit: int = 100):
    """Optimized query with pagination."""
    statement = (
        select(User)
        .offset(offset)
        .limit(limit)
        .order_by(User.id)
    )
    users = session.exec(statement).all()
    return users

def get_users_with_indexed_fields_only(session):
    """Query only indexed fields for better performance."""
    statement = select(User.id, User.email)  # Only select indexed fields
    results = session.exec(statement).all()
    return results

def get_users_in_batches(session, batch_size: int = 1000):
    """Process users in batches to avoid memory issues."""
    offset = 0
    while True:
        statement = (
            select(User)
            .offset(offset)
            .limit(batch_size)
            .order_by(User.id)
        )
        batch = session.exec(statement).all()
        if not batch:
            break
        yield batch
        offset += batch_size
```

### Using Raw SQL for Complex Operations
```python
def complex_aggregation_raw_sql(session):
    """Use raw SQL for complex aggregations when needed."""
    from sqlalchemy import text

    raw_sql = text("""
        SELECT
            u.name,
            COUNT(p.id) as post_count,
            AVG(LENGTH(p.content)) as avg_content_length
        FROM user u
        LEFT JOIN post p ON u.id = p.user_id
        GROUP BY u.id, u.name
        HAVING COUNT(p.id) > 0
        ORDER BY post_count DESC
    """)

    result = session.exec(raw_sql)
    return result.fetchall()
```

## Query Builder Pattern

### Flexible Query Builder
```python
class UserQueryBuilder:
    def __init__(self):
        self.statement = select(User)
        self.filters = []

    def with_name_like(self, name_pattern: str):
        self.filters.append(User.name.contains(name_pattern))
        return self

    def with_min_age(self, min_age: int):
        self.filters.append(User.age >= min_age)
        return self

    def with_email_domain(self, domain: str):
        self.filters.append(User.email.contains(f"@{domain}"))
        return self

    def with_order_by(self, field: str, descending: bool = False):
        order_field = getattr(User, field)
        if descending:
            order_field = order_field.desc()
        self.statement = self.statement.order_by(order_field)
        return self

    def build(self):
        if self.filters:
            self.statement = self.statement.where(and_(*self.filters))
        return self.statement

# Usage
def search_users_flexible(session, name_pattern: str = None, min_age: int = None, email_domain: str = None):
    """Flexible user search using query builder."""
    builder = UserQueryBuilder()

    if name_pattern:
        builder.with_name_like(name_pattern)
    if min_age:
        builder.with_min_age(min_age)
    if email_domain:
        builder.with_email_domain(email_domain)

    statement = builder.with_order_by('name').build()
    users = session.exec(statement).all()
    return users
```

## Query Optimization Best Practices

### Index Usage
```python
# Example model with proper indexing
from datetime import datetime

class OptimizedUser(SQLModel, table=True):
    __table_args__ = (
        # Composite index for common query patterns
        {'sqlite_autoincrement': True},  # For better performance
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # Single column index
    email: str = Field(unique=True, index=True)  # Unique index
    age: int = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Composite index for multi-column queries
    # This would be defined at the table level in __table_args__
```

### Query Execution Best Practices
```python
def safe_query_execution(session, statement, params=None):
    """Safely execute a query with error handling."""
    try:
        result = session.exec(statement)
        return result.all()
    except Exception as e:
        session.rollback()
        raise e

def paginated_query(session, statement, page: int = 1, per_page: int = 10):
    """Execute a query with pagination."""
    offset = (page - 1) * per_page

    # Get total count
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    # Get paginated results
    paginated_statement = statement.offset(offset).limit(per_page)
    results = session.exec(paginated_statement).all()

    return {
        'data': results,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }
```

## Best Practices

1. **Use specific column selection**: Only select the columns you need instead of `SELECT *`
2. **Implement proper pagination**: Always use LIMIT and OFFSET for large datasets
3. **Use appropriate indexes**: Create indexes on frequently queried columns
4. **Avoid N+1 queries**: Use JOINs and eager loading when fetching related data
5. **Use connection pooling**: Configure proper connection pooling for production
6. **Handle NULL values**: Be explicit about NULL handling in queries
7. **Use parameterized queries**: Always use parameterized queries to prevent SQL injection
8. **Monitor query performance**: Use EXPLAIN to analyze query execution plans
9. **Use transactions appropriately**: Wrap related operations in transactions
10. **Cache frequently accessed data**: Consider caching for read-heavy applications

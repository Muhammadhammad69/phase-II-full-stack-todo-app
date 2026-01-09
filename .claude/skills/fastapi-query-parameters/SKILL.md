---
name: fastapi-query-parameters
description: Handle query parameters in FastAPI URLs, implement optional and required parameters, add validation constraints like min_length and regex patterns. Use this skill when Claude needs to work with query parameters, implement filtering, pagination, or search functionality in FastAPI applications.
---

# Query Parameters & Filtering in FastAPI

## Overview
Query parameters are the key-value pairs that appear after the `?` in a URL. FastAPI provides powerful tools for handling query parameters with automatic validation, default values, and type conversion.

## Basic Query Parameters

Query parameters are function parameters that have default values or are explicitly optional:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
def read_items(q: str = None):  # Optional parameter with default None
    if q:
        return {"items": ["foo", "bar"], "search": q}
    return {"items": ["foo", "bar"]}

@app.get("/users/")
def read_users(skip: int = 0, limit: int = 100):  # Parameters with default values
    return {"skip": skip, "limit": limit}
```

## Optional vs Required Query Parameters

### Optional Parameters
Parameters with default values are optional:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
def read_items(q: str = None, category: str = "all"):
    return {"q": q, "category": category}
```

### Required Parameters
Use `...` from the `typing` module to make parameters required:

```python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

@app.get("/items/")
def read_items(q: str):  # This is required - no default value
    return {"q": q}

# Or using Optional for clarity:
@app.get("/search/")
def search_items(q: Optional[str] = ...):  # Required but can be None
    return {"query": q}
```

## Validation Constraints

Use the `Query` parameter to add validation constraints to query parameters:

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/")
def read_items(
    q: str = Query(
        None,
        min_length=3,
        max_length=50,
        regex="^[a-zA-Z0-9_]*$",
        description="Search query with validation constraints"
    ),
    price: float = Query(
        None,
        gt=0,  # greater than
        le=1000  # less than or equal to
    )
):
    return {"q": q, "price": price}
```

## Multiple Query Parameters

Handle multiple query parameters for complex filtering:

```python
from fastapi import FastAPI, Query
from typing import List, Optional

app = FastAPI()

@app.get("/items/")
def read_items(
    q: Optional[str] = Query(None, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, le=100, description="Maximum number of records to return"),
    sort: str = Query("id", description="Field to sort by"),
    order: str = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    return {
        "q": q,
        "skip": skip,
        "limit": limit,
        "sort": sort,
        "order": order
    }
```

## List Query Parameters

Accept multiple values for the same parameter:

```python
from fastapi import FastAPI, Query
from typing import List

app = FastAPI()

@app.get("/items/")
def read_items(tags: List[str] = Query([], description="Multiple tags for filtering")):
    return {"tags": tags}

# URL example: /items/?tags=electronics&tags=books&tags=toys
# Result: {"tags": ["electronics", "books", "toys"]}
```

## Query Parameters with Enum Values

Restrict query parameter values to specific options:

```python
from enum import Enum
from fastapi import FastAPI, Query
from typing import Optional

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class SortField(str, Enum):
    name = "name"
    date = "date"
    price = "price"

app = FastAPI()

@app.get("/items/")
def read_items(
    sort_by: SortField = Query(SortField.name, description="Field to sort by"),
    order: SortOrder = Query(SortOrder.asc, description="Sort order")
):
    return {"sort_by": sort_by, "order": order}
```

## Advanced Query Parameter Examples

### Filtering with Multiple Conditions
```python
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI()

@app.get("/products/")
def filter_products(
    category: Optional[str] = Query(None, description="Product category"),
    min_price: Optional[float] = Query(None, gt=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, gt=0, description="Maximum price"),
    in_stock: Optional[bool] = Query(None, description="Availability filter"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    search: Optional[str] = Query(None, min_length=2, description="Search in name or description")
):
    filters = {
        "category": category,
        "min_price": min_price,
        "max_price": max_price,
        "in_stock": in_stock,
        "brand": brand,
        "search": search
    }
    # Apply filters to your data source here
    return {"filters": {k: v for k, v in filters.items() if v is not None}}
```

### Pagination with Query Parameters
```python
@app.get("/users/")
def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    include_inactive: bool = Query(False, description="Include inactive users")
):
    offset = (page - 1) * page_size
    return {
        "page": page,
        "page_size": page_size,
        "offset": offset,
        "include_inactive": include_inactive
    }
```

## Query Parameter Aliases

Use aliases when the parameter name doesn't match the expected query parameter:

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/")
def read_items(
    item_q: str = Query(None, alias="q", description="Search query (aliased as 'q')")
):
    return {"search_query": item_q}
# URL: /items/?q=search_term
```

## Query Parameter Examples and Metadata

Add examples and metadata to your query parameters:

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/search/")
def search_items(
    q: str = Query(
        ...,
        min_length=3,
        max_length=50,
        description="Search query",
        example="laptop",
        title="Search Query"
    ),
    category: str = Query(
        "all",
        description="Category to search in",
        enum=["all", "electronics", "books", "clothing"],
        example="electronics"
    )
):
    return {"query": q, "category": category}
```

## Common Mistakes to Avoid

1. **Not Using Query for Validation**: Use `Query()` for validation constraints instead of just type hints
2. **Confusing Path and Query Parameters**: Remember that path parameters go in the path string, query parameters are function parameters
3. **Forgetting Default Values**: Always provide sensible defaults for optional parameters
4. **Not Handling None Values**: Account for when optional parameters are not provided
5. **Overcomplicating Validation**: Use built-in validation before creating custom validators

## Real-World Use Cases

### E-commerce Product Filtering
```python
from fastapi import FastAPI, Query
from typing import Optional, List

app = FastAPI()

@app.get("/products/")
def filter_products(
    q: Optional[str] = Query(None, min_length=2, description="Search term"),
    category: Optional[str] = Query(None, description="Product category"),
    min_price: Optional[float] = Query(None, gt=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, gt=0, description="Maximum price"),
    tags: List[str] = Query([], description="Product tags"),
    in_stock: Optional[bool] = Query(None, description="In stock only"),
    sort_by: str = Query("relevance", description="Sort by field"),
    order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size")
):
    # Apply filters and return results
    return {
        "query": q,
        "filters": {
            "category": category,
            "price_range": {"min": min_price, "max": max_price},
            "tags": tags,
            "in_stock": in_stock
        },
        "sorting": {"by": sort_by, "order": order},
        "pagination": {"page": page, "page_size": page_size}
    }
```

### API Analytics Dashboard
```python
@app.get("/analytics/")
def get_analytics(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    metric: str = Query("page_views", enum=["page_views", "users", "revenue"], description="Metric to analyze"),
    group_by: str = Query("day", enum=["hour", "day", "week", "month"], description="Time grouping"),
    filters: str = Query(None, description="Additional filters as JSON")
):
    return {
        "date_range": {"start": start_date, "end": end_date},
        "metric": metric,
        "group_by": group_by,
        "filters": filters
    }
```

## Quick Reference

- **Optional parameter**: `param: type = default_value`
- **Required parameter**: `param: type` (no default) or `param: Optional[type] = ...`
- **With validation**: `param: type = Query(default, constraints...)`
- **Multiple values**: `param: List[type] = Query(default)`
- **With alias**: `param: type = Query(default, alias="query_name")`
- **Validation constraints**: `min_length`, `max_length`, `gt`, `ge`, `lt`, `le`, `regex`
- **Examples**: `Query(default, example="value", description="...")`

## Error Response Format

When query parameter validation fails, FastAPI returns a 422 status code:

```json
{
  "detail": [
    {
      "loc": ["query", "price"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt",
      "ctx": {
        "limit_value": 0
      }
    }
  ]
}
```
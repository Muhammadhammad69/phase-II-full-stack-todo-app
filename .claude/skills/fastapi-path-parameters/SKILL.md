---
name: fastapi-path-parameters
description: Master path parameters in FastAPI routes with automatic type validation and conversion. Learn how FastAPI validates integer, string, and other data types. Use this skill when Claude needs to work with path parameters, implement type validation, or handle multiple parameters in route paths.
---

# Path Parameters & Type Validation in FastAPI

## Overview
Path parameters are dynamic values extracted from the URL path. FastAPI provides automatic type validation and conversion for these parameters, making it easy to build robust APIs that validate input automatically.

## Basic Path Parameters

Define path parameters by placing them inside curly braces `{}` in your path string:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
```

In this example:
- `{item_id}` is the path parameter
- `item_id: int` specifies that the parameter should be an integer
- FastAPI automatically converts the string from the URL to an integer

## Type Validation & Conversion

FastAPI automatically validates and converts path parameters based on type hints:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):  # Will validate and convert to int
    return {"item_id": item_id}

@app.get("/users/{user_name}")
def read_user(user_name: str):  # Expects a string
    return {"user_name": user_name}

@app.get("/float/{value}")
def read_float(value: float):  # Expects a float
    return {"value": value}

@app.get("/boolean/{flag}")
def read_boolean(flag: bool):  # Accepts true/false, 1/0, etc.
    return {"flag": flag}
```

## Multiple Path Parameters

You can have multiple path parameters in a single route:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}/items/{item_id}")
def read_user_item(user_id: int, item_id: str):
    return {
        "user_id": user_id,
        "item_id": item_id
    }

@app.get("/items/{item_id}/category/{category_id}")
def read_item_category(item_id: int, category_id: str):
    return {
        "item_id": item_id,
        "category_id": category_id
    }
```

## Path Parameters with Regular Expressions

For more complex path parameters, you can use Pydantic's Field with regex validation:

```python
from fastapi import FastAPI, Path
from pydantic import Field

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(
    item_id: str = Path(..., regex=r"^[a-zA-Z0-9_]+$")  # Alphanumeric and underscore only
):
    return {"item_id": item_id}

@app.get("/users/{user_id}")
def read_user(
    user_id: str = Path(
        ...,
        regex=r"^[a-z0-9_]{3,20}$",  # 3-20 chars, lowercase, numbers, underscore
        description="User ID must be 3-20 characters, lowercase, numbers, and underscores only"
    )
):
    return {"user_id": user_id}
```

## Path Parameters with Validation Constraints

Use the `Path` parameter to add validation constraints:

```python
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(
    item_id: int = Path(..., ge=1, le=1000)  # Greater than or equal to 1, less than or equal to 1000
):
    return {"item_id": item_id}

@app.get("/users/{user_id}")
def read_user(
    user_id: int = Path(..., gt=0)  # Greater than 0
):
    return {"user_id": user_id}

@app.get("/files/{file_path}")
def read_file(
    file_path: str = Path(..., min_length=3, max_length=50)
):
    return {"file_path": file_path}
```

## Error Handling for Invalid Types

When a path parameter doesn't match the expected type, FastAPI automatically returns a 422 Unprocessable Entity error:

```python
# If someone requests /items/abc (where abc can't be converted to int)
# FastAPI will return: 422 Unprocessable Entity with details about the validation error

@app.get("/items/{item_id}")
def read_item(item_id: int):  # This expects an integer
    return {"item_id": item_id}
```

## Advanced Path Parameter Examples

### Mixed Path and Query Parameters
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}/items/{item_id}")
def read_user_item(
    user_id: int,
    item_id: str,
    q: str = None,  # Query parameter
    skip: int = 0,  # Query parameter with default
    limit: int = 100  # Query parameter with default
):
    return {
        "user_id": user_id,
        "item_id": item_id,
        "q": q,
        "skip": skip,
        "limit": limit
    }
```

### Path Parameters with Enum Values
```python
from enum import Enum
from fastapi import FastAPI

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

app = FastAPI()

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}
```

## Common Mistakes to Avoid

1. **Forgetting Type Hints**: Without proper type hints, FastAPI can't validate or convert parameters
2. **Using Reserved Keywords**: Avoid using Python reserved keywords as parameter names
3. **Not Handling Validation Errors**: Understand that invalid parameters will cause 422 errors
4. **Incorrect Path Order**: More specific paths should come before less specific ones
5. **Assuming String Types**: Remember that URL parameters are strings by default; type hints are crucial

## Real-World Use Cases

### E-commerce API
```python
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/categories/{category_id}/products/{product_id}")
def get_product(
    category_id: str = Path(..., description="Category identifier"),
    product_id: int = Path(..., ge=1, description="Product identifier"),
    include_details: bool = False
):
    return {
        "category_id": category_id,
        "product_id": product_id,
        "include_details": include_details
    }
```

### User Management API
```python
@app.get("/users/{user_id}/permissions/{permission_id}")
def get_user_permission(
    user_id: int = Path(..., gt=0, description="Valid user ID"),
    permission_id: str = Path(..., description="Permission identifier"),
    active_only: bool = True
):
    return {
        "user_id": user_id,
        "permission_id": permission_id,
        "active_only": active_only
    }
```

## Quick Reference

- **Basic path parameter**: `{parameter_name}` in path
- **Type validation**: Use type hints (`item_id: int`)
- **Path with validation**: `param: type = Path(..., constraints)`
- **Multiple parameters**: `/path/{param1}/{param2}`
- **Validation constraints**: `ge`, `gt`, `le`, `lt`, `min_length`, `max_length`
- **Required parameters**: Use `...` in Path (e.g., `Path(...)`)
- **Optional parameters**: Use default values (e.g., `param: int = 10`)

## Error Response Format

When path parameter validation fails, FastAPI returns a 422 status code with a detailed error response:

```json
{
  "detail": [
    {
      "loc": ["path", "item_id"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```
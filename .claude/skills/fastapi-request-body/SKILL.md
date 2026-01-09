---
name: fastapi-request-body
description: Accept JSON request bodies using Pydantic BaseModel. Learn data validation, nested models, and automatic documentation generation. Use this skill when Claude needs to work with request body validation, Pydantic models, nested data structures, or automatic API documentation generation in FastAPI applications.
---

# Request Body & Pydantic Models in FastAPI

## Overview
FastAPI uses Pydantic models to handle request bodies with automatic validation, serialization, and documentation. Pydantic provides powerful data validation and parsing capabilities that integrate seamlessly with FastAPI.

## Basic Pydantic Model

Create a Pydantic model by inheriting from `BaseModel`:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.post("/items/")
def create_item(item: Item):
    return item
```

## Pydantic Model Fields

### Optional Fields with Default Values
```python
from pydantic import BaseModel
from typing import Optional

class Item(BaseModel):
    name: str                    # Required field
    description: Optional[str] = None  # Optional with default None
    price: float                 # Required field
    tax: float = 10.5           # Optional with default value
    active: bool = True         # Optional with default value
```

### Field Validation with Field
```python
from pydantic import BaseModel, Field
from typing import Optional

class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Item name")
    description: Optional[str] = Field(None, max_length=200, description="Item description")
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    tax: Optional[float] = Field(None, ge=0, le=100, description="Tax percentage (0-100)")
    category: str = Field(..., regex=r"^[a-zA-Z]+$", description="Category (letters only)")
```

## Nested Models

Create complex data structures with nested Pydantic models:

```python
from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    username: str
    email: str

class Address(BaseModel):
    street: str
    city: str
    country: str
    zip_code: str

class Order(BaseModel):
    id: int
    user: User
    items: List[str]
    shipping_address: Address
    billing_address: Optional[Address] = None
    total_amount: float

@app.post("/orders/")
def create_order(order: Order):
    return order
```

## Working with Lists and Complex Types

Handle arrays and complex data types in request bodies:

```python
from pydantic import BaseModel
from typing import List, Dict, Optional

class Tag(BaseModel):
    name: str
    color: str

class Product(BaseModel):
    name: str
    tags: List[Tag]                    # List of nested models
    metadata: Dict[str, str]          # Dictionary of string key-value pairs
    categories: List[str]             # List of strings
    features: Optional[List[str]] = [] # Optional list with default empty list
```

## Pydantic Model Configuration

Configure model behavior with Config class:

```python
from pydantic import BaseModel, Field
from typing import Optional

class Item(BaseModel):
    name: str = Field(..., alias="item_name")  # Accept "item_name" from JSON but use "name" in Python
    description: Optional[str] = None

    class Config:
        allow_population_by_field_name = True  # Allow both "name" and "item_name" in JSON
        str_strip_whitespace = True           # Automatically strip whitespace
        anystr_lower = True                   # Convert strings to lowercase
        min_anystr_length = 1                 # Minimum length for all string fields
```

## Request Body Examples

Provide example data for better API documentation:

```python
from pydantic import BaseModel, Field
from typing import Optional

class Item(BaseModel):
    name: str = Field(
        ...,
        example="Foo",
        description="Item name"
    )
    description: Optional[str] = Field(
        None,
        example="A very nice Item",
        description="Item description"
    )
    price: float = Field(
        ...,
        example=35.4,
        description="Price in USD"
    )
    tax: Optional[float] = Field(
        None,
        example=3.2,
        description="Tax amount"
    )

@app.post("/items/", response_model=Item)
def create_item(item: Item):
    return item
```

## Multiple Body Parameters

FastAPI can handle multiple body parameters along with path and query parameters:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None

class User(BaseModel):
    username: str
    full_name: str = None

@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: Item,
    user: User,
    importance: int = None  # Query parameter
):
    return {"item_id": item_id, "item": item, "user": user, "importance": importance}
```

## Form Data and File Uploads

Handle form data and file uploads alongside JSON bodies:

```python
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str

@app.post("/items/")
async def create_item_with_image(
    item: Item,  # JSON body
    file: UploadFile = File(...)  # Form file
):
    return {"item": item, "filename": file.filename}

@app.post("/items-with-form/")
async def create_item_with_form_data(
    name: str = Form(...),  # Form field
    description: str = Form(...),  # Form field
    file: UploadFile = File(...)  # Form file
):
    return {"name": name, "description": description, "filename": file.filename}
```

## Custom Validators

Add custom validation logic to your models:

```python
from pydantic import BaseModel, validator, Field
from typing import Optional

class Item(BaseModel):
    name: str
    price: float
    description: Optional[str] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.title()  # Capitalize the name

    @validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v

@app.post("/items/")
def create_item(item: Item):
    return item
```

## Generic Models

Use Python's typing module for generic models:

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

DataT = TypeVar('DataT')

class ResponseModel(BaseModel, Generic[DataT]):
    data: DataT
    message: str
    success: bool = True

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
def create_item(item: Item) -> ResponseModel[Item]:
    return ResponseModel(data=item, message="Item created successfully")
```

## Common Mistakes to Avoid

1. **Not Using Type Hints**: Always use proper type hints in Pydantic models for validation
2. **Forgetting Optional Imports**: Use `from typing import Optional` when fields can be None
3. **Confusing Required vs Optional**: Required fields have no default, optional fields have defaults
4. **Not Handling Validation Errors**: Understand that invalid request bodies will cause 422 errors
5. **Misunderstanding Field vs Plain Types**: Use `Field()` for validation constraints, not type hints
6. **Ignoring Nested Model Validation**: Remember that nested models are validated recursively

## Real-World Use Cases

### User Registration Model
```python
from pydantic import BaseModel, Field, validator
from typing import Optional
import re

class UserRegistration(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        regex=r"^[a-zA-Z0-9_]+$",
        description="Username (alphanumeric and underscore only)"
    )
    email: str = Field(
        ...,
        regex=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        description="Valid email address"
    )
    password: str = Field(
        ...,
        min_length=8,
        description="Password must be at least 8 characters"
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name"
    )
    age: Optional[int] = Field(
        None,
        ge=13,
        le=120,
        description="Age (optional, but if provided must be realistic)"
    )

    @validator('password')
    def validate_password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v

@app.post("/register/")
def register_user(user: UserRegistration):
    # Process registration (hash password, save to DB, etc.)
    return {"message": "User registered successfully", "username": user.username}
```

### E-commerce Product Model
```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProductImage(BaseModel):
    url: str
    alt_text: str
    is_primary: bool = False

class ProductVariant(BaseModel):
    sku: str
    price: float
    stock_quantity: int
    attributes: dict

class Product(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., gt=0)
    category: str
    tags: List[str] = []
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    in_stock: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

@app.post("/products/")
def create_product(product: Product):
    # Save product to database
    return {"message": "Product created", "product_id": 123}
```

## Quick Reference

- **Basic model**: `class Model(BaseModel): field: type`
- **Optional field**: `field: Optional[type] = default`
- **Required field with constraints**: `field: type = Field(...)`
- **Validation constraints**: `min_length`, `max_length`, `gt`, `ge`, `lt`, `le`, `regex`
- **Nested models**: `field: NestedModel`
- **Lists**: `field: List[ItemType]`
- **Dictionaries**: `field: Dict[str, type]`
- **Custom validators**: `@validator('field_name')`
- **Examples**: `Field(..., example="value")`
- **Aliases**: `Field(..., alias="json_name")`

## Error Response Format

When request body validation fails, FastAPI returns a 422 status code:

```json
{
  "detail": [
    {
      "loc": ["body", "price"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt",
      "ctx": {
        "limit_value": 0
      }
    },
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
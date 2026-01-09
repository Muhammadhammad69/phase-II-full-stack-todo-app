---
name: fastapi-response-models
description: Define response models for automatic serialization and validation. Control HTTP status codes for different scenarios. Use this skill when Claude needs to work with response model definitions, automatic serialization, filtering response fields, custom status codes, or API documentation generation in FastAPI applications.
---

# Response Models & Status Codes in FastAPI

## Overview
Response models in FastAPI allow you to define the structure of the data your API returns. FastAPI automatically validates and serializes responses to match your model, ensuring consistency and providing automatic documentation.

## Basic Response Models

Define the expected structure of your API responses using Pydantic models:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.get("/items/", response_model=Item)
def get_item():
    # Even if you return a dict, FastAPI will validate it against the model
    return {
        "name": "Foo",
        "description": "A very nice Item",
        "price": 35.4,
        "tax": 3.2
    }
```

## Response Model Validation

FastAPI validates the response data against your model and filters out extra fields:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None

@app.get("/items/", response_model=Item)
def get_item():
    # FastAPI will return only name and description, filtering out extra fields
    return {
        "name": "Foo",
        "description": "A very nice Item",
        "price": 35.4,  # This will be filtered out
        "tax": 3.2      # This will be filtered out
    }
```

## Response Model with Different Input and Output

Often, the input model and output model are different:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Input model
class UserCreate(BaseModel):
    email: str
    password: str  # Password in input

# Output model
class User(BaseModel):
    email: str
    id: int

@app.post("/users/", response_model=User)
def create_user(user: UserCreate):
    # Process the user creation
    db_user = User(
        email=user.email,
        id=123  # Generated ID
    )
    # Password is not included in response
    return db_user
```

## Optional Response Models

You can make response models optional with different return types:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class User(BaseModel):
    name: str
    email: str

@app.get("/users/{user_id}", response_model=Optional[User])
def get_user(user_id: int):
    # Return user or None
    if user_id == 1:
        return User(name="John", email="john@example.com")
    return None
```

## Response Model with Pydantic Config

Configure response behavior using Pydantic model configuration:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

    class Config:
        # Allow responses to include additional fields not in the model
        extra = "allow"
        # Enable ORM mode to work with SQLAlchemy models
        orm_mode = True

@app.get("/items/", response_model=Item)
def get_item():
    return {
        "name": "Foo",
        "description": "A very nice Item",
        "price": 35.4,
        "tax": 3.2,
        "extra_field": "This will be included due to extra='allow'"
    }
```

## Multiple Response Models

Handle different response types for the same endpoint:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Union

app = FastAPI()

class User(BaseModel):
    name: str
    email: str

class Error(BaseModel):
    message: str

@app.get("/users/{user_id}", response_model=Union[User, Error])
def get_user(user_id: int):
    if user_id == 1:
        return User(name="John", email="john@example.com")
    else:
        return Error(message="User not found")
```

## Custom Response Status Codes

Control HTTP status codes for different scenarios:

```python
from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None

# Create with 201 Created
@app.post("/items/", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    return item

# Update with 200 OK
@app.put("/items/{item_id}", response_model=Item, status_code=status.HTTP_200_OK)
def update_item(item_id: int, item: Item):
    return item

# Delete with 204 No Content
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    # Return nothing for 204
    return

# Custom status codes
@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    if item_id < 0:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Item ID cannot be negative"
        )
    return Item(name=f"Item {item_id}", description="A test item")
```

## Response Model Filtering

Use response models to filter sensitive data:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserIn(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    username: str
    email: str
    # password is intentionally omitted

@app.post("/user/", response_model=UserOut)
def create_user(user: UserIn):
    # Process the user (hash password, etc.)
    # Return only the safe fields
    return UserOut(
        username=user.username,
        email=user.email
    )
```

## Nested Response Models

Handle complex nested structures in responses:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Address(BaseModel):
    street: str
    city: str
    country: str

class User(BaseModel):
    name: str
    email: str
    addresses: List[Address]

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    return {
        "name": "John Doe",
        "email": "john@example.com",
        "addresses": [
            {
                "street": "123 Main St",
                "city": "New York",
                "country": "USA"
            },
            {
                "street": "456 Oak Ave",
                "city": "Los Angeles",
                "country": "USA"
            }
        ]
    }
```

## Response Model with Field Filtering

Use Pydantic's `Field` to control field behavior in responses:

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = Field(None, description="Item description")
    price: float = Field(..., gt=0, description="Price must be positive")
    internal_id: str = Field(..., description="Internal system ID",
                             example="sys_12345")

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    return {
        "name": f"Item {item_id}",
        "description": "A sample item",
        "price": 25.99,
        "internal_id": f"sys_{item_id}"
    }
```

## Response Model with Custom Encoders

Handle complex data types in responses:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional

app = FastAPI()

class Product(BaseModel):
    name: str
    price: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None

# FastAPI handles Decimal and datetime serialization automatically
@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    return {
        "name": f"Product {product_id}",
        "price": Decimal("29.99"),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
```

## Response Model for Different Scenarios

Define different response models for different scenarios:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Union

app = FastAPI()

class UserPublic(BaseModel):
    name: str
    email: str

class UserPrivate(UserPublic):
    phone: str
    address: str

class ErrorDetail(BaseModel):
    message: str
    code: str

@app.get("/users/{user_id}", response_model=Union[UserPublic, ErrorDetail])
def get_user_public(user_id: int):
    if user_id == 1:
        return UserPublic(name="John", email="john@example.com")
    else:
        return ErrorDetail(message="User not found", code="USER_NOT_FOUND")

@app.get("/users/{user_id}/private", response_model=Union[UserPrivate, ErrorDetail])
def get_user_private(user_id: int):
    if user_id == 1:
        return UserPrivate(
            name="John",
            email="john@example.com",
            phone="+1234567890",
            address="123 Main St"
        )
    else:
        return ErrorDetail(message="User not found", code="USER_NOT_FOUND")
```

## Common Response Status Codes

Use appropriate status codes for different scenarios:

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None

# 200 - Success (default)
@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    return Item(name=f"Item {item_id}")

# 201 - Created
@app.post("/items/", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    return item

# 204 - No Content
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    return

# 400 - Bad Request
@app.post("/items/validate", response_model=Item)
def validate_item(item: Item):
    if len(item.name) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item name must be at least 3 characters"
        )
    return item

# 404 - Not Found
@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    if item_id == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return Item(name=f"Item {item_id}")

# 422 - Unprocessable Entity (validation error)
@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: Item):
    if item_id < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Item ID must be positive"
        )
    return item

# 500 - Internal Server Error
@app.get("/items/system-error", response_model=Item)
def system_error():
    # This would be caught by FastAPI's exception handler
    raise ValueError("Something went wrong")
```

## Response Model with Generic Types

Use generics for flexible response models:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    errors: Optional[List[str]] = None

class User(BaseModel):
    name: str
    email: str

app = FastAPI()

@app.get("/users/{user_id}", response_model=ApiResponse[User])
def get_user(user_id: int):
    user = User(name="John", email="john@example.com")
    return ApiResponse(
        success=True,
        message="User retrieved successfully",
        data=user
    )

@app.get("/users/", response_model=ApiResponse[List[User]])
def get_users():
    users = [
        User(name="John", email="john@example.com"),
        User(name="Jane", email="jane@example.com")
    ]
    return ApiResponse(
        success=True,
        message="Users retrieved successfully",
        data=users
    )
```

## Common Mistakes to Avoid

1. **Not Using Response Models**: Always define response models to ensure consistency
2. **Inconsistent Field Names**: Use the same field names in input and output models when appropriate
3. **Exposing Sensitive Data**: Filter out sensitive information in response models
4. **Not Handling Different Scenarios**: Consider different response types for success and error cases
5. **Incorrect Status Codes**: Use appropriate HTTP status codes for different operations
6. **Overcomplicating Models**: Keep response models simple and focused on what the client needs

## Real-World Use Cases

### API Response Wrapper
```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List
from datetime import datetime

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    timestamp: datetime = datetime.utcnow()
    request_id: Optional[str] = None

class User(BaseModel):
    id: int
    name: str
    email: str

app = FastAPI()

@app.get("/users/{user_id}", response_model=APIResponse[User])
def get_user(user_id: int):
    # Fetch user from database
    user = User(id=user_id, name="John Doe", email="john@example.com")

    return APIResponse(
        success=True,
        message="User retrieved successfully",
        data=user
    )

@app.get("/users/", response_model=APIResponse[List[User]])
def get_users(skip: int = 0, limit: int = 10):
    # Fetch users from database
    users = [
        User(id=1, name="John Doe", email="john@example.com"),
        User(id=2, name="Jane Smith", email="jane@example.com")
    ]

    return APIResponse(
        success=True,
        message=f"Retrieved {len(users)} users",
        data=users[skip:skip+limit]
    )
```

### E-commerce API Response
```python
from pydantic import BaseModel
from typing import List, Optional

class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str

class CartItem(BaseModel):
    product: Product
    quantity: int
    subtotal: float

class Cart(BaseModel):
    items: List[CartItem]
    total_items: int
    total_amount: float

@app.get("/cart", response_model=Cart)
def get_cart():
    # Calculate cart total
    cart_items = [
        CartItem(
            product=Product(id=1, name="Laptop", price=999.99, description="Gaming laptop"),
            quantity=1,
            subtotal=999.99
        ),
        CartItem(
            product=Product(id=2, name="Mouse", price=29.99, description="Wireless mouse"),
            quantity=2,
            subtotal=59.98
        )
    ]

    total_items = sum(item.quantity for item in cart_items)
    total_amount = sum(item.subtotal for item in cart_items)

    return Cart(
        items=cart_items,
        total_items=total_items,
        total_amount=total_amount
    )
```

## Quick Reference

- **Response model**: `response_model=ModelName`
- **Status codes**: Use `status_code` parameter or `status.HTTP_*_OK`
- **Filtering**: Response models automatically filter extra fields
- **Validation**: FastAPI validates response data against model
- **Generic responses**: Use `Union[Type1, Type2]` for multiple possible responses
- **Optional responses**: Use `Optional[Model]` for nullable responses
- **Common codes**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 404 (Not Found), 422 (Unprocessable Entity)
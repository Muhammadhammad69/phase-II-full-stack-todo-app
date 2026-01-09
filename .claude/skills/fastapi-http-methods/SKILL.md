---
name: fastapi-http-methods
description: Implement full CRUD operations using GET, POST, PUT, PATCH, and DELETE HTTP methods. Understand RESTful API design principles. Use this skill when Claude needs to implement CRUD operations, work with different HTTP methods, design RESTful APIs, or understand idempotency concepts in FastAPI applications.
---

# HTTP Methods & CRUD Operations in FastAPI

## Overview
HTTP methods define the type of operation to be performed on a resource. FastAPI provides decorators for all standard HTTP methods, enabling you to build complete CRUD (Create, Read, Update, Delete) operations for RESTful APIs.

## HTTP Method Decorators

FastAPI provides decorators for all standard HTTP methods:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items")     # GET - Retrieve resources
@app.post("/items")    # POST - Create a new resource
@app.put("/items/{id}") # PUT - Update entire resource
@app.patch("/items/{id}") # PATCH - Partial update
@app.delete("/items/{id}") # DELETE - Remove resource
```

## CRUD Operations Implementation

### Create (POST)
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float

# Create a new item
@app.post("/items/", status_code=201)
def create_item(item: Item):
    # In a real app, save to database
    item.id = 123  # Simulate generated ID
    return item
```

### Read (GET)
```python
# Get all items
@app.get("/items/")
def get_items(skip: int = 0, limit: int = 100):
    # In a real app, fetch from database
    return [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]

# Get a specific item
@app.get("/items/{item_id}")
def get_item(item_id: int):
    # In a real app, fetch specific item from database
    return {"id": item_id, "name": f"Item {item_id}"}
```

### Update (PUT/PATCH)
```python
# Update entire item (PUT)
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    # In a real app, update entire item in database
    return {"id": item_id, **item.dict()}

# Partial update (PATCH)
@app.patch("/items/{item_id}")
def partial_update_item(item_id: int, name: str = None, price: float = None):
    # In a real app, update only provided fields
    update_data = {"id": item_id}
    if name:
        update_data["name"] = name
    if price:
        update_data["price"] = price
    return update_data
```

### Delete (DELETE)
```python
# Delete an item
@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    # In a real app, delete from database
    # Return 204 No Content for successful deletion
    return
```

## HTTP Method Characteristics

### GET
- **Purpose**: Retrieve resources
- **Idempotent**: Multiple identical requests should have the same effect
- **Safe**: Should not change server state
- **Cachable**: Results can be cached

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # Retrieve user data
    return {"id": user_id, "name": "John Doe"}
```

### POST
- **Purpose**: Create new resources or trigger operations
- **Not idempotent**: Multiple requests may create multiple resources
- **Not safe**: Changes server state
- **Not cachable**: Results shouldn't be cached

```python
@app.post("/users/", status_code=201)
def create_user(user: User):
    # Create new user
    return user
```

### PUT
- **Purpose**: Update entire resource or create if it doesn't exist
- **Idempotent**: Multiple identical requests should have the same effect
- **Not safe**: Changes server state

```python
@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    # Update entire user resource
    return {"id": user_id, **user.dict()}
```

### PATCH
- **Purpose**: Partial update of a resource
- **Not idempotent**: Multiple requests may have different effects
- **Not safe**: Changes server state

```python
@app.patch("/users/{user_id}")
def partial_update_user(user_id: int, name: str = None, email: str = None):
    # Partially update user resource
    update_data = {"id": user_id}
    if name:
        update_data["name"] = name
    if email:
        update_data["email"] = email
    return update_data
```

### DELETE
- **Purpose**: Remove resources
- **Idempotent**: Multiple identical requests should have the same effect
- **Not safe**: Changes server state

```python
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    # Delete user resource
    return
```

## Advanced CRUD Example

Complete CRUD implementation for a User resource:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Pydantic models
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class User(UserBase):
    id: int
    active: bool = True

# In-memory storage (use database in real app)
users_db = []
next_id = 1

# CREATE
@app.post("/users/", response_model=User, status_code=201)
def create_user(user: UserCreate):
    global next_id
    db_user = User(id=next_id, **user.dict(exclude={"password"}))
    users_db.append(db_user)
    next_id += 1
    return db_user

# READ - All users
@app.get("/users/", response_model=List[User])
def get_users(skip: int = 0, limit: int = 100):
    return users_db[skip:skip + limit]

# READ - Single user
@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    for user in users_db:
        if user.id == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

# UPDATE - Full update
@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user_update: UserUpdate):
    for i, user in enumerate(users_db):
        if user.id == user_id:
            update_data = user_update.dict(exclude_unset=True)
            updated_user = user.copy(update=update_data)
            users_db[i] = updated_user
            return updated_user
    raise HTTPException(status_code=404, detail="User not found")

# DELETE
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    for i, user in enumerate(users_db):
        if user.id == user_id:
            users_db.pop(i)
            return
    raise HTTPException(status_code=404, detail="User not found")
```

## HTTP Status Codes

Use appropriate status codes for different operations:

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    # Successfully created
    return item

@app.get("/items/{item_id}")
def get_item(item_id: int):
    # Successfully retrieved
    return {"id": item_id}

@app.put("/items/{item_id}", status_code=status.HTTP_200_OK)
def update_item(item_id: int, item: Item):
    # Successfully updated
    return item

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    # Successfully deleted, no content to return
    return

@app.get("/items/{item_id}")
def get_item(item_id: int):
    # Resource not found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )
```

## Handling Complex Updates

### Partial Updates with Pydantic
```python
from pydantic import BaseModel, create_model

# Create an update model with all fields optional
def create_update_model(model_class):
    return create_model(
        f"{model_class.__name__}Update",
        **{
            name: (field.type_, field.default)
            for name, field in model_class.__fields__.items()
        }
    )

UserUpdate = create_update_model(User)

@app.patch("/users/{user_id}", response_model=User)
def partial_update_user(user_id: int, user_update: UserUpdate):
    # Implementation for partial update
    pass
```

### Using Pydantic's `exclude_unset` for Partial Updates
```python
@app.patch("/users/{user_id}", response_model=User)
def partial_update_user(user_id: int, user_update: UserUpdate):
    stored_user = get_user_from_db(user_id)
    if not stored_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only update fields that were provided in the request
    update_data = user_update.dict(exclude_unset=True)
    updated_user = stored_user.copy(update=update_data)

    # Save to database
    save_user_to_db(updated_user)
    return updated_user
```

## RESTful API Design Principles

### Resource-Based URLs
```python
# Good: Resource-based
@app.get("/users/{user_id}")
@app.get("/users/{user_id}/posts")
@app.get("/posts/{post_id}/comments")

# Avoid: Action-based
# @app.get("/get_user_posts")
# @app.get("/delete_post_comments")
```

### Consistent URL Structure
```python
# Collection endpoints
@app.get("/users")      # Get all users
@app.post("/users")     # Create new user

# Individual resource endpoints
@app.get("/users/{id}")     # Get specific user
@app.put("/users/{id}")     # Update specific user
@app.patch("/users/{id}")   # Partial update
@app.delete("/users/{id}")  # Delete specific user
```

## Common Mistakes to Avoid

1. **Incorrect Status Codes**: Use appropriate status codes (201 for creation, 204 for deletion)
2. **Confusing PUT vs PATCH**: PUT should replace the entire resource, PATCH should update partially
3. **Not Handling Errors**: Always handle potential errors with HTTPException
4. **Inconsistent URL Structure**: Follow RESTful conventions consistently
5. **Not Using Response Models**: Use response_model to ensure consistent return structure
6. **Ignoring Idempotency**: Understand which methods should be idempotent

## Real-World Use Cases

### Blog API
```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

class BlogPostBase(BaseModel):
    title: str
    content: str
    published: bool = False

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    published: Optional[bool] = None

class BlogPost(BlogPostBase):
    id: int
    created_at: datetime
    updated_at: datetime

# CRUD operations for blog posts
@app.post("/posts/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
def create_post(post: BlogPostCreate):
    # Create new blog post
    pass

@app.get("/posts/", response_model=List[BlogPost])
def get_posts(skip: int = 0, limit: int = 100, published_only: bool = True):
    # Get multiple blog posts with filtering
    pass

@app.get("/posts/{post_id}", response_model=BlogPost)
def get_post(post_id: int):
    # Get specific blog post
    pass

@app.put("/posts/{post_id}", response_model=BlogPost)
def update_post(post_id: int, post_update: BlogPostUpdate):
    # Full update of blog post
    pass

@app.patch("/posts/{post_id}", response_model=BlogPost)
def partial_update_post(post_id: int, post_update: BlogPostUpdate):
    # Partial update of blog post
    pass

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int):
    # Delete blog post
    pass
```

### Product Catalog API
```python
@app.post("/products/", response_model=Product, status_code=201)
def create_product(product: ProductCreate):
    """Create a new product in the catalog"""
    pass

@app.get("/products/", response_model=List[Product])
def get_products(
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    in_stock: bool = None,
    skip: int = 0,
    limit: int = 100
):
    """Get products with optional filtering"""
    pass

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    """Get a specific product by ID"""
    pass

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product_update: ProductUpdate):
    """Update entire product details"""
    pass

@app.patch("/products/{product_id}/price", response_model=Product)
def update_product_price(product_id: int, new_price: float):
    """Update only product price"""
    pass

@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int):
    """Remove product from catalog"""
    pass
```

## Quick Reference

- **GET**: `@app.get("/resource")` - Retrieve resources
- **POST**: `@app.post("/resource")` - Create resources (201 status)
- **PUT**: `@app.put("/resource/{id}")` - Update entire resource
- **PATCH**: `@app.patch("/resource/{id}")` - Partial update
- **DELETE**: `@app.delete("/resource/{id}")` - Remove resource (204 status)
- **Status codes**: 200 (OK), 201 (Created), 204 (No Content), 404 (Not Found)
- **Response models**: Use `response_model` for consistent output
- **Idempotency**: GET, PUT, DELETE are idempotent; POST, PATCH are not
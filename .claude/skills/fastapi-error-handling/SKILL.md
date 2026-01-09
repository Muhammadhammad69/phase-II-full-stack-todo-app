---
name: fastapi-error-handling
description: Handle errors gracefully using HTTPException. Implement custom error responses and status codes for different failure scenarios. Use this skill when Claude needs to work with error handling, custom exceptions, HTTPException, validation error handling, or exception handlers in FastAPI applications.
---

# Error Handling & Exceptions in FastAPI

## Overview
FastAPI provides robust error handling mechanisms to gracefully manage errors and provide meaningful responses to clients. Proper error handling is crucial for building reliable APIs that provide good user experience and maintain security.

## HTTPException

Use HTTPException to return HTTP error responses with specific status codes:

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return {"item_id": item_id}
```

## Custom HTTPException with Headers

Add custom headers to HTTPException responses:

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Item ID cannot be negative",
            headers={"X-Error": "There goes my error"}
        )
    return {"item_id": item_id}
```

## Exception Handlers

Create custom exception handlers for specific exception types:

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

class CustomException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=418,
        content={
            "message": f"Custom exception occurred with name: {exc.name}",
            "error_type": "CustomException"
        }
    )

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id == 999:
        raise CustomException(name="special_item")
    return {"item_id": item_id}
```

## Validation Error Handling

Handle Pydantic validation errors automatically:

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, ValidationError
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": exc.body
        }
    )

@app.post("/items/")
def create_item(item: Item):
    return item
```

## Global Exception Handler

Create a global exception handler for unhandled exceptions:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the error for debugging
    logging.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "message": "An internal server error occurred",
            "error_type": "InternalServerError"
        }
    )

@app.get("/error-test")
def trigger_error():
    # This will trigger the global exception handler
    raise ValueError("This is an unhandled error")
```

## Custom Exception Models

Create structured exception responses:

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

app = FastAPI()

class ErrorResponse(BaseModel):
    error_id: str
    timestamp: datetime
    message: str
    error_type: str
    details: Optional[dict] = None

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_response = ErrorResponse(
        error_id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        message=exc.detail,
        error_type="HTTPException",
        details={
            "status_code": exc.status_code,
            "headers": dict(exc.headers) if exc.headers else None
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Item ID must be a positive integer"
        )
    return {"item_id": item_id}
```

## Business Logic Error Handling

Handle application-specific business logic errors:

```python
from fastapi import FastAPI, HTTPException, status
from enum import Enum

app = FastAPI()

class ErrorCode(str, Enum):
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"

class BusinessError(Exception):
    def __init__(self, error_code: ErrorCode, message: str, status_code: int = 400):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

@app.exception_handler(BusinessError)
async def business_error_handler(request: Request, exc: BusinessError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "error_type": "BusinessError"
        }
    )

@app.post("/transactions/transfer")
def transfer_money(amount: float, from_account: str, to_account: str):
    if amount <= 0:
        raise BusinessError(
            error_code=ErrorCode.INVALID_CREDENTIALS,
            message="Transfer amount must be positive",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    if amount > 1000:  # Simulate insufficient funds
        raise BusinessError(
            error_code=ErrorCode.INSUFFICIENT_FUNDS,
            message="Insufficient funds for transfer",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    return {"message": f"Transferred {amount} from {from_account} to {to_account}"}
```

## Database Error Handling

Handle database-specific errors:

```python
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse

app = FastAPI()

class DatabaseError(Exception):
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

@app.exception_handler(DatabaseError)
async def database_error_handler(request: Request, exc: DatabaseError):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    # Map specific database errors to appropriate HTTP status codes
    if exc.error_code == "DUPLICATE_KEY":
        status_code = status.HTTP_409_CONFLICT
    elif exc.error_code == "FOREIGN_KEY_VIOLATION":
        status_code = status.HTTP_400_BAD_REQUEST
    elif exc.error_code == "PERMISSION_DENIED":
        status_code = status.HTTP_403_FORBIDDEN

    return JSONResponse(
        status_code=status_code,
        content={
            "message": exc.message,
            "error_type": "DatabaseError",
            "error_code": exc.error_code
        }
    )

@app.get("/users/{user_id}")
def get_user(user_id: int):
    # Simulate database error
    if user_id == 999:
        raise DatabaseError(
            message="User not found in database",
            error_code="RECORD_NOT_FOUND"
        )
    return {"user_id": user_id, "name": f"User {user_id}"}
```

## Error Logging and Monitoring

Implement comprehensive error logging:

```python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import logging
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    try:
        response = await call_next(request)
    except Exception as e:
        # Log the exception
        logger.error(f"Request failed: {request.method} {request.url} - {str(e)}")
        logger.error(traceback.format_exc())

        # Re-raise the exception to be handled by exception handlers
        raise
    finally:
        process_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Request: {request.method} {request.url} - Status: {response.status_code} - Time: {process_time}s")

    return response

@app.exception_handler(Exception)
async def comprehensive_exception_handler(request: Request, exc: Exception):
    # Log the error
    logger.error(f"Unhandled exception in {request.url.path}: {str(exc)}")
    logger.error(traceback.format_exc())

    # Return appropriate response
    return JSONResponse(
        status_code=500,
        content={
            "message": "An internal server error occurred",
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": str(request.headers.get("x-request-id", "unknown"))
        }
    )

@app.get("/test-error")
def test_error():
    raise ValueError("This is a test error")
```

## Validation Error Customization

Customize validation error responses:

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    tags: List[str]

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error['loc']),
            "message": error['msg'],
            "type": error['type']
        })

    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation failed",
            "errors": errors,
            "total_errors": len(errors)
        }
    )

@app.post("/items/")
def create_item(item: Item):
    return item
```

## Multiple Exception Handlers

Handle different exception types with specific handlers:

```python
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
import sqlite3

app = FastAPI()

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "error_type": "HTTPException"}
    )

@app.exception_handler(sqlite3.IntegrityError)
async def sqlite_integrity_error_handler(request: Request, exc: sqlite3.IntegrityError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "message": f"Database integrity error: {str(exc)}",
            "error_type": "IntegrityError"
        }
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": f"Value error: {str(exc)}",
            "error_type": "ValueError"
        }
    )

@app.get("/test/{error_type}")
def test_error(error_type: str):
    if error_type == "http":
        raise HTTPException(status_code=404, detail="HTTP error")
    elif error_type == "sqlite":
        raise sqlite3.IntegrityError("UNIQUE constraint failed")
    elif error_type == "value":
        raise ValueError("Invalid value provided")
    return {"message": "No error"}
```

## Common Mistakes to Avoid

1. **Not Using HTTPException**: Always use HTTPException for HTTP-related errors
2. **Exposing Internal Details**: Don't expose internal error details to clients
3. **Not Logging Errors**: Always log errors for debugging and monitoring
4. **Generic Exception Handling**: Be specific about exception types when possible
5. **Ignoring Validation Errors**: Handle Pydantic validation errors appropriately
6. **Not Using Proper Status Codes**: Use appropriate HTTP status codes for different error types
7. **Not Testing Error Scenarios**: Test your error handling paths

## Real-World Use Cases

### API Rate Limiting Error
```python
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
import time

class RateLimitError(Exception):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded. Retry after {retry_after} seconds")

@app.exception_handler(RateLimitError)
async def rate_limit_error_handler(request: Request, exc: RateLimitError):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        headers={"Retry-After": str(exc.retry_after)},
        content={
            "message": "Rate limit exceeded",
            "retry_after": exc.retry_after,
            "error_type": "RateLimitError"
        }
    )

# Simulate rate limiting
request_times = {}

@app.get("/api/data")
def get_data(request: Request):
    client_ip = request.client.host
    current_time = time.time()

    if client_ip in request_times:
        if current_time - request_times[client_ip] < 1:  # 1 request per second
            raise RateLimitError(retry_after=1)

    request_times[client_ip] = current_time
    return {"data": "protected content", "timestamp": current_time}
```

### Authentication Error Handling
```python
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse

class AuthenticationError(Exception):
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(message)

class AuthorizationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)

@app.exception_handler(AuthenticationError)
async def auth_error_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "message": exc.message,
            "error_type": "AuthenticationError",
            "error_code": exc.error_code
        }
    )

@app.exception_handler(AuthorizationError)
async def authorization_error_handler(request: Request, exc: AuthorizationError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "message": exc.message,
            "error_type": "AuthorizationError"
        }
    )

@app.get("/protected")
def protected_endpoint(token: str = None):
    if not token:
        raise AuthenticationError(
            message="Authentication token required",
            error_code="TOKEN_MISSING"
        )

    if token != "valid_token":
        raise AuthenticationError(
            message="Invalid authentication token",
            error_code="TOKEN_INVALID"
        )

    # Check permissions
    if token == "read_only_token":
        raise AuthorizationError("Insufficient permissions for this action")

    return {"message": "Access granted", "user": "authenticated_user"}
```

## Quick Reference

- **HTTPException**: `raise HTTPException(status_code=404, detail="Not found")`
- **Exception handler**: `@app.exception_handler(ExceptionType)`
- **Status codes**: Use `status.HTTP_*_OK` constants
- **Custom responses**: Return `JSONResponse` from exception handlers
- **Validation errors**: Handle with `RequestValidationError`
- **Global handler**: Use for unhandled exceptions
- **Error logging**: Always log errors for debugging
- **Security**: Don't expose internal error details

## Best Practices

1. **Use appropriate status codes** for different error types
2. **Log errors** for debugging and monitoring
3. **Return consistent error formats**
4. **Don't expose sensitive information** in error messages
5. **Handle validation errors** automatically with Pydantic
6. **Test error scenarios** to ensure proper handling
7. **Use middleware** for cross-cutting concerns like logging
---
name: fastapi-security
description: Implement basic security features including CORS, HTTP Basic Auth, and token-based authentication for protecting API endpoints. Use this skill when Claude needs to work with API security, authentication, CORS configuration, HTTP Bearer tokens, basic authentication, or security best practices in FastAPI applications.
---

# Security & Authentication Basics in FastAPI

## Overview
Security is a critical aspect of any API. FastAPI provides built-in security utilities and integrates well with industry-standard authentication methods. This guide covers essential security practices including CORS, authentication, and authorization.

## CORS (Cross-Origin Resource Sharing)

Configure CORS to control which origins can access your API:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com", "http://localhost:3000"],  # Specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Allowed HTTP methods
    allow_headers=["*"],  # Allowed headers
    # Additional options:
    # expose_headers=["Access-Control-Allow-Origin"],
    # max_age=86400,  # Cache preflight requests for 24 hours
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

### CORS Configuration Options

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# More restrictive CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://staging.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["X-Requested-With", "Content-Type", "Authorization"],
    # Only expose specific headers to frontend
    expose_headers=["X-My-Custom-Header", "X-Total-Count"],
    # Cache preflight requests (in seconds)
    max_age=3600,  # 1 hour
)

@app.get("/secure-data")
def get_secure_data():
    return {"data": "This is secure data"}
```

## HTTP Basic Authentication

Implement basic authentication using username/password:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

app = FastAPI()
security = HTTPBasic()

def authenticate_user(credentials: HTTPBasicCredentials = Depends(security)):
    # In production, verify against a database
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "secret")

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/basic-protected")
def basic_protected_route(username: str = Depends(authenticate_user)):
    return {"message": f"Hello {username}, you are authenticated with Basic Auth"}
```

## HTTP Bearer Token Authentication

Implement token-based authentication:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

app = FastAPI()
security = HTTPBearer()

# In production, use a strong secret key
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return username
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@app.get("/bearer-protected")
def bearer_protected_route(username: str = Depends(verify_token)):
    return {"message": f"Hello {username}, you are authenticated with Bearer token"}
```

## OAuth2 Password Flow with JWT Tokens

Implement OAuth2 with password flow:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import bcrypt

app = FastAPI()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Secret key for JWT
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Mock user database
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "secret"
        "disabled": False,
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None

class User(BaseModel):
    username: str
    email: str = None
    full_name: str = None
    disabled: bool = None

class UserInDB(User):
    hashed_password: str

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def get_password_hash(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
```

## Role-Based Access Control (RBAC)

Implement role-based permissions:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
import jwt

app = FastAPI()
security = HTTPBearer()

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

class Role:
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"

def get_current_user_with_roles(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        roles = payload.get("roles", [])

        if username is None or not roles:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

        return {"username": username, "roles": roles}
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def require_role(required_role: str):
    def role_checker(current_user: dict = Depends(get_current_user_with_roles)):
        if required_role not in current_user["roles"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not allowed"
            )
        return current_user
    return role_checker

@app.get("/admin-area", dependencies=[Depends(require_role(Role.ADMIN))])
def admin_area():
    return {"message": "Welcome to admin area"}

@app.get("/moderator-area", dependencies=[Depends(require_role(Role.MODERATOR))])
def moderator_area():
    return {"message": "Welcome to moderator area"}

@app.get("/user-area", dependencies=[Depends(require_role(Role.USER))])
def user_area():
    return {"message": "Welcome to user area"}
```

## Security Headers

Add security headers to protect against common vulnerabilities:

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Callable

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"

        return response

app = FastAPI()
app.add_middleware(SecurityHeadersMiddleware)

@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

## Input Validation and Sanitization

Implement proper input validation to prevent injection attacks:

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field, validator
import html
import re

app = FastAPI()

class SafeInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field("", max_length=1000)

    @validator("title", "description")
    def prevent_script_tags(cls, v):
        # Remove potentially dangerous HTML tags
        if re.search(r"<script[^>]*>.*?</script>", v, re.IGNORECASE):
            raise ValueError("Script tags are not allowed")
        return v

def sanitize_html(text: str) -> str:
    """Sanitize HTML to prevent XSS"""
    return html.escape(text)

@app.post("/safe-input")
def process_safe_input(input_data: SafeInput):
    sanitized_title = sanitize_html(input_data.title)
    sanitized_description = sanitize_html(input_data.description)

    return {
        "title": sanitized_title,
        "description": sanitized_description
    }
```

## Rate Limiting

Implement rate limiting to prevent abuse:

```python
from fastapi import FastAPI, Request, HTTPException, status
from collections import defaultdict
import time

app = FastAPI()

# Simple in-memory rate limiter (use Redis in production)
rate_limits = defaultdict(list)

MAX_REQUESTS = 10
TIME_WINDOW = 60  # seconds

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host

    now = time.time()

    # Clean old requests
    rate_limits[client_ip] = [
        req_time for req_time in rate_limits[client_ip]
        if now - req_time < TIME_WINDOW
    ]

    # Check if limit exceeded
    if len(rate_limits[client_ip]) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )

    # Add current request
    rate_limits[client_ip].append(now)

    response = await call_next(request)
    return response

@app.get("/protected-endpoint")
def protected_endpoint():
    return {"message": "This endpoint is rate limited"}
```

## Environment-Based Security Configuration

Configure security based on environment:

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Environment-based security configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "development":
    # Allow all origins in development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Restrictive configuration for production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://yourdomain.com"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["X-Requested-With", "Content-Type", "Authorization"],
    )

@app.get("/")
def read_root():
    return {"environment": ENVIRONMENT, "message": "Security configured based on environment"}
```

## Common Security Vulnerabilities and Prevention

### SQL Injection Prevention
```python
from fastapi import FastAPI
import sqlite3

app = FastAPI()

@app.get("/users/{user_id}")
def get_user_safe(user_id: int):
    # Use parameterized queries - SAFE
    conn = sqlite3.connect("example.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return {"user": user}

# DON'T do this (vulnerable to SQL injection):
# cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### Path Traversal Prevention
```python
import os
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/files/{filename}")
def get_file(filename: str):
    # Prevent path traversal attacks
    if ".." in filename or filename.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Construct safe path
    safe_path = os.path.join("uploads", filename)

    # Verify the constructed path is within allowed directory
    if not safe_path.startswith(os.path.abspath("uploads")):
        raise HTTPException(status_code=400, detail="Invalid path")

    # Proceed with file operations
    return {"file_path": safe_path}
```

## Common Mistakes to Avoid

1. **Hardcoding Secrets**: Never hardcode API keys, passwords, or secrets in your code
2. **Not Using HTTPS in Production**: Always use HTTPS for authentication
3. **Weak Password Storage**: Use bcrypt or similar for password hashing
4. **Missing Input Validation**: Always validate and sanitize user input
5. **Overly Permissive CORS**: Be restrictive with CORS origins in production
6. **Not Rate Limiting**: Protect against brute force and DoS attacks
7. **Exposing Sensitive Information**: Don't leak internal details in error messages
8. **Using Default Secrets**: Always change default passwords and secrets

## Real-World Use Cases

### Comprehensive Authentication System
```python
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta
import secrets

app = FastAPI()
security = HTTPBearer()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class User(BaseModel):
    username: str
    email: str
    full_name: str

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

# In production, use a proper user database
users_db = {
    "admin": {
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "hashed_password": "hashed_password_here",
        "disabled": False
    }
}

def create_tokens(username: str):
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_jwt_token(
        data={"sub": username, "type": "access"},
        expires_delta=access_token_expires
    )

    # Create refresh token
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_jwt_token(
        data={"sub": username, "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    return access_token, refresh_token

def create_jwt_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_access_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")

        if username is None or token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@app.post("/login", response_model=TokenPair)
async def login(login_request: LoginRequest):
    # In production, verify credentials against database
    if login_request.username in users_db:
        # Here you would verify the password hash
        access_token, refresh_token = create_tokens(login_request.username)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

@app.post("/refresh-token", response_model=TokenPair)
async def refresh_token(refresh_request: RefreshTokenRequest):
    try:
        payload = jwt.decode(refresh_request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")

        if username is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Create new tokens
        access_token, refresh_token = create_tokens(username)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@app.get("/secure-data")
async def get_secure_data(username: str = Depends(verify_access_token)):
    return {
        "message": f"Hello {username}, this is secure data",
        "timestamp": datetime.utcnow()
    }
```

## Quick Reference

- **CORS**: Use `CORSMiddleware` to configure origin policies
- **Basic Auth**: `HTTPBasic` for username/password authentication
- **Bearer Tokens**: `HTTPBearer` for token-based authentication
- **OAuth2**: `OAuth2PasswordBearer` for standard OAuth2 flow
- **JWT**: Use `python-jose` or `PyJWT` for token handling
- **Rate Limiting**: Implement with middleware or external services
- **Security Headers**: Add protection against common attacks
- **Input Validation**: Use Pydantic models for validation

## Security Best Practices

1. **Use HTTPS in production** - Never transmit credentials over HTTP
2. **Hash passwords** - Use bcrypt or similar for password storage
3. **Validate all inputs** - Never trust user input without validation
4. **Implement rate limiting** - Protect against brute force attacks
5. **Use strong secrets** - Generate cryptographically secure keys
6. **Follow principle of least privilege** - Grant minimal necessary permissions
7. **Keep dependencies updated** - Regularly update security patches
8. **Log security events** - Monitor for suspicious activities
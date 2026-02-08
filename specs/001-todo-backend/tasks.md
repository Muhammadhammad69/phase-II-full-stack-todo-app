# Todo App Backend Tasks

This document outlines the detailed task breakdown for implementing the Todo App Backend using FastAPI, SQLModel, and NeonDB.

## Phase 1: Project Foundation

- [X] T001 Create backend directory structure per implementation plan
- [X] T002 Initialize UV project with todo-backend name per implementation plan
- [X] T003 [P] Install core dependencies (FastAPI, SQLModel, PostgreSQL drivers) per implementation plan
- [X] T004 [P] Install development dependencies (pytest, ruff, httpx) per implementation plan

## Phase 2: Configuration Setup

- [X] T005 Create environment configuration files per implementation plan
- [X] T006 Create settings configuration module per implementation plan

## Phase 3: Database Layer

- [X] T007 Create database connection module per implementation plan
- [X] T008 Define User model (reference) per implementation plan
- [X] T009 Define Task model per implementation plan
- [X] T010 Create database initialization script per implementation plan

## Phase 4: Pydantic Schemas

- [X] T011 Create Task schemas per implementation plan

## Phase 5: Authentication & Security

- [X] T012 Create JWT utility functions per implementation plan
- [X] T013 Create authentication dependencies per implementation plan

## Phase 6: Custom Exceptions

- [X] T014 Define custom exception classes per implementation plan
- [X] T015 Implement exception handlers per implementation plan

## Phase 7: API Endpoints Implementation

- [X] T016 Create tasks router setup per implementation plan
- [X] T017 Implement create task endpoint per implementation plan
- [X] T018 Implement list tasks endpoint per implementation plan
- [X] T019 Implement get single task endpoint per implementation plan
- [X] T020 Implement update task endpoint per implementation plan
- [X] T021 Implement delete task endpoint per implementation plan
- [X] T022 Implement toggle completion endpoint per implementation plan

## Phase 8: Main Application

- [X] T023 Create main FastAPI application per implementation plan
- [X] T024 Create application entry point per implementation plan

## Phase 9: Testing

- [X] T025 Create test configuration per implementation plan
- [X] T026 Write task endpoint tests per implementation plan
- [X] T027 Write authentication tests per implementation plan

## Phase 10: Documentation

- [X] T028 Create backend README per implementation plan
- [X] T029 Add API endpoint documentation per implementation plan

## Phase 11: Code Quality & Final Setup

- [X] T030 Configure Ruff for linting per implementation plan
- [X] T031 Run linting and fix issues per implementation plan
- [X] T032 Create root project README per implementation plan
- [X] T033 Verify all tests pass per implementation plan

## Implementation Details

### Phase 1: Project Foundation

**Task 1.1: Create Backend Directory Structure**
- **Description:** Create the backend folder and basic directory structure
- **Agent Required:** None
- **Actions:**
```bash
  mkdir -p backend
  cd backend
  mkdir -p app/{api/v1,models,schemas,core,db,middleware}
  mkdir -p tests
  touch app/__init__.py
```
- **Files Created:**
  - `backend/` (folder)
  - `backend/app/` and subdirectories
  - `backend/tests/` (folder)
- **Git Commit:** `chore: initialize backend directory structure`

**Task 1.2: Initialize UV Project**
- **Description:** Initialize the project using UV package manager
- **Agent Required:** `fastapi-development-assistant` (READ FIRST for project setup best practices)
- **Actions:**
```bash
  cd backend
  uv init --name todo-backend
```
- **Files Created:**
  - `backend/pyproject.toml`
  - `backend/.python-version`
- **Dependencies:** Task 1.1 must be completed
- **Git Commit:** `chore: initialize UV project with pyproject.toml`

**Task 1.3: Install Core Dependencies**
- **Description:** Install FastAPI, SQLModel, and database dependencies using UV
- **Agent Required:**
  - `fastapi-development-assistant` (READ for dependency recommendations)
  - `sqlmodel-development-assistant` (READ for SQLModel setup)
  - `neon-database-assistant` (READ for PostgreSQL driver selection)
- **Actions:**
```bash
  cd backend
  uv add fastapi
  uv add "uvicorn[standard]"
  uv add sqlmodel
  uv add psycopg2-binary
  uv add asyncpg
  uv add pyjwt
  uv add python-dotenv
  uv add pydantic-settings
```
- **Files Modified:**
  - `backend/pyproject.toml`
  - `backend/uv.lock` (auto-generated)
- **Dependencies:** Task 1.2 must be completed
- **Git Commit:** `chore: add core dependencies (FastAPI, SQLModel, PostgreSQL drivers)`

**Task 1.4: Install Development Dependencies**
- **Description:** Install testing and development tools
- **Agent Required:** `fastapi-development-assistant` (READ for testing setup)
- **Actions:**
```bash
  cd backend
  uv add --dev pytest
  uv add --dev pytest-asyncio
  uv add --dev httpx
  uv add --dev ruff
```
- **Files Modified:**
  - `backend/pyproject.toml`
- **Dependencies:** Task 1.3 must be completed
- **Git Commit:** `chore: add development dependencies (pytest, ruff, httpx)`

### Phase 2: Configuration Setup

**Task 2.1: Create Environment Configuration Files**
- **Description:** Set up environment variables template and configuration
- **Agent Required:** `neon-database-assistant` (READ FIRST for NeonDB connection string format)
- **Actions:**
  1. Create `.env.example` with template variables
  2. Create `.env` (gitignored) with actual values
  3. Add `.env` to `.gitignore`
- **Files Created:**
  - `backend/.env.example`
  - `backend/.env` (not committed)
  - `backend/.gitignore` (if not exists)
- **Content for `.env.example`:**
```env
  DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require
  JWT_SECRET_KEY=your-secret-key-change-in-production
  JWT_ALGORITHM=HS256
  ENVIRONMENT=development
  LOG_LEVEL=INFO
```
- **Dependencies:** None
- **Git Commit:** `config: add environment configuration template`

**Task 2.2: Create Settings Configuration Module**
- **Description:** Implement Pydantic settings for configuration management
- **Agent Required:** `fastapi-development-assistant` (READ for Pydantic settings best practices)
- **Actions:**
  1. Create `backend/app/config.py`
  2. Define Settings class with all required fields
  3. Implement validation and type hints
- **Files Created:**
  - `backend/app/config.py`
- **Code Structure:**
```python
  from pydantic_settings import BaseSettings, SettingsConfigDict

  class Settings(BaseSettings):
      database_url: str
      jwt_secret_key: str
      jwt_algorithm: str = "HS256"
      environment: str = "development"
      log_level: str = "INFO"

      model_config = SettingsConfigDict(env_file=".env")

  settings = Settings()
```
- **Dependencies:** Task 2.1 must be completed
- **Git Commit:** `feat: implement settings configuration with Pydantic`

### Phase 3: Database Layer

**Task 3.1: Create Database Connection Module**
- **Description:** Set up async database engine and session management
- **Agent Required:**
  - `neon-database-assistant` (READ FIRST for NeonDB async connection setup)
  - `sqlmodel-development-assistant` (READ for async SQLModel engine configuration)
- **Actions:**
  1. Create `backend/app/db/__init__.py`
  2. Create `backend/app/db/database.py`
  3. Implement async engine creation
  4. Implement session dependency for FastAPI
  5. Add connection lifecycle management
- **Files Created:**
  - `backend/app/db/__init__.py`
  - `backend/app/db/database.py`
- **Key Functions:**
  - `get_engine()` - Create async engine
  - `get_session()` - Async session dependency
  - `init_db()` - Initialize database tables
- **Dependencies:** Task 2.2 must be completed
- **Git Commit:** `feat: implement async database connection with NeonDB`

**Task 3.2: Define User Model (Reference)**
- **Description:** Create User model for reference (not managing authentication)
- **Agent Required:** `sqlmodel-development-assistant` (READ FIRST for SQLModel model definition)
- **Actions:**
  1. Create `backend/app/models/__init__.py`
  2. Create `backend/app/models/user.py`
  3. Define User SQLModel with email as primary key
- **Files Created:**
  - `backend/app/models/__init__.py`
  - `backend/app/models/user.py`
- **Model Fields:**
  - email (String, primary_key=True)
  - username (String)
- **Dependencies:** Task 3.1 must be completed
- **Git Commit:** `feat: add User model for authentication reference`

**Task 3.3: Define Task Model**
- **Description:** Create comprehensive Task model with all required fields
- **Agent Required:** `sqlmodel-development-assistant` (READ FIRST for SQLModel fields, relationships, and validators)
- **Actions:**
  1. Create `backend/app/models/task.py`
  2. Define Task SQLModel with all fields from specification
  3. Add proper field types, defaults, and constraints
  4. Implement relationships and foreign keys
  5. Add automatic timestamp handling
- **Files Created:**
  - `backend/app/models/task.py`
- **Model Fields:**
  - id (UUID, primary_key, default=uuid4)
  - user_email (String, ForeignKey to User.email)
  - title (String, max_length=200, required)
  - description (Text, optional)
  - priority (Enum: low/medium/high, default=medium)
  - is_completed (Boolean, default=False)
  - due_date (DateTime, nullable)
  - completed_at (DateTime, nullable)
  - created_at (DateTime, auto-generated)
  - updated_at (DateTime, auto-updated)
- **Dependencies:** Task 3.2 must be completed
- **Git Commit:** `feat: implement Task model with full field definitions`

**Task 3.4: Create Database Initialization Script**
- **Description:** Implement database table creation logic
- **Agent Required:**
  - `neon-database-assistant` (READ for database initialization best practices)
  - `sqlmodel-development-assistant` (READ for SQLModel.metadata.create_all usage)
- **Actions:**
  1. Create `backend/app/db/init_db.py`
  2. Implement table creation function
  3. Add error handling for database operations
- **Files Created:**
  - `backend/app/db/init_db.py`
- **Key Functions:**
  - `create_db_and_tables()` - Create all tables
  - Handle existing tables gracefully
- **Dependencies:** Task 3.3 must be completed
- **Git Commit:** `feat: add database initialization script`

### Phase 4: Pydantic Schemas

**Task 4.1: Create Task Schemas**
- **Description:** Define Pydantic schemas for request/response validation
- **Agent Required:** `fastapi-development-assistant` (READ FIRST for Pydantic schema patterns and validation)
- **Actions:**
  1. Create `backend/app/schemas/__init__.py`
  2. Create `backend/app/schemas/task.py`
  3. Define TaskCreate, TaskUpdate, TaskResponse, TaskList schemas
  4. Add custom validators
- **Files Created:**
  - `backend/app/schemas/__init__.py`
  - `backend/app/schemas/task.py`
- **Schemas to Create:**
  - `TaskCreate` - For POST requests
  - `TaskUpdate` - For PUT/PATCH requests (all fields optional)
  - `TaskResponse` - For API responses
  - `TaskListResponse` - For paginated list responses
- **Dependencies:** Task 3.3 must be completed
- **Git Commit:** `feat: implement Pydantic schemas for Task operations`

### Phase 5: Authentication & Security

**Task 5.1: Create JWT Utility Functions**
- **Description:** Implement JWT token decoding and validation
- **Agent Required:** `fastapi-development-assistant` (READ FIRST for JWT handling and security best practices)
- **Actions:**
  1. Create `backend/app/core/__init__.py`
  2. Create `backend/app/core/security.py`
  3. Implement token decoding with PyJWT
  4. Add token validation logic
  5. Handle expiration and invalid tokens
- **Files Created:**
  - `backend/app/core/__init__.py`
  - `backend/app/core/security.py`
- **Key Functions:**
  - `decode_jwt(token: str)` - Decode and validate JWT
  - `extract_user_from_token(token: str)` - Get user info from token
- **Dependencies:** Task 2.2 must be completed
- **Git Commit:** `feat: implement JWT token validation utilities`

**Task 5.2: Create Authentication Dependencies**
- **Description:** Implement FastAPI dependencies for authentication
- **Agent Required:**
  - `fastapi-development-assistant` (READ FIRST for dependency injection patterns)
  - `neon-database-assistant` (READ for async user verification queries)
- **Actions:**
  1. Create `backend/app/core/dependencies.py`
  2. Implement get_current_user dependency
  3. Add user verification against database
  4. Handle authentication errors
- **Files Created:**
  - `backend/app/core/dependencies.py`
- **Key Functions:**
  - `get_current_user()` - Verify token and return user email
  - Handle Bearer token extraction
  - Query database to verify user exists
- **Dependencies:** Task 5.1 and Task 3.1 must be completed
- **Git Commit:** `feat: add authentication dependency with database verification`

### Phase 6: Custom Exceptions

**Task 6.1: Define Custom Exception Classes**
- **Description:** Create custom exceptions for various error scenarios
- **Agent Required:** `fastapi-development-assistant` (READ for exception handling patterns)
- **Actions:**
  1. Create `backend/app/core/exceptions.py`
  2. Define all custom exception classes
  3. Include appropriate status codes and messages
- **Files Created:**
  - `backend/app/core/exceptions.py`
- **Exceptions to Create:**
  - `TokenInvalidException`
  - `TokenExpiredException`
  - `UserNotFoundException`
  - `TaskNotFoundException`
  - `ValidationException`
  - `DatabaseException`
- **Dependencies:** None
- **Git Commit:** `feat: define custom exception classes for error handling`

**Task 6.2: Implement Exception Handlers**
- **Description:** Register global exception handlers for FastAPI
- **Agent Required:** `fastapi-development-assistant` (READ for exception handler registration)
- **Actions:**
  1. Create `backend/app/core/exception_handlers.py`
  2. Implement handler for each custom exception
  3. Return standardized error responses
  4. Add logging for debugging
- **Files Created:**
  - `backend/app/core/exception_handlers.py`
- **Key Functions:**
  - Handler for each exception type
  - `register_exception_handlers(app)` - Register all handlers
- **Response Format:**
```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable message"
    }
  }
```
- **Dependencies:** Task 6.1 must be completed
- **Git Commit:** `feat: implement global exception handlers with standardized responses`

### Phase 7: API Endpoints Implementation

**Task 7.1: Create Tasks Router Setup**
- **Description:** Set up the tasks router structure
- **Agent Required:** `fastapi-development-assistant` (READ FIRST for router patterns and API versioning)
- **Actions:**
  1. Create `backend/app/api/__init__.py`
  2. Create `backend/app/api/v1/__init__.py`
  3. Create `backend/app/api/v1/tasks.py`
  4. Initialize APIRouter with tags and prefix
- **Files Created:**
  - `backend/app/api/__init__.py`
  - `backend/app/api/v1/__init__.py`
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 5.2 must be completed
- **Git Commit:** `feat: initialize tasks API router with v1 structure`

**Task 7.2: Implement Create Task Endpoint**
- **Description:** POST /api/v1/tasks - Create new task
- **Agent Required:**
  - `fastapi-development-assistant` (READ FIRST for async route handlers and validation)
  - `sqlmodel-development-assistant` (READ for async SQLModel INSERT operations)
- **Actions:**
  1. Implement POST endpoint in tasks router
  2. Use TaskCreate schema for validation
  3. Verify user authentication
  4. Create task in database
  5. Return TaskResponse
- **Endpoint:** `POST /api/v1/tasks`
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 7.1, Task 4.1 must be completed
- **If Stuck:** Consult `fastapi-development-assistant` and `sqlmodel-development-assistant` from `.claude/agents/`
- **Git Commit:** `feat: implement create task endpoint with validation`

**Task 7.3: Implement List Tasks Endpoint**
- **Description:** GET /api/v1/tasks - List all user tasks with filtering and pagination
- **Agent Required:**
  - `fastapi-development-assistant` (READ FIRST for query parameters and pagination)
  - `sqlmodel-development-assistant` (READ for filtering, sorting, and pagination with SQLModel)
- **Actions:**
  1. Implement GET endpoint with query parameters
  2. Add filters: completed status, priority, date range
  3. Implement pagination (page, page_size)
  4. Add sorting by created_at
  5. Return TaskListResponse with pagination metadata
- **Endpoint:** `GET /api/v1/tasks`
- **Query Parameters:**
  - completed (optional boolean)
  - priority (optional enum)
  - date_from, date_to (optional datetime)
  - page (default: 1)
  - page_size (default: 20)
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 7.2 must be completed
- **If Stuck:** Consult `sqlmodel-development-assistant` from `.claude/agents/` for complex query building
- **Git Commit:** `feat: implement list tasks endpoint with filtering and pagination`

**Task 7.4: Implement Get Single Task Endpoint**
- **Description:** GET /api/v1/tasks/{task_id} - Retrieve specific task
- **Agent Required:**
  - `fastapi-development-assistant` (READ for path parameters)
  - `sqlmodel-development-assistant` (READ for SELECT by ID operations)
- **Actions:**
  1. Implement GET endpoint with task_id parameter
  2. Verify task belongs to authenticated user
  3. Return TaskResponse
  4. Raise TaskNotFoundException if not found
- **Endpoint:** `GET /api/v1/tasks/{task_id}`
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 7.3 must be completed
- **If Stuck:** Consult agents from `.claude/agents/`
- **Git Commit:** `feat: implement get single task endpoint with ownership verification`

**Task 7.5: Implement Update Task Endpoint**
- **Description:** PUT /api/v1/tasks/{task_id} - Update task with partial updates
- **Agent Required:**
  - `fastapi-development-assistant` (READ for PATCH operations)
  - `sqlmodel-development-assistant` (READ for UPDATE operations with partial data)
- **Actions:**
  1. Implement PUT endpoint with task_id
  2. Use TaskUpdate schema (all fields optional)
  3. Verify ownership
  4. Update only provided fields
  5. Update updated_at timestamp
  6. Return updated TaskResponse
- **Endpoint:** `PUT /api/v1/tasks/{task_id}`
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 7.4 must be completed
- **If Stuck:** Consult `sqlmodel-development-assistant` from `.claude/agents/` for partial update patterns
- **Git Commit:** `feat: implement update task endpoint with partial updates support`

**Task 7.6: Implement Delete Task Endpoint**
- **Description:** DELETE /api/v1/tasks/{task_id} - Permanently delete task
- **Agent Required:**
  - `fastapi-development-assistant` (READ for DELETE operations)
  - `sqlmodel-development-assistant` (READ for DELETE operations)
- **Actions:**
  1. Implement DELETE endpoint with task_id
  2. Verify ownership
  3. Delete task from database
  4. Return success message
- **Endpoint:** `DELETE /api/v1/tasks/{task_id}`
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Response:**
```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
```
- **Dependencies:** Task 7.5 must be completed
- **If Stuck:** Consult agents from `.claude/agents/`
- **Git Commit:** `feat: implement delete task endpoint with ownership check`

**Task 7.7: Implement Toggle Completion Endpoint**
- **Description:** PATCH /api/v1/tasks/{task_id}/complete - Toggle task completion status
- **Agent Required:**
  - `fastapi-development-assistant` (READ for PATCH operations)
  - `sqlmodel-development-assistant` (READ for conditional UPDATE operations)
- **Actions:**
  1. Implement PATCH endpoint with task_id
  2. Verify ownership
  3. Toggle is_completed status
  4. Set completed_at when marking complete
  5. Clear completed_at when marking incomplete
  6. Return updated TaskResponse
- **Endpoint:** `PATCH /api/v1/tasks/{task_id}/complete`
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 7.6 must be completed
- **If Stuck:** Consult agents from `.claude/agents/`
- **Git Commit:** `feat: implement toggle completion endpoint with timestamp handling`

### Phase 8: Main Application

**Task 8.1: Create Main FastAPI Application**
- **Description:** Set up main application with all configurations
- **Agent Required:** `fastapi-development-assistant` (READ FIRST for application setup, CORS, lifespan events)
- **Actions:**
  1. Create `backend/app/main.py`
  2. Initialize FastAPI app with metadata
  3. Configure CORS for frontend integration
  4. Include tasks router
  5. Register exception handlers
  6. Add startup event to initialize database
  7. Add health check endpoint
- **Files Created:**
  - `backend/app/main.py`
- **Key Components:**
  - FastAPI app initialization
  - CORS middleware
  - Router inclusion (/api/v1/tasks)
  - Lifespan events for database
  - Health check at /health
- **Dependencies:** Task 7.7 and Task 6.2 must be completed
- **Git Commit:** `feat: implement main FastAPI application with CORS and database lifecycle`

**Task 8.2: Create Application Entry Point**
- **Description:** Add run script for development
- **Agent Required:** `fastapi-development-assistant` (READ for Uvicorn configuration)
- **Actions:**
  1. Update `backend/pyproject.toml` with scripts
  2. Verify Uvicorn configuration
- **Files Modified:**
  - `backend/pyproject.toml`
- **Add Script:**
```toml
  [project.scripts]
  dev = "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
```
- **Dependencies:** Task 8.1 must be completed
- **Git Commit:** `chore: add development server run script`

### Phase 9: Testing

**Task 9.1: Create Test Configuration**
- **Description:** Set up pytest configuration and fixtures
- **Agent Required:** `fastapi-development-assistant` (READ FIRST for FastAPI testing patterns)
- **Actions:**
  1. Create `backend/tests/__init__.py`
  2. Create `backend/tests/conftest.py`
  3. Set up test database fixtures
  4. Create test client fixture
  5. Create mock JWT token fixture
  6. Add sample test data fixtures
- **Files Created:**
  - `backend/tests/__init__.py`
  - `backend/tests/conftest.py`
- **Key Fixtures:**
  - `test_db` - Test database session
  - `test_client` - FastAPI TestClient
  - `mock_token` - Valid JWT token for testing
  - `sample_user` - Test user
  - `sample_task` - Test task
- **Dependencies:** Task 8.1 must be completed
- **Git Commit:** `test: add pytest configuration and test fixtures`

**Task 9.2: Write Task Endpoint Tests**
- **Description:** Comprehensive tests for all task endpoints
- **Agent Required:** `fastapi-development-assistant` (READ for testing async endpoints)
- **Actions:**
  1. Create `backend/tests/test_tasks.py`
  2. Test create task (success and failures)
  3. Test list tasks with filters
  4. Test get single task
  5. Test update task
  6. Test delete task
  7. Test toggle completion
  8. Test authentication failures
  9. Test validation errors
- **Files Created:**
  - `backend/tests/test_tasks.py`
- **Test Categories:**
  - Happy path tests
  - Authentication failures (invalid/expired token)
  - Ownership verification
  - Validation errors
  - Edge cases (pagination, filters)
- **Dependencies:** Task 9.1 must be completed
- **If Stuck:** Consult `fastapi-development-assistant` from `.claude/agents/`
- **Git Commit:** `test: add comprehensive tests for task endpoints`

**Task 9.3: Write Authentication Tests**
- **Description:** Test JWT validation and user verification
- **Agent Required:** `fastapi-development-assistant` (READ for security testing)
- **Actions:**
  1. Create `backend/tests/test_auth.py`
  2. Test token decoding
  3. Test expired tokens
  4. Test invalid tokens
  5. Test unregistered users
- **Files Created:**
  - `backend/tests/test_auth.py`
- **Dependencies:** Task 9.2 must be completed
- **Git Commit:** `test: add authentication and JWT validation tests`

### Phase 10: Documentation

**Task 10.1: Create Backend README**
- **Description:** Comprehensive documentation for backend setup and usage
- **Agent Required:** None
- **Actions:**
  1. Create `backend/README.md`
  2. Document setup instructions using UV
  3. List environment variables
  4. Explain how to run the application
  5. Document API endpoints
  6. Add testing instructions
  7. Include troubleshooting section
- **Files Created:**
  - `backend/README.md`
- **Sections:**
  - Prerequisites
  - Installation (UV-based)
  - Configuration
  - Running the Application
  - API Documentation
  - Testing
  - Project Structure
  - Troubleshooting
- **Dependencies:** Task 8.2 must be completed
- **Git Commit:** `docs: add comprehensive backend README with setup instructions`

**Task 10.2: Add API Endpoint Documentation**
- **Description:** Enhance FastAPI OpenAPI documentation
- **Agent Required:** `fastapi-development-assistant` (READ for OpenAPI documentation)
- **Actions:**
  1. Add descriptions to all endpoints in tasks router
  2. Add request/response examples
  3. Document authentication requirements
  4. Add tags and summaries
- **Files Modified:**
  - `backend/app/api/v1/tasks.py`
- **Dependencies:** Task 10.1 must be completed
- **Git Commit:** `docs: enhance API endpoint documentation with examples`

### Phase 11: Code Quality & Final Setup

**Task 11.1: Configure Ruff for Linting**
- **Description:** Set up code quality tools
- **Agent Required:** None
- **Actions:**
  1. Create `backend/ruff.toml` or add to `pyproject.toml`
  2. Configure linting rules
  3. Configure formatting rules
  4. Add pre-commit hooks (optional)
- **Files Created/Modified:**
  - `backend/pyproject.toml` (add ruff config)
- **Dependencies:** None
- **Git Commit:** `chore: configure Ruff for code linting and formatting`

**Task 11.2: Run Linting and Fix Issues**
- **Description:** Ensure code quality across the project
- **Agent Required:** None
- **Actions:**
```bash
  cd backend
  uv run ruff check . --fix
  uv run ruff format .
```
- **Files Modified:** Multiple files (formatting fixes)
- **Dependencies:** Task 11.1 and all previous tasks must be completed
- **Git Commit:** `style: format code with Ruff`

**Task 11.3: Create Root Project README**
- **Description:** Main README at project root
- **Agent Required:** None
- **Actions:**
  1. Create/update root `README.md`
  2. Explain project structure
  3. Link to backend README
  4. Document spec-kit-plus usage
- **Files Created/Modified:**
  - `README.md` (root level)
- **Dependencies:** Task 10.1 must be completed
- **Git Commit:** `docs: add root README with project overview`

**Task 11.4: Verify All Tests Pass**
- **Description:** Final verification before completion
- **Agent Required:** None (but consult agents if tests fail)
- **Actions:**
```bash
  cd backend
  uv run pytest -v
```
- **Dependencies:** All previous tasks must be completed
- **Expected:** All tests should pass
- **If Tests Fail:**
  1. Identify which agent domain the failure belongs to
  2. Consult the relevant agent from `.claude/agents/`
  3. Fix the issue
  4. Re-run tests
- **Git Commit:** `test: verify all tests pass successfully`

## Dependencies

- Task 1.2 depends on Task 1.1
- Task 1.3 depends on Task 1.2
- Task 1.4 depends on Task 1.3
- Task 2.2 depends on Task 2.1
- Task 3.1 depends on Task 2.2
- Task 3.2 depends on Task 3.1
- Task 3.3 depends on Task 3.2
- Task 3.4 depends on Task 3.3
- Task 4.1 depends on Task 3.3
- Task 5.1 depends on Task 2.2
- Task 5.2 depends on Task 5.1 and Task 3.1
- Task 7.1 depends on Task 5.2
- Task 7.2 depends on Task 7.1 and Task 4.1
- Task 7.3 depends on Task 7.2
- Task 7.4 depends on Task 7.3
- Task 7.5 depends on Task 7.4
- Task 7.6 depends on Task 7.5
- Task 7.7 depends on Task 7.6
- Task 8.1 depends on Task 7.7 and Task 6.2
- Task 8.2 depends on Task 8.1
- Task 9.1 depends on Task 8.1
- Task 9.2 depends on Task 9.1
- Task 9.3 depends on Task 9.2
- Task 10.1 depends on Task 8.2
- Task 10.2 depends on Task 10.1
- Task 11.2 depends on Task 11.1 and all previous tasks
- Task 11.3 depends on Task 10.1
- Task 11.4 depends on all previous tasks

## Parallel Execution Opportunities

- Tasks 1.3 and 1.4 can be executed in parallel as they both install dependencies
- Tasks 6.1 and 6.2 can be executed in parallel as they both relate to exception handling
- Tasks 9.2 and 9.3 can be executed in parallel as they both relate to testing

## Implementation Strategy

1. Start with Phase 1 (Project Foundation) to establish the basic structure
2. Proceed with Phase 2 (Configuration Setup) to configure the application
3. Move to Phase 3 (Database Layer) to establish the data layer
4. Continue with Phase 4 (Pydantic Schemas) to define data validation
5. Proceed with Phase 5 (Authentication & Security) to secure the application
6. Move to Phase 6 (Custom Exceptions) to handle errors properly
7. Implement Phase 7 (API Endpoints) to provide functionality
8. Complete with Phase 8 (Main Application) to tie everything together
9. Follow with Phase 9 (Testing) to ensure quality
10. Proceed with Phase 10 (Documentation) to document the application
11. Finish with Phase 11 (Code Quality & Final Setup) to polish the application

The MVP scope would include the essential tasks from Phases 1-8 to deliver a working backend with basic task management functionality.
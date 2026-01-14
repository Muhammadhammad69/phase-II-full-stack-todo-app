---
id: 0001
title: todo-backend-plan
stage: plan
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-todo-backend
branch: 001-todo-backend
user: claude
command: /sp.plan 001-todo-backend
labels: ["todo-backend", "api", "fastapi", "planning"]
links:
  spec: /mnt/d/code/GIAIC_Quatar_04/Quatar_04_Hackathons/hackathon_two/phase-2-todo-app/specs/001-todo-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/d/code/GIAIC_Quatar_04/Quatar_04_Hackathons/hackathon_two/phase-2-todo-app/specs/001-todo-backend/plan.md
  - /mnt/d/code/GIAIC_Quatar_04/Quatar_04_Hackathons/hackathon_two/phase-2-todo-app/specs/001-todo-backend/research.md
  - /mnt/d/code/GIAIC_Quatar_04/Quatar_04_Hackathons/hackathon_two/phase-2-todo-app/specs/001-todo-backend/data-model.md
  - /mnt/d/code/GIAIC_Quatar_04/Quatar_04_Hackathons/hackathon_two/phase-2-todo-app/specs/001-todo-backend/quickstart.md
  - /mnt/d/code/GIAIC_Quatar_04/Quatar_04_Hackathons/hackathon_two/phase-2-todo-app/specs/001-todo-backend/contracts/openapi.yaml
tests:
  - no tests created in planning phase
---

## Prompt

```
/sp.plan 001-todo-backend

Must run this command /sp.plan

## Todo App Backend - Technical Implementation Plan

### Project Structure & Setup Strategy

Before creating the technical implementation plan, we need to organize the project structure as follows:

```
.
├── backend/                          # All backend code here
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── .env
│   ├── src/
│   │   ├── main.py
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── middleware/
│   │   └── utils/
│   └── requirements.txt
├── .specify/                         # Spec-kit-plus artifacts (root level)
│   ├── memory/
│   ├── scripts/
│   ├── specs/
│   └── templates/
├── .git/                             # Git repo (root level)
└── other spec-kit-plus files (root)
```

### Step 1: Backend Folder & UV Project Creation

**Consult with fastapi-development-assistant, neon-database-assistant, and sqlmodel-development-assistant before proceeding:**

1. Create `backend/` folder in project root
2. Initialize UV project: `uv init todo-backend` inside backend folder
3. This will create:
   - `backend/pyproject.toml` with project metadata
   - `backend/.python-version` for Python version pinning
   - `backend/README.md`
4. The UV project will be isolated within the `backend/` directory

### Step 2: Dependencies Installation via UV

**Consult with fastapi-development-assistant, neon-database-assistant, and sqlmodel-development-assistant:**

Install all required dependencies using UV:

```
cd backend
uv sync
uv add fastapi uvicorn sqlmodel psycopg[binary] pyjwt python-dotenv pydantic pydantic-settings
```

Key Dependencies:
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlmodel** - ORM and data validation
- **psycopg** - PostgreSQL adapter
- **pyjwt** - JWT token handling
- **python-dotenv** - Environment variables
- **pydantic & pydantic-settings** - Data validation

### Step 3: Environment Configuration

**Consult with neon-database-assistant:**

Create `backend/.env` file with:
```
DATABASE_URL=postgresql://user:password@localhost/todo_db
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ENVIRONMENT=development
APP_NAME=Todo Backend API
DEBUG=true
LOG_LEVEL=INFO
```

Create `backend/src/config/settings.py` using Pydantic Settings for configuration management.

### Step 4: Database Connection & Schema

**Primary consultation: neon-database-assistant**
**Secondary: sqlmodel-development-assistant**

Setup NeonDB PostgreSQL connection:
- Connection pooling with appropriate pool size
- Connection timeout configuration
- Error handling for database connection failures
- Create migration system using Alembic or manual SQL

Database Schema Implementation:
- **Users Table**: email (PK), username
- **Tasks Table**: id (UUID), user_email (FK), title, description, priority (enum), is_completed, due_date, completed_at, created_at, updated_at

### Step 5: SQLModel Models Definition

**Primary consultation: sqlmodel-development-assistant**
**Secondary: fastapi-development-assistant**

Create models in `backend/src/models/`:
- `User` model (reference to users table)
- `Task` model with all fields from schema
- Use SQLModel for both ORM and Pydantic validation
- Define relationships between User and Task
- Add field validators for data integrity

Create Pydantic schemas in `backend/src/schemas/` for request/response:
- `TaskCreate` - Input validation for creating tasks
- `TaskUpdate` - Partial update validation
- `TaskResponse` - API response format
- `TaskListResponse` - Paginated response format

### Step 6: JWT Authentication Middleware

**Primary consultation: fastapi-development-assistant**
**Secondary: (neon-database-assistant for user lookup)**

Create authentication system in `backend/src/middleware/`:
- JWT token extraction from Authorization header (Bearer token)
- Token validation using PyJWT
- Token signature verification
- Expiration checking
- Email validation against users table
- Custom exception handling for auth failures
- Reusable dependency for protecting routes

### Step 7: API Endpoint Structure

**Primary consultation: fastapi-development-assistant**
**Secondary: sqlmodel-development-assistant**

Organize endpoints in `backend/src/api/v1/`:
- `endpoints/tasks.py` - All task CRUD operations
- `router.py` - Route aggregation

Endpoints to implement:
- POST `/api/v1/tasks` - Create task
- GET `/api/v1/tasks` - List tasks (with filters & pagination)
- GET `/api/v1/tasks/{task_id}` - Get single task
- PUT `/api/v1/tasks/{task_id}` - Update task
- DELETE `/api/v1/tasks/{task_id}` - Delete task
- PATCH `/api/v1/tasks/{task_id}/complete` - Toggle completion

### Step 8: Database Operations (CRUD)

**Primary consultation: sqlmodel-development-assistant**
**Secondary: neon-database-assistant**

Create `backend/src/utils/db_operations.py`:
- Create task with user association
- Read tasks with filtering (completed/pending, priority, date range)
- Implement pagination (20 items/page default)
- Update task fields (partial updates)
- Delete task with ownership verification
- Sort by created_at descending by default

### Step 9: Error Handling & Response Format

**Primary consultation: fastapi-development-assistant**

Implement consistent error handling:
- Custom exception classes for different error types
- Global exception handlers
- Standardized response format (success/error structure)
- Specific error codes for each scenario
- Proper HTTP status codes (401, 403, 404, 400, 500)

Response format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Step 10: CORS & Additional Middleware

**Consult with fastapi-development-assistant:**

- Configure CORS for frontend integration
- Add logging middleware for debugging
- Request/response logging
- Error logging

### Step 11: Main Application File

**Consult with fastapi-development-assistant:**

Create `backend/src/main.py`:
- Initialize FastAPI app
- Mount all routers
- Register middleware
- Configure CORS
- Add health check endpoint
- Setup logging

### Step 12: Project Structure Verification

After planning, create skeleton files:
```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py
│   │   └── session.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── task.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   └── tasks.py
│   │   │   └── router.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py
│   └── utils/
│       ├── __init__.py
│       ├── db_operations.py
│       └── exceptions.py
└── tests/
    ├── __init__.py
    └── test_tasks.py
```

### Critical Decisions

**Consult with all three agents - fastapi-development-assistant, neon-database-assistant, and sqlmodel-development-assistant:**

1. **Async vs Sync**: Use async/await throughout for better concurrency
2. **Database Pool Size**: Determine appropriate pool size for expected load
3. **Error Handling Strategy**: Use custom exceptions with specific codes
4. **Logging Level**: Determine appropriate logging for development vs production
5. **API Versioning**: Use /api/v1/ path prefix for future versioning support

### Tech Stack Confirmation

- **Framework**: FastAPI (async, modern, auto-documentation)
- **ASGI Server**: Uvicorn (production-ready)
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Database**: NeonDB (PostgreSQL serverless)
- **Authentication**: PyJWT with custom middleware
- **Dependency Management**: UV (fast, reliable)
- **Environment**: python-dotenv
- **Data Validation**: Pydantic v2

### Deliverables from Planning Phase

1. ✅ Project structure documented
2. ✅ Dependencies listed and justified
3. ✅ Database schema designed
4. ✅ API endpoint specification
5. ✅ Authentication flow documented
6. ✅ Error handling strategy defined
7. ✅ Response format standardized
8. ✅ Tech stack confirmed with agent consultation

### Next Steps After /sp.plan

1. Review this implementation plan with all three agents
2. Create skeleton directory structure in `backend/`
3. Initialize UV project in `backend/` folder
4. Create `.env` template file
5. Commit all planning artifacts to git with message: "plan: add todo backend implementation plan with UV project structure"
6. Await `/sp.tasks` command to break down into actionable items

---

**IMPORTANT**: This is PLANNING ONLY. No implementation code will be written until `/sp.implement` command is executed.
```

## Response snapshot

Implemented a comprehensive technical implementation plan for the Todo App Backend API. The planning phase included:

1. Created research.md that defines the technology stack:
   - Python 3.11 with FastAPI framework
   - Uvicorn as ASGI server
   - SQLModel for ORM and data validation
   - PyJWT for authentication
   - PostgreSQL via NeonDB
   - Pytest for testing

2. Created data-model.md with entity definitions:
   - User entity with email, username, and timestamps
   - Task entity with title, description, priority, completion status, and relationships
   - Database schema with proper indexes and constraints

3. Created OpenAPI specification in contracts/openapi.yaml defining:
   - All required endpoints (POST, GET, PUT, DELETE, PATCH)
   - Request/response schemas
   - Error handling patterns
   - Authentication requirements

4. Created quickstart.md with setup instructions and usage examples

5. Updated the implementation plan with resolved technical context

All planning artifacts are now in place for the next phase of implementation.

## Outcome

- ✅ Impact: Complete technical implementation plan created with all required artifacts
- 🧪 Tests: no tests created in planning phase
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, openapi.yaml, and PHR
- 🔁 Next prompts: Ready for /sp.tasks to break down implementation into actionable tasks
- 🧠 Reflection: Planning phase successfully completed all required deliverables

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementation with /sp.tasks

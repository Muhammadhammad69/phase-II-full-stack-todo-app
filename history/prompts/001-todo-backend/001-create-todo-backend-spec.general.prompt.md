---
id: 001
title: create-todo-backend-spec
stage: spec
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-todo-backend
user: claude
command: /sp.specify 001-todo-backend
labels:
  - todo-api
  - backend
  - specification
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-backend/spec.md
  - specs/001-todo-backend/checklists/requirements.md
tests:
  - spec-validation
---

# Create Todo Backend API Specification

## Prompt Text

```
001-todo-backend

Must run this command /sp.specify
Branch Name: 001-todo-backend

Build a secure and scalable Todo App Backend API with the following requirements:

## Project Overview
Create a FastAPI-based backend service for a Todo application that allows users to manage their personal todo items. The system will handle task creation, updates, deletion, viewing, and completion tracking with JWT-based authentication.

## Core Features

### 1. Add Task
**User Story:** As a user, I want to create new todo items so that I can track tasks I need to complete.

**Acceptance Criteria:**
- User sends a POST request with task details (title, description, priority, due_date)
- System validates JWT token from request headers
- System extracts username and email from decoded token
- System verifies email exists in the database
- System creates a new task associated with the authenticated user
- System returns created task details with unique task ID and timestamp
- System returns appropriate error if token is invalid, expired, or email not registered

### 2. Delete Task
**User Story:** As a user, I want to remove tasks from my list so that I can keep my todo list clean and relevant.

**Acceptance Criteria:**
- User sends a DELETE request with task ID
- System validates JWT token from request headers
- System verifies the task belongs to the authenticated user
- System permanently deletes the task from the database
- System returns success confirmation
- System returns 404 if task doesn't exist or doesn't belong to user
- System returns appropriate error for invalid/expired token

### 3. Update Task
**User Story:** As a user, I want to modify existing task details so that I can keep information current and accurate.

**Acceptance Criteria:**
- User sends a PUT/PATCH request with task ID and updated fields
- System validates JWT token from request headers
- System verifies the task belongs to the authenticated user
- System allows partial updates (title, description, priority, due_date)
- System updates only the provided fields
- System returns updated task details
- System returns 404 if task doesn't exist or doesn't belong to user
- System returns appropriate error for invalid/expired token

### 4. View Task List
**User Story:** As a user, I want to see all my tasks so that I can review what needs to be done.

**Acceptance Criteria:**
- User sends a GET request to retrieve all tasks
- System validates JWT token from request headers
- System returns all tasks associated with the authenticated user
- System includes filtering options (completed/pending, priority, date range)
- System supports pagination (default 20 items per page)
- System returns tasks sorted by created_at descending by default
- System returns empty array if user has no tasks
- System returns appropriate error for invalid/expired token

### 5. Mark as Complete
**User Story:** As a user, I want to toggle task completion status so that I can track my progress.

**Acceptance Criteria:**
- User sends a PATCH request with task ID to toggle completion
- System validates JWT token from request headers
- System verifies the task belongs to the authenticated user
- System toggles is_completed status (true/false)
- System updates completed_at timestamp when marked complete
- System clears completed_at when marked incomplete
- System returns updated task with new status
- System returns 404 if task doesn't exist or doesn't belong to user
- System returns appropriate error for invalid/expired token

## Technical Requirements

### Technology Stack
- **Framework:** FastAPI (latest stable version)
- **Database:** NeonDB (PostgreSQL)
- **ORM:** SQLModel
- **Project Management:** UV (for project creation and dependency management)
- **JWT Library:** PyJWT (for token decoding and validation)
- **Environment Management:** python-dotenv

### Database Schema
**Tasks Table:**
- id (UUID, primary key)
- user_email (string, foreign key reference)
- title (string, required, max 200 chars)
- description (text, optional)
- priority (enum: low, medium, high, default: medium)
- is_completed (boolean, default: false)
- due_date (datetime, optional)
- completed_at (datetime, nullable)
- created_at (datetime, auto-generated)
- updated_at (datetime, auto-updated)

**Users Table Reference:**
- email (string, primary key)
- username (string, required)

### Authentication & Authorization
- All endpoints require JWT token in Authorization header (Bearer token)
- Token must be decoded using PyJWT library
- Token payload contains: username, email, exp (expiration)
- System must validate token signature and expiration
- System must verify email exists in users table before any operation
- Return 401 Unauthorized for invalid tokens
- Return 401 Unauthorized for expired tokens
- Return 403 Forbidden for unregistered emails

### API Response Format
**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Error Handling
- Invalid Token: "Invalid authentication token"
- Expired Token: "Authentication token has expired"
- Unregistered Email: "User not found in the system"
- Task Not Found: "Task not found or access denied"
- Validation Error: "Invalid input: [specific field errors]"
- Database Error: "An error occurred while processing your request"

## AI Agents Collaboration
This specification will be implemented using three specialized agents:

1. **fastapi-development-assistant**:
   - API endpoint design and implementation
   - Request/response handling
   - JWT authentication middleware
   - Input validation and error handling

2. **neon-database-assistant**:
   - Database connection setup
   - Schema design and migrations
   - Query optimization
   - Connection pooling configuration

3. **sqlmodel-development-assistant**:
   - SQLModel models definition
   - Database relationships
   - CRUD operations implementation
   - Data validation with Pydantic

## Project Setup Requirements
- Use UV for project initialization: `uv init todo-backend`
- Use UV for all dependency installation
- Create virtual environment using UV
- Configure development and production environments
- Set up environment variables (.env file)

## Environment Variables Required
DATABASE_URL=postgresql://user:password@neon-host/dbname
USER_TABLE="user"
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ENVIRONMENT=development

## API Endpoints Summary
- POST /api/v1/tasks - Create new task
- GET /api/v1/tasks - List all tasks with filters
- GET /api/v1/tasks/{task_id} - Get specific task
- PUT /api/v1/tasks/{task_id} - Update task
- DELETE /api/v1/tasks/{task_id} - Delete task
- PATCH /api/v1/tasks/{task_id}/complete - Toggle completion

## Non-Functional Requirements
- API response time < 200ms for 95th percentile
- Support concurrent requests (async operations)
- Proper logging for debugging and monitoring
- Input sanitization to prevent SQL injection
- Rate limiting per user (optional for future)
- CORS configuration for frontend integration

## Out of Scope (For This Phase)
- User registration and login endpoints
- Password management
- Email notifications
- Task sharing between users
- Task categories or labels
- Task attachments
- Recurring tasks

## Success Criteria
- All five core features are fully functional
- JWT authentication works correctly
- Database operations are secure and efficient
- API follows RESTful conventions
- Proper error handling for all scenarios
- Code is well-documented and follows PEP 8
- All changes are committed to Git with descriptive messages

## Git Commit Strategy
After specification creation, commit all changes with message:
"feat: add todo app backend specifications with JWT auth and NeonDB integration"

## Review & Acceptance Checklist
- [ ] All user stories are clearly defined with acceptance criteria
- [ ] Technical stack is explicitly specified (FastAPI, NeonDB, SQLModel, UV, PyJWT)
- [ ] Authentication flow is clearly documented
- [ ] Database schema is defined
- [ ] API endpoints are listed with methods
- [ ] Error handling scenarios are covered
- [ ] Environment variables are documented
- [ ] Success criteria are measurable
- [ ] Out of scope items are identified
- [ ] Git commit message is appropriate
```

## Response Text

Created a comprehensive specification for the Todo App Backend API with five core user stories (Add Task, View Task List, Update Task, Delete Task, Mark as Complete), each with priority levels, acceptance scenarios, and edge cases. Defined 19 functional requirements covering JWT authentication, task operations, filtering, pagination, and error handling. Established 8 measurable success criteria focusing on functionality, performance, and code quality. The specification is technology-agnostic and ready for the planning phase.

## Outcome

Successfully created a complete specification for the Todo App Backend API that covers all core features requested, with clear user stories, functional requirements, and success criteria. The specification is ready for planning and implementation.
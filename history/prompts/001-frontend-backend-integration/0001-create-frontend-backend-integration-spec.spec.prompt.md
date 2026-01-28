---
id: 0001
title: Create Frontend Backend Integration Spec
stage: spec
date: 2026-01-28
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-frontend-backend-integration
branch: 001-frontend-backend-integration
user: default_user
command: /sp.specify — 002-frontend-backend-integration
labels: ["spec", "integration", "api", "authentication"]
links:
  spec: ../specs/001-frontend-backend-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-frontend-backend-integration/spec.md
  - specs/001-frontend-backend-integration/checklists/requirements.md
  - history/prompts/001-frontend-backend-integration/0001-create-frontend-backend-integration-spec.spec.prompt.md
tests:
  - none
---

## Prompt

— 002-frontend-backend-integration

Must run this command /sp.specify
Branch Name: 002-frontend-backend-integration

## 🎯 Goal
Connect the **frontend application** with an **already deployed FastAPI backend**, enabling real API-driven functionality for the following frontend routes:

- `/todos`
- `/dashboard`
- `/profile`

The backend is **fully ready and deployed**. The frontend must consume **real APIs only** (no mocks or static data).

---

## 🧩 Environment Configuration
- Backend base URL is defined in `.env` as:

```env
BACKEND_BASE_URL=...
## 🌐 API Configuration Rules

- All API requests **MUST** use the environment variable
- ❌ Do **NOT** hardcode backend URLs anywhere in the codebase

---

## 🔐 Authentication Rules

- Backend uses **JWT authentication**
- JWT token is stored in **cookies**
- Cookie name: `auth_token`

### 📡 Protected API Requests

For every protected API request:

1. Read the JWT token from cookies
2. Send the token in request headers as:

```http
Authorization: Bearer <auth_token>

### Authentication Error Handling

- If the token is **missing** or **invalid**:
  - Handle **401 Unauthorized** responses gracefully
  - Prepare logic for **redirect** or **error handling**
    - Logic only
    - ❌ No UI redesign

## 📄 Backend API Contract (Source of Truth)

### 1️⃣ Health Check

**Endpoint:**
`GET /health`

**Authentication:**
Not required

**Purpose:**
Sanity check only (optional usage)

**Response:
```json
{
  "status": "healthy",
  "message": "Todo Backend API is running"
}


## 🗂 Task Management APIs

All endpoints below are **JWT protected**
**Base Path:** `/api/v1/tasks`

---

### ➕ Create Task

**Endpoint:**
`POST /api/v1/tasks/`

**Authentication:**
Required (JWT)

**Headers:
Authorization: Bearer <auth_token>


**Payload:**

- `title` (string, **required**)
- `description` (string, optional)
- `priority` (string: `low` | `medium` | `high`, default: `medium`)
- `due_date` (ISO DateTime, optional)

**Response:**
Created task object (includes `id`, timestamps, and other task details)

## 📄 List Tasks

**Endpoint:**
`GET /api/v1/tasks/`

**Authentication:**
Required (JWT)

**Headers:
Authorization: Bearer <auth_token>

**Optional Query Parameters:**

- `completed` (boolean)
- `priority` (`low` | `medium` | `high`)
- `date_from` (date)
- `date_to` (date)
- `page` (integer, default: 1)
- `page_size` (integer, default: 20)

**Response:**
Paginated task list with metadata

---

### 🔍 Get Specific Task

**Endpoint:**
`GET /api/v1/tasks/{task_id}`

**Authentication:**
Required (JWT)

**Headers:
Authorization: Bearer <auth_token>

**Path Parameter:**

- `task_id` (UUID)

**Response:**
Single task object

---

### ✏️ Update Task

**Endpoint:**
`PUT /api/v1/tasks/{task_id}`

**Authentication:**
Required (JWT)

**Headers:
Authorization: Bearer <auth_token>

**Notes:**
Partial updates allowed

**Payload (any combination):**

- `title`
- `description`
- `priority`
- `due_date`
- `is_completed`

**Response:**
Updated task object

---

### ✅ Toggle Task Completion

**Endpoint:**
`PATCH /api/v1/tasks/{task_id}/complete`

**Authentication:**
Required (JWT)

**Headers:
Authorization: Bearer <auth_token>

**Response:**
Task object with updated completion status

### 🗑 Delete Task

**Endpoint:**
`DELETE /api/v1/tasks/{task_id}`

**Authentication:**
Required (JWT)

**Headers:
Authorization: Bearer <auth_token>

**Response:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}

## 📌 Frontend Page Responsibilities

### /todos
- Fetch tasks from **real backend API**
- Display tasks using **backend response**
- Support:
  - Create task
  - Update task
  - Toggle completion
  - Delete task
- **Pagination** and **filters** must map directly to backend query parameters

### /dashboard
- Use **real backend task data**
- Display meaningful **aggregated or summary information**
- ❌ No mock, static, or hardcoded data allowed

### /profile
- Use **authenticated context**
- Validate presence of **JWT token**
- Ensure consistent **auth-protected behavior**
- Prepare structure for **future user-related API integrations**

---

## 🛠 Technical Constraints
- All implementation work must be inside `/frontend`
- **Backend code must NOT be modified**
- Login and Signup pages **already exist**
- Focus only on:
  - API integration
  - Data flow
  - Authentication handling
  - Correctness and stability

## 🧠 Required Skill Usage

You **MUST** apply best practices from:
  skill_name: vercel-react-best-practices
  skill_location: `/.claude/skills/vercel-react-best-practices`


**Including:**

- Production-safe **data fetching**
- Secure **environment variable** usage
- Clean separation of **API logic** and **UI components**
- **Error** and **loading** state handling
- **Vercel-optimized React patterns**

---

## ✅ Success Criteria

- Frontend consumes **real backend APIs**
- **JWT token** is attached to every protected request
- `/todos`, `/dashboard`, and `/profile` are fully **API-driven**
- No **hardcoded** or **mock data** remains
- Integration is **clean**, **maintainable**, and **scalable**

---

## 🚫 Non-Goals

- No **UI redesign**
- No **backend changes**
- No **authentication system rewrite**

## Response snapshot

I'll help you create a specification for the frontend-backend integration feature. Let me start by analyzing the feature description and creating the specification.

First, I'll determine an appropriate short name for the branch based on the feature description.

...

[Response content was truncated in the conversation history]

## Outcome

- ✅ Impact: Created feature specification document for frontend-backend integration
- 🧪 Tests: None needed for spec creation
- 📁 Files: Created spec.md and requirements checklist in specs/001-frontend-backend-integration/
- 🔁 Next prompts: Ready for /sp.clarify or /sp.plan to continue development
- 🧠 Reflection: Successfully created a comprehensive spec for integrating the frontend with the backend API

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Not applicable
- Next experiment (smallest change to try): Begin implementation planning

# API Contracts: Frontend-Backend Integration

## Base Configuration
- Base URL: `{BACKEND_BASE_URL}`
- Authentication: JWT Token via `Authorization: Bearer {token}` header
- Content-Type: `application/json`
- All endpoints require authentication unless otherwise specified

## Health Check Endpoint
```
GET /health
```

### Request
- No authentication required
- No request body

### Response
```json
{
  "status": "healthy",
  "message": "Todo Backend API is running"
}
```

## Task Management Endpoints

### Get All Tasks
```
GET /api/v1/tasks/
```

#### Request
- Headers: `Authorization: Bearer {token}`
- Query Parameters (optional):
  - `completed`: boolean (filter by completion status)
  - `priority`: string (`low` | `medium` | `high`)
  - `date_from`: date (filter tasks from this date)
  - `date_to`: date (filter tasks until this date)
  - `page`: integer (pagination page, default: 1)
  - `page_size`: integer (items per page, default: 20)

#### Response
```json
{
  "items": [
    {
      "id": "uuid-string",
      "title": "Task title",
      "description": "Task description",
      "priority": "low|medium|high",
      "due_date": "2023-12-31T23:59:59Z",
      "is_completed": false,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "has_next": true
}
```

### Create Task
```
POST /api/v1/tasks/
```

#### Request
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "low|medium|high",
  "due_date": "2023-12-31T23:59:59Z"
}
```

#### Response
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "priority": "low|medium|high",
  "due_date": "2023-12-31T23:59:59Z",
  "is_completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get Specific Task
```
GET /api/v1/tasks/{task_id}
```

#### Request
- Headers: `Authorization: Bearer {token}`
- Path Parameter: `task_id` (UUID)

#### Response
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "priority": "low|medium|high",
  "due_date": "2023-12-31T23:59:59Z",
  "is_completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Update Task
```
PUT /api/v1/tasks/{task_id}
```

#### Request
- Headers: `Authorization: Bearer {token}`
- Path Parameter: `task_id` (UUID)
- Body (partial updates allowed):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z",
  "is_completed": true
}
```

#### Response
```json
{
  "id": "uuid-string",
  "title": "Updated title",
  "description": "Updated description",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z",
  "is_completed": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### Toggle Task Completion
```
PATCH /api/v1/tasks/{task_id}/complete
```

#### Request
- Headers: `Authorization: Bearer {token}`
- Path Parameter: `task_id` (UUID)
- No request body

#### Response
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "priority": "low|medium|high",
  "due_date": "2023-12-31T23:59:59Z",
  "is_completed": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### Delete Task
```
DELETE /api/v1/tasks/{task_id}
```

#### Request
- Headers: `Authorization: Bearer {token}`
- Path Parameter: `task_id` (UUID)

#### Response
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
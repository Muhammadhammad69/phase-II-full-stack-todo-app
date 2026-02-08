# Data Model: Frontend-Backend Integration

## Task Entity
- **id**: string (UUID) - Unique identifier for the task
- **title**: string - Task title (required)
- **description**: string (optional) - Detailed description of the task
- **priority**: string (low | medium | high) - Task priority level
- **due_date**: string (ISO Date) (optional) - Deadline for the task
- **is_completed**: boolean - Completion status
- **created_at**: string (ISO Date) - Timestamp when task was created
- **updated_at**: string (ISO Date) - Timestamp when task was last updated

## User Session Entity
- **jwt_token**: string - JWT authentication token
- **expires_at**: string (ISO Date) - Expiration time of the token
- **refresh_token**: string (optional) - Token for refreshing the JWT
- **user_id**: string - Identifier for the authenticated user

## Dashboard Data Entity
- **total_tasks**: number - Total number of tasks
- **completed_tasks**: number - Number of completed tasks
- **pending_tasks**: number - Number of pending tasks
- **overdue_tasks**: number - Number of overdue tasks
- **tasks_by_priority**: object - Count of tasks grouped by priority
- **recent_activity**: array - Recently completed or created tasks

## API Response Structures

### Task Response (Single)
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

### Task List Response (Paginated)
```json
{
  "items": [
    // Array of Task Response objects
  ],
  "total": number,
  "page": number,
  "page_size": number,
  "has_next": boolean
}
```

### API Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

### API Success Response
```json
{
  "success": true,
  "message": "Success description",
  "data": {}
}
```

## Validation Rules
- Task title must be between 1-255 characters
- Task description must be 0-1000 characters
- Priority must be one of: 'low', 'medium', 'high'
- Due date must be in ISO 8601 format if provided
- Task completion status can only be toggled by authenticated users
- Task creation/deletion requires authentication
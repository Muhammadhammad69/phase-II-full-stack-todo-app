# Todo API Contract

## Overview
This document defines the API contract that the frontend will connect to in Phase II. The frontend implementation in Phase I uses mock data that mirrors this contract structure.

## Base URL
```
https://api.todoapp.com/api/v1
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Common Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

For errors:
```json
{
  "success": false,
  "data": null,
  "message": "Error message"
}
```

## Endpoints

### Get User Profile
```
GET /users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "username": "john_doe",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "User profile retrieved successfully"
}
```

### Get Tasks
```
GET /tasks
```

**Query Parameters:**
- status: all, completed, pending (default: all)
- priority: all, high, medium, low (default: all)
- category: string (default: all)
- search: string (default: "")

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid-string",
        "user_email": "user@example.com",
        "title": "Task title",
        "description": "Task description",
        "priority": "high",
        "is_completed": false,
        "due_date": "2023-12-31T23:59:59Z",
        "completed_at": null,
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1
  },
  "message": "Tasks retrieved successfully"
}
```

### Create Task
```
POST /tasks
```

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "high",
  "due_date": "2023-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "user_email": "user@example.com",
    "title": "Task title",
    "description": "Task description",
    "priority": "high",
    "is_completed": false,
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": null,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  },
  "message": "Task created successfully"
}
```

### Update Task
```
PUT /tasks/{task_id}
```

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "priority": "medium",
  "due_date": "2023-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "user_email": "user@example.com",
    "title": "Updated task title",
    "description": "Updated task description",
    "priority": "medium",
    "is_completed": false,
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": null,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z"
  },
  "message": "Task updated successfully"
}
```

### Toggle Task Completion
```
PATCH /tasks/{task_id}/toggle-complete
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "user_email": "user@example.com",
    "title": "Task title",
    "description": "Task description",
    "priority": "high",
    "is_completed": true,
    "due_date": "2023-12-31T23:59:59Z",
    "completed_at": "2023-01-02T10:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T10:00:00Z"
  },
  "message": "Task completion toggled successfully"
}
```

### Delete Task
```
DELETE /tasks/{task_id}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Task deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "data": null,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "data": null,
  "message": "Internal server error"
}
```
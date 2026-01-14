# Quickstart Guide: Todo App Backend API

## Prerequisites

- Python 3.11+
- UV package manager
- PostgreSQL database (or NeonDB account)
- Environment where you can run shell commands

## Setup Instructions

### 1. Clone and Navigate to Backend Directory

```bash
cd /path/to/project/backend/
```

### 2. Install UV Package Manager (if not already installed)

```bash
pip install uv
```

### 3. Initialize the UV Project

```bash
uv init todo-backend
```

### 4. Install Dependencies

```bash
cd backend
uv sync
uv add fastapi uvicorn sqlmodel psycopg[binary] pyjwt python-dotenv pydantic pydantic-settings
```

### 5. Create Environment Configuration

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://user:password@localhost/todo_db
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ENVIRONMENT=development
APP_NAME=Todo Backend API
DEBUG=true
LOG_LEVEL=INFO
```

### 6. Project Structure

After setup, your project structure should look like:

```
backend/
├── pyproject.toml
├── uv.lock
├── .env
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

## Running the Application

### 1. Start the Development Server

```bash
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Access the API

- API Documentation: `http://localhost:8000/docs`
- API Redoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

## API Usage Examples

### 1. Authentication

All endpoints require a valid JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8000/api/v1/tasks
```

### 2. Create a Task

```bash
curl -X POST http://localhost:8000/api/v1/tasks \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Sample Task",
       "description": "This is a sample task",
       "priority": "medium",
       "due_date": "2023-12-31T23:59:59Z"
     }'
```

### 3. Get Tasks

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:8000/api/v1/tasks?completed=all&page=1&page_size=20"
```

### 4. Update a Task

```bash
curl -X PUT http://localhost:8000/api/v1/tasks/TASK_ID \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Updated Task Title",
       "priority": "high"
     }'
```

### 5. Toggle Task Completion

```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/TASK_ID/complete \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Delete a Task

```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/TASK_ID \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing

Run the tests using pytest:

```bash
uv run pytest tests/ -v
```

## Configuration Options

- `ENVIRONMENT`: Set to "development", "staging", or "production"
- `DEBUG`: Enable/disable debug mode (true/false)
- `LOG_LEVEL`: Set logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT signing (change in production!)
- `JWT_ALGORITHM`: Algorithm for JWT signing (default: HS256)

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL server is running
   - Check that credentials are valid

2. **JWT Authentication Issues**
   - Verify JWT_SECRET_KEY is set correctly
   - Ensure tokens are properly formatted with "Bearer " prefix
   - Check that tokens haven't expired

3. **Missing Dependencies**
   - Run `uv sync` to ensure all dependencies are installed
   - Check that pyproject.toml contains all required packages

## Next Steps

1. Implement the API endpoints as defined in the OpenAPI specification
2. Set up proper database migrations
3. Add comprehensive error handling
4. Implement proper logging
5. Add more test coverage
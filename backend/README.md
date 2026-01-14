# Todo Backend API

A FastAPI-based backend for a todo application with PostgreSQL database and JWT authentication.

## Prerequisites

- Python 3.11+
- UV package manager
- PostgreSQL database (or NeonDB account)
- Environment where you can run shell commands

## Installation (UV-based)

1. **Install UV Package Manager** (if not already installed):
   ```bash
   pip install uv
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   uv sync
   ```

3. **Install with Development Dependencies**:
   ```bash
   uv sync --dev
   ```

## Configuration

1. **Create Environment File**:
   Copy the example environment file and update with your settings:
   ```bash
   cp .env.example .env
   ```

2. **Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql+asyncpg://user:password@localhost/dbname`)
   - `JWT_SECRET_KEY`: Secret key for JWT signing (change in production!)
   - `JWT_ALGORITHM`: Algorithm for JWT signing (default: HS256)
   - `ENVIRONMENT`: Set to "development", "staging", or "production"
   - `LOG_LEVEL`: Set logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

## Running the Application

### Development Server
```bash
uv run dev
```
Or alternatively:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API Documentation: `http://localhost:8000/docs`
- API Redoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

### Production Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

The API provides the following endpoints:

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Tasks Endpoints

#### Create a Task
`POST /api/v1/tasks/`
```json
{
  "title": "Sample Task",
  "description": "This is a sample task",
  "priority": "medium",
  "due_date": "2023-12-31T23:59:59Z"
}
```

#### List Tasks
`GET /api/v1/tasks/`
- Query Parameters:
  - `completed`: Filter by completion status (true/false)
  - `priority`: Filter by priority (low/medium/high)
  - `date_from`: Filter by creation date (ISO format)
  - `date_to`: Filter by creation date (ISO format)
  - `page`: Page number (default: 1)
  - `page_size`: Items per page (default: 20)

#### Get a Single Task
`GET /api/v1/tasks/{task_id}`

#### Update a Task
`PUT /api/v1/tasks/{task_id}`
```json
{
  "title": "Updated Task Title",
  "priority": "high"
}
```

#### Toggle Task Completion
`PATCH /api/v1/tasks/{task_id}/complete`

#### Delete a Task
`DELETE /api/v1/tasks/{task_id}`

## Testing

Run the tests using pytest:
```bash
uv run pytest tests/ -v
```

To run tests with coverage:
```bash
uv run pytest tests/ --cov=app --cov-report=html
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── tasks.py          # Task endpoints
│   ├── models/                   # Database models
│   │   ├── user.py
│   │   └── task.py
│   ├── schemas/                  # Pydantic schemas
│   │   └── task.py
│   ├── core/                     # Core utilities
│   │   ├── security.py           # JWT utilities
│   │   ├── dependencies.py       # FastAPI dependencies
│   │   ├── exceptions.py         # Custom exceptions
│   │   └── exception_handlers.py # Exception handlers
│   ├── db/                       # Database related
│   │   ├── database.py           # Database connection
│   │   └── init_db.py            # Database initialization
│   ├── config.py                 # Configuration settings
│   └── main.py                   # Main FastAPI application
├── tests/
│   ├── conftest.py               # Test configuration
│   ├── test_tasks.py             # Task endpoint tests
│   └── test_auth.py              # Authentication tests
├── pyproject.toml                # Project dependencies
├── .env                          # Environment variables (git-ignored)
├── .env.example                  # Environment variables template
└── .gitignore                    # Git ignore rules
```

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

### Development Tips

- Use `uv run dev` for development with auto-reload
- The API documentation is available at `/docs` endpoint
- All database models are defined using SQLModel
- All API requests require JWT authentication
- Use the test suite to verify functionality before deployment

## Environment Configuration

For development, make sure your `.env` file contains appropriate values:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/todo_app
JWT_SECRET_KEY=your-test-secret-key
JWT_ALGORITHM=HS256
ENVIRONMENT=development
LOG_LEVEL=INFO
```

For production, ensure you use a strong secret key and appropriate database configuration.
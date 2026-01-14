# Data Model: Todo App Backend API

## Entity Definitions

### User Entity
**Purpose**: Represents an authenticated user in the system

**Fields**:
- `email`: String (Primary Key) - Unique identifier for the user
- `username`: String - Display name for the user
- `created_at`: DateTime - Timestamp when user was registered
- `updated_at`: DateTime - Timestamp when user record was last updated

**Validation Rules**:
- Email must be a valid email format
- Email must be unique across the system
- Username must not be empty

**Relationships**:
- One-to-many with Task entity (one user can have many tasks)

### Task Entity
**Purpose**: Represents a user's todo item with attributes including title, description, priority, completion status, due date, and timestamps

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for the task
- `user_email`: String (Foreign Key) - Reference to the owning user
- `title`: String - Title of the task (required)
- `description`: String (Optional) - Detailed description of the task
- `priority`: Enum (low, medium, high) - Priority level of the task
- `is_completed`: Boolean - Completion status of the task (default: false)
- `due_date`: DateTime (Optional) - Deadline for the task completion
- `completed_at`: DateTime (Optional) - Timestamp when task was marked complete
- `created_at`: DateTime - Timestamp when task was created
- `updated_at`: DateTime - Timestamp when task was last updated

**Validation Rules**:
- Title must not be empty
- Priority must be one of the allowed values (low, medium, high)
- Due date must be in the future if provided
- Completed_at should only be set when is_completed is true

**State Transitions**:
- `created` → `pending` (default state when created)
- `pending` → `completed` (when marked complete)
- `completed` → `pending` (when marked incomplete)

**Relationships**:
- Many-to-one with User entity (many tasks belong to one user)

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_email ON tasks(user_email);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

## API Schema Definitions

### TaskRequest Schema
Used for creating and updating tasks

- `title`: String (required) - Title of the task
- `description`: String (optional) - Description of the task
- `priority`: String (optional) - Priority level (low, medium, high)
- `due_date`: String (optional) - Due date in ISO format

### TaskResponse Schema
Used for API responses

- `id`: String - UUID of the task
- `user_email`: String - Email of the task owner
- `title`: String - Title of the task
- `description`: String - Description of the task
- `priority`: String - Priority level (low, medium, high)
- `is_completed`: Boolean - Completion status
- `due_date`: String (optional) - Due date in ISO format
- `completed_at`: String (optional) - Completion timestamp in ISO format
- `created_at`: String - Creation timestamp in ISO format
- `updated_at`: String - Last update timestamp in ISO format

### TaskListResponse Schema
Used for listing tasks

- `tasks`: Array<TaskResponse> - List of tasks
- `total_count`: Integer - Total number of tasks matching the query
- `page`: Integer - Current page number
- `page_size`: Integer - Number of tasks per page

## Relationships and Constraints

### Ownership Verification
- Each task is associated with a specific user via the `user_email` foreign key
- The system must verify that the authenticated user owns the task before allowing operations
- Foreign key constraint ensures referential integrity (ON DELETE CASCADE)

### Indexing Strategy
- Index on `user_email` for efficient user-specific queries
- Index on `is_completed` for filtering by completion status
- Index on `priority` for priority-based sorting/filtering
- Index on `due_date` for date-based queries
- Index on `created_at` for chronological ordering

## Data Integrity Measures

### Validation Layers
1. **Application Level**: Pydantic models validate data before database insertion
2. **Database Level**: SQL constraints enforce data integrity at the database level
3. **Business Logic**: Custom validation rules implemented in service layer

### Audit Trail
- `created_at` and `updated_at` timestamps track all changes
- `completed_at` specifically tracks when a task was marked complete
- All timestamps use UTC timezone for consistency
# Quickstart Guide: Frontend-Backend Integration

## Setup Environment

1. **Configure Backend URL**
   ```bash
   # Add to your .env.local file
   BACKEND_BASE_URL=https://your-backend-domain.com
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

## API Service Integration

### 1. Import and Initialize API Service
```typescript
import { ApiService } from '@/components/api/ApiService';

// The service automatically handles JWT tokens from cookies
```

### 2. Make Authenticated API Calls
```typescript
// Example: Fetch tasks
try {
  const response = await ApiService.get('/api/v1/tasks/');
  console.log(response.data);
} catch (error) {
  console.error('Error fetching tasks:', error);
}
```

### 3. Create New Task
```typescript
const newTask = {
  title: 'New task',
  description: 'Task description',
  priority: 'medium',
  due_date: '2023-12-31T23:59:59Z'
};

try {
  const response = await ApiService.post('/api/v1/tasks/', newTask);
  console.log('Task created:', response.data);
} catch (error) {
  console.error('Error creating task:', error);
}
```

## Page Integration Examples

### Todos Page Integration
Update your `/src/app/todos/page.tsx`:

```typescript
'use client';

import { useApi } from '@/hooks/useApi';
import { TaskService } from '@/components/api/TaskService';

export default function TodosPage() {
  const { data: tasks, loading, error, refetch } = useApi(
    () => TaskService.getAllTasks()
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Render your tasks */}
    </div>
  );
}
```

### Dashboard Page Integration
Update your `/src/app/dashboard/page.tsx`:

```typescript
'use client';

import { useApi } from '@/hooks/useApi';
import { TaskService } from '@/components/api/TaskService';

export default function DashboardPage() {
  const { data: dashboardData, loading, error } = useApi(
    () => TaskService.getDashboardStats()
  );

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Render dashboard statistics */}
    </div>
  );
}
```

## Authentication Handling

### Profile Page Validation
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Checking authentication...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      {/* Render profile content */}
    </div>
  );
}
```

## Error Handling

The API service includes automatic error handling:

- 401 errors trigger automatic logout and redirect to login
- Network errors show user-friendly messages with retry options
- Validation errors return descriptive messages

## Running Tests

```bash
# Run unit tests for API services
npm run test:unit api

# Run integration tests for pages
npm run test:integration pages
```
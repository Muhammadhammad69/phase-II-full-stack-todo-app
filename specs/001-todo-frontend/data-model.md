# Data Model: Todo App Frontend

## TypeScript Interfaces

### User Interface
```typescript
interface User {
  email: string;      // Primary key (matches backend)
  username: string;   // Display name
  createdAt: Date;    // Account creation time
  updatedAt: Date;    // Last update time
}
```

### Task Interface
```typescript
interface Task {
  id: string;                 // UUID (matches backend)
  userEmail: string;          // Foreign key to User.email (matches backend)
  title: string;              // Required task title
  description?: string;       // Optional task description
  priority: 'low' | 'medium' | 'high';  // Priority level (matches backend)
  isCompleted: boolean;       // Completion status (matches backend)
  dueDate?: Date | null;      // Optional due date (matches backend)
  completedAt?: Date | null;  // Completion timestamp (matches backend)
  createdAt: Date;            // Creation timestamp (matches backend)
  updatedAt: Date;            // Last update timestamp (matches backend)
}
```

### Category Interface
```typescript
interface Category {
  name: string;               // Category name (e.g., Work, Personal)
  color?: string;             // Optional color for visual indication
  style?: string;             // Optional styling class
}
```

### Priority Enum
```typescript
type Priority = 'low' | 'medium' | 'high';

const PriorityColors = {
  low: '#00ff00',     // Green for low priority
  medium: '#ffff00',  // Yellow for medium priority
  high: '#ff0000'     // Red for high priority
} as const;
```

## Mock Data Structures

### Mock User Data
```typescript
const mockUser: User = {
  email: 'user@example.com',
  username: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Mock Task Data
```typescript
const mockTasks: Task[] = [
  {
    id: 'uuid-1',
    userEmail: 'user@example.com',
    title: 'Complete project proposal',
    description: 'Finish the project proposal document for client review',
    priority: 'high',
    isCompleted: false,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'uuid-2',
    userEmail: 'user@example.com',
    title: 'Buy groceries',
    priority: 'medium',
    isCompleted: true,
    dueDate: null,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Completed yesterday
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];
```

## State Management Types

### Task Filter Options
```typescript
interface TaskFilters {
  status?: 'all' | 'completed' | 'pending';
  priority?: 'all' | 'low' | 'medium' | 'high';
  category?: string;
  searchQuery?: string;
}
```

### Sorting Options
```typescript
type SortOption = 'priority' | 'alphabetical' | 'creationDate' | 'dueDate';
type SortDirection = 'asc' | 'desc';
```

## Validation Rules

### Task Validation
- Title is required and must be 1-100 characters
- Description is optional and limited to 500 characters
- Priority must be one of 'low', 'medium', or 'high'
- Due date must be a valid date if provided
- Creation and update timestamps are automatically managed

### User Validation
- Email must be a valid email format
- Username is required and must be 1-50 characters
- Timestamps are automatically managed
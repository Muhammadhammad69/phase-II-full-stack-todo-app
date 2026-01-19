// types/index.ts

export interface User {
  email: string;      // Primary key (matches backend)
  username: string;   // Display name
  createdAt: Date;    // Account creation time
  updatedAt: Date;    // Last update time
}

export interface Task {
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

export interface Category {
  name: string;               // Category name (e.g., Work, Personal)
  color?: string;             // Optional color for visual indication
  style?: string;             // Optional styling class
}

export type Priority = 'low' | 'medium' | 'high';

export interface TaskFilters {
  status?: 'all' | 'completed' | 'pending';
  priority?: 'all' | 'low' | 'medium' | 'high';
  category?: string;
  searchQuery?: string;
}

export type SortOption = 'priority' | 'alphabetical' | 'creationDate' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

// Validation rules
export const VALIDATION_RULES = {
  TASK: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    VALID_PRIORITIES: ['low', 'medium', 'high'] as const,
  },
  USER: {
    USERNAME_MIN_LENGTH: 1,
    USERNAME_MAX_LENGTH: 50,
  },
} as const;

// Priority colors mapping
export const PRIORITY_COLORS = {
  low: '#00ff00',     // Green for low priority
  medium: '#ffff00',  // Yellow for medium priority
  high: '#ff0000'     // Red for high priority
} as const;
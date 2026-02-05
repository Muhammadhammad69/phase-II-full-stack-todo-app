// types/todo/task.ts

import { Priority } from '../common/types';

export interface Task {
  id: string;                 // UUID (matches backend)
  userEmail: string;          // Foreign key to User.email (matches backend)
  title: string;              // Required task title
  description?: string;       // Optional task description
  priority: Priority;         // Priority level (matches backend)
  isCompleted: boolean;       // Completion status (matches backend)
  dueDate?: Date | null;      // Optional due date (matches backend)
  completedAt?: Date | null;  // Completion timestamp (matches backend)
  createdAt: Date;            // Creation timestamp (matches backend)
  updatedAt: Date;            // Last update timestamp (matches backend)
}
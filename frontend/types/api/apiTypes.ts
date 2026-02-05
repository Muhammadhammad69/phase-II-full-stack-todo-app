// frontend/src/lib/types/apiTypes.ts


import { Priority } from '@/types/common/types';

// Generic API response structures
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  detail?: string | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Task-related API responses
export interface TaskApiResponse {
  id: string;
  user_email: string;
  title: string;
  description?: string;
  priority: Priority;
  due_date?: string | null; // ISO date string
  is_completed: boolean;
  completed_at?: string | null; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface PaginatedTaskResponse {
  tasks: TaskApiResponse[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

// Dashboard API response
// export interface DashboardStatsResponse {
//   total_tasks: number;
//   completed_tasks: number;
//   pending_tasks: number;
//   overdue_tasks: number;
//   tasks_by_priority: {
//     low: number;
//     medium: number;
//     high: number;
//   };
//   recent_activity: TaskApiResponse[];
// }

// Task creation/update request
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
  due_date?: string; // ISO date string
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  due_date?: string; // ISO date string
  is_completed?: boolean;
}

// Filter parameters for task queries
export interface TaskFilterParams {
  completed?: boolean;
  priority?: Priority;
  date_from?: string; // ISO date string
  date_to?: string; // ISO date string
  page?: number;
  page_size?: number;
}

// Error response types
export interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationError[];
}
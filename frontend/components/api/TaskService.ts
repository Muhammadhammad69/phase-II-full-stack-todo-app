// frontend/src/components/api/TaskService.ts

import { apiService } from './ApiService';
import {
  TaskApiResponse,
  PaginatedTaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilterParams
} from '../../types/api/apiTypes';
import { Task } from '@/types';

import { API_ENDPOINTS } from '../../lib/constants/apiConstants';

export class TaskService {
  /**
   * Get all tasks with optional filtering and pagination
   */
  async getAllTasks(params: TaskFilterParams = {}): Promise<PaginatedTaskResponse> {
    // Build query string from params
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.TASKS.BASE}?${queryString}` : API_ENDPOINTS.TASKS.BASE;

    return await apiService.get<PaginatedTaskResponse>(endpoint);
  }

  /**
   * Get a specific task by ID
   */
  async getTaskById(id: string): Promise<TaskApiResponse> {
    return await apiService.get<TaskApiResponse>(API_ENDPOINTS.TASKS.SINGLE(id));
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskRequest): Promise<TaskApiResponse> {
    return await apiService.post<CreateTaskRequest, TaskApiResponse>(
      API_ENDPOINTS.TASKS.BASE,
      taskData
    );
  }

  /**
   * Update a task
   */
  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<TaskApiResponse> {
    return await apiService.put<UpdateTaskRequest, TaskApiResponse>(
      API_ENDPOINTS.TASKS.SINGLE(id),
      taskData
    );
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string): Promise<TaskApiResponse> {
    // // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    return await apiService.patch<{}, TaskApiResponse>(
      API_ENDPOINTS.TASKS.COMPLETE(id),
      {}
    );
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
    return await apiService.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.TASKS.SINGLE(id)
    );
  }

  /**
   * Transform API response to internal Task format
   */
  transformApiToInternalTask(apiTask: TaskApiResponse): Task {
    return {
      id: apiTask.id,
      userEmail: '', // This might come from the user context instead
      title: apiTask.title,
      description: apiTask.description,
      priority: apiTask.priority,
      isCompleted: apiTask.is_completed,
      dueDate: apiTask.due_date ? new Date(apiTask.due_date) : null,
      completedAt: null, // API doesn't seem to have this field directly
      createdAt: new Date(apiTask.created_at),
      updatedAt: new Date(apiTask.updated_at),
    };
  }

  /**
   * Transform internal Task format to API request format
   */
  transformInternalToApiTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): CreateTaskRequest {
    return {
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.dueDate ? task.dueDate.toISOString() : undefined,
    };
  }

  /**
   * Transform internal Task format to API update request format
   */
  transformInternalToUpdateApiTask(task: Task): UpdateTaskRequest {
    return {
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.dueDate ? task.dueDate.toISOString() : undefined,
      is_completed: task.isCompleted,
    };
  }
}

export const taskService = new TaskService();
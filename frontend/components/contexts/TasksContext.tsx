"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Task } from "@/types/todo/task";
import { TaskFilters } from "@/types/todo/filters";
import { SortOption, SortDirection, Priority } from "@/types/common/types";
import { useAuth } from "@/components/contexts/AuthContext";
import {
  tasksReducer,
  TasksState,
  initialState
  
} from "@/components/reducers/tasksReducer";

// Import the TaskService
import { taskService } from "@/components/api/TaskService";

// Context
interface TasksContextType extends TasksState {
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userEmail">,
  ) => Promise<boolean | undefined>;
  updateTask: (task: Task) => Promise<Task | undefined>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSort: (option: SortOption, direction: SortDirection) => void;
  setTasks: (tasks: Task[]) => void;
  setError: (error: string | null) => void;
  loadTasks: (
    completed?: boolean,
    priority?: Priority,
    page?: number,
    pageSize?: number,
  ) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Provider component
interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(tasksReducer, initialState);

  // Load tasks when user logs in
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      // Clear tasks when user logs out
      dispatch({ type: "SET_TASKS", payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  useEffect(() => {
    
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  const loadTasks = async (
    completed?: boolean,
    priority?: Priority,
    page: number = 1,
    pageSize: number = 1000,
  ) => {
    if (!user) return;
    setError(null);
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await taskService.getAllTasks({
        completed,
        priority,
        page,
        page_size: pageSize,
      });
      // Transform API response to internal Task format
      const tasks = response.tasks.map((apiTask) => ({
        id: apiTask.id,
        userEmail: apiTask.user_email,
        title: apiTask.title,
        description: apiTask.description,
        priority: apiTask.priority,
        isCompleted: apiTask.is_completed,
        dueDate: apiTask.due_date ? new Date(apiTask.due_date) : null,
        completedAt: apiTask.completed_at
          ? new Date(apiTask.completed_at)
          : null,
        createdAt: new Date(apiTask.created_at),
        updatedAt: new Date(apiTask.updated_at),
      }));
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (error) {
      console.error("Failed to load tasks:", error);
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userEmail">,
  ) => {
    if (!user) return;
    setError(null);
    let flag = false;
    try {
      // Don't set global loading state for individual operations
      // Prepare task data for API
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate ? taskData.dueDate.toISOString() : undefined,
      };

      const response = await taskService.createTask(apiTaskData);

      // Transform API response to internal Task format
      const newTask: Task = {
        id: response.id,
        userEmail: response.user_email,
        title: response.title,
        description: response.description,
        priority: response.priority,
        isCompleted: response.is_completed,
        dueDate: response.due_date ? new Date(response.due_date) : null,
        completedAt: response.completed_at
          ? new Date(response.completed_at)
          : null,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
     
      flag = true;
      dispatch({ type: "ADD_TASK", payload: newTask });
      dispatch({ type: "SET_Add_Product", payload: "true" });
    } catch (error) {
      flag = false;
      console.error("Failed to add task:", (  error as Error).message);

      dispatch({ type: "SET_Add_Product", payload: "false" });
    }
    return flag;
  };

  const updateTask = async (task: Task) => {
    setError(null);
    let responseData: Task | undefined = undefined;
    try {
      // Don't set global loading state for individual operations
      // Prepare task data for API
      const apiTaskData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate ? task.dueDate.toISOString() : undefined,
        is_completed: task.isCompleted,
      };

      const response = await taskService.updateTask(task.id, apiTaskData);

      // Transform API response to internal Task format
      const updatedTask: Task = {
        id: response.id,
        userEmail: response.user_email,
        title: response.title,
        description: response.description,
        priority: response.priority,
        isCompleted: response.is_completed,
        dueDate: response.due_date ? new Date(response.due_date) : null,
        completedAt: response.completed_at
          ? new Date(response.completed_at)
          : null,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
      responseData = updatedTask;
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
    } catch (error) {
      responseData = undefined;
      console.error("Failed to update task:", error);
      
    }
    return  responseData;
  };

  const deleteTask = async (id: string) => {
    setError(null);
    try {
      // Don't set global loading state for individual operations
      await taskService.deleteTask(id);
      dispatch({ type: "DELETE_TASK", payload: id });
    } catch (error) {
      console.error("Failed to delete task:", error);
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    setError(null);
    try {
      // Don't set global loading state for individual operations
      await taskService.toggleTaskCompletion(id);

      // Update local state immediately for better UX
      dispatch({ type: "TOGGLE_TASK_COMPLETION", payload: id });
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    }
  };

  const setFilters = (filters: Partial<TaskFilters>) => {
    setError(null);
    dispatch({ type: "SET_FILTERS", payload: filters });
  };

  const setSort = (option: SortOption, direction: SortDirection) => {
    setError(null);
    dispatch({ type: "SET_SORT", payload: { option, direction } });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const setTasks = (tasks: Task[]) => {
    setError(null);
    dispatch({ type: "SET_TASKS", payload: tasks });
  };

  const value = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    setFilters,
    setSort,
    setTasks,
    setError,
    loadTasks,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

// Hook to use the context
export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};

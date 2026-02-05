// frontend/components/reducers/tasksReducer.ts

import { Task } from '@/types/todo/task';
import { TaskFilters } from '@/types/todo/filters';
import { SortOption, SortDirection } from '@/types/common/types';

// Action types
export type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'SET_SORT'; payload: { option: SortOption; direction: SortDirection } }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_Add_Product'; payload: "true" | "false" | null }
  | { type: 'SET_LOADING'; payload: boolean };

// State interface
export interface TasksState {
  tasks: Task[];
  filters: TaskFilters;
  sort: {
    option: SortOption;
    direction: SortDirection;
  };
  error: string | null;
  loading: boolean;
  isProductAdded: "true" | "false" | null;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  importantTasks: number;
}

// Initial state
export const initialState: TasksState = {
  tasks: [],
  filters: {
    status: 'all',
    priority: 'all',
    category: 'all',
    searchQuery: '',
  },
  sort: {
    option: 'creationDate',
    direction: 'desc',
  },
  error: null,
  loading: false,
  isProductAdded:null,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  importantTasks: 0,
};

// Helper function to calculate task statistics
const calculateTaskStats = (tasks: Task[]): {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  importantTasks: number
} => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const pendingTasks = tasks.filter(task => !task.isCompleted).length;
  const importantTasks = tasks.filter(task => task.priority === 'high').length;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    importantTasks
  };
};

// Reducer function
export const tasksReducer = (state: TasksState, action: TaskAction): TasksState => {
  switch (action.type) {
    case 'ADD_TASK':
      const newTasksWithAdded = [...state.tasks, action.payload];
      const statsAfterAdd = calculateTaskStats(newTasksWithAdded);
      return {
        ...state,
        tasks: newTasksWithAdded,
        ...statsAfterAdd
      };

    case 'UPDATE_TASK':
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id ? action.payload : task
      );
      const statsAfterUpdate = calculateTaskStats(updatedTasks);
      return {
        ...state,
        tasks: updatedTasks,
        ...statsAfterUpdate
      };

    case 'DELETE_TASK':
      const filteredTasks = state.tasks.filter(task => task.id !== action.payload);
      const statsAfterDelete = calculateTaskStats(filteredTasks);
      return {
        ...state,
        tasks: filteredTasks,
        ...statsAfterDelete
      };

    case 'TOGGLE_TASK_COMPLETION':
      const toggledTasks = state.tasks.map(task =>
        task.id === action.payload
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completedAt: task.isCompleted ? null : new Date(),
              updatedAt: new Date(),
            }
          : task
      );
      const statsAfterToggle = calculateTaskStats(toggledTasks);
      return {
        ...state,
        tasks: toggledTasks,
        ...statsAfterToggle
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SORT':
      return {
        ...state,
        sort: { ...state.sort, ...action.payload },
      };

    case 'SET_TASKS':
      const statsAfterSet = calculateTaskStats(action.payload);
      return {
        ...state,
        tasks: action.payload,
        ...statsAfterSet
      };

    case 'SET_ERROR':
     
      return {
        ...state,
        error: action.payload,
      };
    
    case "SET_Add_Product":
      return {
        ...state,
        isProductAdded: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};
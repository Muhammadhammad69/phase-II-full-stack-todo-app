import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Task, TaskFilters, SortOption, SortDirection } from '@/types';
import { useAuth } from '@/components/auth/AuthContext';

// Action types
type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'SET_SORT'; payload: { option: SortOption; direction: SortDirection } }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_ERROR'; payload: string | null };

// State interface
interface TasksState {
  tasks: Task[];
  filters: TaskFilters;
  sort: {
    option: SortOption;
    direction: SortDirection;
  };
  error: string | null;
}

// Initial state
const initialState: TasksState = {
  tasks: [], // Start with empty tasks - they'll be populated per user as needed
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
};

// Reducer function
const tasksReducer = (state: TasksState, action: TaskAction): TasksState => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'TOGGLE_TASK_COMPLETION':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? {
                ...task,
                isCompleted: !task.isCompleted,
                completedAt: task.isCompleted ? null : new Date(),
                updatedAt: new Date(),
              }
            : task
        ),
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
      return {
        ...state,
        tasks: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

// Context
interface TasksContextType extends TasksState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSort: (option: SortOption, direction: SortDirection) => void;
  setError: (error: string | null) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Provider component
interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(tasksReducer, initialState);

  // Reset tasks when user changes
  useEffect(() => {
    if (user) {
      // Initialize with mock tasks for the current user
      const mockUserTasks: Task[] = [];
      if(user.email === 'hammad@gmail.com') {
        // Add some mock tasks for the default user
        mockUserTasks.push(
          {
            id: '1',
            userEmail: user.email,
            title: 'Welcome to Tech Innovation Todo',
            description: 'This is a sample task to get you started',
            priority: 'medium',
            isCompleted: false,
            dueDate: null,
            completedAt: null,
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000),
          },
          {
            id: '2',
            userEmail: user.email,
            title: 'Complete project proposal',
            description: 'Finish the proposal document for the client meeting',
            priority: 'high',
            isCompleted: false,
            dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
            completedAt: null,
            createdAt: new Date(Date.now() - 43200000), // 12 hours ago
            updatedAt: new Date(Date.now() - 43200000),
          }
        );
      }
      dispatch({ type: 'SET_TASKS', payload: mockUserTasks });
    } else {
      // Clear tasks when user logs out
      dispatch({ type: 'SET_TASKS', payload: [] });
    }
  }, [user]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (task: Task) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, updatedAt: new Date() },
    });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleTaskCompletion = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: id });
  };

  const setFilters = (filters: Partial<TaskFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSort = (option: SortOption, direction: SortDirection) => {
    dispatch({ type: 'SET_SORT', payload: { option, direction } });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    setFilters,
    setSort,
    setError,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

// Hook to use the context
export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
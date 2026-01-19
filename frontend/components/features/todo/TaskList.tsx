import React from 'react';
import { useTasks } from './TasksContext';
import TaskItem from './TaskItem';
import { Card } from '@/components/ui/card';
import { Task } from '@/types';
import { useAuth } from '@/components/auth/AuthContext';
import styles from './TaskList.module.css';

interface TaskListProps {
  limit?: number; // Optional prop to limit number of tasks displayed
}

const TaskList: React.FC<TaskListProps> = ({ limit }) => {
  const { tasks, filters, sort } = useTasks();
  const { user } = useAuth();

  // Filter tasks for current user first, then apply other filters
  const userTasks = tasks.filter(task => task.userEmail === user?.email);

  // Filter tasks based on current filters
  const filteredTasks = userTasks.filter(task => {
    // Filter by status
    if (filters.status === 'completed' && !task.isCompleted) {
      return false;
    }
    if (filters.status === 'pending' && task.isCompleted) {
      return false;
    }

    // Filter by priority
    if (filters.priority !== 'all' && filters.priority !== task.priority) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    return true;
  });

  // Sort tasks based on current sort settings
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;

    switch (sort.option) {
      case 'priority':
        const priorityOrder: Record<'high' | 'medium' | 'low', number> = {
          high: 3,
          medium: 2,
          low: 1,
        };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'alphabetical':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'creationDate':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  });

  // Apply limit if specified
  const displayedTasks = limit ? sortedTasks.slice(0, limit) : sortedTasks;

  return (
    <div className={styles.taskList}>
      {displayedTasks.length === 0 ? (
        <Card className={styles.emptyState}>
          <p>No tasks found. Create a new task to get started!</p>
        </Card>
      ) : (
        <div className={styles.tasksGrid}>
          {displayedTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
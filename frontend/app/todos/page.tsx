'use client';

import React, { useState, useEffect } from 'react';
import { TasksProvider, useTasks } from '@/components/features/todo/TasksContext';
import TaskItem from '@/components/features/todo/TaskItem';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Clock, TrendingUp, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useTheme } from '@/theme/ThemeProvider';
import styles from './todos.module.css';

// Component that uses the tasks context
const TodosContent = () => {
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const theme = useTheme();

  // Calculate stats
  const completedCount = tasks.filter(task => task.isCompleted).length;
  const pendingCount = tasks.filter(task => !task.isCompleted).length;
  const importantCount = tasks.filter(task => task.priority === 'high').length;

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'completed') return matchesSearch && task.isCompleted;
      if (filter === 'pending') return matchesSearch && !task.isCompleted;
      if (filter === 'important') return matchesSearch && task.priority === 'high';
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Default sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className={styles.todosContainer}>
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Star className={styles.starIcon} size={48} />
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.todosTitle}>Task Management Hub</h1>
            <p className={styles.todosSubtitle}>Streamline your workflow with intelligent task organization</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <CheckCircle size={24} className={styles.completedIcon} />
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{completedCount}</h3>
                <p className={styles.statLabel}>Completed</p>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <AlertTriangle size={24} className={styles.pendingIcon} />
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{pendingCount}</h3>
                <p className={styles.statLabel}>Pending</p>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <Star size={24} className={styles.importantIcon} />
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{importantCount}</h3>
                <p className={styles.statLabel}>Important</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <Card className={styles.filtersCard}>
        <div className="p-8">
          <div className={styles.filtersHeader}>
            <div className={styles.filtersTitleSection}>
              <Filter size={20} className={styles.filterIcon} />
              <h2 className={styles.filtersTitle}>Filter & Sort Tasks</h2>
            </div>

            <div className={styles.actionButtons}>
              <Button variant="outline" className={styles.actionButton}>
                Export
              </Button>
              <Button variant="outline" className={styles.actionButton}>
                Bulk Actions
              </Button>
            </div>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <Input
                type="text"
                placeholder="Search tasks by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="filter" className={styles.filterLabel}>
                Status Filter
              </label>
              <div className={styles.selectWrapper}>
                <Select value={filter} onValueChange={(value) => setFilter(value)}>
                  <SelectTrigger id="filter" className={styles.filterSelect}>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="sortBy" className={styles.filterLabel}>
                Sort By
              </label>
              <div className={styles.selectWrapper}>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger id="sortBy" className={styles.filterSelect}>
                    <SelectValue placeholder="Select sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Newest First</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="default" className={styles.refreshButton}>
              <Clock size={16} className={styles.buttonIcon} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Task Statistics */}
      <div className={styles.tasksStats}>
        <div className={styles.statsHeader}>
          <p className={styles.statsText}>
            Showing <span className={styles.highlight}>{filteredTasks.length}</span> of{' '}
            <span className={styles.highlight}>{tasks.length}</span> tasks
          </p>
          <Badge variant={filter === 'completed' ? 'success' : filter === 'pending' ? 'default' : filter === 'important' ? 'destructive' : 'secondary'}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)} Filter
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          ></div>
        </div>
        <div className={styles.progressLabels}>
          <span className={styles.progressLabel}>Progress: {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%</span>
          <span className={styles.progressLabel}>Completion Rate</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className={styles.tasksList}>
        {filteredTasks.length > 0 ? (
          <>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>Task Overview</h3>
              <div className={styles.listActions}>
                <Button variant="ghost" size="sm" className={styles.listAction}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" className={styles.listAction}>
                  Clear Selection
                </Button>
              </div>
            </div>

            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`${styles.taskItemWrapper} ${index % 2 === 0 ? styles.evenItem : styles.oddItem}`}
              >
                <TaskItem key={task.id} task={task} />
              </div>
            ))}
          </>
        ) : (
          <Card className={styles.emptyState}>
            <div className="p-12 text-center">
              <div className={styles.emptyStateIcon}>
                <Star size={48} className={styles.emptyStateStarIcon} />
              </div>
              <h3 className={styles.emptyStateTitle}>
                {searchTerm || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
              </h3>
              <p className={styles.emptyStateDescription}>
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria to see more tasks.'
                  : 'Get started by creating your first task to begin organizing your workflow.'}
              </p>
              <Button variant="default" className={styles.emptyStateButton}>
                Create New Task
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default function AllTodosPage() {
  return (
    <TasksProvider>
      <TodosContent />
    </TasksProvider>
  );
}
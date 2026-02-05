"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTasks } from "@/components/contexts/TasksContext";
import TaskItem from "@/components/features/todo/TaskItem";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  Clock,

  CheckCircle,
  AlertTriangle,
  Star,
} from "lucide-react";


import styles from "./todos.module.css";
import { Priority } from "@/types/common/types";
import Link from "next/dist/client/link";

// Component that uses the tasks context
const TodosContent = () => {
  

  const {
    tasks,
    
    
    
    
    totalTasks,
    completedTasks,
    pendingTasks,
    importantTasks,
    loading: isLoading,
    error: apiError,
    loadTasks,
  } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Fixed page size of 10 tasks
  // const theme = useTheme();
  

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Track whether we've completed the initial setup
  const initialSetupDone = useRef(false);
  const prevFilter = useRef(filter);

  useEffect(() => {
    const fetchTasks = async () => {
      let completedFilter;
      let priorityFilter: Priority | undefined;

      if (filter === "completed") {
        completedFilter = true;
      } else if (filter === "pending") {
        completedFilter = false;
      } else if (filter === "important") {
        priorityFilter = "high";
      }

      await loadTasks(completedFilter, priorityFilter, 1, 1000);
    };

    // Check if this is the initial render or an actual filter change
    if (!initialSetupDone.current) {
      // This is the initial render - mark setup as done but don't fetch
      initialSetupDone.current = true;
    } else if (prevFilter.current !== filter) {
      // This is an actual filter change by user - fetch tasks
      fetchTasks();
    }

    // Update the previous filter value
    prevFilter.current = filter;
  }, [filter, loadTasks]); // Include loadTasks but this should be stable from context

  // Function to render pagination items with ellipsis for large page ranges
  const renderPaginationItems = () => {
    const totalPages = Math.ceil(totalTasks / pageSize);
    const maxVisiblePages = 3; // Maximum number of page links to show

    // Calculate the range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
            isActive={1 === currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
     

      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(totalPages);
            }}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  // Use stats from the context (these are calculated automatically by the reducer)
  const completedCount = completedTasks;
  const pendingCount = pendingTasks;
  const importantCount = importantTasks;
  const totalCount = totalTasks;

  // Use all tasks from the context for display (since we fetched all tasks to ensure accurate stats)
  let processedTasks = [...tasks]; // Copy to avoid mutating state directly

  // Apply search filtering
  if (searchTerm) {
    processedTasks = processedTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  // Apply filter based on the filter state (completed/pending/important)
  processedTasks = processedTasks.filter((task) => {
    if (filter === "completed") return task.isCompleted;
    if (filter === "pending") return !task.isCompleted;
    if (filter === "important") return task.priority === "high";
    return true; // 'all' filter
  });

  // Apply sorting
  processedTasks = processedTasks.sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    // Default sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Apply pagination to the processed tasks
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const filteredTasks = processedTasks.slice(startIndex, endIndex);

  // Show loading state with skeletons
  if (isLoading) {
    return (
      <div className={styles.todosContainer}>
        {/* Hero Header Skeleton */}
        <div className={styles.heroHeader}>
          <div className={styles.headerContent}>
            <div>
              <Skeleton className="size-20 " />
            </div>
            <div className={styles.headerText}>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className={styles.statsGrid}>
            {[...Array(3)].map((_, index) => (
              <Card key={index} className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statIcon}>
                    <Skeleton className="size-6 rounded" />
                  </div>
                  <div className={styles.statInfo}>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Filters Section Skeleton */}
        <Card className={styles.filtersCard}>
          <div className="p-8">
            <div className={styles.filtersHeader}>
              <div className={styles.filtersTitleSection}>
                <Skeleton className="size-5 rounded-sm mr-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className={styles.actionButtons}>
                <Skeleton className="h-9 w-20 mr-2" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            <div className={styles.filtersRow}>
              <div className={styles.searchContainer}>
                <Skeleton className="size-4.5 rounded-sm mr-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className={styles.filterGroup}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-40" />
              </div>

              <div className={styles.filterGroup}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-40" />
              </div>

              <Skeleton className="h-10 w-24 self-end" />
            </div>
          </div>
        </Card>

        {/* Task Statistics Skeleton */}
        <div className={styles.tasksStats}>
          <div className={styles.statsHeader}>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-2 w-full mb-2" />
          <div className={styles.progressLabels}>
            <Skeleton className="h-4 w-32 mr-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Tasks List Skeleton */}
        <div className={styles.tasksList}>
          <div className={styles.listHeader}>
            <Skeleton className="h-6 w-32" />
            <div className={styles.listActions}>
              <Skeleton className="h-8 w-16 mr-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>

          {/* Task Items Skeleton */}
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`${styles.taskItemWrapper} ${index % 2 === 0 ? styles.evenItem : styles.oddItem}`}
            >
              <Card className="mb-3">
                <div className="p-4 flex items-start space-x-4">
                  <Skeleton className="size-5 rounded mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </Card>
            </div>
          ))}

          {/* Pagination Skeleton */}
          <div className={styles.paginationContainer}>
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className={styles.todosContainer}>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Error Loading Tasks
          </h2>
          <p className="text-gray-600 mt-2">{apiError}</p>
          <Button
            className="mt-4"
            onClick={async () => {
              let completedFilter;
              let priorityFilter: Priority | undefined;

              if (filter === "completed") {
                completedFilter = true;
              } else if (filter === "pending") {
                completedFilter = false;
              } else if (filter === "important") {
                priorityFilter = "high";
              }

              await loadTasks(completedFilter, priorityFilter, 1, 1000);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
            <p className={styles.todosSubtitle}>
              Streamline your workflow with intelligent task organization
            </p>
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
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value)}
                >
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
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
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

            <Button
              variant="default"
              className={styles.refreshButton}
              onClick={async () => {
                let completedFilter;
                let priorityFilter: Priority | undefined;

                if (filter === "completed") {
                  completedFilter = true;
                } else if (filter === "pending") {
                  completedFilter = false;
                } else if (filter === "important") {
                  priorityFilter = "high";
                }

                await loadTasks(completedFilter, priorityFilter, 1, 1000);
              }}
            >
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
            Showing{" "}
            <span className={styles.highlight}>{filteredTasks.length}</span> of{" "}
            <span className={styles.highlight}>{totalCount}</span> tasks
          </p>
          <Badge
            variant={
              filter === "completed"
                ? "default"
                : filter === "pending"
                  ? "secondary"
                  : filter === "important"
                    ? "destructive"
                    : "outline"
            }
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)} Filter
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%`,
            }}
          ></div>
        </div>
        <div className={styles.progressLabels}>
          <span className={styles.progressLabel}>
            Progress:{" "}
            {totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0}
            %
          </span>
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

            {/* Task Statistics */}
            {/* <div className={styles.tasksStats}>
              <div className={styles.statsHeader}>
                <p className={styles.statsText}>
                  Showing <span className={styles.highlight}>{filteredTasks.length}</span> of{' '}
                  <span className={styles.highlight}>{totalCount}</span> tasks
                  {searchTerm && <span> matching "{searchTerm}"</span>}
                </p>
                <span className={styles.statsText}>
                  {filteredTasks.filter(t => t.isCompleted).length} completed
                </span>
              </div>
            </div> */}
          </>
        ) : (
          <Card className={styles.emptyState}>
            <div className="p-12 text-center">
              <div className={styles.emptyStateIcon}>
                <Star size={48} className={styles.emptyStateStarIcon} />
              </div>
              <h3 className={styles.emptyStateTitle}>
                {searchTerm || filter !== "all"
                  ? "No tasks match your filters"
                  : "No tasks yet"}
              </h3>
              <p className={styles.emptyStateDescription}>
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria to see more tasks."
                  : "Get started by creating your first task to begin organizing your workflow."}
              </p>
              <Link href={"/dashboard#add-task"}>
                <Button variant="default" className={styles.emptyStateButton}>
                  Create New Task
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Pagination Controls */}
        {!searchTerm && totalTasks > pageSize && (
          <div className={styles.paginationContainer}>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Render page numbers */}
                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const totalPages = Math.ceil(totalTasks / pageSize);
                      if (currentPage < totalPages) {
                        setCurrentPage((prev) => prev + 1);
                      }
                    }}
                    className={
                      Math.ceil(totalTasks / pageSize) <= currentPage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className={styles.paginationSummary}>
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalTasks)} of {totalTasks}{" "}
              tasks
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AllTodosPage() {
  return <TodosContent />;
}

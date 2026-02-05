'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTasks } from '@/components/contexts/TasksContext';
import TaskForm from '@/components/features/todo/TaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/components/contexts/AuthContext';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { user } = useAuth();
  const { tasks, totalTasks, completedTasks, pendingTasks, importantTasks, loading: isLoading, error: apiError } = useTasks();
  // const theme = useTheme();

  useEffect(() => {
    // Get user email from localStorage
    
    setUserEmail(user?.name || null);
  }, [user]);

  // Calculate overdue tasks based on due dates
  // const overdueTasks = 0; // This would need to be calculated from the tasks list if needed
  
  // Show loading state with skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[--color-background] to-[--color-surface] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header Skeleton */}
          <div className="text-center mb-10 md:mb-12 relative overflow-hidden">
            <div className="relative z-10 p-1">
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-80 mx-auto" />
            </div>
          </div>

          {/* Stats Section Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-linear-to-br from-[--color-primary]/15 to-[--color-secondary]/15 shadow-xl border border-[--color-primary]/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-primary] to-[--color-secondary]"></div>
                <CardContent className="p-6 pt-8 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-20 mb-4" />
                      <Skeleton className="h-10 w-16" />
                    </div>
                    <Skeleton className="size-12 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="space-y-10">
            <div className="flex items-center justify-between mb-8">
              <Skeleton className="h-8 w-56" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Add Task Card Skeleton */}
              <Card className="bg-linear-to-br from-[--color-primary]/10 to-[--color-secondary]/10 shadow-xl border border-[--color-primary]/30 h-full transition-all duration-500 hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-primary] to-[--color-secondary]"></div>
                <CardHeader className="pb-6 relative z-10">
                  <CardTitle className="text-xl text-[--color-primary] flex items-center">
                    <Skeleton className="size-5 mr-3" />
                    <Skeleton className="h-5 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>

              {/* Task List Card Skeleton */}
              <Card className="bg-linear-to-br from-[--color-secondary]/10 to-[--color-primary]/10 shadow-xl border border-[--color-secondary]/30 h-full transition-all duration-500 hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-secondary] to-[--color-primary]"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-6 relative z-10">
                  <CardTitle className="text-xl text-[--color-secondary] flex items-center">
                    <Skeleton className="size-5 mr-3" />
                    <Skeleton className="h-5 w-32" />
                  </CardTitle>
                  <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[--color-background] to-[--color-surface] p-4 md:p-8">
        <div className="max-w-7xl mx-auto p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">Error Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">{apiError}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()} // Simple retry by refreshing
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[--color-background] to-[--color-surface] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="text-center mb-10 md:mb-12 relative overflow-hidden">
          <div className="relative z-10 p-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-[--color-primary] to-[--color-secondary] bg-clip-text mb-4">
              Dashboard
            </h1>
            <p className="text-lg text-[--color-text-primary] max-w-2xl mx-auto">
              Welcome back&apos; <span className="font-semibold text-[--color-primary]">{userEmail || 'User'}</span>! Here's your personalized workspace.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-linear-to-br from-[--color-primary]/15 to-[--color-secondary]/15 shadow-xl border border-[--color-primary]/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-primary] to-[--color-secondary]"></div>
            <CardContent className="p-6 pt-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[--color-primary] mb-2">Total Tasks</p>
                  <p className="text-4xl font-bold text-[--color-primary]">{totalTasks || 0}</p>
                </div>
                <div className="bg-white/90 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-[--color-primary]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-[--color-status-success]/15 to-[--color-status-success]/15 shadow-xl border border-[--color-status-success]/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-status-success] to-[--color-status-success]/70"></div>
            <CardContent className="p-6 pt-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[--color-status-success] mb-2">Completed</p>
                  <p className="text-4xl font-bold text-[--color-status-success]">{completedTasks || 0}</p>
                </div>
                <div className="bg-white/90 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-[--color-status-success]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-[--color-status-warning]/15 to-[--color-status-warning]/15 shadow-xl border border-[--color-status-warning]/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-status-warning] to-[--color-status-warning]/70"></div>
            <CardContent className="p-6 pt-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[--color-status-warning] mb-2">Pending</p>
                  <p className="text-4xl font-bold text-[--color-status-warning]">{pendingTasks || 0}</p>
                </div>
                <div className="bg-white/90 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-[--color-status-warning]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-[--color-status-error]/15 to-[--color-status-error]/15 shadow-xl border border-[--color-status-error]/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-status-error] to-[--color-status-error]/70"></div>
            <CardContent className="p-6 pt-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[--color-status-error] mb-2">Important</p>
                  <p className="text-4xl font-bold text-[--color-status-error]">{importantTasks || 0}</p>
                </div>
                <div className="bg-white/90 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-[--color-status-error]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.332 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[--color-primary]">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Button
              asChild
              className="py-8 bg-linear-to-r from-[--color-primary] to-[--color-secondary] hover:from-[--color-primary]/80 hover:to-[--color-secondary]/80 text-white font-semibold shadow-xl transition-all duration-300 h-24 group relative overflow-hidden"
            >
              <Link href="/todos" className="flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 group-hover:scale-125 transition-transform duration-300 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-lg font-semibold text-white">View All Tasks</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="py-8 border-2 border-[--color-secondary] text-[--color-secondary] font-semibold shadow-xl hover:bg-[--color-secondary]/20 transition-colors duration-300 h-24 group relative overflow-hidden"
            >
              <Link href="/todos?filter=important" className="flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-[--color-secondary] group-hover:scale-125 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.332 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-lg font-semibold">Important Tasks</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="py-8 border-2 border-[--color-primary] text-[--color-primary] font-semibold shadow-xl hover:bg-[--color-primary]/20 transition-colors duration-300 h-24 group relative overflow-hidden"
            >
              <Link href="/profile" className="flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-[--color-primary] group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-lg font-semibold">Edit Profile</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[--color-primary]">
              Recent Activity
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10" id='add-task'>
            {/* Add Task Card */}
            <Card className="bg-linear-to-br from-[--color-primary]/10 to-[--color-secondary]/10 shadow-xl border border-[--color-primary]/30 h-full transition-all duration-500 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-primary] to-[--color-secondary]"></div>
              <CardHeader className="pb-6 relative z-10">
                <CardTitle className="text-xl text-[--color-primary] flex items-center">
                  <div className="mr-3 p-2 bg-white/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[--color-primary]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  Add New Task
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <TaskForm />
              </CardContent>
            </Card>

            {/* Task List Card */}
            <Card className="bg-linear-to-br from-[--color-secondary]/10 to-[--color-primary]/10 shadow-xl border border-[--color-secondary]/30 h-full transition-all duration-500 hover:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-secondary] to-[--color-primary]"></div>
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between pb-6 relative z-10 px-4">
                <CardTitle className="text-xl sm:text-xl text-[--color-secondary] flex items-center">
                  <div className="sm:mr-3 p-2 bg-white/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-[--color-secondary]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  Your Recent Tasks
                </CardTitle>
                <Link
                  href="/todos"
                  className="text-[--color-primary] hover:text-[--color-primary]/80 text-base font-medium transition-colors duration-200 flex items-center hover:underline underline-offset-4"
                >
                  View All
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </CardHeader>
              <CardContent className="relative z-10">
                {/* Recent tasks from the TasksContext - sorted by creation date */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tasks
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          task.isCompleted
                            ? 'bg-green-50 border-l-green-500 text-green-800'
                            : task.priority === 'high'
                              ? 'bg-red-50 border-l-red-500 text-red-800'
                              : task.priority === 'medium'
                                ? 'bg-yellow-50 border-l-yellow-500 text-yellow-800'
                                : 'bg-blue-50 border-l-blue-500 text-blue-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{task.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.isCompleted
                              ? 'bg-green-200 text-green-800'
                              : task.priority === 'high'
                                ? 'bg-red-200 text-red-800'
                                : task.priority === 'medium'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-blue-200 text-blue-800'
                          }`}>
                            {task.isCompleted ? 'Done' : task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                    ))}
                  {tasks.length === 0 && (
                    <p className="text-gray-600 italic text-center py-4">
                      No tasks yet. Create your first task!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
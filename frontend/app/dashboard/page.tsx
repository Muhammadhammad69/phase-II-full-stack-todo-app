'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TasksProvider } from '@/components/features/todo/TasksContext';
import TaskForm from '@/components/features/todo/TaskForm';
import TaskList from '@/components/features/todo/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme/ThemeProvider';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    // Get user email from localStorage
    const storedEmail = localStorage.getItem('userEmail');
    setUserEmail(storedEmail);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-[--color-background] to-[--color-surface] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="text-center mb-10 md:mb-12 relative overflow-hidden">
          {/* <div className="absolute inset-0 bg-linear-to-r from-[--color-primary]/20 to-[--color-secondary]/20 -rotate-6 transform scale-125 rounded-2xl"></div> */}
          <div className="relative z-10 p-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-[--color-primary] to-[--color-secondary] bg-clip-text mb-4">
         Dashboard
            </h1>
            <p className="text-lg text-[--color-text-primary] max-w-2xl mx-auto">
              Welcome back, <span className="font-semibold text-[--color-primary]">{userEmail || 'User'}</span>! Here's your personalized workspace.
            </p>
            <p className="text-sm font-medium text-[--color-primary] mb-1 from-[--color-status-success]/15 to-[--color-status-success]/15">Total Tasks</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-linear-to-br from-[--color-primary]/15 to-[--color-secondary]/15 shadow-xl border border-[--color-primary]/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-primary] to-[--color-secondary]"></div>
            <CardContent className="p-6 pt-8 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[--color-primary] mb-1">Total Tasks</p>
                  <p className="text-3xl font-bold text-[--color-primary]">12</p>
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
                  <p className="text-sm font-medium text-[--color-status-success] mb-1">Completed</p>
                  <p className="text-3xl font-bold text-[--color-status-success]">7</p>
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
                  <p className="text-sm font-medium text-[--color-status-warning] mb-1">Pending</p>
                  <p className="text-3xl font-bold text-[--color-status-warning]">5</p>
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
                  <p className="text-sm font-medium text-[--color-status-error] mb-1">Overdue</p>
                  <p className="text-3xl font-bold text-[--color-status-error]">1</p>
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
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[--color-primary]">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Button
              asChild
              className="py-6 bg-linear-to-r from-[--color-primary] to-[--color-secondary] hover:from-[--color-primary]/80 hover:to-[--color-secondary]/80 text-white font-semibold shadow-xl transition-all duration-300 h-20 group relative overflow-hidden"
            >
              <Link href="/todos" className="flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 group-hover:scale-125 transition-transform duration-300"
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
                <span className="text-lg font-semibold">View All Tasks</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="py-6 border-2 border-[--color-secondary] text-[--color-secondary] font-semibold shadow-xl hover:bg-[--color-secondary]/20 transition-colors duration-300 h-20 group relative overflow-hidden"
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
              className="py-6 border-2 border-[--color-primary] text-[--color-primary] font-semibold shadow-xl hover:bg-[--color-primary]/20 transition-colors duration-300 h-20 group relative overflow-hidden"
            >
              <Link href="/profile" className="flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-[--color-primary] group-hover:scale-125 transition-transform duration-300"
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
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[--color-primary]">
              Recent Activity
            </h2>
          </div>

          <TasksProvider>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Task Card */}
              <Card className="bg-linear-to-br from-[--color-primary]/10 to-[--color-secondary]/10 shadow-xl border border-[--color-primary]/30 h-full transition-all duration-500 hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[--color-primary] to-[--color-secondary]"></div>
                <CardHeader className="pb-4 relative z-10">
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
                <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
                  <CardTitle className="text-xl text-[--color-secondary] flex items-center">
                    <div className="mr-3 p-2 bg-white/80 rounded-lg group-hover:scale-110 transition-transform duration-300">
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
                    className="text-[--color-primary] hover:text-[--color-primary]/80 text-base font-medium transition-colors duration-200 flex items-center"
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
                  <TaskList limit={5} />
                </CardContent>
              </Card>
            </div>
          </TasksProvider>
        </div>
      </div>
    </div>
  );
}
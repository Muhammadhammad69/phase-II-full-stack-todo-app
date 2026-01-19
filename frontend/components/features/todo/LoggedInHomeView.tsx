'use client';

import React from 'react';
import Link from 'next/link';
import { useTasks } from '@/components/features/todo/TasksContext';
import { useAuth } from '@/components/auth/AuthContext';
import TaskList from '@/components/features/todo/TaskList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LoggedInHomeView = () => {
  const { tasks } = useTasks();
  const { user } = useAuth();

  // Filter tasks for current user to determine if there are any
  const userTasks = tasks.filter(task => task.userEmail === user?.email);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#0066ff]">Your Todo Dashboard</h1>
        <p className="text-lg text-[#b3b3b3]">
          Welcome back! Here are your recent tasks.
        </p>
      </div>

      <Card  >
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2 text-[#0066ff]">Recent Tasks</h2>
          <p className="text-[#b3b3b3] mb-4">
            {userTasks.length > 0
              ? `Showing your ${Math.min(userTasks.length, 5)} most recent tasks`
              : 'You have no tasks yet'}
          </p>

          {userTasks.length > 0 ? (
            <TaskList limit={5} />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-[#b3b3b3] mb-4">
                You haven't created any tasks yet. Visit the dashboard to add your first task.
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoggedInHomeView;
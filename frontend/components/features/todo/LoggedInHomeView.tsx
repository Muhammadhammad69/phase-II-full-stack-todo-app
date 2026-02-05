"use client";

import React from "react";
import Link from "next/link";
import { useTasks } from "@/components/contexts/TasksContext";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LoggedInHomeView = () => {
  const { tasks, loading } = useTasks();
  
  // Filter tasks for current user to determine if there are any
  // const userTasks = tasks.filter(task => task.userEmail === user?.email);
  if (loading) {
    return <div>Loading your tasks...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#0066ff]">Your Todos</h1>
        <p className="text-lg text-[#b3b3b3]">
          Welcome back! Here are your recent tasks.
        </p>
      </div>

      <Card>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2 text-[#0066ff]">
            Recent Tasks
          </h2>
          <p className="text-[#b3b3b3] mb-4">
            {tasks.length > 0
              ? `Showing your ${Math.min(tasks.length, 3)} most recent tasks`
              : "You have no tasks yet"}
          </p>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              <>
                {tasks
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg border`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString()
                              : "No date"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.isCompleted
                              ? "bg-green-200 text-green-800"
                              : task.priority === "high"
                                ? "bg-red-200 text-red-800"
                                : task.priority === "medium"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-blue-200 text-blue-800"
                          }`}
                        >
                          {task.isCompleted ? "Done" : task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))}
                <div className="flex gap-4">
                  <Button className="bg-[#0ea5e9] hover:bg-[#0093d5] cursor-pointer transition-all duration-200 ease-in-out scale-100 hover:scale-102 ">
                    <Link href="/todos">View All Todos</Link>
                  </Button>
                  <Button className="bg-[#0ea5e9] hover:bg-[#0093d5] cursor-pointer transition-all duration-200 ease-in-out scale-100 hover:scale-102 ">
                    <Link href="/dashboard#add-task">Add Todos</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                <p className="text-[#b3b3b3] mb-4">
                  You haven&apos;t created any tasks yet. Visit the dashboard to add
                  your first task.
                </p>
                <Link href="/dashboard#add-task" className="cursor-pointer">
                  <Button className="cursor-pointer">Go to Dashboard</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoggedInHomeView;

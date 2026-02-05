

// frontend/src/components/api/TaskItem.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/components/contexts/TasksContext";
import { Task } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, Loader2 } from "lucide-react";
import TaskUpdatedForm from "./TaskUpdateForm";


interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTaskCompletion, deleteTask: deleteLocalTask } = useTasks();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  

  const handleToggleCompletion = async () => {
    if (!task.id) return;

    setIsToggling(true);
    try {
      await toggleTaskCompletion(task.id);
      toast.success(
        `Task "${task.title}" marked as ${task.isCompleted ? "incomplete" : "completed"}`,
        { duration: 3000 },
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error("Failed to update task status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!task.id) return;

    setIsDeleting(true);
    try {
      await deleteLocalTask(task.id);
      toast.success(`Task "${task.title}" deleted successfully`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setIsDialogOpen(true);
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
   
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Card className="mb-3">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start space-x-4 gap-y-4">
            {/* Custom Switch Toggle with Loader */}
            <button
              onClick={handleToggleCompletion}
              disabled={!task.id || isToggling}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors  shrink-0 ${
                isToggling
                  ? "bg-gray-300 cursor-not-allowed"
                  : task.isCompleted
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300 hover:bg-gray-400"
              }`}
              role="switch"
              aria-checked={task.isCompleted}
              title={
                task.isCompleted ? "Mark as incomplete" : "Mark as complete"
              }
            >
              <span
                className={` h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
                  task.isCompleted ? "translate-x-7" : "translate-x-1"
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                ) : (
                  task.isCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )
                )}
              </span>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3
                  className={`font-medium ${task.isCompleted ? "line-through text-gray-500" : ""}`}
                >
                  {task.title}
                </h3>
                <Badge
                  className={`${priorityColors[task.priority]} self-start`}
                >
                  {task.priority}
                </Badge>
              </div>

              {task.description && (
                <p
                  className={`text-sm mt-1 ${task.isCompleted ? "line-through text-gray-500" : "text-gray-600"}`}
                >
                  {task.description}
                </p>
              )}

              {task.dueDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {/* <p>{currentId && "hi"}</p> */}
            <div className="flex  gap-2 self-end">
              {/* <Button
                variant="default"
                className="cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] transition-all duration-200 ease-in-out  "
                onClick={() => setIsEditDialogOpen(true)}
              >
                Edit
              </Button> */}
              <TaskUpdatedForm task={task} />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={!task.id || isDeleting} // Disable if task doesn't have an ID
                className="cursor-pointer  sm:self-start h-9!"
              >
                {isDeleting ? <Spinner className="h-4 w-4" /> : null}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task <strong>&quot;{task.title}&quot;</strong> from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsDialogOpen(false);
                handleDeleteConfirmed();
              }}
              className="cursor-pointer"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  );
};

export default TaskItem;

// frontend/src/components/api/TaskForm.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/components/contexts/TasksContext";
import toast from "react-hot-toast";
import { Spinner } from "../../ui/spinner";

import {Field, FieldLabel} from "@/components/ui/field"

interface TaskFormProps {
  onTaskAdded?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded }) => {
  const { addTask, error: creationError } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const today = new Date();
  today.setDate(today.getDate() + 1); // tomorrow

  const minDate = today.toLocaleDateString("en-CA");

 
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsCreating(true);
    try {
      const isAdded = await addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: false,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");

      if (isAdded) {
        toast.success("Task added successfully!");
      }else {
        throw new Error("Failed to add task");
      }
  //      if (isProductAdded === "true") {
  //   toast.success("Task added successfully!");
  // }else if (isProductAdded === "false") {
  //   toast.error("Failed to add task");
  // }

      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Failed to add task");
    }finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        {creationError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error: {creationError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <Textarea
              placeholder="Task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field>
                <FieldLabel htmlFor="priority">Priority</FieldLabel>
                 <Select
                value={priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setPriority(value)
                }
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              </Field>
             
            </div>

            <div>
              <Field>
                <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
                <Input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                disabled={isCreating}
                
                min={minDate}
              />
              </Field>
              
            </div>
          </div>

          <Button
            type="submit"
            disabled={isCreating}
            className="w-full cursor-pointer"
          >
            {isCreating && <Spinner />}
            {isCreating ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;

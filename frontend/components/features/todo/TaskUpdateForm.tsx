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


import { Field, FieldLabel } from "@/components/ui/field";
import { Task } from "@/types/todo/task";
import {
  Dialog,
  DialogClose,
  DialogContent,
  
  DialogFooter,
  
  
  
} from "@/components/ui/dialog";


interface TaskUpdatedFormProps {
  task: Task;
}

const TaskUpdatedForm: React.FC<TaskUpdatedFormProps> = ({ task }) => {
  const {  error: creationError, updateTask } = useTasks();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate ? task.dueDate.toLocaleDateString("en-CA") : "",
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const today = new Date();
  today.setDate(today.getDate() + 1); // tomorrow

  const minDate = today.toLocaleDateString("en-CA");

  const handleClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {

      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.toLocaleDateString("en-CA") : "");
    },1000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if(title.trim() === task.title && description?.trim() === task.description && priority === task.priority && (dueDate ? new Date(dueDate).toLocaleDateString("en-CA") : null) === (task.dueDate ? task.dueDate.toLocaleDateString("en-CA") : null)) {
      toast.error("No changes made to the task");
      return;
    }
    setIsCreating(true);
    const updatedTask: Task = {
      id: task.id, // Using the task ID from the passed-in task object
      userEmail: task.userEmail, // This would be set based on user context
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
    
      const response = await updateTask(updatedTask);


      if (response) {
        toast.success("Task updated successfully!");
        setIsDialogOpen(false);
        setTimeout(() => {
          setTitle(response.title);
          setDescription(response.description);
          setPriority(response.priority);
          setDueDate(response.dueDate ? response.dueDate.toLocaleDateString("en-CA") : "");
        },1000);

      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Failed to add task");
    } finally {
      setIsCreating(false);
    }
  };
 
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleClose} >
      <Button
        variant="default"
        className="cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] transition-all duration-200 ease-in-out "
        onClick={() => setIsDialogOpen(true)}
      >
        Edit
      </Button>
      {/* <DialogTrigger asChild>
        </DialogTrigger> */}
      <DialogContent className="sm:max-w-md">
        <Card className="pb-2 gap-4 border-none shadow-none">
          <CardHeader className="px-0">
            <CardTitle>Update Task</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
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
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={isCreating}
                      min={minDate}
                    />
                  </Field>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild onClick={handleClose}>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isCreating} className="cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] hover:text-black transition-all duration-200 ease-in-out ">
                  {isCreating && <Spinner />}
                  {isCreating ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
              {/* <Button
                type="submit"
                disabled={isCreating}
                className="w-full cursor-pointer"
              ></Button> */}
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default TaskUpdatedForm;

{
  /* <Card>
      <CardHeader>
        <CardTitle>Update Task</CardTitle>
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
            {isCreating ? "Updating..." : "Update Task"}
          </Button>
        </form>
      </CardContent>
    </Card> */
}

// export function DialogDemo() {
//   let isOpen = false
//   return (
//     <Dialog open={isOpen}>

//         <DialogTrigger asChild>
//           <Button
//   variant="default"
//   className="cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] transition-all duration-200 ease-in-out  "
//   onClick={() => setIsEditDialogOpen(true)}
// >
//   Edit
// </Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-sm">
//            <Card>
//       <CardHeader>
//         <CardTitle>Update Task</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {creationError && (
//           <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//             Error: {creationError}
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Input
//               type="text"
//               placeholder="Task title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//               disabled={isCreating}
//             />
//           </div>

//           <div>
//             <Textarea
//               placeholder="Task description (optional)"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               disabled={isCreating}
//               rows={3}
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <Field>
//                 <FieldLabel htmlFor="priority">Priority</FieldLabel>
//                  <Select
//                 value={priority}
//                 onValueChange={(value: "low" | "medium" | "high") =>
//                   setPriority(value)
//                 }
//                 disabled={isCreating}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Priority" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="low">Low</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="high">High</SelectItem>
//                 </SelectContent>
//               </Select>
//               </Field>

//             </div>

//             <div>
//               <Field>
//                 <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
//                 <Input
//                 type="date"
//                 id="dueDate"
//                 value={dueDate}
//                 onChange={e => setDueDate(e.target.value)}
//                 disabled={isCreating}

//                 min={minDate}
//               />
//               </Field>

//             </div>
//           </div>

//           <Button
//             type="submit"
//             disabled={isCreating}
//             className="w-full cursor-pointer"
//           >
//             {isCreating && <Spinner />}
//             {isCreating ? "Updating..." : "Update Task"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//           <DialogFooter>
//             <DialogClose asChild>
//               <Button variant="outline">Cancel</Button>
//             </DialogClose>
//             <Button type="submit">Save changes</Button>
//           </DialogFooter>
//         </DialogContent>

//     </Dialog>
//   )
// }

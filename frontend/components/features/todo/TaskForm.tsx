import React, { useState } from 'react';
import { Task, Priority } from '@/types';
import { useTasks } from './TasksContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VALIDATION_RULES } from '@/types';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  initialTask?: Partial<Task>;
  isEditing?: boolean;
}

const TaskForm = ({ onSubmit, onCancel, initialTask, isEditing = false }: TaskFormProps) => {
  const { addTask, updateTask } = useTasks();

  const [formData, setFormData] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    priority: initialTask?.priority || 'medium' as Priority,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < VALIDATION_RULES.TASK.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION_RULES.TASK.TITLE_MIN_LENGTH} characters`;
    } else if (formData.title.length > VALIDATION_RULES.TASK.TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be no more than ${VALIDATION_RULES.TASK.TITLE_MAX_LENGTH} characters`;
    }

    if (formData.description && formData.description.length > VALIDATION_RULES.TASK.DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must be no more than ${VALIDATION_RULES.TASK.DESCRIPTION_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEditing && initialTask?.id) {
      // Update existing task
      updateTask({
        ...initialTask,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        updatedAt: new Date(),
      } as Task);
    } else {
      // Add new task
      addTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        isCompleted: false,
        userEmail: 'user@example.com', // Mock user
        dueDate: null,
        completedAt: null,
      });
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
    });

    if (onSubmit) {
      onSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? styles.error : ''}
          placeholder="Enter task title"
          required
        />
        {errors.title && <div className={styles.errorText}>{errors.title}</div>}
      </div>

      <div className={styles.field}>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description (optional)"
          className={`${errors.description ? styles.error : ''}`}
        />
        {errors.description && <div className={styles.errorText}>{errors.description}</div>}
      </div>

      <div className={styles.field}>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: Priority) => setFormData(prev => ({...prev, priority: value}))}>
          <SelectTrigger id="priority" className={styles.select}>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="default">
          {isEditing ? 'Update Task' : 'Add Task'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
import React, { useState } from 'react';
import { Task, Priority } from '@/types';
import { useTasks } from './TasksContext';
import { Checkbox } from '@/components/ui/checkbox';
import PriorityChip from '@/components/ui/PriorityChip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal';
import TaskForm from './TaskForm';
import { getPriorityColor } from '@/theme/utils';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { toggleTaskCompletion, deleteTask, updateTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  return (
    <Card  className={`${styles.taskItem} ${task.isCompleted ? styles.completed : ''}`}>
      <div className={styles.taskHeader}>
        <div className={styles.taskInfo}>
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={() => handleToggleCompletion()}
            className={styles.checkbox}
          />
          <div className={styles.taskContent}>
            <h3 className={`${styles.taskTitle} ${task.isCompleted ? styles.completedText : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`${styles.taskDescription} ${task.isCompleted ? styles.completedText : ''}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className={styles.taskActions}>
          <PriorityChip priority={task.priority} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            aria-label="Edit task"
          >
            <Icon icon="edit" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete task"
          >
            <Icon icon="delete" />
          </Button>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseEdit}
        title="Edit Task"
      >
        <TaskForm
          initialTask={task}
          isEditing={true}
          onSubmit={handleSaveEdit}
          onCancel={handleCloseEdit}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        <div className={styles.deleteConfirm}>
          <p>Are you sure you want to delete "{task.title}"?</p>
          <div className={styles.confirmActions}>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default TaskItem;
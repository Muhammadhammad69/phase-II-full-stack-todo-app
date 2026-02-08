// frontend/src/components/api/TodoFilter.tsx

'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/types';

interface TodoFilterProps {
  filters: TaskFilters;
  onFilterChange: (newFilters: Partial<TaskFilters>) => void;
  onResetFilters: () => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-50">
        <Input
          placeholder="Search tasks..."
          value={filters.searchQuery || ''}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
        />
      </div>

      <div>
        <Select
          value={filters.status || 'all'}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value) => onFilterChange({ status: value as any })}
        >
          <SelectTrigger className="w-30">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select
          value={filters.priority || 'all'}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onValueChange={(value) => onFilterChange({ priority: value as any })}
        >
          <SelectTrigger className="w-30">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onResetFilters}>
        Reset
      </Button>
    </div>
  );
};

export default TodoFilter;
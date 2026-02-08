// types/todo/filters.ts



export interface TaskFilters {
  status?: 'all' | 'completed' | 'pending';
  priority?: 'all' | 'low' | 'medium' | 'high';
  category?: string;
  searchQuery?: string;
}
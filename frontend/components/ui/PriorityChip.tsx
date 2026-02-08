import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PriorityLevel = 'low' | 'medium' | 'high';

interface PriorityChipProps {
  priority: PriorityLevel;
  label?: string;
  className?: string;
}

const PriorityChip = ({
  priority,
  label,
  className = '',
}: PriorityChipProps) => {
  const priorityLabel = label || priority.charAt(0).toUpperCase() + priority.slice(1);

  // Map priority to badge variants
  const getVariant = () => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'high':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn("capitalize", className)}
    >
      {priorityLabel}
    </Badge>
  );
};

export default PriorityChip;
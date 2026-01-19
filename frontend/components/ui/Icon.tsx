import React from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconType = 'add' | 'delete' | 'edit' | 'check' | 'close' | 'search';

interface IconProps {
  icon: IconType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Icon = ({
  icon,
  size = 'md',
  className = '',
}: IconProps) => {
  // Size mapping
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  // Icon mapping
  const iconMap = {
    add: PlusIcon,
    delete: TrashIcon,
    edit: PencilIcon,
    check: CheckIcon,
    close: XIcon,
    search: SearchIcon,
  };

  const SelectedIcon = iconMap[icon];
  const sizeClass = sizeClasses[size];

  return <SelectedIcon className={cn(sizeClass, className)} />;
};

export default Icon;
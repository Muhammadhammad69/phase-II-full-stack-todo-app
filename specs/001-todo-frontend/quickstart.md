# Quickstart Guide: Todo App Frontend

## Project Setup

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Initialize Project
```bash
# Navigate to project root
cd /path/to/repo

# Create frontend directory
mkdir frontend
cd frontend

# Initialize Next.js project with TypeScript and App Router
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Install Additional Dependencies
```bash
# Additional dependencies if not installed by create-next-app
npm install -D typescript @types/node @types/react @types/react-dom
```

## Project Structure
```
frontend/
├── app/
│   ├── globals.css          # Global styles with Tech Innovation theme
│   ├── layout.tsx           # Root layout with theme
│   ├── page.tsx             # Main dashboard page
│   └── types/               # TypeScript types
│       └── index.ts
├── components/              # Reusable UI components
│   ├── ui/                  # Base components (Button, Input, etc.)
│   └── todo/                # Todo-specific components
├── lib/                     # Utilities and constants
│   ├── types.ts             # Shared types
│   └── utils.ts             # Helper functions
├── public/                  # Static assets
└── package.json
```

## Tech Innovation Theme Setup

### Update globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --tech-innovation-electric-blue: #0066ff;
  --tech-innovation-neon-cyan: #00ffff;
  --tech-innovation-dark-gray: #1e1e1e;
  --tech-innovation-white: #ffffff;
}

.tech-innovation-theme {
  --color-primary: var(--tech-innovation-electric-blue);
  --color-accent: var(--tech-innovation-neon-cyan);
  --color-background: var(--tech-innovation-dark-gray);
  --color-text: var(--tech-innovation-white);
}
```

### Configure Theme in Layout
```tsx
// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Modern todo application with Tech Innovation theme',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="tech-innovation-theme">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

## Component Development

### Create Base Button Component
```tsx
// components/ui/button.tsx
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[#0052cc]',
    secondary: 'bg-[var(--color-accent)] text-[var(--color-background)] hover:bg-[#00e6e6]',
    outline: 'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
  }

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return <button className={classes} {...props}>{children}</button>
}
```

### Create Task Component
```tsx
// components/todo/task-item.tsx
'use client'

import { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface TaskItemProps {
  task: Task
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const handleSaveEdit = () => {
    onEdit({ ...task, title: editTitle })
    setIsEditing(false)
  }

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${
      task.isCompleted ? 'bg-gray-100 opacity-70' : 'bg-white'
    }`}>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggleComplete(task.id)}
          className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
        />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
            className="border rounded px-2 py-1 flex-grow"
            autoFocus
          />
        ) : (
          <span className={`flex-grow ${task.isCompleted ? 'line-through' : ''}`}>
            {task.title}
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>

        {!isEditing && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

## Running the Application

### Development
```bash
# From the frontend directory
npm run dev
```

The application will be available at http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## Key Technologies Used

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **Styling**: CSS Modules with Tech Innovation theme
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier (typically included with Next.js setup)
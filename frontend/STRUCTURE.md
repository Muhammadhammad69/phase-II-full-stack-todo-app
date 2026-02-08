# Frontend Directory Structure

This document describes the organized frontend directory structure for the Todo application.

## Overview

The frontend follows a modular architecture with clear separation of concerns:

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── auth/          # Authentication API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── profile/           # Profile page
│   ├── signup/            # Signup page
│   └── todos/             # Todos page
├── components/            # Reusable UI components
│   ├── api/               # API service components
│   ├── contexts/          # React Context providers (AuthContext, TasksContext)
│   ├── features/          # Feature-specific components
│   │   └── todo/          # Todo-related components
│   ├── hooks/             # Custom React hooks
│   ├── layout/            # Layout components
│   └── ui/                # Base UI components (buttons, cards, etc.)
├── lib/                   # Shared utilities and business logic
│   ├── auth/              # Authentication utilities
│   ├── constants/         # Application constants
│   ├── db/                # Database utilities
│   ├── utils/             # Utility functions
│   └── types/             # Legacy type definitions (now in types/)
├── middleware/            # Next.js middleware
├── public/                # Static assets
├── theme/                 # Theme configuration
└── types/                 # Centralized TypeScript type definitions
    ├── api/               # API-related types
    ├── auth/              # Authentication types
    ├── common/            # Common types (User, validation rules)
    ├── todo/              # Todo-related types
    └── index.ts           # Main export file
```

## Key Organizational Changes

### 1. Context Management
- **Before**: Context files were scattered in various locations
- **After**: All context files moved to `frontend/components/contexts/`
  - `AuthContext.tsx` → `frontend/components/contexts/AuthContext.tsx`
  - `TasksContext.tsx` → `frontend/components/contexts/TasksContext.tsx`

### 2. Type Definitions
- **Before**: Types were mixed in `frontend/types/` and `frontend/lib/types/`
- **After**: All types centralized in `frontend/types/` with organized subdirectories:
  - API types: `frontend/types/api/`
  - Authentication types: `frontend/types/auth/`
  - Common types: `frontend/types/common/`
  - Todo-specific types: `frontend/types/todo/`

### 3. Import Updates
All affected files have been updated to reflect the new import paths:
- Old: `import { useAuth } from '@/components/auth/AuthContext'`
- New: `import { useAuth } from '@/components/contexts/AuthContext'`
- Old: `import { useTasks } from '@/components/features/todo/TasksContext'`
- New: `import { useTasks } from '@/components/contexts/TasksContext'`
- Old: `import { SomeType } from '@/lib/types/apiTypes'`
- New: `import { SomeType } from '@/types/api/apiTypes'`

## Benefits

1. **Improved Maintainability**: Related functionality grouped together
2. **Better Discoverability**: Consistent naming and organization patterns
3. **Cleaner Imports**: Shorter and more consistent import paths
4. **Scalability**: Easy to add new features and contexts in organized manner
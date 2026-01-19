---
name: shadcn-ui
description: Answer questions about the official shadcn UI docs, provide installation, component usage, CLI commands, and examples. Use when Claude needs to work with shadcn UI components for: (1) Installing shadcn UI in a project, (2) Adding components using the CLI, (3) Understanding component usage and props, (4) Configuring components.json, (5) Implementing theming and dark mode, (6) Following shadcn UI design principles, or (7) Generating React + Tailwind CSS code with shadcn components
---

# shadcn UI

shadcn UI is a collection of accessible, customizable, and open-source components for React applications. This skill provides comprehensive guidance on installing, configuring, and using shadcn UI components with React and Tailwind CSS.

## Installation

To initialize shadcn UI in a new or existing project, run:

```bash
npx shadcn@latest init
```

This command will:
1. Create a `components.json` configuration file
2. Install required dependencies (Tailwind CSS, Radix UI primitives, Lucide React, clsx, and tailwind-merge)
3. Configure your project for shadcn UI components

## Adding Components

To add individual components, use the CLI:

```bash
npx shadcn@latest add [component-name]
```

Examples:
- `npx shadcn@latest add button`
- `npx shadcn@latest add button input dialog`
- `npx shadcn@latest add *` (to add all components)

## Configuration

The `components.json` file stores your project's shadcn UI configuration:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## Component Categories

shadcn UI offers components across several categories:

### Forms
- Button
- Input
- Label
- Checkbox
- Radio Group
- Select
- Textarea
- Toggle

### Data Display
- Table
- Badge
- Avatar
- Card
- Separator
- Skeleton

### Feedback
- Alert
- Dialog
- Toast
- Tooltip
- Progress

### Navigation
- Breadcrumb
- Pagination
- Tabs
- Navigation Menu
- Sidebar

### Surfaces
- Accordion
- Collapsible
- Sheet
- AlertDialog
- Hover Card

## Design Principles

shadcn UI follows these core principles:

1. **Open Code**: All components are open-source and customizable
2. **Composable Interface**: Components can be combined and extended
3. **Distribution**: Easy installation and updates via CLI
4. **Beautiful Defaults**: Carefully designed default styles
5. **AI Ready**: Components work well with AI code assistants
6. **Theming**: Consistent theming and dark mode support

## Component Usage Examples

### Button Component
```jsx
import { Button } from "@/components/ui/button";

// Basic button
<Button>Click me</Button>

// Variant options: default, destructive, outline, secondary, ghost, link
<Button variant="outline">Outline</Button>

// Size options: default, sm, lg, icon
<Button size="lg">Large Button</Button>
```

### Dialog Component
```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

## Theming and Dark Mode

shadcn UI supports automatic dark mode based on system preferences:

1. Enable CSS variables in `components.json`
2. Use CSS variables in your components
3. Leverage Tailwind's dark mode classes

Example:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
}

.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
}
```

## Common Use Cases

### 1. Setting Up a New Project with shadcn UI
1. Initialize Tailwind CSS
2. Run `npx shadcn@latest init`
3. Add desired components with `npx shadcn@latest add [component]`
4. Import and use components in your React application

### 2. Customizing Components
- Modify the generated component files in `components/ui/`
- Override styles with Tailwind utility classes
- Extend components with additional props

### 3. Integrating with Frameworks
shadcn UI works with:
- Next.js (recommended)
- Vite
- Create React App
- Any React-compatible framework

## Troubleshooting

### Common Issues
- Missing dependencies: Run `npx shadcn@latest init` to ensure all dependencies are installed
- Component not found: Check if the component was added with `npx shadcn@latest add`
- Styling issues: Verify Tailwind CSS is properly configured

### Component Updates
Components are stored locally in your project, allowing you to maintain your own versions. To update:
1. Remove the component from your project
2. Re-add it with `npx shadcn@latest add [component]`
3. Reapply any custom modifications

## CLI Commands Reference

- `npx shadcn@latest init` - Initialize shadcn UI in the current project
- `npx shadcn@latest add [component]` - Add specific components
- `npx shadcn@latest remove [component]` - Remove components
- `npx shadcn@latest update [component]` - Update components (coming soon)

For advanced usage and detailed component documentation, refer to the references section.
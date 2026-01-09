---
name: nextjs-setup
description: Complete guide to setting up Next.js projects including create-next-app, directory structure, configuration, environment variables, TypeScript setup, and project organization. Use when Claude needs to create new Next.js projects, understand project structure, configure Next.js applications, set up environment variables, organize files properly, or understand Next.js project setup best practices.
---

# Setting Up Next.js - Project Creation and Structure

## Overview

This skill covers the complete process of setting up a Next.js project, from initial creation to understanding the directory structure and configuration. You'll learn how to create your first Next.js application and understand its fundamental organization.

## Creating a New Next.js Project

### Using create-next-app (Recommended)

The easiest way to create a new Next.js project is using the official `create-next-app` CLI tool:

```bash
npx create-next-app@latest my-next-app
```

### Interactive Setup Process

When you run the command, you'll be prompted to configure your project:

1. **Would you like to use TypeScript?** (Yes/No)
2. **Would you like to use ESLint?** (Yes/No)
3. **Would you like to use Tailwind CSS?** (Yes/No)
4. **Would you like to use `src/` directory?** (Yes/No)
5. **Would you like to use App Router?** (Yes/No - recommended: Yes)
6. **Would you like to customize the import alias?** (Yes/No - default: @/*)

### Alternative: Interactive Mode

You can also run the command without arguments to use interactive prompts:

```bash
npx create-next-app@latest
```

This will guide you through the setup process step by step.

## Project Directory Structure

Here's the typical Next.js project structure:

```
my-next-app/
├── app/                    # App Router directory (main code)
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page (/)
│   ├── about/
│   │   └── page.js        # About page (/about)
│   ├── blog/
│   │   └── [id]/
│   │       └── page.js    # Dynamic blog post (/blog/[id])
│   └── api/               # API routes
│       └── users/
│           └── route.js   # API endpoint (/api/users)
├── public/                # Static assets (images, fonts, etc)
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
├── components/            # Reusable React components
│   ├── Header.js
│   ├── Footer.js
│   └── Navigation.js
├── lib/                   # Utility functions and helpers
│   ├── db.js
│   └── api-client.js
├── styles/                # Global and module styles
│   ├── globals.css
│   └── Home.module.css
├── node_modules/          # Installed dependencies
├── .env.local             # Local environment variables (NOT in git)
├── .env.production        # Production environment variables
├── .gitignore             # Files to ignore in git
├── next.config.js         # Next.js configuration
├── package.json           # Project metadata and dependencies
├── package-lock.json      # Locked dependency versions
├── tsconfig.json          # TypeScript configuration
├── jsconfig.json          # JavaScript configuration (if not using TS)
└── README.md              # Project documentation
```

## Understanding Each Folder

### app/ Directory
- Contains all routes and pages for the App Router
- Special files: `layout.js`, `page.js`, `error.js`, `loading.js`
- File-based routing system
- API routes in `app/api/`
- Recommended with App Router

### public/ Directory
- Static files served directly
- Images, fonts, documents, etc
- Accessible at root path
- Example: `public/logo.png` → `/logo.png`
- Performance: served from CDN in production

### components/ Directory
- Reusable React components
- Shared across pages
- Organized by feature or type
- Not directly routable

### lib/ Directory
- Utility functions
- Helper functions
- Database clients
- API clients
- Shared logic

### styles/ Directory
- Global CSS styles
- CSS Modules
- Tailwind CSS (if selected)
- Font imports

## next.config.js Configuration

### Purpose
Customize Next.js behavior and configure various aspects of your application.

### Basic Structure
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your configuration here
}

module.exports = nextConfig
```

### Common Configurations
```javascript
// next.config.js
module.exports = {
  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },

  // Redirects and rewrites
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_ENV_VAR: 'value',
  },

  // Experimental features
  experimental: {
    appDir: true,
  },
}
```

## Environment Variables

### Types of Environment Files
- `.env`: All environments (committed to git)
- `.env.local`: Local overrides (NOT committed, ignored by git)
- `.env.production`: Production-only variables
- `.env.development`: Development-only variables

### Example .env.local
```
DATABASE_URL=postgresql://user:password@localhost/mydb
API_KEY=secret_key_here
NEXTAUTH_SECRET=random_secret_string
```

### Example .env (no secrets)
```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=My App
```

### Public vs Private Variables
- `NEXT_PUBLIC_*` variables are exposed to browser (use for non-sensitive data)
- Other variables are server-only (use for secrets)

### Accessing Variables
- Server-side: `process.env.DATABASE_URL`
- Client-side: `process.env.NEXT_PUBLIC_API_URL` (only public vars)

### Example Usage
```javascript
// app/api/posts/route.js (server-side, can use all env vars)
const dbUrl = process.env.DATABASE_URL
const apiKey = process.env.API_KEY

// components/Header.js (client-side, only public vars)
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## TypeScript Configuration (tsconfig.json)

Auto-generated if you choose TypeScript during setup.

### Key Settings
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Path Aliases (Important)
```json
"paths": {
  "@/*": ["./*"],
  "@/components/*": ["./components/*"],
  "@/lib/*": ["./lib/*"]
}
```

### Usage with Aliases
```javascript
// Without alias (bad)
import Button from '../../../components/Button'

// With alias (good)
import Button from '@/components/Button'
```

## package.json Scripts

Auto-generated scripts:

```json
{
  "scripts": {
    "dev": "next dev",           // Start development server
    "build": "next build",       // Build for production
    "start": "next start",       // Start production server
    "lint": "next lint",         // Run ESLint
    "type-check": "tsc --noEmit" // Check TypeScript types
  }
}
```

### Running Scripts
```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Build and optimize for production
npm start        # Run production build
npm run lint     # Check code quality
```

## .gitignore Configuration

Standard .gitignore for Next.js projects:

```
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env.local
.env.*.local

# Vercel
.vercel
```

## First Steps After Setup

### Step 1: Navigate to Project
```bash
cd my-next-app
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Browser
- Navigate to http://localhost:3000
- See default Next.js page

### Step 4: Edit Files
- Open `app/page.js`
- Make changes
- See hot reload in action (no refresh needed)

### Step 5: Create New Page
- Create `app/about/page.js`
- Navigate to http://localhost:3000/about
- See new page instantly

### Step 6: Add Component
- Create `components/Header.js`
- Import in `app/layout.js`
- See component rendered

## Common Configuration Needs

### Adding Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Adding TypeScript
```bash
# Rename files from .js to .tsx
# Create tsconfig.json (if not exists)
npm run dev  # TypeScript will auto-setup
```

### Adding ESLint
```bash
npm run lint  # Auto-setup on first run
```

### Changing Port
```bash
npm run dev -- -p 3001  # Run on port 3001
```

## Code Examples

### Example 1: Simple Home Page
```javascript
// app/page.js
export default function Home() {
  return (
    <main>
      <h1>Welcome to My Next.js App</h1>
      <p>This is the home page</p>
    </main>
  )
}
```

### Example 2: Layout Component
```javascript
// app/layout.js
import './globals.css'

export const metadata = {
  title: 'My App',
  description: 'Generated by create next app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Example 3: Using Environment Variables
```javascript
// app/api/config/route.js
export async function GET() {
  return Response.json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    // Note: process.env.DATABASE_URL would NOT work here if server-only
  })
}
```

### Example 4: Creating a New Page
```javascript
// app/products/page.js
export default function Products() {
  return (
    <main>
      <h1>Products</h1>
      <p>Browse our products</p>
    </main>
  )
}
// Accessible at http://localhost:3000/products
```

## Real-World Scenarios

### Scenario 1: Personal Blog
- Use App Router
- Add TypeScript for safety
- Add Tailwind for styling
- Create `app/blog/[slug]/page.js` for posts

### Scenario 2: SaaS Application
- Use App Router
- Enable TypeScript
- Create API routes in `app/api/`
- Add authentication

### Scenario 3: E-commerce Site
- Use App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Database integration

### Scenario 4: Corporate Website
- Use App Router
- TypeScript optional
- Create multiple pages
- Static generation

## Common Mistakes to Avoid

1. **Not understanding file-based routing**
   - Pages must be in app/ directory
   - page.js creates the route
   - folder structure = URL path

2. **Mixing Pages and App Router**
   - Use one or the other, not both
   - App Router is recommended
   - Don't create both app/ and pages/

3. **Putting logic in public folder**
   - Public folder is for static assets only
   - Cannot run code there
   - Use app/api/ for API endpoints

4. **Committing node_modules to git**
   - Always add to .gitignore
   - Can be 500MB+ in size
   - npm install will regenerate

5. **Not using environment variables for secrets**
   - Never hardcode API keys
   - Use .env.local for local development
   - Use NEXT_PUBLIC_ only for public data

6. **Forgetting to add NEXT_PUBLIC_ prefix for client variables**
   - Client-side code cannot access server variables
   - Must use NEXT_PUBLIC_ prefix
   - Only then accessible in browser

7. **Starting with complex structure**
   - Start simple
   - Organize as you grow
   - Refactor when needed

## Best Practices

1. **Use consistent folder structure**
   - app/ for routes
   - components/ for components
   - lib/ for utilities
   - styles/ for CSS

2. **Use path aliases (@/)**
   - Makes imports cleaner
   - Easier to refactor
   - Reduces relative path errors

3. **Keep environment variables organized**
   - Document all variables
   - Use .env.example as template
   - Never commit .env.local

4. **Use TypeScript for type safety**
   - Catch errors early
   - Better IDE support
   - Self-documenting code

5. **Organize by feature**
   - Group related files
   - Create feature folders
   - Keep related code together

6. **Start development server**
   - Use npm run dev
   - Hot reload during development
   - Faster feedback loop

7. **Commit to git regularly**
   - Track your changes
   - Easy to revert if needed
   - Backup in cloud

## Quick Reference

### Command: Create Project
```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

### Command: Open in Browser
- http://localhost:3000

### Command: Build for Production
```bash
npm run build
npm start
```

### Folder Structure:
- app/ = Routes and pages
- public/ = Static files
- components/ = Reusable components
- lib/ = Utilities and helpers
- styles/ = CSS files

### Environment:
- .env = Shared variables
- .env.local = Local secrets (not in git)
- NEXT_PUBLIC_* = Client-visible variables

### Scripts:
- npm run dev = Start development
- npm run build = Build for production
- npm start = Run production build
- npm run lint = Check code quality

### Path Alias:
- @/ = root directory
- Example: @/components/Header

### TypeScript:
- Auto-configured if selected
- Strict mode recommended
- Type checking: npm run type-check

## References

For detailed information on specific topics, see the reference files:
- [DIRECTORY_STRUCTURE.md](references/DIRECTORY_STRUCTURE.md) - Detailed project organization
- [CONFIGURATION.md](references/CONFIGURATION.md) - Next.js configuration options
- [ENVIRONMENT_VARIABLES.md](references/ENVIRONMENT_VARIABLES.md) - Environment variable management
- [TYPESCRIPT_SETUP.md](references/TYPESCRIPT_SETUP.md) - TypeScript configuration guide
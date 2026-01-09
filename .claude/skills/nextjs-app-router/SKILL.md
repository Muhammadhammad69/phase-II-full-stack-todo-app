---
name: nextjs-app-router
description: Master the Next.js App Router for intuitive file-based routing. Create routes by simply creating files and folders. Learn about dynamic routes, route groups, layouts, error handling, loading states, and API routes. Use when Claude needs to implement file-based routing, create dynamic routes, organize routes with route groups, implement layouts and shared UI, handle errors and loading states, create API routes, or navigate between pages in Next.js applications.
---

# App Router and File-Based Routing - Modern Navigation

## Overview

The Next.js App Router provides a modern, intuitive approach to routing based on file-system conventions. Instead of manually defining routes, you create routes by simply creating files and folders in the `app` directory. This approach makes routing predictable, type-safe, and easy to understand.

## File-Based Routing Basics

### Route Structure
Routes in the App Router are determined by the folder structure in the `app` directory:
- Each folder represents a URL segment
- The `page.js` file in a folder creates the route
- No need to manually define routes
- Type-safe routing with automatic path validation

### Basic Route Structure
```
app/
├── page.js              → /
├── about/
│   └── page.js          → /about
├── blog/
│   └── page.js          → /blog
└── contact/
    └── page.js          → /contact
```

## Dynamic Routes

### Single Dynamic Segment
Use square brackets `[param]` to create dynamic routes:

```
app/blog/[id]/page.js → /blog/1, /blog/2, etc.
```

```javascript
// app/blog/[id]/page.js
export default function Post({ params }) {
  return <h1>Post {params.id}</h1>
}
```

### Multiple Dynamic Segments
You can have multiple dynamic segments in a single route:

```
app/blog/[category]/[slug]/page.js → /blog/tech/react-tutorial, /blog/life/travel-blog, etc.
```

```javascript
// app/blog/[category]/[slug]/page.js
export default function Post({ params }) {
  return (
    <article>
      <h1>Category: {params.category}</h1>
      <h2>Post: {params.slug}</h2>
    </article>
  )
}
```

### Catch-All Routes
Use three dots `[...slug]` to capture multiple segments:

```
app/docs/[...slug]/page.js → /docs/a, /docs/a/b, /docs/a/b/c, etc.
```

```javascript
// app/docs/[...slug]/page.js
export default function Docs({ params }) {
  // /docs/a/b/c → params.slug = ['a', 'b', 'c']
  return <h1>Docs: {params.slug.join('/')}</h1>
}
```

### Optional Catch-All Routes
Use double square brackets `[[...slug]]` for optional catch-all routes:

```
app/docs/[[...slug]]/page.js → /docs (matches), /docs/a (matches), /docs/a/b (matches)
```

```javascript
// app/docs/[[...slug]]/page.js
export default function Docs({ params }) {
  // /docs → params.slug = undefined
  // /docs/a/b → params.slug = ['a', 'b']
  const path = params.slug?.join('/') || 'home'
  return <h1>Documentation: {path}</h1>
}
```

## Nested Routes and Layouts

### Nested Route Structure
Create nested routes by organizing folders in a hierarchy:

```
app/
├── dashboard/
│   ├── layout.js
│   ├── page.js          → /dashboard
│   ├── profile/
│   │   └── page.js      → /dashboard/profile
│   └── settings/
│       └── page.js      → /dashboard/settings
```

### Layouts
Layouts define shared UI that persists across multiple routes:

```javascript
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/profile">Profile</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}
```

### Root Layout
The root layout is required and must contain the `<html>` and `<body>` tags:

```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>Global Header</header>
        {children}
        <footer>Global Footer</footer>
      </body>
    </html>
  )
}
```

## Route Groups

Route groups allow you to organize routes without affecting the URL structure. Use parentheses `(groupname)`:

```
app/
├── (auth)/
│   ├── layout.js        → Shared auth layout
│   ├── login/
│   │   └── page.js      → /login
│   └── signup/
│       └── page.js      → /signup
├── (shop)/
│   ├── layout.js        → Shared shop layout
│   ├── products/
│   │   └── page.js      → /products
│   └── cart/
│       └── page.js      → /cart
```

```javascript
// app/(auth)/layout.js
export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <header>Login/Signup Area</header>
      {children}
    </div>
  )
}
```

## Special Files

### Error Handling with error.js
Create error boundaries for specific route segments:

```javascript
// app/dashboard/error.js
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Loading States with loading.js
Show loading UI while content is being fetched:

```javascript
// app/dashboard/loading.js
export default function Loading() {
  return <div>Loading dashboard...</div>
}
```

### Not Found Pages with not-found.js
Handle 404 errors for specific route segments:

```javascript
// app/blog/[slug]/not-found.js
export default function NotFound() {
  return (
    <div>
      <h1>Post Not Found</h1>
      <p>The requested blog post could not be found.</p>
    </div>
  )
}
```

## API Routes

Create API endpoints in the `app/api` directory:

```
app/api/
├── users/
│   └── route.js         → /api/users
├── posts/
│   └── [id]/
│       └── route.js     → /api/posts/[id]
```

```javascript
// app/api/users/route.js
export async function GET() {
  const users = await db.users.findAll()
  return Response.json(users)
}

export async function POST(request) {
  const data = await request.json()
  const user = await db.users.create(data)
  return Response.json(user, { status: 201 })
}

// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const user = await db.users.findById(params.id)
  return Response.json(user)
}

export async function PUT(request, { params }) {
  const data = await request.json()
  const user = await db.users.update(params.id, data)
  return Response.json(user)
}

export async function DELETE(request, { params }) {
  await db.users.delete(params.id)
  return new Response(null, { status: 204 })
}
```

## Navigation

### Using Link Component
The `Link` component provides client-side navigation with automatic prefetching:

```javascript
// app/page.js
import Link from 'next/link'

export default function Home() {
  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/blog/first-post">First Post</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  )
}
```

### Programmatic Navigation with useRouter
Use the `useRouter` hook for programmatic navigation:

```javascript
// components/NavigationButton.js
'use client'

import { useRouter } from 'next/navigation'

export default function NavigationButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard')
  }

  return <button onClick={handleClick}>Go to Dashboard</button>
}
```

### Advanced Link Usage
```javascript
// app/page.js
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* Basic link */}
      <Link href="/about">About</Link>

      {/* Dynamic route */}
      <Link href="/blog/123">Post 123</Link>

      {/* External link */}
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        External Link
      </Link>

      {/* Link with query params */}
      <Link href={{ pathname: '/search', query: { q: 'next.js' } }}>
        Search Next.js
      </Link>

      {/* Disable prefetch */}
      <Link href="/heavy-page" prefetch={false}>
        Heavy Page (no prefetch)
      </Link>
    </div>
  )
}
```

## Route Priority

Routes are matched in the following order of priority:
1. Static routes (e.g., `/about`)
2. Dynamic routes (e.g., `/blog/[id]`)
3. Catch-all routes (e.g., `/blog/[...slug]`)
4. Optional catch-all routes (e.g., `/blog/[[...slug]]`)

## Real-World Examples

### Example 1: Blog Site
```
app/
├── page.js              → Home page
├── blog/
│   ├── page.js          → All blog posts
│   └── [slug]/
│       ├── page.js      → Individual blog post
│       └── not-found.js → Post not found
└── about/
    └── page.js          → About page
```

### Example 2: E-commerce Site
```
app/
├── page.js              → Home page
├── products/
│   ├── page.js          → All products
│   └── [id]/
│       └── page.js      → Product detail
├── cart/
│   └── page.js          → Shopping cart
└── (auth)/
    ├── login/
    │   └── page.js      → Login page
    └── signup/
        └── page.js      → Signup page
```

### Example 3: SaaS Application
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.js      → Login page
│   └── signup/
│       └── page.js      → Signup page
├── dashboard/
│   ├── layout.js        → Dashboard layout
│   ├── page.js          → Dashboard home
│   ├── profile/
│   │   └── page.js      → User profile
│   └── settings/
│       └── page.js      → Settings page
└── api/
    └── auth/
        └── route.js     → Authentication API
```

## Common Mistakes to Avoid

1. **Using pages/ instead of app/**: With the App Router, use the `app` directory, not `pages`

2. **Forgetting page.js file**: Folders alone don't create routes - you need a `page.js` file

3. **Wrong params syntax**: Always access parameters via the `params` object (e.g., `params.id`)

4. **Confusing route groups with URLs**: Parentheses `(group)` don't appear in the URL - they're only for organization

5. **Nesting too deep**: Keep your folder structure shallow for easier navigation

6. **Not handling loading states**: Always implement `loading.js` for better UX

7. **Missing error boundaries**: Add `error.js` files to gracefully handle errors

## Best Practices

1. **Keep routes logical and organized**: Use clear folder names that match your URL structure

2. **Use route groups for related pages**: Organize related functionality with route groups

3. **Create layouts for shared UI**: Use layouts to avoid duplicating common elements

4. **Handle errors and loading states**: Implement proper error boundaries and loading indicators

5. **Use Link for navigation**: Prefer the `Link` component for internal navigation

6. **Keep folder structure shallow**: Avoid deep nesting for better maintainability

7. **Name pages clearly**: Use descriptive names for your route segments

8. **Leverage dynamic routes**: Use dynamic routes for collections of similar content

## Quick Reference

### Creating Routes
- Folder = URL segment
- `page.js` = creates route
- `[id]` = dynamic segment
- `(...)` = route group (organization only)

### Special Files
- `layout.js` = shared UI
- `error.js` = error boundary
- `loading.js` = loading state
- `page.js` = route content
- `route.js` = API endpoint
- `not-found.js` = 404 page

### Navigation
```javascript
import Link from 'next/link'
// <Link href="/about">About</Link>

// Programmatic navigation
'use client'
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/dashboard')
```

### Dynamic Route Parameters
```javascript
// app/blog/[id]/page.js
export default function Post({ params }) {
  return <h1>Post {params.id}</h1>
}
```

## References

For detailed information on specific topics, see the reference files:
- [DYNAMIC_ROUTES.md](references/DYNAMIC_ROUTES.md) - Advanced dynamic routing patterns
- [LAYOUTS.md](references/LAYOUTS.md) - Layout system and nested layouts
- [NAVIGATION.md](references/NAVIGATION.md) - Navigation patterns and techniques
- [API_ROUTES.md](references/API_ROUTES.md) - Creating API endpoints
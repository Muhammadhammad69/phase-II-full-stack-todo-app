# Next.js Layouts Guide

## Overview

Layouts in Next.js App Router allow you to create shared UI that persists across multiple routes while preserving React state between route changes. Unlike pages, layouts are not re-rendered when navigating between routes, which provides better performance and user experience.

## Root Layout

### Required Root Layout
Every Next.js app must have a root layout in `app/layout.js` that contains the `<html>` and `<body>` tags:

```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>Global Header</header>
        <main>{children}</main>
        <footer>Global Footer</footer>
      </body>
    </html>
  )
}
```

### Adding Metadata to Root Layout
You can define metadata that applies to all routes in the root layout:

```javascript
// app/layout.js
export const metadata = {
  title: 'My App',
  description: 'Welcome to my application',
  icons: {
    icon: '/favicon.ico',
  },
}

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

## Nested Layouts

### Basic Nested Layout
Create layouts for specific route segments by adding `layout.js` files in route folders:

```
app/
├── layout.js          # Root layout
├── page.js            # Home page
├── dashboard/
│   ├── layout.js      # Dashboard layout
│   ├── page.js        # Dashboard home
│   └── settings/
│       ├── layout.js  # Settings layout
│       └── page.js    # Settings page
```

```javascript
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <nav className="sidebar">
        <ul>
          <li><a href="/dashboard">Overview</a></li>
          <li><a href="/dashboard/settings">Settings</a></li>
          <li><a href="/dashboard/profile">Profile</a></li>
        </ul>
      </nav>
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  )
}
```

### Multiple Nested Layouts
Layouts are nested automatically. Each layout wraps the next layout or page in the hierarchy:

```
app/
├── layout.js                    # Root layout (wraps everything)
├── dashboard/
│   ├── layout.js              # Dashboard layout (wraps dashboard pages)
│   ├── page.js                # Dashboard home
│   └── settings/
│       ├── layout.js          # Settings layout (wraps settings pages)
│       └── page.js            # Settings page
```

The resulting structure when visiting `/dashboard/settings`:
```html
<html>
  <body>
    <!-- Root layout content -->
    <header>Global Header</header>
    <div class="dashboard">
      <!-- Dashboard layout content -->
      <nav class="sidebar">...</nav>
      <div class="dashboard-content">
        <!-- Settings layout content -->
        <aside>Settings sidebar</aside>
        <main>
          <!-- Settings page content -->
          Settings page content
        </main>
      </div>
    </div>
    <footer>Global Footer</footer>
  </body>
</html>
```

## Layout Properties and Features

### Children Prop
Layouts receive a `children` prop that contains the nested layout or page:

```javascript
// app/blog/layout.js
export default function BlogLayout({ children }) {
  return (
    <section className="blog-section">
      <aside className="blog-sidebar">
        <h2>Blog Topics</h2>
        <ul>
          <li>Technology</li>
          <li>Design</li>
          <li>Business</li>
        </ul>
      </aside>
      <article className="blog-content">
        {children} {/* This is where the page content goes */}
      </article>
    </section>
  )
}
```

### Preserving State
Layouts preserve React state between route changes within their scope:

```javascript
// app/dashboard/layout.js
import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="dashboard-layout">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        Toggle Sidebar
      </button>
      <nav className={sidebarOpen ? 'open' : 'closed'}>
        <ul>Dashboard Navigation</ul>
      </nav>
      <main>
        {children}
      </main>
    </div>
  )
}
```

When navigating between `/dashboard/settings` and `/dashboard/profile`, the `sidebarOpen` state is preserved.

## Conditional Layouts

### Layout Based on Route Parameters
You can create different layouts based on route parameters:

```javascript
// app/products/[category]/layout.js
export default function ProductLayout({ children, params }) {
  const { category } = params

  return (
    <div className={`product-layout product-layout-${category}`}>
      <header>
        <h1>Products in {category}</h1>
      </header>
      <div className="product-content">
        {children}
      </div>
    </div>
  )
}
```

### Layout Based on User Role
```javascript
// app/admin/layout.js
import { auth } from '@/lib/auth'

export default async function AdminLayout({ children }) {
  const user = await auth()

  if (!user || user.role !== 'admin') {
    // Redirect to login or show error
    return <div>Access denied</div>
  }

  return (
    <div className="admin-layout">
      <nav>Admin Navigation</nav>
      <main>{children}</main>
    </div>
  )
}
```

## Layout Composition Patterns

### Shared Layout Components
Create reusable layout components:

```javascript
// components/AppLayout.js
export default function AppLayout({ children, sidebar, header }) {
  return (
    <div className="app-layout">
      {header && <header className="app-header">{header}</header>}
      <div className="app-body">
        {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}

// app/dashboard/layout.js
import AppLayout from '@/components/AppLayout'
import DashboardSidebar from '@/components/DashboardSidebar'

export default function DashboardLayout({ children }) {
  return (
    <AppLayout
      header={<nav>Dashboard Header</nav>}
      sidebar={<DashboardSidebar />}
    >
      {children}
    </AppLayout>
  )
}
```

### Layout with Data Fetching
Layouts can fetch data that's shared across multiple pages:

```javascript
// app/dashboard/layout.js
import { getDashboardData } from '@/lib/dashboard'

export default async function DashboardLayout({ children }) {
  const dashboardData = await getDashboardData()

  return (
    <div className="dashboard-layout">
      <header>
        <h1>Welcome, {dashboardData.user.name}</h1>
        <p>Active items: {dashboardData.stats.activeItems}</p>
      </header>
      <nav>
        <ul>
          {dashboardData.navigation.map(item => (
            <li key={item.id}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  )
}
```

## Advanced Layout Features

### Template vs Layout
Use `template.js` when you want to re-render the layout for each navigation:

```javascript
// app/dashboard/template.js
import { useEffect } from 'react'

export default function DashboardTemplate({ children }) {
  useEffect(() => {
    // This effect runs on each navigation
    console.log('Dashboard template mounted')
  }, [])

  return (
    <div className="dashboard-template">
      <div className="dashboard-content">{children}</div>
    </div>
  )
}
```

### Multiple Root Layouts
You can have different root layouts for different sections:

```
app/
├── (marketing)/
│   ├── layout.js      # Marketing site layout
│   └── ...
├── (app)/
│   ├── layout.js      # Application layout
│   └── ...
└── layout.js          # Default root layout
```

```javascript
// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <html lang="en">
      <body className="marketing-site">
        <header>Marketing Site Header</header>
        <main>{children}</main>
        <footer>Marketing Site Footer</footer>
      </body>
    </html>
  )
}
```

## Layout Best Practices

### Keep Layouts Lightweight
Layouts should focus on structure and shared UI, not heavy computations:

```javascript
// ❌ Avoid heavy computations in layout
export default function HeavyLayout({ children }) {
  const heavyComputation = performHeavyCalculation() // This runs on every route change

  return (
    <div>
      <header>{heavyComputation}</header>
      {children}
    </div>
  )
}

// ✅ Better approach - move heavy computation to page
export default function LightLayout({ children }) {
  return (
    <div>
      <header>Light Header</header>
      {children}
    </div>
  )
}
```

### Use CSS Classes for Different Layouts
Apply different styling based on the current route:

```javascript
// app/layout.js
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  return (
    <html lang="en" className={pathname.startsWith('/admin') ? 'admin-layout' : 'user-layout'}>
      <body>{children}</body>
    </html>
  )
}
```

### Avoid Duplicate Content
Don't duplicate content across layouts:

```javascript
// ❌ Don't duplicate navigation in multiple layouts
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div>
      <nav>Dashboard Navigation</nav> {/* Duplicate of root nav */}
      {children}
    </div>
  )
}

// ✅ Better approach - use a single source of truth
// components/Navigation.js
export default function Navigation() {
  return <nav>Main Navigation</nav>
}

// app/layout.js
import Navigation from '@/components/Navigation'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
```

## Layout Error Handling

### Layout Error Boundaries
You can add error boundaries to layouts:

```javascript
// app/error.js
'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Graceful Fallbacks
Handle cases where layout data fails to load:

```javascript
// app/dashboard/layout.js
import { Suspense } from 'react'

function DashboardLayoutContent({ children }) {
  // This component will handle the actual layout
  // with the assumption that data is available
  return (
    <div className="dashboard-layout">
      <nav>Dashboard Navigation</nav>
      <main>{children}</main>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </Suspense>
  )
}
```

Layouts are a powerful feature in Next.js that enable you to create consistent UI structures while maintaining React state and providing optimal performance. Understanding how to properly structure and use layouts is key to building well-organized Next.js applications.
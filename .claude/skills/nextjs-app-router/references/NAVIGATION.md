# Next.js Navigation Guide

## Overview

Navigation in Next.js App Router is handled through the `Link` component for declarative navigation and the `useRouter` hook for programmatic navigation. Next.js provides client-side navigation with automatic prefetching for better performance.

## Link Component

### Basic Usage
The `Link` component is the primary way to navigate between routes in Next.js:

```javascript
// app/page.js
import Link from 'next/link'

export default function HomePage() {
  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
    </nav>
  )
}
```

### Dynamic Routes with Link
```javascript
// app/products/page.js
import Link from 'next/link'

export default function ProductsPage() {
  const products = [
    { id: 1, name: 'Laptop' },
    { id: 2, name: 'Phone' },
    { id: 3, name: 'Tablet' }
  ]

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link href={`/products/${product.id}`}>
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Link with Query Parameters
```javascript
// app/search/page.js
import Link from 'next/link'

export default function SearchPage() {
  return (
    <div>
      <Link href={{ pathname: '/results', query: { q: 'react', page: 1 } }}>
        Search for React (page 1)
      </Link>

      <Link href="/results?q=nextjs&page=2">
        Search for Next.js (page 2)
      </Link>
    </div>
  )
}
```

### External Links
```javascript
// app/external/page.js
import Link from 'next/link'

export default function ExternalPage() {
  return (
    <div>
      <Link
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit External Site
      </Link>
    </div>
  )
}
```

### Disabling Prefetching
```javascript
// app/heavy/page.js
import Link from 'next/link'

export default function HeavyPage() {
  return (
    <div>
      <Link href="/very-heavy-page" prefetch={false}>
        Heavy Page (no prefetch)
      </Link>
    </div>
  )
}
```

### Styling Active Links
```javascript
// app/navigation/page.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav>
      <Link
        href="/"
        className={pathname === '/' ? 'active' : ''}
      >
        Home
      </Link>
      <Link
        href="/about"
        className={pathname === '/about' ? 'active' : ''}
      >
        About
      </Link>
    </nav>
  )
}
```

## useRouter Hook

### Basic Programmatic Navigation
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

### Navigation Methods
```javascript
// components/AdvancedNavigation.js
'use client'

import { useRouter } from 'next/navigation'

export default function AdvancedNavigation() {
  const router = useRouter()

  return (
    <div>
      <button onClick={() => router.push('/new-page')}>
        Push new page (adds to history)
      </button>

      <button onClick={() => router.replace('/replace-page')}>
        Replace current page (replaces history)
      </button>

      <button onClick={() => router.back()}>
        Go back
      </button>

      <button onClick={() => router.forward()}>
        Go forward
      </button>

      <button onClick={() => router.refresh()}>
        Refresh current page
      </button>
    </div>
  )
}
```

### Navigation with State
```javascript
// components/NavigationWithState.js
'use client'

import { useRouter } from 'next/navigation'

export default function NavigationWithState() {
  const router = useRouter()

  const navigateWithState = () => {
    // Store state in URL search parameters
    router.push('/page?message=hello&user=123')
  }

  return <button onClick={navigateWithState}>Navigate with State</button>
}
```

## usePathname Hook

### Getting Current Path
```javascript
// components/CurrentPath.js
'use client'

import { usePathname } from 'next/navigation'

export default function CurrentPath() {
  const pathname = usePathname()

  return <div>Current path: {pathname}</div>
}
```

### Conditional Rendering Based on Path
```javascript
// components/ConditionalContent.js
'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalContent() {
  const pathname = usePathname()

  return (
    <div>
      {pathname === '/admin' && <div>Admin Panel</div>}
      {pathname.startsWith('/blog') && <div>Blog Content</div>}
      {pathname.includes('/user') && <div>User Content</div>}
    </div>
  )
}
```

## useSearchParams Hook

### Accessing Query Parameters
```javascript
// app/search-results/page.js
'use client'

import { useSearchParams } from 'next/navigation'

export default function SearchResults() {
  const searchParams = useSearchParams()

  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'
  const category = searchParams.get('category')

  return (
    <div>
      <h1>Search Results</h1>
      <p>Query: {query}</p>
      <p>Page: {page}</p>
      <p>Category: {category}</p>
    </div>
  )
}
```

### Working with Multiple Query Parameters
```javascript
// components/FilterComponent.js
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function FilterComponent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentCategory = searchParams.get('category') || 'all'
  const currentSort = searchParams.get('sort') || 'newest'

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.set(key, newFilters[key])
      } else {
        params.delete(key)
      }
    })

    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <select
        value={currentCategory}
        onChange={(e) => updateFilters({ category: e.target.value })}
      >
        <option value="all">All Categories</option>
        <option value="tech">Technology</option>
        <option value="design">Design</option>
      </select>

      <select
        value={currentSort}
        onChange={(e) => updateFilters({ sort: e.target.value })}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="popular">Most Popular</option>
      </select>
    </div>
  )
}
```

## Advanced Navigation Patterns

### Conditional Navigation
```javascript
// components/ConditionalNavigation.js
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ConditionalNavigation() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleNavigation = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <div>
      <button onClick={handleNavigation}>
        {isAuthenticated ? 'Go to Dashboard' : 'Login'}
      </button>
      <button onClick={() => setIsAuthenticated(!isAuthenticated)}>
        Toggle Auth Status
      </button>
    </div>
  )
}
```

### Navigation with Confirmation
```javascript
// components/ConfirmNavigation.js
'use client'

import { useRouter } from 'next/navigation'

export default function ConfirmNavigation() {
  const router = useRouter()

  const handleNavigation = () => {
    if (confirm('Are you sure you want to leave this page?')) {
      router.push('/next-page')
    }
  }

  return <button onClick={handleNavigation}>Navigate with Confirmation</button>
}
```

### Navigation with Loading State
```javascript
// components/LoadingNavigation.js
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoadingNavigation() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigation = async () => {
    setIsLoading(true)
    try {
      // Simulate some async operation
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/target-page')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={handleNavigation} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Navigate'}
    </button>
  )
}
```

## Navigation Performance

### Prefetching Configuration
Next.js automatically prefetches visible links. You can control this behavior:

```javascript
// app/navigation/page.js
import Link from 'next/link'

export default function NavigationPage() {
  return (
    <div>
      {/* Prefetch by default */}
      <Link href="/dashboard">Dashboard</Link>

      {/* Disable prefetching */}
      <Link href="/heavy-page" prefetch={false}>
        Heavy Page
      </Link>

      {/* Prefetch on hover */}
      <Link href="/profile" prefetch="hover">
        Profile
      </Link>
    </div>
  )
}
```

### Prefetching in Layouts
```javascript
// components/Navigation.js
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Navigation() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch a route programmatically
    router.prefetch('/dashboard')
  }, [router])

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  )
}
```

## Error Handling in Navigation

### Navigation Error Boundaries
```javascript
// app/navigation-error/page.js
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NavigationErrorPage() {
  const router = useRouter()
  const [error, setError] = useState(null)

  const handleNavigation = async () => {
    try {
      router.push('/some-page')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <button onClick={handleNavigation}>Navigate</button>
      {error && <div>Error: {error}</div>}
    </div>
  )
}
```

### Safe Navigation Wrapper
```javascript
// lib/safe-navigation.js
'use client'

import { useRouter } from 'next/navigation'

export function useSafeRouter() {
  const router = useRouter()

  const safePush = async (url) => {
    try {
      router.push(url)
    } catch (error) {
      console.error('Navigation error:', error)
      // Optionally redirect to error page
      router.push('/error')
    }
  }

  return { ...router, push: safePush }
}

// Usage
// components/SafeNavigation.js
import { useSafeRouter } from '@/lib/safe-navigation'

export default function SafeNavigation() {
  const { push } = useSafeRouter()

  return <button onClick={() => push('/dashboard')}>Safe Navigation</button>
}
```

## Navigation Best Practices

### 1. Use Link for Internal Navigation
Always use the `Link` component for internal navigation instead of regular `<a>` tags:

```javascript
// ❌ Don't do this
<a href="/about">About</a>

// ✅ Do this
import Link from 'next/link'
<Link href="/about">About</Link>
```

### 2. Optimize Prefetching
Be mindful of prefetching heavy pages:

```javascript
// For heavy dashboard with lots of data
<Link href="/dashboard" prefetch={false}>
  Dashboard
</Link>
```

### 3. Use Relative vs Absolute Paths Appropriately
```javascript
// Absolute paths (recommended for most cases)
<Link href="/about">About</Link>

// For nested routes, relative paths might be useful
<Link href="../about">About</Link>
```

### 4. Handle Query Parameters Properly
```javascript
// Use URLSearchParams for complex query manipulation
const updateQuery = (newParams) => {
  const params = new URLSearchParams(window.location.search)
  Object.entries(newParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  })
  router.push(`?${params.toString()}`)
}
```

### 5. Navigation in Server Components
For navigation in server components, use the `redirect` function:

```javascript
// app/server-navigation/page.js
import { redirect } from 'next/navigation'

export default async function ServerNavigationPage({ searchParams }) {
  if (searchParams.needsRedirect) {
    redirect('/redirect-target')
  }

  return <div>Server Component</div>
}
```

Navigation in Next.js provides a smooth, fast user experience with client-side routing, automatic prefetching, and various hooks for different use cases. Understanding these navigation patterns is crucial for building responsive and user-friendly Next.js applications.
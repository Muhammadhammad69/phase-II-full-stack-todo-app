# Next.js Data Fetching in Server Components

## Overview

Server Components in Next.js App Router provide powerful data fetching capabilities that run on the server. This approach offers better performance, security, and SEO compared to client-side data fetching.

## Basic Data Fetching in Server Components

### Fetching from External APIs
```javascript
// app/products/page.js
export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products')
  const products = await res.json()

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

### Fetching from Database
```javascript
// app/users/page.js
import { db } from '@/lib/db'

export default async function UsersPage() {
  const users = await db.users.findAll()

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  )
}
```

## Advanced Data Fetching Patterns

### Parallel Data Fetching
```javascript
// app/dashboard/page.js
export default async function DashboardPage() {
  // Fetch multiple data sources in parallel
  const [user, posts, analytics] = await Promise.all([
    fetch('/api/user').then(res => res.json()),
    fetch('/api/posts').then(res => res.json()),
    fetch('/api/analytics').then(res => res.json())
  ])

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <div>
        <h2>Your Posts ({posts.length})</h2>
        <h2>Analytics: {analytics.views} views</h2>
      </div>
    </div>
  )
}
```

### Sequential Data Fetching
```javascript
// app/user/[id]/page.js
export default async function UserPage({ params }) {
  // First fetch user data
  const user = await fetch(`/api/users/${params.id}`).then(res => res.json())

  // Then fetch user-specific data
  const userPosts = await fetch(`/api/users/${params.id}/posts`).then(res => res.json())

  return (
    <div>
      <h1>{user.name}</h1>
      <div>
        {userPosts.map(post => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    </div>
  )
}
```

## Caching Strategies

### Automatic Request Memoization
Server Components automatically cache fetch requests with the same URL:

```javascript
// app/data-fetching/page.js
async function getApiData() {
  // This request will be cached automatically
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function DataPage() {
  const data1 = await getApiData() // First call
  const data2 = await getApiData() // Same result, cached

  return <div>{data1.length} items</div>
}
```

### Configuring Cache Behavior
```javascript
// app/products/page.js
export default async function ProductsPage() {
  // Cache for 300 seconds (5 minutes)
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 300 }
  })
  const products = await res.json()

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Using revalidate Property
```javascript
// app/page.js
// Revalidate every hour (3600 seconds)
export const revalidate = 3600

export default async function HomePage() {
  const data = await fetch('https://api.example.com/home-data').then(res => res.json())

  return <div>{data.content}</div>
}
```

### Cache Tags for Granular Control
```javascript
// app/actions.js
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(productId) {
  // Update product in database
  await db.products.update(productId, { /* ... */ })

  // Revalidate cache using tag
  revalidateTag('products')
  revalidateTag(`product-${productId}`)
}

// app/products/[id]/page.js
export default async function ProductPage({ params }) {
  const res = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { tags: [`product-${params.id}`] }
  })
  const product = await res.json()

  return <div>{product.name}</div>
}

// app/products/page.js
export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products', {
    next: { tags: ['products'] }
  })
  const products = await res.json()

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## Streaming and Suspense

### Streaming with Suspense
```javascript
// app/page.js
import { Suspense } from 'react'
import ProductList from './product-list'
import UserList from './user-list'

export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <div>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductList />
        </Suspense>
        <Suspense fallback={<div>Loading users...</div>}>
          <UserList />
        </Suspense>
      </div>
    </div>
  )
}

// app/product-list.js
export default async function ProductList() {
  // This will stream when ready
  const products = await fetch('https://api.example.com/products').then(res => res.json())

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Delayed Data Fetching
```javascript
// app/components/SlowComponent.js
export default async function SlowComponent() {
  // Simulate slow data fetching
  await new Promise(resolve => setTimeout(resolve, 2000))

  const data = await fetch('https://api.example.com/slow-data').then(res => res.json())

  return <div>Slow data: {data.value}</div>
}

// app/page.js
import { Suspense } from 'react'
import SlowComponent from './components/SlowComponent'

export default function Page() {
  return (
    <div>
      <h1>Fast content</h1>
      <Suspense fallback={<div>Loading slow component...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

## Error Handling in Data Fetching

### Handling Fetch Errors
```javascript
// app/error-handling/page.js
export default async function ErrorHandlingPage() {
  let data = null
  let error = null

  try {
    const res = await fetch('https://api.example.com/data')

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    data = await res.json()
  } catch (err) {
    error = err.message
  }

  if (error) {
    return <div>Error loading data: {error}</div>
  }

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### Using Error Boundaries
```javascript
// app/error.js
'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

## Dynamic Data Fetching

### Fetching with Dynamic Parameters
```javascript
// app/blog/[slug]/page.js
export default async function BlogPostPage({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(res => res.json())

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

### Fetching with Search Parameters
```javascript
// app/search/page.js
export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || ''
  const category = searchParams.category || 'all'

  const res = await fetch(
    `https://api.example.com/search?q=${query}&category=${category}`
  )
  const results = await res.json()

  return (
    <div>
      <h1>Search Results for: {query}</h1>
      <div>
        {results.map(item => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    </div>
  )
}
```

## Performance Optimization

### Using unstable_cache for Complex Data
```javascript
// app/lib/cache.js
import { unstable_cache } from 'next/cache'

export const getCachedUserPosts = unstable_cache(
  async (userId) => {
    const posts = await fetch(`https://api.example.com/users/${userId}/posts`).then(res => res.json())
    return posts
  },
  ['user-posts'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
)

// app/user-posts.js
import { getCachedUserPosts } from '@/lib/cache'

export default async function UserPosts({ userId }) {
  const posts = await getCachedUserPosts(userId)

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

### Conditional Fetching
```javascript
// app/conditional-fetching/page.js
export default async function ConditionalPage({ searchParams }) {
  let data = []

  if (searchParams.load === 'true') {
    data = await fetch('https://api.example.com/data').then(res => res.json())
  }

  return (
    <div>
      <a href="?load=true">Load Data</a>
      {data.length > 0 ? (
        <div>
          {data.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      ) : (
        <p>Data not loaded</p>
      )}
    </div>
  )
}
```

## Integration with Client Components

### Passing Data to Client Components
```javascript
// app/dashboard/page.js
import ClientChart from './client-chart'

export default async function DashboardPage() {
  // Fetch data server-side
  const analyticsData = await fetch('https://api.example.com/analytics').then(res => res.json())

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass server-fetched data to client component */}
      <ClientChart initialData={analyticsData} />
    </div>
  )
}

// app/client-chart.js
'use client'

import { useState, useEffect } from 'react'

export default function ClientChart({ initialData }) {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    // Client-side updates can happen here
    const interval = setInterval(async () => {
      // Fetch updated data
      const newData = await fetch('/api/live-analytics').then(res => res.json())
      setData(newData)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Render chart with data */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

## Best Practices

### 1. Always Handle Errors
```javascript
// ❌ Bad - no error handling
export default async function BadPage() {
  const data = await fetch('https://api.example.com/data').then(res => res.json())
  return <div>{data.items.length}</div>
}

// ✅ Good - with error handling
export default async function GoodPage() {
  try {
    const res = await fetch('https://api.example.com/data')
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    return <div>{data.items.length}</div>
  } catch (error) {
    return <div>Failed to load data</div>
  }
}
```

### 2. Use Appropriate Cache Settings
```javascript
// For frequently changing data
const res = await fetch('https://api.example.com/live-data', {
  next: { revalidate: 10 } // Revalidate every 10 seconds
})

// For static data
const res = await fetch('https://api.example.com/static-content', {
  next: { revalidate: 3600 } // Revalidate every hour
})
```

### 3. Optimize Fetch Calls
```javascript
// ❌ Multiple separate calls
const users = await fetch('/api/users').then(res => res.json())
const posts = await fetch('/api/posts').then(res => res.json())
const comments = await fetch('/api/comments').then(res => res.json())

// ✅ Single call with multiple endpoints
const [users, posts, comments] = await Promise.all([
  fetch('/api/users').then(res => res.json()),
  fetch('/api/posts').then(res => res.json()),
  fetch('/api/comments').then(res => res.json())
])
```

Server Components provide powerful data fetching capabilities that should be leveraged for optimal performance. Always consider caching strategies, error handling, and the user experience when implementing data fetching patterns.
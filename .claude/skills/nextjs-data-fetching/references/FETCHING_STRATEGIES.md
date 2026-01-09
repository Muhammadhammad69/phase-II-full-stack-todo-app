# Next.js Data Fetching Strategies

## Overview

Next.js provides multiple data fetching strategies optimized for different use cases. Understanding when and how to use each strategy is crucial for building performant applications.

## Server-Side Rendering (SSR)

### Basic Server-Side Fetching
Server Components in the App Router can fetch data directly:

```javascript
// app/products/page.js
export default async function ProductsPage() {
  // This fetch runs on the server
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

### Server Component with Dynamic Parameters
Use dynamic parameters to fetch specific data:

```javascript
// app/products/[id]/page.js
export default async function ProductPage({ params }) {
  const res = await fetch(`https://api.example.com/products/${params.id}`)
  const product = await res.json()

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
    </div>
  )
}
```

## Static Site Generation (SSG)

### Static Generation with Revalidation
Pre-generate pages at build time with periodic revalidation:

```javascript
// app/products/[id]/page.js
export default async function ProductPage({ params }) {
  // This page will be regenerated every hour
  const res = await fetch(
    `https://api.example.com/products/${params.id}`,
    { next: { revalidate: 3600 } } // Revalidate every hour
  )
  const product = await res.json()

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  )
}
```

### Generate Static Parameters
Pre-generate dynamic routes at build time:

```javascript
// app/products/[id]/page.js
export async function generateStaticParams() {
  // Fetch the list of all products at build time
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json())

  // Return the list of params to pre-generate
  return products.map(product => ({
    id: product.id.toString()
  }))
}

export default async function ProductPage({ params }) {
  const res = await fetch(`https://api.example.com/products/${params.id}`)
  const product = await res.json()

  return <div>{product.name}</div>
}
```

## Incremental Static Regeneration (ISR)

### ISR with Time-Based Revalidation
Allow pages to be updated incrementally:

```javascript
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const res = await fetch(
    `https://api.example.com/posts/${params.slug}`,
    { next: { revalidate: 60 } } // Revalidate every minute
  )
  const post = await res.json()

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

### ISR with Cache Tags
Use cache tags for more granular control:

```javascript
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const res = await fetch(
    `https://api.example.com/posts/${params.slug}`,
    { next: { tags: ['blog', `post-${params.slug}`] } }
  )
  const post = await res.json()

  return <div>{post.title}</div>
}

// In a Server Action, invalidate specific posts
// app/actions.js
'use server'

import { revalidateTag } from 'next/cache'

export async function updatePost(slug) {
  // Update the post in the database
  await db.posts.update({ where: { slug }, data: { /* ... */ } })

  // Revalidate the specific post
  revalidateTag(`post-${slug}`)

  // Revalidate all blog posts
  revalidateTag('blog')
}
```

## Client-Side Data Fetching

### Client Component with useEffect
Use client-side fetching for dynamic or user-specific data:

```javascript
// app/components/UserDashboard.js
'use client'

import { useState, useEffect } from 'react'

export default function UserDashboard() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/dashboard')
        if (!response.ok) throw new Error('Failed to fetch')

        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Welcome, {userData?.name}</h2>
      <p>Items: {userData?.items?.length}</p>
    </div>
  )
}
```

### SWR for Client-Side Data Fetching
Use SWR for more advanced client-side data fetching:

```javascript
// app/components/PostsList.js
'use client'

import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function PostsList() {
  const { data, error, isLoading } = useSWR('/api/posts', fetcher)

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## Parallel Data Fetching

### Multiple Requests in Parallel
Fetch multiple data sources simultaneously:

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
        <h2>Posts: {posts.length}</h2>
        <h2>Views: {analytics.views}</h2>
      </div>
    </div>
  )
}
```

## Conditional Data Fetching

### Fetch Based on Parameters
Conditionally fetch data based on URL parameters:

```javascript
// app/search/page.js
export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || ''
  const category = searchParams.category || 'all'
  const page = parseInt(searchParams.page) || 1

  let data = []
  if (query) {
    const res = await fetch(
      `https://api.example.com/search?q=${encodeURIComponent(query)}&category=${category}&page=${page}`
    )
    data = await res.json()
  }

  return (
    <div>
      <h1>Search Results</h1>
      {data.length > 0 ? (
        <div>
          {data.map(item => (
            <div key={item.id}>{item.title}</div>
          ))}
        </div>
      ) : (
        <p>No results found</p>
      )}
    </div>
  )
}
```

## Error Handling in Data Fetching

### Robust Error Handling
Handle fetch errors gracefully:

```javascript
// app/products/page.js
export default async function ProductsPage() {
  let products = []
  let error = null

  try {
    const res = await fetch('https://api.example.com/products')

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    products = await res.json()
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error = err.message
  }

  if (error) {
    return (
      <div>
        <h2>Error loading products</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## Performance Optimization

### Request Memoization
Leverage automatic request memoization:

```javascript
// app/data-fetching/page.js
async function getApiData() {
  // This request will be cached automatically within the same request
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function DataPage() {
  // These calls will use the same cached result within this request
  const data1 = await getApiData()
  const data2 = await getApiData()
  const data3 = await getApiData()

  return <div>{data1.length} items</div>
}
```

### Optimistic Caching
Use appropriate caching strategies for different data types:

```javascript
// For frequently changing data
const liveData = await fetch('https://api.example.com/live-feed', {
  next: { revalidate: 10 } // Revalidate every 10 seconds
})

// For mostly static data
const staticData = await fetch('https://api.example.com/static-content', {
  next: { revalidate: 3600 } // Revalidate every hour
})

// For data that should never be cached
const freshData = await fetch('https://api.example.com/real-time', {
  cache: 'no-store' // No caching
})
```

## Best Practices

### 1. Choose the Right Strategy
- Use Server Components for static or slowly changing data
- Use Client Components for user-specific or interactive data
- Use SSG with revalidation for content that updates periodically
- Use SSR for data that changes on every request

### 2. Optimize Fetch Calls
- Use parallel fetching with Promise.all when possible
- Use cache tags for granular invalidation
- Consider the appropriate revalidation intervals

### 3. Handle Errors Gracefully
- Always implement error boundaries
- Provide fallback UI for failed requests
- Log errors for debugging

### 4. Optimize Performance
- Use appropriate caching strategies
- Implement proper loading states
- Consider pagination for large datasets

Understanding these data fetching strategies will help you build performant Next.js applications that provide a great user experience while optimizing for SEO and performance.
# Next.js Caching Strategies

## Overview

Caching is crucial for optimizing performance in Next.js applications. This guide covers various caching strategies and techniques for both data fetching and server actions.

## Request Memoization

### Automatic Memoization
Server Components automatically memoize identical fetch requests within the same request:

```javascript
// app/data-fetching/page.js
async function getApiData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function DataPage() {
  // These three calls will return the same result without making additional HTTP requests
  const data1 = await getApiData() // First call - makes HTTP request
  const data2 = await getApiData() // Second call - uses memoized result
  const data3 = await getApiData() // Third call - uses memoized result

  return <div>{data1.length} items</div>
}
```

### Using 'use cache' Directive
Explicitly cache function results with the `use cache` directive:

```javascript
// lib/data.js
import { unstable_cache } from 'next/cache'

// Cache function results with specific keys and revalidation
export const getCachedUserData = unstable_cache(
  async (userId) => {
    const res = await fetch(`https://api.example.com/users/${userId}`)
    return res.json()
  },
  ['user-data'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
)

// Using the 'use cache' directive
export async function getUserWithCache(userId) {
  'use cache'
  const res = await fetch(`https://api.example.com/users/${userId}`)
  return res.json()
}
```

## fetch() Caching Options

### Cache Strategies
```javascript
// Cache forever (default behavior)
const res = await fetch('https://api.example.com/data')
const data = await res.json()

// No cache - always fetch fresh data
const res = await fetch('https://api.example.com/live-data', {
  cache: 'no-store'
})
const data = await res.json()

// Force cache (explicit)
const res = await fetch('https://api.example.com/static-data', {
  cache: 'force-cache'
})
const data = await res.json()
```

### Revalidation with next Options
```javascript
// Revalidate every 60 seconds (ISR)
const res = await fetch('https://api.example.com/feed', {
  next: { revalidate: 60 }
})
const data = await res.json()

// Tag-based caching for granular invalidation
const res = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
const posts = await res.json()

// Multiple tags
const res = await fetch('https://api.example.com/user-posts', {
  next: { tags: ['posts', 'user-posts', `user-${userId}`] }
})
const posts = await res.json()

// Revalidate indefinitely (until manually invalidated)
const res = await fetch('https://api.example.com/permanent-data', {
  next: { revalidate: false }
})
const data = await res.json()
```

## Cache Invalidation

### Using revalidatePath
Invalidate cached data for a specific path:

```javascript
// app/actions.js
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData) {
  // Create the post
  const post = await db.posts.create(formData)

  // Revalidate the posts list page
  revalidatePath('/posts')

  // Revalidate the specific post page
  revalidatePath(`/posts/${post.id}`)

  // Revalidate the home page if it shows recent posts
  revalidatePath('/')

  return { success: true, post }
}

export async function updatePost(postId, formData) {
  // Update the post
  const post = await db.posts.update({ where: { id: postId }, data: formData })

  // Revalidate the specific post page
  revalidatePath(`/posts/${postId}`)

  // Revalidate the posts list
  revalidatePath('/posts')

  return { success: true, post }
}

export async function deletePost(postId) {
  // Delete the post
  await db.posts.delete({ where: { id: postId } })

  // Revalidate the posts list
  revalidatePath('/posts')

  // Revalidate the home page if needed
  revalidatePath('/')

  return { success: true }
}
```

### Using revalidateTag
Invalidate cached data using tags:

```javascript
// app/actions.js
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(productId, formData) {
  // Update the product
  const product = await db.products.update({
    where: { id: productId },
    data: formData
  })

  // Revalidate by tags
  revalidateTag('products')           // All products
  revalidateTag(`product-${productId}`) // Specific product
  revalidateTag('inventory')         // Inventory data

  return { success: true, product }
}

export async function createOrder(formData) {
  // Create the order
  const order = await db.orders.create(formData)

  // Revalidate related data
  revalidateTag('orders')              // All orders
  revalidateTag(`user-orders-${order.userId}`) // User's orders
  revalidateTag('inventory')           // Inventory might be affected

  return { success: true, order }
}
```

## Dynamic Revalidation

### Conditional Revalidation
```javascript
// app/actions.js
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function publishPost(postId) {
  // Publish the post
  const post = await db.posts.update({
    where: { id: postId },
    data: { published: true, publishedAt: new Date() }
  })

  // Conditionally revalidate based on post type
  if (post.type === 'featured') {
    revalidatePath('/')           // Revalidate home page
    revalidateTag('featured-posts') // Revalidate featured posts
  }

  revalidatePath('/posts')        // Always revalidate posts list
  revalidatePath(`/posts/${postId}`) // Revalidate specific post

  return { success: true, post }
}
```

## Cache Tags Best Practices

### Organizing Cache Tags
```javascript
// lib/cache-tags.js
export const TAGS = {
  // Global
  GLOBAL: 'global',

  // Posts
  POSTS: 'posts',
  POST: (id) => `post-${id}`,
  FEATURED_POSTS: 'featured-posts',

  // Users
  USERS: 'users',
  USER: (id) => `user-${id}`,
  USER_POSTS: (userId) => `user-posts-${userId}`,

  // Products
  PRODUCTS: 'products',
  PRODUCT: (id) => `product-${id}`,
  INVENTORY: 'inventory',

  // Orders
  ORDERS: 'orders',
  ORDER: (id) => `order-${id}`,
  USER_ORDERS: (userId) => `user-orders-${userId}`,

  // Comments
  COMMENTS: 'comments',
  POST_COMMENTS: (postId) => `post-comments-${postId}`
}

// app/actions.js
'use server'

import { revalidateTag } from 'next/cache'
import { TAGS } from '@/lib/cache-tags'

export async function createComment(formData) {
  const comment = await db.comments.create(formData)

  // Use organized tags
  revalidateTag(TAGS.COMMENTS)
  revalidateTag(TAGS.POST_COMMENTS(comment.postId))
  revalidateTag(TAGS.USER(comment.authorId))

  return { success: true, comment }
}
```

## Cache Configuration

### Per-Route Revalidation
```javascript
// app/slow-page.js
// Set revalidation interval for the entire route
export const revalidate = 3600 // Revalidate every hour

export default async function SlowPage() {
  const data = await fetch('https://api.example.com/slow-data').then(res => res.json())
  return <div>{data.content}</div>
}

// app/dynamic-page.js
// Dynamic revalidation based on environment
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : 30

export default async function DynamicPage() {
  const data = await fetch('https://api.example.com/data').then(res => res.json())
  return <div>{data.content}</div>
}
```

## Caching in API Routes

### Cache Headers in API Routes
```javascript
// app/api/data/route.js
export async function GET() {
  const data = await fetchExternalData()

  return Response.json(data, {
    headers: {
      // Set cache headers for CDN
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  })
}

// app/api/private/route.js
export async function GET() {
  // Private data should not be cached
  const data = await getPrivateUserData()

  return Response.json(data, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  })
}
```

## Advanced Caching Patterns

### Caching with Authentication Context
```javascript
// lib/authenticated-cache.js
import { unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'

export const getPersonalizedData = unstable_cache(
  async (userId) => {
    const res = await fetch(`https://api.example.com/personal-data/${userId}`)
    return res.json()
  },
  ['personal-data'], // Base cache key
  {
    revalidate: 300, // Revalidate every 5 minutes
    tags: ['personal-data']
  }
)

// app/dashboard/page.js
export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) {
    return <div>Please log in</div>
  }

  // This will be cached per user
  const data = await getPersonalizedData(session.user.id)

  return <div>{data.content}</div>
}
```

### Conditional Caching
```javascript
// app/data-fetching/page.js
export default async function DataPage({ searchParams }) {
  const isPreview = searchParams.preview === 'true'

  let cacheOptions = {}
  if (isPreview) {
    // Don't cache preview data
    cacheOptions = { cache: 'no-store' }
  } else {
    // Cache regular data
    cacheOptions = { next: { revalidate: 3600, tags: ['content'] } }
  }

  const res = await fetch('https://api.example.com/content', cacheOptions)
  const data = await res.json()

  return <div>{data.content}</div>
}
```

## Performance Monitoring

### Measuring Cache Effectiveness
```javascript
// lib/cache-monitoring.js
export function withCacheMonitoring(fn, name) {
  return async (...args) => {
    const startTime = performance.now()
    const result = await fn(...args)
    const endTime = performance.now()

    console.log(`${name} took ${endTime - startTime}ms`)

    return result
  }
}

// Usage
const getCachedData = withCacheMonitoring(getData, 'getData')

// app/monitored-page.js
export default async function MonitoredPage() {
  const data = await getCachedData()
  return <div>{data.content}</div>
}
```

## Best Practices

### 1. Choose Appropriate Revalidation Times
- Static content: Longer revalidation (hours/days)
- Dynamic content: Shorter revalidation (minutes)
- Live data: No cache or very short cache

### 2. Use Tags for Related Data
- Group related data under common tags
- Use specific tags for individual items
- Invalidate the right scope when updating

### 3. Consider Cache Size
- Don't cache extremely large datasets
- Use pagination for large collections
- Implement cache eviction strategies

### 4. Monitor Cache Performance
- Track cache hit rates
- Monitor cache size
- Adjust strategies based on usage patterns

### 5. Handle Cache Warming
- Pre-populate important cache entries
- Consider background jobs for cache warming
- Implement cache warming strategies for critical paths

Effective caching strategies can dramatically improve your application's performance. Always consider the trade-offs between data freshness and performance when implementing caching.
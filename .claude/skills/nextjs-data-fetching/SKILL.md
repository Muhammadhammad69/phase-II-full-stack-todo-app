---
name: nextjs-data-fetching
description: Master data fetching and Server Actions in Next.js for efficient backend integration. Learn modern data fetching patterns, form handling, cache management, and error handling. Use when Claude needs to implement data fetching in Server Components, handle form submissions with Server Actions, manage cache invalidation, implement optimistic updates, or work with API routes in Next.js applications.
---

# Data Fetching and Server Actions - Backend Integration

## Overview

Next.js provides powerful data fetching and mutation capabilities through Server Components and Server Actions. This skill covers modern patterns for fetching data on the server, handling form submissions with Server Actions, and managing cache invalidation for optimal performance and user experience.

## Data Fetching in Server Components

### Basic Data Fetching
Server Components can fetch data directly without needing to pass through props from parent components:

```javascript
// app/posts/page.js
export default async function Posts() {
  // Fetch from external API
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

### Database Fetching
Server Components can also access databases directly:

```javascript
// app/products/page.js
import { db } from '@/lib/db'

export default async function Products() {
  // Direct database access
  const products = await db.products.findMany({
    where: { active: true },
    include: { category: true }
  })

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <p>Category: {product.category.name}</p>
        </div>
      ))}
    </div>
  )
}
```

## Fetch Caching Strategies

### Automatic Caching
By default, `fetch()` results are cached automatically:

```javascript
// Cache forever (default behavior)
const res = await fetch('https://api.example.com/data')
const data = await res.json()
```

### No Cache (Fresh Data)
Disable caching to always fetch fresh data:

```javascript
// No cache - always fetch fresh data
const res = await fetch('https://api.example.com/live-data', {
  cache: 'no-store'
})
const data = await res.json()
```

### Revalidation (ISR - Incremental Static Regeneration)
Revalidate data periodically:

```javascript
// Revalidate every 60 seconds
const res = await fetch('https://api.example.com/feed', {
  next: { revalidate: 60 }
})
const data = await res.json()
```

### Tag-Based Revalidation
Use cache tags for more granular control:

```javascript
// Tag-based caching
const res = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
const posts = await res.json()

// Later in a Server Action, invalidate this cache
import { revalidateTag } from 'next/cache'
revalidateTag('posts')
```

## Server Actions

### Basic Server Action
Server Actions are server-side functions that can be called from Client Components:

```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData) {
  // Extract form data
  const name = formData.get('name')
  const price = formData.get('price')

  // Validate input
  if (!name || !price) {
    return { error: 'Name and price are required' }
  }

  try {
    // Save to database
    const product = await db.products.create({
      data: {
        name: name.trim(),
        price: parseFloat(price)
      }
    })

    // Revalidate cache to show updated data
    revalidatePath('/products')

    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { error: 'Failed to create product' }
  }
}
```

### Using Server Actions in Forms
Server Actions work seamlessly with form submissions:

```javascript
// app/components/AddProductForm.js
'use client'

import { useState } from 'react'
import { addProduct } from '@/app/actions'

export default function AddProductForm() {
  const [error, setError] = useState('')

  const handleSubmit = async (formData) => {
    const result = await addProduct(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setError('')
      // Reset form or show success message
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <input
        name="name"
        placeholder="Product name"
        required
      />
      <input
        name="price"
        type="number"
        placeholder="Price"
        required
      />
      <button type="submit">Add Product</button>
    </form>
  )
}
```

## Cache Invalidation

### Using revalidatePath
Invalidate cached data for a specific path:

```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateProduct(id, formData) {
  const name = formData.get('name')
  const price = formData.get('price')

  await db.products.update({
    where: { id },
    data: {
      name: name.trim(),
      price: parseFloat(price)
    }
  })

  // Revalidate multiple paths affected by this change
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)

  return { success: true }
}
```

### Using revalidateTag
Invalidate cached data using tags:

```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function deleteProduct(id) {
  await db.products.delete({ where: { id } })

  // Revalidate all caches tagged with 'products'
  revalidateTag('products')
  revalidateTag(`product-${id}`)

  return { success: true }
}
```

## Error Handling in Server Actions

### Comprehensive Error Handling
Properly handle errors and return meaningful messages:

```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function submitForm(formData) {
  try {
    // Validate input
    const email = formData.get('email')
    if (!email || !email.includes('@')) {
      return { error: 'Please provide a valid email address' }
    }

    // Check if user already exists
    const existingUser = await db.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: 'Email already registered' }
    }

    // Create user
    const user = await db.users.create({
      data: {
        email,
        name: formData.get('name')
      }
    })

    revalidatePath('/users')

    return { success: true, user }
  } catch (error) {
    console.error('Form submission error:', error)

    // Don't expose internal errors to the client
    if (error.code === 'P2002') { // Prisma unique constraint error
      return { error: 'Email already exists' }
    }

    return { error: 'An unexpected error occurred' }
  }
}
```

## Optimistic Updates

### Using useOptimistic Hook
Provide better user experience with optimistic updates:

```javascript
// app/components/TodoList.js
'use client'

import { useState } from 'react'
import { useOptimistic } from 'react'
import { addTodo, toggleTodo } from '@/app/actions'

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos)
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { id: Date.now(), text: newTodo, done: false }]
  )

  const handleAddTodo = async (formData) => {
    const text = formData.get('text')
    addOptimisticTodo(text)

    try {
      const result = await addTodo(text)
      if (result.success) {
        setTodos(prev => [...prev, result.todo])
      } else {
        // Revert optimistic update on error
        setTodos(prev => prev.slice(0, -1))
      }
    } catch (error) {
      // Revert optimistic update on error
      setTodos(prev => prev.slice(0, -1))
    }
  }

  return (
    <div>
      <form action={handleAddTodo}>
        <input name="text" placeholder="New todo" required />
        <button type="submit">Add</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => toggleTodo(todo.id)}>
              {todo.done ? 'Undo' : 'Done'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Query Parameters and Search

### Server Component with Search Parameters
Handle query parameters in Server Components:

```javascript
// app/products/page.js
import ProductFilter from '@/components/ProductFilter'

export default async function Products({ searchParams }) {
  const query = searchParams.q || ''
  const category = searchParams.category || 'all'
  const page = parseInt(searchParams.page) || 1
  const limit = 10

  // Fetch data based on query parameters
  const products = await db.products.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive'
      },
      ...(category !== 'all' && { categoryId: category })
    },
    skip: (page - 1) * limit,
    take: limit
  })

  return (
    <div>
      <h1>Products</h1>
      <ProductFilter currentQuery={query} currentCategory={category} />
      <div>
        {products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Client Component for Search
Handle search functionality in Client Components:

```javascript
// app/components/ProductFilter.js
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ProductFilter({ currentQuery, currentCategory }) {
  const [query, setQuery] = useState(currentQuery || '')
  const [category, setCategory] = useState(currentCategory || 'all')

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Initialize state from URL params
    setQuery(searchParams.get('q') || '')
    setCategory(searchParams.get('category') || 'all')
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category && category !== 'all') params.set('category', category)

    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="filter-controls">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  )
}
```

## Streaming and Suspense

### Progressive Content Loading
Use Suspense boundaries for better loading states:

```javascript
// app/dashboard/page.js
import { Suspense } from 'react'
import AnalyticsChart from '@/components/AnalyticsChart'
import RecentActivity from '@/components/RecentActivity'
import UserStats from '@/components/UserStats'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Suspense fallback={<div className="loading-skeleton">Loading stats...</div>}>
          <UserStats />
        </Suspense>

        <Suspense fallback={<div className="loading-skeleton">Loading chart...</div>}>
          <AnalyticsChart />
        </Suspense>

        <Suspense fallback={<div className="loading-skeleton">Loading activity...</div>}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  )
}

// app/components/UserStats.js
export default async function UserStats() {
  const stats = await fetchUserStats()

  return (
    <div className="stats-card">
      <h3>User Stats</h3>
      <p>Total Users: {stats.total}</p>
      <p>New This Month: {stats.newThisMonth}</p>
    </div>
  )
}
```

## API Routes (Alternative Approach)

### Traditional API Endpoints
While Server Actions are preferred for form handling, you can still create traditional API routes:

```javascript
// app/api/products/route.js
import { db } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const products = await db.products.findMany({
    where: {
      ...(category && { categoryId: category })
    }
  })

  return Response.json(products)
}

export async function POST(request) {
  const data = await request.json()

  const product = await db.products.create({
    data: {
      name: data.name,
      price: parseFloat(data.price),
      description: data.description
    }
  })

  return Response.json(product, { status: 201 })
}

// app/api/products/[id]/route.js
export async function GET(request, { params }) {
  const product = await db.products.findUnique({
    where: { id: params.id }
  })

  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  return Response.json(product)
}

export async function PUT(request, { params }) {
  const data = await request.json()

  const product = await db.products.update({
    where: { id: params.id },
    data: {
      name: data.name,
      price: parseFloat(data.price),
      description: data.description
    }
  })

  return Response.json(product)
}

export async function DELETE(request, { params }) {
  await db.products.delete({
    where: { id: params.id }
  })

  return new Response(null, { status: 204 })
}
```

## Real-World Examples

### Example 1: Blog with Comments
```javascript
// app/blog/[slug]/page.js
import CommentsSection from '@/components/CommentsSection'
import { db } from '@/lib/db'

export default async function BlogPost({ params }) {
  const post = await db.posts.findUnique({
    where: { slug: params.slug }
  })

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <CommentsSection postId={post.id} />
    </article>
  )
}

// app/components/CommentsSection.js
'use client'

import { useState } from 'react'
import { addComment } from '@/app/actions'

export default function CommentsSection({ postId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  const handleSubmit = async (formData) => {
    const result = await addComment(postId, formData)

    if (result.success) {
      setComments(prev => [...prev, result.comment])
      setNewComment('')
    }
  }

  return (
    <section>
      <h3>Comments</h3>
      <form action={handleSubmit}>
        <input
          name="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <input type="hidden" name="postId" value={postId} />
        <button type="submit">Post Comment</button>
      </form>
      <div>
        {comments.map(comment => (
          <div key={comment.id}>
            <p>{comment.text}</p>
            <small>By {comment.author}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
```

### Example 2: Shopping Cart
```javascript
// app/actions.js
'use server'

import { revalidatePath } from 'next/cache'

export async function addToCart(formData) {
  const productId = formData.get('productId')
  const quantity = parseInt(formData.get('quantity')) || 1

  // Add to cart logic
  const cart = await getOrCreateCart()
  await db.cartItems.create({
    data: {
      cartId: cart.id,
      productId,
      quantity
    }
  })

  // Revalidate cart page
  revalidatePath('/cart')
  revalidatePath('/products')

  return { success: true }
}

export async function removeFromCart(itemId) {
  await db.cartItems.delete({
    where: { id: itemId }
  })

  revalidatePath('/cart')
  revalidatePath('/products')

  return { success: true }
}
```

## Common Mistakes to Avoid

1. **Not handling errors in Server Actions**: Always use try/catch blocks and return meaningful error objects

2. **Forgetting to revalidate cache**: Call `revalidatePath()` or `revalidateTag()` after mutations to update cached data

3. **Fetching in Client Components unnecessarily**: Fetch data in Server Components when possible to reduce client-side JavaScript

4. **Not validating user input**: Always validate and sanitize input on the server-side

5. **Passing sensitive data to Client Components**: Keep secrets and sensitive information on the server

6. **Not using optimistic updates**: Implement optimistic updates for better user experience

## Best Practices

1. **Fetch data in Server Components**: Keep data fetching on the server when possible

2. **Use Server Actions for mutations**: Handle form submissions and data mutations with Server Actions

3. **Implement proper error handling**: Always validate input and handle errors gracefully

4. **Use appropriate caching strategies**: Balance performance with data freshness

5. **Invalidate cache after mutations**: Use `revalidatePath()` or `revalidateTag()` to update cached data

6. **Use optimistic updates**: Provide better user experience with optimistic UI updates

7. **Keep Client Components minimal**: Only pass necessary data to Client Components

8. **Use Suspense boundaries**: Implement proper loading states with Suspense

## Quick Reference

### Data Fetching
```javascript
// Cache forever (default)
const data = await fetch(url)

// No cache
const data = await fetch(url, { cache: 'no-store' })

// Revalidate every 60 seconds
const data = await fetch(url, { next: { revalidate: 60 } })

// Tag-based caching
const data = await fetch(url, { next: { tags: ['data'] } })
```

### Server Actions
```javascript
// Define
'use server'
export async function action(formData) { }

// Use in form
<form action={action}>
```

### Cache Invalidation
```javascript
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

revalidatePath('/path')
revalidateTag('tag-name')
```

### Optimistic Updates
```javascript
'use client'
import { useOptimistic } from 'react'

const [optimisticItems, addOptimisticItem] = useOptimistic(
  items,
  (state, newItem) => [...state, newItem]
)
```

## References

For detailed information on specific topics, see the reference files:
- [FETCHING_STRATEGIES.md](references/FETCHING_STRATEGIES.md) - Advanced data fetching patterns
- [SERVER_ACTIONS.md](references/SERVER_ACTIONS.md) - Comprehensive Server Actions guide
- [CACHING.md](references/CACHING.md) - Caching strategies and best practices
- [ERROR_HANDLING.md](references/ERROR_HANDLING.md) - Error handling patterns
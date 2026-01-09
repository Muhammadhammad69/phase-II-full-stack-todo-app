---
name: nextjs-server-client-components
description: Master Server Components and Client Components for optimal performance in Next.js. Learn when to use each approach, how to implement them correctly, handle data fetching in Server Components, use Server Actions, and optimize component hierarchy. Use when Claude needs to work with Server Components, Client Components, hybrid rendering patterns, data fetching strategies, Server Actions, or component optimization in Next.js applications.
---

# Server and Client Components - Hybrid Rendering

## Overview

Next.js App Router uses React Server Components by default, enabling a hybrid rendering model that optimizes for performance and interactivity. Server Components run exclusively on the server, reducing JavaScript sent to the browser and enabling secure database access. Client Components run in the browser, enabling interactivity with hooks and event listeners.

## What are Server Components?

Server Components are the default in Next.js App Router. They run only on the server and are never sent to the browser, which provides several benefits:

### Key Characteristics
- **Run only on server**: Executed during server-side rendering
- **Never sent to browser**: No JavaScript bundle impact
- **Can access databases directly**: Database connections and secrets are secure
- **Can access secrets/environment variables**: API keys and sensitive data stay on server
- **Reduce JavaScript sent to client**: Smaller bundle sizes
- **Better for SEO**: Content is rendered server-side

### Server Component Syntax
```javascript
// app/products/page.js (Server Component by default)
export default async function Products() {
  // This is a Server Component
  // Can use async/await
  const products = await db.products.findAll()

  return (
    <div>
      {products.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  )
}
```

## What are Client Components?

Client Components are marked with the `'use client'` directive and run in the browser, enabling interactivity and access to browser APIs.

### Key Characteristics
- **Marked with 'use client' directive**: Required at the top of the file
- **Run in browser**: Executed on the client-side
- **Interactive (events, hooks, state)**: Handle user interactions
- **Can use React hooks**: useState, useEffect, useContext, etc.
- **Can use browser APIs**: localStorage, window, document, etc.
- **State management**: Maintain component state

### Client Component Syntax
```javascript
// app/components/Counter.js
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

## Key Differences

### Server Components
- Use async/await for data fetching
- Access databases and backend resources directly
- Access secrets and environment variables
- Never use React hooks
- Never use browser APIs (window, localStorage, etc.)
- Reduce JavaScript bundle size
- Better performance for data-heavy operations

### Client Components
- Use 'use client' directive at the top
- Use React hooks (useState, useEffect, etc.)
- Handle event handlers and interactivity
- Access browser APIs
- Manage state and user interactions
- Include more JavaScript in the bundle

## When to Use Server Components

Use Server Components when you need:
- **Fetching data**: Database queries, API calls
- **Accessing databases**: Direct database connections
- **Using secrets/API keys**: Environment variables with sensitive data
- **Server-side rendering**: For SEO and performance
- **Protecting sensitive information**: Keep secrets on the server
- **Large dependencies**: Heavy libraries that don't need to run in browser
- **Default choice**: Start with Server Components unless you need interactivity

## When to Use Client Components

Use Client Components when you need:
- **Interactivity**: Event handlers, user input
- **Event handlers**: onClick, onChange, onSubmit
- **React hooks**: useState, useEffect, useContext
- **Browser APIs**: localStorage, geolocation, etc.
- **State management**: Component state
- **useEffect for side effects**: Client-side side effects
- **Real-time updates**: WebSocket connections, live data

## Data Fetching in Server Components

Server Components can fetch data directly without needing to pass through props from parent components:

```javascript
// app/posts/page.js (Server Component)
export default async function Posts() {
  // Direct database access
  const posts = await db.posts.findAll()

  // Or fetch from external API
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

## Server Actions

Server Actions allow Client Components to call server-side functions safely:

### Creating Server Actions
```javascript
// app/actions.js
'use server'

import { revalidatePath } from 'next/cache'

export async function addProduct(formData) {
  const name = formData.get('name')
  const price = formData.get('price')

  // Validate
  if (!name || !price) {
    return { error: 'Missing fields' }
  }

  // Save to database
  const product = await db.products.create({
    name,
    price: parseFloat(price)
  })

  // Revalidate cache
  revalidatePath('/products')

  return { success: true, product }
}
```

### Using Server Actions in Client Components
```javascript
// app/components/AddProductForm.js
'use client'

import { addProduct } from '@/app/actions'

export default function Form() {
  return (
    <form action={addProduct}>
      <input name="name" placeholder="Product name" required />
      <input name="price" type="number" placeholder="Price" required />
      <button type="submit">Add Product</button>
    </form>
  )
}
```

## Mixing Server and Client Components

The optimal pattern is to have Server Components at the top level that fetch data and pass it down to Client Components for interactivity:

```javascript
// app/dashboard/page.js (Server Component)
import ClientChart from '@/components/Chart'

export default async function Dashboard() {
  // Server Component - fetch data
  const data = await db.analytics.getData()

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass data to Client Component */}
      <ClientChart data={data} />
    </div>
  )
}

// app/components/Chart.js (Client Component)
'use client'

import { useState } from 'react'

export default function Chart({ data }) {
  const [filter, setFilter] = useState('')

  // Can use hooks
  // Can be interactive

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter"
      />
      {/* Render chart */}
    </div>
  )
}
```

## Component Hierarchy Best Practice

The recommended pattern is to keep Server Components at the top level and place Client Components lower in the tree:

```
Server Component (fetch data)
├── Client Component (interactive)
├── Client Component (interactive)
└── Server Component (fetch more data)
```

### Best Practices:
- Server Components at top level
- Client Components lower in tree
- Move 'use client' down as far as possible
- Don't mark entire app as 'use client'
- Keep Client Components small and focused

## Server Actions Features

Server Actions provide several benefits:
- Form submission without creating API endpoints
- Direct database mutations
- Automatic cache revalidation
- Server-side validation
- No exposed endpoints to manage

```javascript
// app/actions.js
'use server'

import { revalidatePath } from 'next/cache'

export async function deletePost(id) {
  // Validate user (check session)
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')

  // Delete from database
  await db.posts.delete(id)

  // Revalidate cache
  revalidatePath('/posts')

  return { success: true }
}

// app/components/DeleteButton.js
'use client'

import { deletePost } from '@/app/actions'

export default function DeleteButton({ postId }) {
  const handleDelete = async () => {
    const result = await deletePost(postId)
    if (result.success) {
      alert('Post deleted')
    }
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

## Real-World Examples

### Example 1: Blog Post Page
```javascript
// app/blog/[slug]/page.js (Server Component)
export default async function Post({ params }) {
  const post = await db.posts.findBySlug(params.slug)

  if (!post) return <h1>Not found</h1>

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={post.id} />
    </article>
  )
}

// app/components/Comments.js (Client Component)
'use client'

import { useState } from 'react'

export function Comments({ postId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Submit comment via Server Action
    const result = await addComment(postId, text)
    setText('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add comment"
        />
        <button type="submit">Post</button>
      </form>
    </div>
  )
}
```

### Example 2: Todo Application
```javascript
// app/todos/page.js (Server Component)
import TodoForm from '@/components/TodoForm'
import TodoList from '@/components/TodoList'

export default async function Todos() {
  const todos = await db.todos.findAll()

  return (
    <div>
      <h1>My Todos</h1>
      <TodoForm />
      <TodoList todos={todos} />
    </div>
  )
}

// app/components/TodoForm.js (Client Component)
'use client'

import { useState } from 'react'
import { addTodo } from '@/app/actions'

export default function TodoForm() {
  const [text, setText] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addTodo(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New todo"
      />
      <button type="submit">Add</button>
    </form>
  )
}
```

### Example 3: Product Catalog
```javascript
// app/products/page.js (Server Component)
import ProductFilter from '@/components/ProductFilter'

export default async function Products() {
  const products = await db.products.findAll()

  return (
    <div>
      <h1>Products</h1>
      <ProductFilter products={products} />
    </div>
  )
}

// app/components/ProductFilter.js (Client Component)
'use client'

import { useState } from 'react'

export default function ProductFilter({ products }) {
  const [filter, setFilter] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter products"
      />
      <ul>
        {filtered.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Common Mistakes to Avoid

1. **Using 'use client' too broadly**: Mark only what needs it; keep Server Components as the default

2. **Trying to use hooks in Server Components**: Hooks only work in Client Components; use async/await in Server Components

3. **Passing large objects to Client Components**: Keep passed data minimal; Server Components handle heavy data

4. **Not revalidating cache after mutations**: Use revalidatePath() in Server Actions to update UI after changes

5. **Accessing client APIs in Server Components**: window, localStorage only work in Client Components; database access only in Server Components

## Best Practices

1. **Default to Server Components**: Start with Server Components unless you need interactivity
2. **Use Client Components only for interactivity**: For events, hooks, and state
3. **Move 'use client' down the tree**: Keep Server Components at higher levels
4. **Fetch data in Server Components**: Keep data fetching on the server
5. **Handle mutations with Server Actions**: Use Server Actions for data mutations
6. **Keep Client Components simple**: Focus on interactivity, not data fetching
7. **Pass minimal data to Client Components**: Don't pass entire database objects
8. **Validate on server-side**: Always validate data on the server
9. **Revalidate cache after mutations**: Update UI after server changes
10. **Document component types**: Make it clear which components are Server vs Client

## Quick Reference

### Server Components:
- No 'use client' directive (default)
- async/await allowed
- Database access
- Secrets/environment variables
- Zero JavaScript sent to client
- Use async function

### Client Components:
- 'use client' at top of file
- React hooks (useState, useEffect, etc.)
- Event handlers
- State management
- Browser APIs
- Interactivity

### Server Actions:
- 'use server' directive in file
- Form submissions
- Database mutations
- Cache revalidation
- No exposed API endpoints needed

### Data Fetching:
```javascript
// Server Component
const data = await db.fetch()
const data = await fetch(url)
```

### Mutations:
```javascript
// Server Action
'use server'
export async function action() { }

// Called from Client Component
const result = await action()
```

## References

For detailed information on specific topics, see the reference files:
- [COMPONENT_PATTERNS.md](references/COMPONENT_PATTERNS.md) - Advanced component composition patterns
- [SERVER_ACTIONS.md](references/SERVER_ACTIONS.md) - Comprehensive Server Actions guide
- [DATA_FETCHING.md](references/DATA_FETCHING.md) - Data fetching strategies in Server Components
- [PERFORMANCE.md](references/PERFORMANCE.md) - Performance optimization techniques
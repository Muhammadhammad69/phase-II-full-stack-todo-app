# Next.js Server and Client Component Patterns

## Overview

This guide explores advanced patterns for composing Server and Client Components in Next.js applications. Understanding these patterns helps optimize performance, bundle size, and user experience.

## The Golden Rule: Move "use client" Down the Tree

The most important pattern is to keep Server Components at the top of your component tree and push Client Components as far down as possible:

### ❌ Anti-pattern: Early Client Component
```javascript
// app/products/page.js
'use client' // ❌ Unnecessary - entire page as client component

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'

export default function ProductsPage() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Fetch in client - sends data to browser unnecessarily
    fetchProducts().then(setProducts)
  }, [])

  return (
    <div>
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### ✅ Best Practice: Server Component with Client Children
```javascript
// app/products/page.js
import ProductItem from '@/components/ProductItem' // Client Component
import { db } from '@/lib/db'

export default async function ProductsPage() {
  // Fetch data server-side - no JS bundle for data fetching
  const products = await db.products.findAll()

  return (
    <div>
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  )
}

// app/components/ProductItem.js
'use client'

import { useState } from 'react'

export default function ProductItem({ product }) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <button onClick={() => setIsFavorite(!isFavorite)}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
```

## Pattern 1: Data-Heavy Server Components with Interactive Client Children

This pattern is ideal for content-heavy pages with interactive elements:

```javascript
// app/blog/[slug]/page.js
import CommentsSection from '@/components/CommentsSection'
import { getPostBySlug, getRelatedPosts } from '@/lib/posts'

export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug)
  const relatedPosts = await getRelatedPosts(params.slug)

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <p>By {post.author}</p>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <CommentsSection postId={post.id} />
      <RelatedPosts posts={relatedPosts} />
    </article>
  )
}

// app/components/CommentsSection.js
'use client'

import { useState, useEffect } from 'react'
import { getComments, addComment } from '@/lib/comments'

export default function CommentsSection({ postId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    getComments(postId).then(setComments)
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const comment = await addComment(postId, newComment)
    setComments([...comments, comment])
    setNewComment('')
  }

  return (
    <section>
      <h3>Comments</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        {comments.map(comment => (
          <div key={comment.id}>{comment.text}</div>
        ))}
      </div>
    </section>
  )
}
```

## Pattern 2: Server Actions for Data Mutations

Server Actions allow Client Components to perform server-side operations:

```javascript
// app/actions/post-actions.js
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function likePost(postId, userId) {
  // Validate user
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Perform database operation
  const like = await db.likes.create({ postId, userId })

  // Revalidate cache to show updated like count
  revalidatePath(`/posts/${postId}`)

  return { success: true, like }
}

export async function createComment(postId, userId, content) {
  if (!userId || !content.trim()) {
    return { error: 'Invalid input' }
  }

  const comment = await db.comments.create({
    postId,
    userId,
    content
  })

  revalidatePath(`/posts/${postId}`)

  return { success: true, comment }
}
```

```javascript
// app/components/LikeButton.js
'use client'

import { useState } from 'react'
import { likePost } from '@/app/actions/post-actions'

export default function LikeButton({ postId, initialLikes, userId }) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await likePost(postId, userId)
      setIsLiked(!isLiked)
      setLikes(isLiked ? likes - 1 : likes + 1)
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={isLiked ? 'liked' : ''}
    >
      {isLiked ? '❤️ Liked' : '🤍 Like'} ({likes})
    </button>
  )
}
```

## Pattern 3: Higher-Order Client Components

For reusable interactive components that need to work with different data:

```javascript
// app/components/InteractiveList.js
'use client'

import { useState } from 'react'

export default function InteractiveList({
  items,
  renderItem,
  initialSort = 'name',
  onSortChange
}) {
  const [sortBy, setSortBy] = useState(initialSort)
  const [filter, setFilter] = useState('')

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1
    if (a[sortBy] > b[sortBy]) return 1
    return 0
  })

  return (
    <div>
      <div className="controls">
        <input
          type="text"
          placeholder="Filter items..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value)
            onSortChange?.(e.target.value)
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>
      <ul>
        {sortedItems.map((item, index) => (
          <li key={item.id || index}>
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

```javascript
// app/projects/page.js
import InteractiveList from '@/components/InteractiveList'
import { getProjects } from '@/lib/projects'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div>
      <h1>Projects</h1>
      <InteractiveList
        items={projects}
        renderItem={(project) => (
          <div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <span>Priority: {project.priority}</span>
          </div>
        )}
        onSortChange={(newSort) => console.log('Sorting by:', newSort)}
      />
    </div>
  )
}
```

## Pattern 4: Context Providers with Server Data

Passing server-fetched data to Client Components that need context:

```javascript
// app/dashboard/page.js
import DashboardProvider from '@/components/DashboardProvider'
import { getUserPreferences, getDashboardData } from '@/lib/dashboard'

export default async function DashboardPage() {
  const [preferences, data] = await Promise.all([
    getUserPreferences(),
    getDashboardData()
  ])

  return (
    <DashboardProvider initialData={data} preferences={preferences}>
      <DashboardContent />
    </DashboardProvider>
  )
}
```

```javascript
// app/components/DashboardProvider.js
'use client'

import { createContext, useContext, useState } from 'react'

const DashboardContext = createContext()

export default function DashboardProvider({
  children,
  initialData,
  preferences
}) {
  const [dashboardData, setDashboardData] = useState(initialData)
  const [userPrefs, setUserPrefs] = useState(preferences)

  const updatePreferences = async (newPrefs) => {
    // Update preferences and revalidate
    setUserPrefs(newPrefs)
  }

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      setDashboardData,
      userPrefs,
      updatePreferences
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
```

## Pattern 5: Conditional Client Components

Sometimes you only need Client Components under certain conditions:

```javascript
// app/components/MaybeClientComponent.js
import { Suspense } from 'react'

// Server Component that conditionally renders Client Component
export default function MaybeClientComponent({
  userId,
  children,
  fallback = <div>Loading...</div>
}) {
  // Only render client component if user is authenticated
  if (!userId) {
    return <div>Please log in to see this content</div>
  }

  return (
    <Suspense fallback={fallback}>
      <ClientOnlyComponent userId={userId}>
        {children}
      </ClientOnlyComponent>
    </Suspense>
  )
}

// app/components/ClientOnlyComponent.js
'use client'

import { useState, useEffect } from 'react'

export default function ClientOnlyComponent({ userId, children }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // Prevents hydration mismatch
  }

  return <div data-user-id={userId}>{children}</div>
}
```

## Performance Considerations

### Bundle Size Optimization
- Server Components don't contribute to client bundle size
- Large libraries can be used in Server Components without impacting client
- Client Components should be kept minimal and focused

### Data Transfer Efficiency
- Only send serializable data from Server to Client Components
- Don't pass entire database objects, only necessary properties
- Use server actions to avoid exposing sensitive data

### Caching and Revalidation
- Server Components can be cached using React's caching mechanisms
- Use `revalidatePath` and `revalidateTag` in Server Actions
- Client Components handle client-side caching separately

These patterns help create efficient, maintainable Next.js applications that leverage the strengths of both Server and Client Components while minimizing bundle size and maximizing performance.
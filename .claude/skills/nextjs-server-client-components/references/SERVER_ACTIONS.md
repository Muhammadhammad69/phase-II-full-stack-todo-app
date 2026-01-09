# Next.js Server Actions Guide

## Overview

Server Actions provide a way for Client Components to execute server-side code without creating separate API endpoints. They allow you to perform server-side operations like database mutations, file uploads, or other server-side logic directly from client components.

## Basic Server Action

### Creating a Server Action
```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(formData) {
  const title = formData.get('title')
  const content = formData.get('content')

  // Validate input
  if (!title || !content) {
    return { error: 'Title and content are required' }
  }

  // Create in database
  const post = await db.posts.create({
    title,
    content,
    createdAt: new Date()
  })

  // Revalidate the path to update cached data
  revalidatePath('/posts')

  return { success: true, post }
}
```

### Using Server Action in Client Component
```javascript
// app/components/CreatePostForm.js
'use client'

import { createPost } from '@/app/actions'

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input
        name="title"
        placeholder="Post title"
        required
      />
      <textarea
        name="content"
        placeholder="Post content"
        required
      />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

## Advanced Server Action Patterns

### 1. Server Action with Validation and Error Handling
```javascript
// app/actions/user-actions.js
'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(13).max(120)
})

export async function createUser(prevState, formData) {
  try {
    // Validate input
    const validatedData = createUserSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      age: Number(formData.get('age'))
    })

    // Check if user already exists
    const existingUser = await db.users.findByEmail(validatedData.email)
    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    // Create user
    const user = await db.users.create(validatedData)

    // Revalidate relevant paths
    revalidatePath('/users')
    revalidatePath('/dashboard')

    return { success: true, user }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input: ' + error.errors[0].message }
    }
    return { error: 'Failed to create user' }
  }
}
```

### 2. Server Action with Authentication
```javascript
// app/actions/auth-actions.js
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(formData) {
  // Authenticate user
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const userId = session.user.id
  const name = formData.get('name')
  const bio = formData.get('bio')

  try {
    // Update user profile
    const updatedUser = await db.users.update(userId, {
      name,
      bio
    })

    // Revalidate user-specific paths
    revalidatePath(`/users/${userId}`)
    revalidatePath('/profile')

    return { success: true, user: updatedUser }
  } catch (error) {
    return { error: 'Failed to update profile' }
  }
}
```

### 3. Server Action with File Upload
```javascript
// app/actions/file-actions.js
'use server'

import { db } from '@/lib/db'
import { uploadFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData) {
  const file = formData.get('file')
  const userId = formData.get('userId')

  if (!file || !(file instanceof File)) {
    return { error: 'No valid file provided' }
  }

  try {
    // Validate file type and size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { error: 'File too large' }
    }

    // Upload file to storage
    const fileUrl = await uploadFile(file)

    // Save file record to database
    const document = await db.documents.create({
      userId,
      originalName: file.name,
      fileUrl,
      mimeType: file.type,
      size: file.size
    })

    // Revalidate user document list
    revalidatePath(`/users/${userId}/documents`)

    return { success: true, document }
  } catch (error) {
    return { error: 'Failed to upload file' }
  }
}
```

## Using Server Actions with useFormState

Server Actions work well with React's `useFormState` hook for form handling:

```javascript
// app/components/UserForm.js
'use client'

import { useFormState } from 'react-dom'
import { createUser } from '@/app/actions/user-actions'

const initialState = {
  message: '',
  error: ''
}

export default function UserForm() {
  const [state, formAction] = useFormState(createUser, initialState)

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
        />
      </div>

      <div>
        <label htmlFor="age">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          required
        />
      </div>

      <button type="submit">Create User</button>

      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state.success && <p style={{ color: 'green' }}>User created successfully!</p>}
    </form>
  )
}
```

## Server Actions with Direct Function Calls

You can also call Server Actions directly from Client Components:

```javascript
// app/components/LikeButton.js
'use client'

import { likePost } from '@/app/actions/post-actions'

export default function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = async () => {
    try {
      const result = await likePost(postId)
      if (result.success) {
        setIsLiked(!isLiked)
        setLikes(isLiked ? likes - 1 : likes + 1)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  return (
    <button onClick={handleLike}>
      {isLiked ? '❤️ Liked' : '🤍 Like'} ({likes})
    </button>
  )
}
```

## Error Handling and Validation

### Comprehensive Error Handling
```javascript
// app/actions/error-handling.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Define error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND'
}

export async function updateProduct(productId, formData) {
  try {
    // Validate product ID
    if (!productId || typeof productId !== 'string') {
      return {
        error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid product ID' }
      }
    }

    // Parse and validate form data
    const productData = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      description: formData.get('description')
    }

    const productSchema = z.object({
      name: z.string().min(1).max(100),
      price: z.number().positive(),
      description: z.string().max(1000).optional()
    })

    const validatedData = productSchema.parse(productData)

    // Check if product exists and user has permission
    const existingProduct = await db.products.findById(productId)
    if (!existingProduct) {
      return {
        error: { code: ERROR_CODES.NOT_FOUND, message: 'Product not found' }
      }
    }

    // Update product
    const updatedProduct = await db.products.update(productId, validatedData)

    // Revalidate paths
    revalidatePath(`/products/${productId}`)
    revalidatePath('/products')

    return { success: true, product: updatedProduct }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: error.errors[0].message
        }
      }
    }

    console.error('Server action error:', error)
    return {
      error: {
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Failed to update product'
      }
    }
  }
}
```

## Caching and Revalidation

Server Actions often need to invalidate cached data:

```javascript
// app/actions/cache-actions.js
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'

export async function createComment(postId, content) {
  const comment = await db.comments.create({ postId, content })

  // Revalidate the specific post page
  revalidatePath(`/posts/${postId}`)

  // Revalidate pages that might show all comments
  revalidateTag('comments')

  return { success: true, comment }
}

export async function deletePost(postId) {
  await db.posts.delete(postId)

  // Revalidate multiple paths that might be affected
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`) // For 404 page
  revalidateTag('posts')

  return { success: true }
}
```

## Security Considerations

### Input Validation and Sanitization
```javascript
// app/actions/security-actions.js
'use server'

import { db } from '@/lib/db'
import { sanitizeInput } from '@/lib/security'
import { revalidatePath } from 'next/cache'

export async function createArticle(formData) {
  // Sanitize all inputs
  const title = sanitizeInput(formData.get('title'))
  const content = sanitizeInput(formData.get('content'))
  const tags = formData.getAll('tags').map(tag => sanitizeInput(tag))

  // Validate content length
  if (title.length > 200) {
    return { error: 'Title too long' }
  }

  if (content.length > 10000) {
    return { error: 'Content too long' }
  }

  // Create article
  const article = await db.articles.create({
    title,
    content,
    tags
  })

  revalidatePath('/articles')

  return { success: true, article }
}
```

### Rate Limiting Server Actions
```javascript
// lib/rate-limit.js
const rateLimitMap = new Map()

export function checkRateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs }

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }

  record.count++

  rateLimitMap.set(identifier, record)

  return {
    allowed: record.count <= maxRequests,
    remaining: Math.max(maxRequests - record.count, 0),
    resetTime: record.resetTime
  }
}

// app/actions/rate-limited-actions.js
'use server'

import { checkRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function submitContactForm(formData) {
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'

  const { allowed, remaining } = checkRateLimit(ip, 3, 300000) // 3 requests per 5 minutes

  if (!allowed) {
    return { error: 'Rate limit exceeded. Please try again later.' }
  }

  // Process form submission
  const result = await processContactForm(formData)

  return result
}
```

Server Actions provide a powerful and secure way to handle server-side operations from client components. They eliminate the need for separate API routes while maintaining security and performance benefits. Always validate inputs, handle errors appropriately, and revalidate cached data when necessary.
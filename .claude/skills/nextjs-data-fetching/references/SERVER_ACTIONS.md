# Next.js Server Actions Guide

## Overview

Server Actions provide a way to execute server-side code from client components without creating separate API endpoints. They offer a secure and efficient way to handle form submissions, data mutations, and other server-side operations.

## Basic Server Actions

### Creating a Simple Server Action
```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(formData) {
  const title = formData.get('title')
  const content = formData.get('content')

  if (!title || !content) {
    return { error: 'Title and content are required' }
  }

  try {
    const post = await db.posts.create({
      data: {
        title: title.trim(),
        content: content.trim()
      }
    })

    revalidatePath('/posts')

    return { success: true, post }
  } catch (error) {
    console.error('Error creating post:', error)
    return { error: 'Failed to create post' }
  }
}
```

### Using Server Actions in Forms
```javascript
// app/components/CreatePostForm.js
'use client'

import { useState } from 'react'
import { createPost } from '@/app/actions'

export default function CreatePostForm() {
  const [error, setError] = useState('')

  const handleSubmit = async (formData) => {
    const result = await createPost(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setError('')
      // Optionally redirect or show success message
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <p className="error">{error}</p>}
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

## Advanced Server Actions

### Server Actions with Validation
```javascript
// app/actions/validation-actions.js
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
    const validatedData = createUserSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      age: Number(formData.get('age'))
    })

    // Check if user already exists
    const existingUser = await db.users.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    const user = await db.users.create({
      data: validatedData
    })

    revalidatePath('/users')

    return { success: true, user }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Failed to create user' }
  }
}
```

### Server Actions with Authentication
```javascript
// app/actions/auth-actions.js
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(formData) {
  // Get the current session
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const userId = session.user.id
  const name = formData.get('name')
  const bio = formData.get('bio')

  try {
    const updatedUser = await db.users.update({
      where: { id: userId },
      data: {
        name: name?.trim() || undefined,
        bio: bio?.trim() || undefined
      }
    })

    // Revalidate paths that show user data
    revalidatePath('/profile')
    revalidatePath(`/users/${userId}`)

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: 'Failed to update profile' }
  }
}
```

## Server Actions with useFormState

### Using useFormState for Form Handling
```javascript
// app/components/UserForm.js
'use client'

import { useFormState } from 'react-dom'
import { createUser } from '@/app/actions/validation-actions'

const initialState = {
  error: '',
  success: false
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

## Server Actions with File Uploads

### Handling File Uploads
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
      return { error: 'File size exceeds 10MB limit' }
    }

    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      return { error: 'Invalid file type' }
    }

    // Upload file to storage
    const fileUrl = await uploadFile(file)

    // Save file record to database
    const document = await db.documents.create({
      data: {
        userId,
        originalName: file.name,
        fileUrl,
        mimeType: file.type,
        size: file.size
      }
    })

    // Revalidate user document list
    revalidatePath(`/users/${userId}/documents`)

    return { success: true, document }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { error: 'Failed to upload file' }
  }
}
```

## Error Handling in Server Actions

### Comprehensive Error Handling
```javascript
// app/actions/error-handling.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function updateProduct(productId, formData) {
  try {
    // Validate inputs
    if (!productId || typeof productId !== 'string') {
      return { error: 'Invalid product ID' }
    }

    const productData = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      description: formData.get('description')
    }

    // Validate with Zod
    const productSchema = z.object({
      name: z.string().min(1).max(100),
      price: z.number().positive(),
      description: z.string().max(1000).optional()
    })

    const validatedData = productSchema.parse(productData)

    // Check if product exists
    const existingProduct = await db.products.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return { error: 'Product not found' }
    }

    // Update product
    const updatedProduct = await db.products.update({
      where: { id: productId },
      data: validatedData
    })

    // Revalidate affected paths
    revalidatePath(`/products/${productId}`)
    revalidatePath('/products')

    return { success: true, product: updatedProduct }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    console.error('Server action error:', error)
    return { error: 'Failed to update product' }
  }
}
```

## Security Considerations

### Input Sanitization and Validation
```javascript
// app/actions/security-actions.js
'use server'

import { db } from '@/lib/db'
import { sanitizeInput } from '@/lib/security'
import { revalidatePath } from 'next/cache'

export async function createComment(formData) {
  // Sanitize all inputs
  const postId = sanitizeInput(formData.get('postId'))
  const content = sanitizeInput(formData.get('content'))
  const authorId = formData.get('authorId') // Assume this comes from session

  // Validate inputs
  if (!postId || !content || content.length > 1000) {
    return { error: 'Invalid comment data' }
  }

  try {
    const comment = await db.comments.create({
      data: {
        postId,
        content,
        authorId
      }
    })

    revalidatePath(`/posts/${postId}`)

    return { success: true, comment }
  } catch (error) {
    console.error('Error creating comment:', error)
    return { error: 'Failed to create comment' }
  }
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
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const { allowed, remaining } = checkRateLimit(ip, 3, 300000) // 3 requests per 5 minutes

  if (!allowed) {
    return { error: 'Rate limit exceeded. Please try again later.' }
  }

  // Process form submission
  const result = await processContactForm(formData)

  return result
}
```

## Transaction Management

### Database Transactions in Server Actions
```javascript
// app/actions/transaction-actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function transferFunds(formData) {
  const fromAccountId = formData.get('fromAccount')
  const toAccountId = formData.get('toAccount')
  const amount = parseFloat(formData.get('amount'))

  if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
    return { error: 'Invalid transfer data' }
  }

  try {
    // Use a transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
      // Check balance
      const fromAccount = await tx.account.findUnique({
        where: { id: fromAccountId }
      })

      if (!fromAccount || fromAccount.balance < amount) {
        throw new Error('Insufficient funds')
      }

      // Perform the transfer
      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } }
      })

      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } }
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
          type: 'TRANSFER'
        }
      })

      return transaction
    })

    // Revalidate affected accounts
    revalidatePath(`/accounts/${fromAccountId}`)
    revalidatePath(`/accounts/${toAccountId}`)

    return { success: true, transaction: result }
  } catch (error) {
    console.error('Transfer error:', error)
    return { error: error.message || 'Failed to transfer funds' }
  }
}
```

## Best Practices

### 1. Always Validate Input
```javascript
// ❌ Bad: No validation
export async function badAction(formData) {
  const email = formData.get('email')
  await db.users.create({ data: { email } })
  return { success: true }
}

// ✅ Good: With validation
export async function goodAction(formData) {
  const email = formData.get('email')

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { error: 'Invalid email' }
  }

  await db.users.create({ data: { email } })
  return { success: true }
}
```

### 2. Handle Errors Gracefully
```javascript
export async function handleErrors(formData) {
  try {
    // Operation
    const result = await performOperation(formData)
    return { success: true, result }
  } catch (error) {
    // Log error for debugging
    console.error('Action error:', error)

    // Return user-friendly error message
    return { error: 'Operation failed. Please try again.' }
  }
}
```

### 3. Use Appropriate Cache Invalidation
```javascript
export async function updateEntity(formData) {
  const entity = await db.entity.update(formData)

  // Revalidate specific path
  revalidatePath(`/entities/${entity.id}`)

  // Revalidate list page
  revalidatePath('/entities')

  // Revalidate by tag if using tag-based caching
  // revalidateTag('entities')

  return { success: true, entity }
}
```

Server Actions provide a powerful and secure way to handle server-side operations from client components. They eliminate the need for separate API routes while maintaining security and performance benefits. Always validate inputs, handle errors appropriately, and revalidate cached data when necessary.
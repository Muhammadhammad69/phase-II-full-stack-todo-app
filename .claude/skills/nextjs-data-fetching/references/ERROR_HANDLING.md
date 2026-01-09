# Next.js Error Handling in Data Fetching and Server Actions

## Overview

Proper error handling is crucial for creating robust and user-friendly Next.js applications. This guide covers error handling patterns for data fetching in Server Components and Server Actions.

## Error Handling in Data Fetching

### Basic Error Handling
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
      <div className="error-container">
        <h2>Error loading products</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
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

### Using Error Boundaries
```javascript
// app/error.js
'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="error-boundary">
          <h2>Something went wrong!</h2>
          <p>We're sorry, but there was an error loading this page.</p>
          <button onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

// app/not-found.js
export default function NotFound() {
  return (
    <div className="not-found">
      <h2>Not Found</h2>
      <p>Could not find the requested resource</p>
      <a href="/">Return Home</a>
    </div>
  )
}
```

### Fetch Error Handling with Status Codes
```javascript
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  try {
    const res = await fetch(`https://api.example.com/posts/${params.slug}`)

    if (!res.ok) {
      if (res.status === 404) {
        // Handle 404 specifically
        return <div>Post not found</div>
      } else if (res.status === 500) {
        // Handle server errors
        return <div>Server error occurred</div>
      } else {
        // Handle other status codes
        throw new Error(`HTTP error! status: ${res.status}`)
      }
    }

    const post = await res.json()

    return (
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    return (
      <div className="error-container">
        <h2>Error loading post</h2>
        <p>An unexpected error occurred. Please try again later.</p>
      </div>
    )
  }
}
```

## Error Handling in Server Actions

### Basic Server Action Error Handling
```javascript
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData) {
  const name = formData.get('name')
  const price = formData.get('price')

  // Validate inputs
  if (!name || !price) {
    return { error: 'Name and price are required' }
  }

  try {
    const product = await db.products.create({
      data: {
        name: name.trim(),
        price: parseFloat(price)
      }
    })

    revalidatePath('/products')

    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)

    // Return user-friendly error message
    if (error.code === 'P2002') { // Prisma unique constraint violation
      return { error: 'A product with this name already exists' }
    }

    return { error: 'Failed to create product. Please try again.' }
  }
}
```

### Advanced Server Action Error Handling
```javascript
// app/actions/advanced-errors.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Define custom error types
class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export async function updateProduct(productId, formData) {
  try {
    // Validate inputs
    if (!productId || typeof productId !== 'string') {
      throw new ValidationError('Invalid product ID')
    }

    // Validate form data with Zod
    const productSchema = z.object({
      name: z.string().min(1).max(100),
      price: z.number().positive(),
      description: z.string().max(1000).optional()
    })

    const productData = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      description: formData.get('description')
    }

    const validatedData = productSchema.parse(productData)

    // Check if product exists
    const existingProduct = await db.products.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      throw new ValidationError('Product not found')
    }

    // Update the product
    const updatedProduct = await db.products.update({
      where: { id: productId },
      data: validatedData
    })

    // Revalidate paths
    revalidatePath(`/products/${productId}`)
    revalidatePath('/products')

    return { success: true, product: updatedProduct }
  } catch (error) {
    // Log error for debugging
    console.error('Update product error:', error)

    // Handle different error types
    if (error instanceof ValidationError) {
      return { error: error.message }
    } else if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    } else if (error.code === 'P2002') { // Unique constraint
      return { error: 'A product with this name already exists' }
    } else {
      // Generic error message to avoid exposing internal details
      return { error: 'Failed to update product. Please try again.' }
    }
  }
}
```

### Server Action with Detailed Error Response
```javascript
// app/actions/detailed-errors.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createUser(formData) {
  const email = formData.get('email')
  const name = formData.get('name')

  try {
    // Validate inputs
    if (!email || !name) {
      return {
        success: false,
        error: 'Email and name are required',
        fieldErrors: {
          email: !email ? 'Email is required' : undefined,
          name: !name ? 'Name is required' : undefined
        }
      }
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: 'Invalid email format',
        fieldErrors: {
          email: 'Please enter a valid email address'
        }
      }
    }

    // Check if user already exists
    const existingUser = await db.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
        fieldErrors: {
          email: 'This email is already in use'
        }
      }
    }

    // Create the user
    const user = await db.users.create({
      data: {
        email,
        name
      }
    })

    // Revalidate paths
    revalidatePath('/users')

    return {
      success: true,
      user,
      message: 'User created successfully!'
    }
  } catch (error) {
    console.error('Create user error:', error)

    // Return detailed error response
    return {
      success: false,
      error: 'An unexpected error occurred',
      fieldErrors: {},
      serverError: process.env.NODE_ENV === 'development'
        ? error.message
        : undefined
    }
  }
}
```

## Client-Side Error Handling

### Handling Server Action Errors in Client Components
```javascript
// app/components/UserForm.js
'use client'

import { useState } from 'react'
import { createUser } from '@/app/actions/detailed-errors'

export default function UserForm() {
  const [formState, setFormState] = useState({
    message: '',
    error: '',
    fieldErrors: {}
  })

  const handleSubmit = async (formData) => {
    const result = await createUser(formData)

    if (result.success) {
      setFormState({
        message: result.message,
        error: '',
        fieldErrors: {}
      })
      // Optionally reset form or redirect
    } else {
      setFormState({
        message: '',
        error: result.error,
        fieldErrors: result.fieldErrors
      })
    }
  }

  return (
    <form action={handleSubmit}>
      {formState.message && (
        <div className="success-message">
          {formState.message}
        </div>
      )}

      {formState.error && (
        <div className="error-message">
          {formState.error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
        />
        {formState.fieldErrors.email && (
          <span className="field-error">
            {formState.fieldErrors.email}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
        />
        {formState.fieldErrors.name && (
          <span className="field-error">
            {formState.fieldErrors.name}
          </span>
        )}
      </div>

      <button type="submit">Create User</button>
    </form>
  )
}
```

## Form Error Handling with useFormState

### Using useFormState for Error Handling
```javascript
// app/components/ProductForm.js
'use client'

import { useFormState } from 'react-dom'
import { createProduct } from '@/app/actions'

const initialState = {
  message: '',
  error: '',
  fieldErrors: {}
}

export default function ProductForm() {
  const [state, formAction] = useFormState(createProduct, initialState)

  return (
    <form action={formAction}>
      {state.message && (
        <div className="success">{state.message}</div>
      )}

      {state.error && (
        <div className="error">{state.error}</div>
      )}

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
        />
        {state.fieldErrors?.name && (
          <span className="error">{state.fieldErrors.name}</span>
        )}
      </div>

      <div>
        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          type="number"
          required
        />
        {state.fieldErrors?.price && (
          <span className="error">{state.fieldErrors.price}</span>
        )}
      </div>

      <button type="submit">Create Product</button>
    </form>
  )
}
```

## Database Error Handling

### Prisma Error Handling
```javascript
// lib/prisma-error-handler.js
import { Prisma } from '@prisma/client'

export function handlePrismaError(error) {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return {
        error: 'A record with this value already exists',
        code: 'UNIQUE_CONSTRAINT'
      }
    case 'P2025': // Record not found
      return {
        error: 'Record not found',
        code: 'RECORD_NOT_FOUND'
      }
    case 'P2003': // Foreign key constraint violation
      return {
        error: 'Cannot delete record due to related records',
        code: 'FOREIGN_KEY_VIOLATION'
      }
    default:
      return {
        error: 'An unexpected database error occurred',
        code: 'DATABASE_ERROR'
      }
  }
}

// app/actions/error-handled-actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { handlePrismaError } from '@/lib/prisma-error-handler'

export async function deleteProduct(productId) {
  try {
    const product = await db.products.delete({
      where: { id: productId }
    })

    revalidatePath('/products')

    return { success: true, product }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const handledError = handlePrismaError(error)
      return { error: handledError.error }
    }

    console.error('Delete product error:', error)
    return { error: 'Failed to delete product' }
  }
}
```

## Network Error Handling

### Handling Fetch Network Errors
```javascript
// lib/network-error-handler.js
export function handleNetworkError(error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error: Unable to connect to server'
  }

  if (error.message.includes('Failed to fetch')) {
    return 'Unable to reach the server. Please check your internet connection.'
  }

  return 'An unexpected network error occurred'
}

// app/data-fetching/network-errors.js
export default async function NetworkErrorPage() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const res = await fetch('https://api.example.com/data', {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()

    return <div>{data.content}</div>
  } catch (error) {
    if (error.name === 'AbortError') {
      return (
        <div className="error">
          <h2>Request Timeout</h2>
          <p>The request took too long to complete. Please try again.</p>
        </div>
      )
    }

    const errorMessage = handleNetworkError(error)

    return (
      <div className="error">
        <h2>Network Error</h2>
        <p>{errorMessage}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }
}
```

## Error Logging and Monitoring

### Structured Error Logging
```javascript
// lib/logger.js
export function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog)
  }

  // Send to error reporting service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Sentry, LogRocket, etc.
    // sendToErrorReportingService(errorLog)
  }
}

// app/actions/logged-actions.js
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/logger'

export async function loggedAction(formData) {
  try {
    // Perform action
    const result = await db.someOperation(formData)

    revalidatePath('/some-path')

    return { success: true, result }
  } catch (error) {
    // Log the error with context
    logError(error, {
      action: 'loggedAction',
      formDataKeys: Object.fromEntries(formData.entries())
    })

    return { error: 'Operation failed. Please try again.' }
  }
}
```

## Best Practices

### 1. Never Expose Internal Errors
```javascript
// ❌ Bad: Exposing internal errors
export async function badAction(formData) {
  try {
    await db.operation(formData)
    return { success: true }
  } catch (error) {
    return { error: error.message } // Exposes internal details
  }
}

// ✅ Good: Generic error messages
export async function goodAction(formData) {
  try {
    await db.operation(formData)
    return { success: true }
  } catch (error) {
    console.error('Operation error:', error) // Log internally
    return { error: 'Operation failed. Please try again.' } // Generic message
  }
}
```

### 2. Validate Inputs First
```javascript
export async function validatedAction(formData) {
  // Validate inputs first
  const email = formData.get('email')
  if (!email || !email.includes('@')) {
    return { error: 'Please provide a valid email address' }
  }

  // Then perform operation
  try {
    const user = await db.users.create({ data: { email } })
    return { success: true, user }
  } catch (error) {
    console.error('Create user error:', error)
    return { error: 'Failed to create user' }
  }
}
```

### 3. Use Appropriate Error Boundaries
```javascript
// app/components/WithErrorBoundary.js
'use client'

import { useState, useEffect } from 'react'

export default function WithErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (hasError) {
      // Report error to monitoring service
      console.error('Error boundary caught error')
    }
  }, [hasError])

  if (hasError) {
    return (
      <div className="error-fallback">
        <h2>Something went wrong</h2>
        <button onClick={() => setHasError(false)}>
          Try again
        </button>
      </div>
    )
  }

  return children
}
```

### 4. Handle Different Error Types
```javascript
export async function handleDifferentErrors(formData) {
  try {
    const result = await performOperation(formData)
    return { success: true, result }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message }
    } else if (error.code === 'P2002') {
      return { error: 'This item already exists' }
    } else if (error.name === 'NetworkError') {
      return { error: 'Unable to connect to server' }
    } else {
      console.error('Unexpected error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }
}
```

Proper error handling enhances user experience and helps maintain application stability. Always validate inputs, handle different error types appropriately, log errors for debugging, and provide user-friendly error messages.
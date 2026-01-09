# Next.js API Routes Guide

## Overview

API routes in Next.js App Router allow you to create backend endpoints directly in your application without needing a separate server. These routes are created using the `route.js` file in the `app` directory and support all HTTP methods.

## Basic API Route Structure

### Simple GET Route
Create an API route by adding a `route.js` file in the `app/api` directory:

```javascript
// app/api/hello/route.js
export async function GET(request) {
  return new Response('Hello, Next.js!')
}
```

This creates an endpoint at `/api/hello` that responds to GET requests.

### Multiple HTTP Methods
You can export multiple HTTP method handlers in the same file:

```javascript
// app/api/user/route.js
export async function GET(request) {
  return Response.json({ message: 'Get user data' })
}

export async function POST(request) {
  const data = await request.json()
  return Response.json({ message: 'User created', data })
}

export async function PUT(request) {
  const data = await request.json()
  return Response.json({ message: 'User updated', data })
}

export async function DELETE(request) {
  return new Response(null, { status: 204 })
}
```

## Request and Response Handling

### Reading Request Data
```javascript
// app/api/data/route.js
export async function POST(request) {
  // Get URL search parameters
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Parse JSON body
  const body = await request.json()

  // Get headers
  const contentType = request.headers.get('content-type')

  return Response.json({
    id,
    body,
    contentType,
  })
}
```

### Different Response Types
```javascript
// app/api/responses/route.js
export async function GET(request) {
  // JSON response
  if (request.headers.get('accept')?.includes('application/json')) {
    return Response.json({ message: 'JSON response' })
  }

  // Text response
  if (request.headers.get('accept')?.includes('text/plain')) {
    return new Response('Plain text response')
  }

  // HTML response
  return new Response('<h1>HTML response</h1>', {
    headers: { 'Content-Type': 'text/html' },
  })
}
```

## Dynamic API Routes

### Dynamic Route Parameters
API routes can use the same dynamic route patterns as page routes:

```
app/
└── api/
    └── users/
        └── [id]/
            └── route.js
```

```javascript
// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const userId = params.id

  // Fetch user from database
  const user = await getUserById(userId)

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json(user)
}

export async function PUT(request, { params }) {
  const userId = params.id
  const data = await request.json()

  // Update user in database
  const updatedUser = await updateUserById(userId, data)

  return Response.json(updatedUser)
}

export async function DELETE(request, { params }) {
  const userId = params.id

  // Delete user from database
  await deleteUserById(userId)

  return new Response(null, { status: 204 })
}
```

### Multiple Dynamic Segments
```javascript
// app/api/users/[userId]/posts/[postId]/route.js
export async function GET(request, { params }) {
  const { userId, postId } = params

  const post = await getPostById(userId, postId)

  if (!post) {
    return Response.json({ error: 'Post not found' }, { status: 404 })
  }

  return Response.json(post)
}
```

## Advanced API Route Features

### Middleware-like Behavior
You can add authentication or validation logic directly in API routes:

```javascript
// app/api/protected/route.js
async function authenticate(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.substring(7)
  return await verifyToken(token)
}

export async function GET(request) {
  const user = await authenticate(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({ message: 'Protected data', user: user.id })
}
```

### Request Body Validation
```javascript
// app/api/validation/route.js
function validateUserData(data) {
  const errors = []

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string')
  }

  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required')
  }

  if (data.age && (typeof data.age !== 'number' || data.age < 0)) {
    errors.push('Age must be a positive number')
  }

  return errors
}

export async function POST(request) {
  const data = await request.json()
  const errors = validateUserData(data)

  if (errors.length > 0) {
    return Response.json(
      { error: 'Validation failed', details: errors },
      { status: 400 }
    )
  }

  // Process valid data
  const user = await createUser(data)
  return Response.json(user, { status: 201 })
}
```

### Error Handling
```javascript
// app/api/error-handling/route.js
export async function GET(request) {
  try {
    const data = await fetchData()
    return Response.json(data)
  } catch (error) {
    console.error('API Error:', error)

    // Return appropriate error response
    if (error.code === 'FETCH_ERROR') {
      return Response.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      )
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Database Integration

### Connecting to a Database
```javascript
// lib/db.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// app/api/users/route.js
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return Response.json(users)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
    })

    return Response.json(user, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

## Request and Response Headers

### Setting Response Headers
```javascript
// app/api/headers/route.js
export async function GET(request) {
  return new Response('Hello', {
    headers: {
      'Content-Type': 'text/plain',
      'X-Custom-Header': 'custom-value',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

### Reading Request Headers
```javascript
// app/api/request-info/route.js
export async function GET(request) {
  const userAgent = request.headers.get('user-agent')
  const accept = request.headers.get('accept')
  const contentType = request.headers.get('content-type')

  return Response.json({
    userAgent,
    accept,
    contentType,
  })
}
```

## API Route Patterns

### File Upload Handler
```javascript
// app/api/upload/route.js
export async function POST(request) {
  try {
    // Note: For file uploads, you might need to use a library like busboy
    // or handle multipart form data differently
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Process the file (implementation depends on your storage solution)
    const result = await saveFile(file)

    return Response.json(result, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

### Rate Limiting
```javascript
// lib/rate-limit.js
const rateLimitMap = new Map()

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
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
    resetTime: record.resetTime,
  }
}

// app/api/rate-limited/route.js
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed, remaining, resetTime } = checkRateLimit(ip, 5, 60000) // 5 requests per minute

  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  return Response.json(
    { message: 'Success', remaining },
    {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  )
}
```

### Middleware Integration
```javascript
// middleware.js
export function middleware(request) {
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
}

export const config = {
  matcher: ['/api/protected/:path*'],
}
```

## Testing API Routes

### Unit Testing Example
```javascript
// __tests__/api/users.test.js
// This would typically run in a Node.js environment with Next.js test utilities

describe('User API Routes', () => {
  test('GET /api/users returns list of users', async () => {
    const response = await fetch('/api/users')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  test('POST /api/users creates a new user', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' }
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    expect(response.status).toBe(201)
    const user = await response.json()
    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
  })
})
```

## Performance Considerations

### Caching API Responses
```javascript
// app/api/cached-data/route.js
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const data = await expensiveDataFetch()
  return Response.json(data)
}

// Or with cache tags
export async function GET() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600, tags: ['api-data'] }
  }).then(res => res.json())

  return Response.json(data)
}
```

### Streaming Responses
```javascript
// app/api/streaming/route.js
export async function GET() {
  // Create a stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('Line 1\n'))
      await new Promise(resolve => setTimeout(resolve, 1000))
      controller.enqueue(encoder.encode('Line 2\n'))
      await new Promise(resolve => setTimeout(resolve, 1000))
      controller.enqueue(encoder.encode('Line 3\n'))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

API routes in Next.js provide a powerful way to create backend endpoints with minimal setup. They support all HTTP methods, dynamic routing, and can integrate with databases and other services. Remember to handle errors appropriately, validate input data, and consider security implications when creating API routes.
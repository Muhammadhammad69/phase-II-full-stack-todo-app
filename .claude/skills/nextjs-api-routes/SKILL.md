---
name: nextjs-api-routes
description: Build RESTful APIs directly in Next.js using API routes. Learn request handling, middleware, authentication, CORS configuration, and best practices for creating backend endpoints. Use when Claude needs to create API endpoints, handle HTTP requests and responses, implement authentication, configure CORS, or work with request/response objects in Next.js applications.
---

# API Routes and RESTful APIs - Backend Endpoints

## Overview

Next.js API routes allow you to create backend endpoints directly within your Next.js application. Using the App Router, you can create route handlers with the `route.js` file that handle various HTTP methods and provide a complete backend solution without needing a separate server.

## API Routes Basics

### Route Handler Structure
API routes in the App Router are created using `route.js` files in the `app/api/` directory. Each HTTP method is defined as an exported async function:

```javascript
// app/api/posts/route.js
export async function GET(request) {
  const posts = await db.posts.findAll()
  return Response.json(posts)
}

export async function POST(request) {
  const data = await request.json()
  const post = await db.posts.create(data)
  return Response.json(post, { status: 201 })
}

export async function PUT(request) {
  const data = await request.json()
  const post = await db.posts.update(data)
  return Response.json(post)
}

export async function DELETE(request) {
  await db.posts.delete()
  return new Response(null, { status: 204 })
}
```

### Supported HTTP Methods
Next.js supports all standard HTTP methods in route handlers:

```javascript
// app/api/resource/route.js
export async function GET(request) {}
export async function HEAD(request) {}
export async function POST(request) {}
export async function PUT(request) {}
export async function DELETE(request) {}
export async function PATCH(request) {}

// OPTIONS is auto-implemented if not defined
export async function OPTIONS(request) {}
```

## File Structure

### Route Organization
The file path determines the API endpoint path:

```
app/api/
├── users/
│   ├── route.js         → /api/users
│   └── [id]/
│       └── route.js     → /api/users/[id]
├── posts/
│   ├── route.js         → /api/posts
│   └── [id]/
│       └── route.js     → /api/posts/[id]
└── auth/
    ├── login/route.js   → /api/auth/login
    └── register/route.js → /api/auth/register
```

### Dynamic Routes
Use square brackets to create dynamic API routes:

```javascript
// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const user = await db.users.findById(params.id)
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }
  return Response.json(user)
}

export async function PUT(request, { params }) {
  const data = await request.json()
  const user = await db.users.update(params.id, data)
  return Response.json(user)
}

export async function DELETE(request, { params }) {
  await db.users.delete(params.id)
  return new Response(null, { status: 204 })
}
```

## Request and Response Handling

### Request Object
The request object provides access to various properties:

```javascript
// app/api/example/route.js
export async function GET(request) {
  // Request properties
  const url = request.url
  const method = request.method
  const headers = request.headers

  // Get specific header
  const contentType = headers.get('content-type')
  const authorization = headers.get('authorization')

  return Response.json({ contentType, authorization })
}

export async function POST(request) {
  // Parse JSON body
  const data = await request.json()

  // Parse form data
  const formData = await request.formData()

  // Get URL search parameters
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  return Response.json({ data, query })
}
```

### Response Object
Create appropriate responses with proper status codes:

```javascript
// app/api/posts/route.js
export async function POST(request) {
  const data = await request.json()

  // Validation
  if (!data.title) {
    return Response.json(
      { error: 'Title is required' },
      { status: 400 }
    )
  }

  // Create resource
  const post = await db.posts.create(data)

  // Return created resource with 201 status
  return Response.json(post, { status: 201 })
}

export async function GET(request) {
  const posts = await db.posts.findAll()

  // Return with custom headers
  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

## Query Parameters

### Extracting Query Parameters
Access query parameters from the request URL:

```javascript
// app/api/posts/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)

  // Get individual parameters
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10
  const sort = searchParams.get('sort') || 'date'
  const category = searchParams.get('category')

  // Get all parameters
  const filters = {}
  for (const [key, value] of searchParams.entries()) {
    filters[key] = value
  }

  const posts = await db.posts.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sort]: 'desc' },
    where: category ? { category } : {}
  })

  return Response.json({
    posts,
    pagination: {
      page,
      limit,
      total: await db.posts.count()
    }
  })
}

// Usage: /api/posts?page=2&limit=20&sort=title&category=tech
```

## Request Body Parsing

### JSON Parsing
Parse JSON request bodies:

```javascript
// app/api/users/route.js
export async function POST(request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.email || !data.name) {
      return Response.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Create user
    const user = await db.users.create(data)

    return Response.json(user, { status: 201 })
  } catch (error) {
    // Handle JSON parsing errors
    return Response.json(
      { error: 'Invalid JSON format' },
      { status: 400 }
    )
  }
}
```

### Form Data Parsing
Parse form data for file uploads or form submissions:

```javascript
// app/api/upload/route.js
export async function POST(request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const userId = formData.get('userId')

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Process file upload
    const result = await uploadFile(file)

    return Response.json({
      success: true,
      fileId: result.id
    }, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

## Headers and Cookies

### Working with Headers
Access and set headers in API routes:

```javascript
// app/api/secure/route.js
export async function GET(request) {
  // Get request headers
  const authHeader = request.headers.get('authorization')
  const userAgent = request.headers.get('user-agent')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Create response with custom headers
  const response = Response.json({ message: 'Secure data' })
  response.headers.set('X-API-Version', '1.0')
  response.headers.append('X-Custom-Header', 'value')

  return response
}
```

### Working with Cookies
Handle cookies for session management:

```javascript
// app/api/session/route.js
export async function GET(request) {
  // Get cookie
  const sessionId = request.cookies.get('sessionId')

  if (!sessionId) {
    return Response.json(
      { error: 'No session' },
      { status: 401 }
    )
  }

  // Verify session
  const session = await verifySession(sessionId)

  if (!session) {
    return Response.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }

  return Response.json({ user: session.user })
}

export async function POST(request) {
  const data = await request.json()

  // Create session
  const session = await createSession(data)

  // Create response with cookie
  const response = Response.json({ user: session.user }, { status: 201 })
  response.cookies.set('sessionId', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'strict',
    path: '/'
  })

  return response
}
```

## Authentication in API Routes

### JWT Token Verification
Implement authentication with JWT tokens:

```javascript
// lib/auth.js
import jwt from 'jsonwebtoken'

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// app/api/protected/route.js
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Authorization header required' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const decoded = verifyToken(token)

  if (!decoded) {
    return Response.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Token is valid, proceed with request
  const user = await db.users.findById(decoded.userId)

  return Response.json({ user })
}
```

### Session-Based Authentication
Implement session-based authentication:

```javascript
// lib/session.js
export async function getSession(request) {
  const sessionId = request.cookies.get('sessionId')

  if (!sessionId) {
    return null
  }

  return await db.sessions.findById(sessionId)
}

// app/api/profile/route.js
import { getSession } from '@/lib/session'

export async function GET(request) {
  const session = await getSession(request)

  if (!session) {
    return Response.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const user = await db.users.findById(session.userId)

  return Response.json({ user })
}

export async function PUT(request) {
  const session = await getSession(request)

  if (!session) {
    return Response.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const data = await request.json()
  const updatedUser = await db.users.update(session.userId, data)

  return Response.json(updatedUser)
}
```

## CORS Configuration

### Setting CORS Headers
Configure CORS for cross-origin requests:

```javascript
// app/api/public/route.js
export async function GET(request) {
  const data = await fetchPublicData()

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // In production, specify exact origins
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  })
}

// Handle preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
```

### Production CORS Configuration
For production applications, specify exact origins:

```javascript
// lib/cors.js
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://yourdomain.com',
  'https://www.yourdomain.com'
]

export function isOriginAllowed(origin) {
  return allowedOrigins.includes(origin)
}

// app/api/secure/route.js
import { isOriginAllowed } from '@/lib/cors'

export async function GET(request) {
  const origin = request.headers.get('origin')

  const response = Response.json({ data: 'secure' })

  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}
```

## Error Handling

### Comprehensive Error Handling
Implement proper error handling with try/catch blocks:

```javascript
// app/api/posts/route.js
export async function POST(request) {
  try {
    const data = await request.json()

    // Validation
    if (!data.title || !data.content) {
      return Response.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    if (data.title.length < 5) {
      return Response.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      )
    }

    // Create post
    const post = await db.posts.create(data)

    return Response.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)

    // Handle specific error types
    if (error.code === 'P2002') { // Prisma unique constraint
      return Response.json(
        { error: 'Post with this title already exists' },
        { status: 409 }
      )
    }

    // Generic server error
    return Response.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
```

### Custom Error Response
Create a custom error response helper:

```javascript
// lib/error-handler.js
export function createErrorResponse(message, status = 500, details = null) {
  return Response.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

// app/api/handlers/posts.js
import { createErrorResponse } from '@/lib/error-handler'

export async function GET(request, { params }) {
  try {
    const post = await db.posts.findById(params.id)

    if (!post) {
      return createErrorResponse('Post not found', 404)
    }

    return Response.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return createErrorResponse('Failed to fetch post', 500)
  }
}
```

## Complete CRUD Example

### Posts API with Full CRUD Operations
```javascript
// app/api/posts/route.js
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const posts = await db.posts.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const total = await db.posts.count()

    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validation
    if (!data.title || !data.content) {
      return Response.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const post = await db.posts.create({
      ...data,
      published: data.published ?? false
    })

    return Response.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return Response.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

// app/api/posts/[id]/route.js
export async function GET(request, { params }) {
  try {
    const post = await db.posts.findById(params.id)

    if (!post) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return Response.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return Response.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()

    const post = await db.posts.update(params.id, data)

    return Response.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    return Response.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await db.posts.delete(params.id)

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting post:', error)
    return Response.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
```

## Common Mistakes to Avoid

1. **Not handling all HTTP methods properly**: Define only the methods you need and return appropriate status codes for unsupported methods

2. **Forgetting error handling**: Always wrap API logic in try/catch blocks and return proper error responses

3. **Not validating input**: Validate all request data, check required fields, and sanitize user input

4. **Exposing sensitive data**: Don't return passwords or other sensitive fields, filter data before sending responses

5. **Not setting proper status codes**: Use appropriate HTTP status codes (201 for creation, 204 for deletion, 400 for bad requests, etc.)

6. **Ignoring CORS**: Set appropriate CORS headers if your API will be accessed from different domains

## Best Practices

1. **Use proper HTTP methods**: GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for removal

2. **Return correct status codes**: 200 for success, 201 for creation, 400 for bad requests, 401 for unauthorized, 404 for not found, 500 for server errors

3. **Validate all inputs**: Always validate request data and return appropriate error messages

4. **Handle errors gracefully**: Use try/catch blocks and provide user-friendly error messages

5. **Authenticate sensitive endpoints**: Implement proper authentication and authorization

6. **Use consistent naming**: Follow RESTful conventions for endpoint naming

7. **Document your API**: Provide clear documentation for your endpoints

8. **Log important events**: Log errors and important events for debugging

9. **Implement rate limiting**: Protect your API from abuse

10. **Test thoroughly**: Test all endpoints with various scenarios

## Quick Reference

### HTTP Methods:
```javascript
export async function GET(request) {
  // Retrieve data
  return Response.json(data)
}

export async function POST(request) {
  // Create data
  const data = await request.json()
  return Response.json(result, { status: 201 })
}

export async function PUT(request, { params }) {
  // Update data
  return Response.json(updatedData)
}

export async function DELETE(request, { params }) {
  // Delete data
  return new Response(null, { status: 204 })
}
```

### Status Codes:
- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

### Request Parsing:
```javascript
// JSON
const data = await request.json()

// Form data
const formData = await request.formData()

// Query parameters
const { searchParams } = new URL(request.url)
const param = searchParams.get('param')
```

### Response Creation:
```javascript
// JSON response
Response.json(data)

// JSON with status
Response.json(data, { status: 201 })

// Custom response
new Response(body, {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
})
```

## References

For detailed information on specific topics, see the reference files:
- [REQUEST_HANDLING.md](references/REQUEST_HANDLING.md) - Advanced request handling techniques
- [RESPONSE_FORMATTING.md](references/RESPONSE_FORMATTING.md) - Response formatting and headers
- [AUTHENTICATION.md](references/AUTHENTICATION.md) - Authentication and authorization patterns
- [ERROR_HANDLING.md](references/ERROR_HANDLING.md) - Error handling strategies
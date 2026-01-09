# Next.js API Routes - Response Formatting

## Overview

Proper response formatting is crucial for creating well-designed APIs that provide a good developer experience. This guide covers various aspects of creating and formatting API responses in Next.js.

## Basic Response Creation

### Response.json()
The most common way to return JSON responses:

```javascript
// app/api/users/route.js
export async function GET(request) {
  const users = await db.users.findAll()

  // Simple JSON response
  return Response.json(users)
}

export async function POST(request) {
  const data = await request.json()
  const user = await db.users.create(data)

  // JSON response with status code
  return Response.json(user, { status: 201 })
}

export async function DELETE(request, { params }) {
  await db.users.delete(params.id)

  // Empty response with status code
  return new Response(null, { status: 204 })
}
```

### Custom Response Objects
Create responses with custom bodies and headers:

```javascript
// app/api/custom/route.js
export async function GET(request) {
  const data = await fetchSomeData()

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'X-API-Version': '1.0'
    }
  })
}

export async function POST(request) {
  const data = await request.json()
  const result = await processData(data)

  // Response with multiple headers
  const response = new Response(JSON.stringify(result), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Location': `/api/resources/${result.id}`,
      'X-Resource-ID': result.id.toString()
    }
  })

  return response
}
```

## HTTP Status Codes

### Standard Status Codes
Use appropriate status codes for different scenarios:

```javascript
// app/api/status-codes/route.js
export async function GET(request) {
  const resource = await getResource()

  if (!resource) {
    // 404 Not Found
    return Response.json(
      { error: 'Resource not found' },
      { status: 404 }
    )
  }

  // 200 OK - Success
  return Response.json(resource)
}

export async function POST(request) {
  const data = await request.json()

  // 400 Bad Request - Validation error
  if (!data.name) {
    return Response.json(
      { error: 'Name is required' },
      { status: 400 }
    )
  }

  // 401 Unauthorized - Authentication required
  const auth = request.headers.get('authorization')
  if (!auth) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // 403 Forbidden - Insufficient permissions
  const user = await verifyToken(auth)
  if (user.role !== 'admin') {
    return Response.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  // 201 Created - Resource successfully created
  const resource = await createResource(data)
  return Response.json(resource, { status: 201 })
}

export async function PUT(request, { params }) {
  const data = await request.json()

  // 409 Conflict - Resource already exists
  const existing = await findResource(data.identifier)
  if (existing && existing.id !== params.id) {
    return Response.json(
      { error: 'Resource with this identifier already exists' },
      { status: 409 }
    )
  }

  const updated = await updateResource(params.id, data)

  // 200 OK - Resource successfully updated
  return Response.json(updated)
}

export async function DELETE(request, { params }) {
  const deleted = await deleteResource(params.id)

  if (!deleted) {
    // 404 Not Found - Resource doesn't exist
    return Response.json(
      { error: 'Resource not found' },
      { status: 404 }
    )
  }

  // 204 No Content - Resource successfully deleted
  return new Response(null, { status: 204 })
}
```

### Custom Status Code Helper
Create a helper for consistent status code responses:

```javascript
// lib/response-helpers.js
export function createResponse(data, statusCode = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}

export function createErrorResponse(message, statusCode = 500, additionalData = {}) {
  return createResponse(
    {
      error: message,
      ...additionalData,
      timestamp: new Date().toISOString()
    },
    statusCode
  )
}

export function createSuccessResponse(data, statusCode = 200) {
  return createResponse(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    statusCode
  )
}

// app/api/helpers/route.js
import {
  createResponse,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/response-helpers'

export async function GET(request) {
  try {
    const data = await fetchData()

    if (!data) {
      return createErrorResponse('Data not found', 404)
    }

    return createSuccessResponse(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.requiredField) {
      return createErrorResponse('Required field is missing', 400)
    }

    const result = await processCreation(data)

    return createSuccessResponse(result, 201)
  } catch (error) {
    console.error('Error creating resource:', error)
    return createErrorResponse('Failed to create resource', 500)
  }
}
```

## Response Headers

### Common Response Headers
Set appropriate headers for different scenarios:

```javascript
// app/api/headers/route.js
export async function GET(request) {
  const data = await getPublicData()

  const response = Response.json(data)

  // Caching headers
  response.headers.set('Cache-Control', 'public, max-age=3600')
  response.headers.set('ETag', generateETag(data))

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // API versioning
  response.headers.set('X-API-Version', '1.0')

  // Rate limiting info
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', '99')

  return response
}

export async function POST(request) {
  const data = await request.json()
  const resource = await createResource(data)

  const response = Response.json(resource, { status: 201 })

  // Location header for created resources
  response.headers.set('Location', `/api/resources/${resource.id}`)

  // Content headers
  response.headers.set('Content-Type', 'application/json')
  response.headers.set('Content-Length', JSON.stringify(resource).length.toString())

  return response
}
```

### Pagination Headers
Include pagination information in response headers:

```javascript
// app/api/paginated/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10

  const offset = (page - 1) * limit

  const [resources, totalCount] = await Promise.all([
    getResources(offset, limit),
    getTotalCount()
  ])

  const totalPages = Math.ceil(totalCount / limit)

  const response = Response.json({
    data: resources,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages
    }
  })

  // Set pagination headers
  response.headers.set('X-Total-Count', totalCount.toString())
  response.headers.set('X-Page', page.toString())
  response.headers.set('X-Limit', limit.toString())
  response.headers.set('X-Total-Pages', totalPages.toString())

  // Link header for pagination
  const links = []

  if (page > 1) {
    links.push(`<${buildUrl(page - 1)}>; rel="prev"`)
  }

  if (page < totalPages) {
    links.push(`<${buildUrl(page + 1)}>; rel="next"`)
  }

  links.push(`<${buildUrl(1)}>; rel="first"`)
  links.push(`<${buildUrl(totalPages)}>; rel="last"`)

  if (links.length > 0) {
    response.headers.set('Link', links.join(', '))
  }

  return response
}

function buildUrl(page) {
  const url = new URL(request.url)
  url.searchParams.set('page', page)
  return url.toString()
}
```

## Content Types

### Different Content Types
Return different content types based on request requirements:

```javascript
// app/api/content-types/route.js
export async function GET(request) {
  const acceptHeader = request.headers.get('accept') || ''

  // Determine response format based on Accept header
  if (acceptHeader.includes('text/html')) {
    // HTML response
    const data = await getData()
    const html = generateHtml(data)

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  } else if (acceptHeader.includes('text/plain')) {
    // Plain text response
    const data = await getData()
    const text = JSON.stringify(data, null, 2)

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  } else if (acceptHeader.includes('application/xml')) {
    // XML response
    const data = await getData()
    const xml = convertToXml(data)

    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    })
  } else {
    // Default JSON response
    const data = await getData()
    return Response.json(data)
  }
}

// Helper function to generate HTML
function generateHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
      <head><title>API Response</title></head>
      <body>
        <h1>Data</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `
}

// Helper function to convert to XML (simplified)
function convertToXml(data) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <response>
      <data>${JSON.stringify(data)}</data>
    </response>`
}
```

### File Downloads
Serve files as downloads:

```javascript
// app/api/download/route.js
export async function GET(request, { params }) {
  const file = await getFile(params.fileId)

  if (!file) {
    return Response.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }

  // Create download response
  const response = new Response(file.buffer, {
    status: 200,
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.size.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })

  return response
}

// app/api/stream/route.js
export async function GET(request) {
  // Create a stream for large files
  const stream = new ReadableStream({
    async start(controller) {
      const chunks = await getLargeDataChunks()

      for (const chunk of chunks) {
        controller.enqueue(new TextEncoder().encode(chunk))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Transfer-Encoding': 'chunked'
    }
  })
}
```

## Error Response Formatting

### Consistent Error Responses
Format error responses consistently across your API:

```javascript
// lib/error-formatter.js
export function formatError(error, statusCode = 500, req = null) {
  const errorResponse = {
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  }

  // Add request ID for debugging (in production)
  if (process.env.NODE_ENV === 'production') {
    errorResponse.error.requestId = req?.headers.get('x-request-id') || generateRequestId()
  }

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack
    errorResponse.error.details = error.details
  }

  return errorResponse
}

export function createErrorResponse(error, statusCode = 500, req = null) {
  const formattedError = formatError(error, statusCode, req)

  return new Response(JSON.stringify(formattedError), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

// app/api/errors/route.js
import { createErrorResponse } from '@/lib/error-formatter'

export async function GET(request) {
  try {
    const data = await riskyOperation()
    return Response.json(data)
  } catch (error) {
    // Handle different error types
    if (error.name === 'ValidationError') {
      return createErrorResponse(error, 400, request)
    } else if (error.name === 'NotFoundError') {
      return createErrorResponse(error, 404, request)
    } else if (error.name === 'UnauthorizedError') {
      return createErrorResponse(error, 401, request)
    } else {
      // Log the actual error for debugging
      console.error('API Error:', error)
      return createErrorResponse(error, 500, request)
    }
  }
}
```

## API Response Patterns

### Standardized API Response Format
Create a consistent response format for your entire API:

```javascript
// lib/api-response.js
export class ApiResponse {
  constructor(data, meta = {}) {
    this.response = {
      success: true,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    }
  }

  static success(data, meta = {}) {
    return new Response(
      JSON.stringify(new ApiResponse(data, meta).response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  static created(data, location = null) {
    const response = new Response(
      JSON.stringify(new ApiResponse(data).response),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (location) {
      response.headers.set('Location', location)
    }

    return response
  }

  static error(message, status = 500, code = null) {
    const errorResponse = {
      success: false,
      error: {
        message,
        code: code || `ERROR_${status}`,
        status
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404, 'RESOURCE_NOT_FOUND')
  }

  static badRequest(message = 'Bad request') {
    return this.error(message, 400, 'BAD_REQUEST')
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403, 'FORBIDDEN')
  }
}

// app/api/standardized/route.js
import { ApiResponse } from '@/lib/api-response'

export async function GET(request) {
  try {
    const users = await db.users.findAll()

    return ApiResponse.success(users, {
      count: users.length,
      endpoint: '/api/users'
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return ApiResponse.error('Failed to fetch users')
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.email) {
      return ApiResponse.badRequest('Email is required')
    }

    const user = await db.users.create(data)

    return ApiResponse.created(user, `/api/users/${user.id}`)
  } catch (error) {
    console.error('Error creating user:', error)
    return ApiResponse.error('Failed to create user')
  }
}

export async function GET(request, { params }) {
  try {
    const user = await db.users.findById(params.id)

    if (!user) {
      return ApiResponse.notFound(`User with ID ${params.id} not found`)
    }

    return ApiResponse.success(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return ApiResponse.error('Failed to fetch user')
  }
}
```

Proper response formatting creates a consistent and professional API experience. Always consider the consumer of your API and provide clear, well-structured responses with appropriate status codes and headers.
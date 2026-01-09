# Next.js API Routes - Request Handling

## Overview

Proper request handling is fundamental to creating robust API endpoints in Next.js. This guide covers various aspects of handling incoming requests, including parameter extraction, body parsing, headers management, and more.

## Request Object Properties

### Basic Properties
The request object provides access to various properties of the incoming HTTP request:

```javascript
// app/api/example/route.js
export async function GET(request) {
  // URL and method information
  const url = request.url
  const method = request.method
  const headers = request.headers

  // Return request information
  return Response.json({
    url,
    method,
    headers: Object.fromEntries(headers.entries())
  })
}
```

### URL and Search Parameters
Access URL components and query parameters:

```javascript
// app/api/search/route.js
export async function GET(request) {
  const url = new URL(request.url)

  // Get the full URL components
  const pathname = url.pathname
  const search = url.search
  const hash = url.hash

  // Get specific query parameters
  const query = url.searchParams.get('q')
  const page = parseInt(url.searchParams.get('page')) || 1
  const limit = parseInt(url.searchParams.get('limit')) || 10
  const sortBy = url.searchParams.get('sort') || 'date'

  // Get all query parameters
  const queryParams = {}
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value
  }

  return Response.json({
    pathname,
    query,
    pagination: { page, limit },
    sorting: { sortBy },
    allParams: queryParams
  })
}
```

## Request Body Parsing

### JSON Parsing
Parse JSON request bodies with proper error handling:

```javascript
// app/api/users/route.js
export async function POST(request) {
  try {
    // Parse JSON body
    const body = await request.json()

    // Validate the parsed data
    if (!body.email || !body.name) {
      return Response.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Process the data
    const user = await db.users.create({
      email: body.email,
      name: body.name,
      role: body.role || 'user'
    })

    return Response.json(user, { status: 201 })
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    // Handle other errors
    console.error('Error parsing JSON:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Form Data Parsing
Handle form data for file uploads or multipart requests:

```javascript
// app/api/upload/route.js
export async function POST(request) {
  try {
    const formData = await request.formData()

    // Get specific fields
    const file = formData.get('file')
    const title = formData.get('title')
    const description = formData.get('description')
    const userId = formData.get('userId')

    // Validate required fields
    if (!file) {
      return Response.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (!(file instanceof File)) {
      return Response.json(
        { error: 'Uploaded file is not a valid file' },
        { status: 400 }
      )
    }

    // Validate file properties
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return Response.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Process file upload
    const uploadResult = await uploadFile(file)

    // Create file record in database
    const fileRecord = await db.files.create({
      filename: file.name,
      size: file.size,
      mimetype: file.type,
      url: uploadResult.url,
      userId
    })

    return Response.json({
      success: true,
      file: fileRecord
    }, { status: 201 })
  } catch (error) {
    console.error('File upload error:', error)
    return Response.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}
```

### Raw Body Parsing
For cases where you need to access the raw body stream:

```javascript
// app/api/webhook/route.js
export async function POST(request) {
  try {
    // Get the raw body as text
    const rawBody = await request.text()

    // Verify webhook signature (example with GitHub)
    const signature = request.headers.get('X-Hub-Signature-256')
    const expectedSignature = createHash('sha256')
      .update(rawBody)
      .digest('hex')

    if (signature !== `sha256=${expectedSignature}`) {
      return Response.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody)

    // Process webhook
    await processWebhook(payload)

    return Response.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
```

## Headers Management

### Reading Request Headers
Access and validate request headers:

```javascript
// app/api/secured/route.js
export async function GET(request) {
  // Get specific headers
  const contentType = request.headers.get('content-type')
  const userAgent = request.headers.get('user-agent')
  const authorization = request.headers.get('authorization')
  const apiKey = request.headers.get('x-api-key')

  // Validate required headers
  if (!apiKey) {
    return Response.json(
      { error: 'API key is required' },
      { status: 401 }
    )
  }

  // Validate API key
  const isValidApiKey = await validateApiKey(apiKey)
  if (!isValidApiKey) {
    return Response.json(
      { error: 'Invalid API key' },
      { status: 401 }
    )
  }

  // Validate content type for POST requests
  if (request.method === 'POST' && !contentType?.includes('application/json')) {
    return Response.json(
      { error: 'Content-Type must be application/json' },
      { status: 400 }
    )
  }

  // Continue with the request
  const data = await fetchData()

  return Response.json(data)
}
```

### Conditional Header Handling
Handle different header combinations:

```javascript
// app/api/conditional/route.js
export async function POST(request) {
  const headers = request.headers
  const contentType = headers.get('content-type')
  const accept = headers.get('accept')
  const authorization = headers.get('authorization')

  let data

  // Handle different content types
  if (contentType?.includes('application/json')) {
    data = await request.json()
  } else if (contentType?.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData()
    data = Object.fromEntries(formData)
  } else {
    return Response.json(
      { error: 'Unsupported content type' },
      { status: 415 }
    )
  }

  // Handle different accept types
  let response
  if (accept?.includes('application/json')) {
    response = Response.json(data, { status: 201 })
  } else if (accept?.includes('text/plain')) {
    response = new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'text/plain' }
    })
  } else {
    response = Response.json(data, { status: 201 })
  }

  return response
}
```

## Dynamic Route Parameters

### Single Dynamic Parameter
Handle single dynamic parameters in route paths:

```javascript
// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const userId = params.id

  // Validate parameter
  if (!userId || isNaN(parseInt(userId))) {
    return Response.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    )
  }

  try {
    const user = await db.users.findById(parseInt(userId))

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return Response.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return Response.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  const userId = params.id
  const data = await request.json()

  if (!userId || isNaN(parseInt(userId))) {
    return Response.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    )
  }

  try {
    const updatedUser = await db.users.update(parseInt(userId), data)

    if (!updatedUser) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
```

### Multiple Dynamic Parameters
Handle routes with multiple dynamic parameters:

```javascript
// app/api/organizations/[orgId]/members/[memberId]/route.js
export async function GET(request, { params }) {
  const orgId = params.orgId
  const memberId = params.memberId

  // Validate both parameters
  if (!orgId || isNaN(parseInt(orgId)) || !memberId || isNaN(parseInt(memberId))) {
    return Response.json(
      { error: 'Invalid organization or member ID' },
      { status: 400 }
    )
  }

  try {
    // Check if organization exists
    const org = await db.organizations.findById(parseInt(orgId))
    if (!org) {
      return Response.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if member belongs to organization
    const member = await db.members.findByOrgAndId(parseInt(orgId), parseInt(memberId))
    if (!member) {
      return Response.json(
        { error: 'Member not found in organization' },
        { status: 404 }
      )
    }

    return Response.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return Response.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}
```

### Catch-All Routes
Handle catch-all dynamic routes:

```javascript
// app/api/files/[...path]/route.js
export async function GET(request, { params }) {
  const pathParts = params.path // This is an array of path segments

  // Join path segments to form the full path
  const filePath = pathParts.join('/')

  // Validate path (prevent directory traversal)
  if (filePath.includes('..') || filePath.startsWith('/')) {
    return Response.json(
      { error: 'Invalid file path' },
      { status: 400 }
    )
  }

  try {
    // Serve the file
    const file = await getFile(filePath)

    if (!file) {
      return Response.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Set appropriate content type
    const response = new Response(file.data, {
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream',
        'Content-Length': file.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })

    return response
  } catch (error) {
    console.error('Error serving file:', error)
    return Response.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}
```

## Advanced Request Handling

### Request Validation Middleware
Create reusable validation logic:

```javascript
// lib/request-validation.js
export function validateJSONRequest(request) {
  const contentType = request.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return {
      valid: false,
      error: 'Content-Type must be application/json',
      status: 400
    }
  }

  return { valid: true }
}

export function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter(field => !data[field])

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      status: 400
    }
  }

  return { valid: true }
}

// app/api/validated/route.js
import { validateJSONRequest, validateRequiredFields } from '@/lib/request-validation'

export async function POST(request) {
  // Validate request format
  const jsonValidation = validateJSONRequest(request)
  if (!jsonValidation.valid) {
    return Response.json(
      { error: jsonValidation.error },
      { status: jsonValidation.status }
    )
  }

  // Parse request body
  const data = await request.json()

  // Validate required fields
  const fieldValidation = validateRequiredFields(data, ['name', 'email'])
  if (!fieldValidation.valid) {
    return Response.json(
      { error: fieldValidation.error },
      { status: fieldValidation.status }
    )
  }

  // Process the validated request
  const result = await db.users.create(data)

  return Response.json(result, { status: 201 })
}
```

### Rate Limiting
Implement rate limiting for API endpoints:

```javascript
// lib/rate-limiter.js
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
    resetTime: record.resetTime
  }
}

// app/api/rate-limited/route.js
import { checkRateLimit } from '@/lib/rate-limiter'

export async function GET(request) {
  // Get client IP (consider using a more robust method in production)
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  const { allowed, remaining, resetTime } = checkRateLimit(ip, 100, 60000) // 100 requests per minute

  if (!allowed) {
    return Response.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.floor((resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.floor((resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  // Add rate limit headers
  const response = Response.json(await getData())
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())

  return response
}
```

Proper request handling ensures your API endpoints are robust, secure, and provide a good developer experience. Always validate inputs, handle errors gracefully, and provide clear error messages.
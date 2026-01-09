# Next.js API Routes - Error Handling

## Overview

Robust error handling is essential for creating reliable and maintainable API routes. This guide covers various error handling patterns, from basic try/catch blocks to comprehensive error management systems.

## Basic Error Handling

### Try/Catch Blocks
The fundamental pattern for handling errors in API routes:

```javascript
// app/api/basic-error/route.js
export async function GET(request) {
  try {
    const data = await fetchUserData()
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return Response.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Validation
    if (!data.email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await createUser(data)
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)

    // Handle specific error types
    if (error.message.includes('duplicate')) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generic server error
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

### Multiple Error Scenarios
Handle different error types in a single route:

```javascript
// app/api/multiple-errors/route.js
export async function GET(request, { params }) {
  try {
    // Validate parameter
    if (!params.id) {
      return Response.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      )
    }

    // Validate parameter format
    if (isNaN(parseInt(params.id))) {
      return Response.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Fetch data
    const resource = await getResource(parseInt(params.id))

    if (!resource) {
      return Response.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    return Response.json(resource)
  } catch (error) {
    console.error('Error in GET /api/resource/[id]:', error)

    // Handle different error types
    if (error.name === 'DatabaseConnectionError') {
      return Response.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    } else if (error.name === 'PermissionError') {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    } else {
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
```

## Custom Error Classes

### Creating Custom Errors
Define custom error classes for better error categorization:

```javascript
// lib/errors.js
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
    this.field = field
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
    this.status = 401
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
    this.status = 403
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
    this.status = 409
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Service unavailable') {
    super(message)
    this.name = 'ServiceUnavailableError'
    this.status = 503
  }
}

// Helper function to handle errors
export function handleApiError(error) {
  if (error instanceof ValidationError) {
    return Response.json(
      { error: error.message, field: error.field },
      { status: error.status }
    )
  } else if (error instanceof NotFoundError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    )
  } else if (error instanceof UnauthorizedError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    )
  } else if (error instanceof ForbiddenError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    )
  } else if (error instanceof ConflictError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    )
  } else if (error instanceof ServiceUnavailableError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    )
  } else {
    // Log unexpected errors
    console.error('Unexpected error:', error)

    // Return generic error in production
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Using Custom Errors
Implement custom errors in your API routes:

```javascript
// app/api/custom-errors/route.js
import {
  ValidationError,
  NotFoundError,
  handleApiError
} from '@/lib/errors'

export async function GET(request, { params }) {
  try {
    if (!params.id) {
      throw new ValidationError('ID parameter is required', 'id')
    }

    if (isNaN(parseInt(params.id))) {
      throw new ValidationError('ID must be a number', 'id')
    }

    const user = await db.users.findById(parseInt(params.id))

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return Response.json(user)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.email) {
      throw new ValidationError('Email is required', 'email')
    }

    if (!data.email.includes('@')) {
      throw new ValidationError('Invalid email format', 'email')
    }

    if (!data.name) {
      throw new ValidationError('Name is required', 'name')
    }

    if (data.name.length < 2) {
      throw new ValidationError('Name must be at least 2 characters', 'name')
    }

    const existingUser = await db.users.findByEmail(data.email)
    if (existingUser) {
      throw new ValidationError('Email already exists', 'email')
    }

    const user = await db.users.create(data)

    return Response.json(user, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Error Logging and Monitoring

### Structured Error Logging
Implement structured logging for better error tracking:

```javascript
// lib/logger.js
export class Logger {
  static log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logEntry)
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: send to external service like Sentry, LogRocket, etc.
      // externalLoggingService.send(logEntry)
    }
  }

  static error(message, meta = {}) {
    this.log('error', message, meta)
  }

  static warn(message, meta = {}) {
    this.log('warn', message, meta)
  }

  static info(message, meta = {}) {
    this.log('info', message, meta)
  }
}

// app/api/monitored/route.js
import { Logger } from '@/lib/logger'

export async function GET(request) {
  try {
    const data = await fetchComplexData()
    return Response.json(data)
  } catch (error) {
    // Log the error with context
    Logger.error('Failed to fetch complex data', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })

    return Response.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const startTime = Date.now()

  try {
    const data = await request.json()
    const result = await processUserData(data)

    // Log successful request
    Logger.info('User data processed successfully', {
      userId: result.userId,
      processingTime: Date.now() - startTime,
      url: request.url
    })

    return Response.json(result, { status: 201 })
  } catch (error) {
    // Log failed request with timing
    Logger.error('Failed to process user data', {
      error: error.message,
      processingTime: Date.now() - startTime,
      url: request.url,
      method: request.method
    })

    return Response.json(
      { error: 'Failed to process data' },
      { status: 500 }
    )
  }
}
```

### Error Context and Metadata
Include relevant context in error handling:

```javascript
// lib/error-context.js
export function createErrorContext(request, context = {}) {
  return {
    url: request.url,
    method: request.method,
    headers: {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      'x-forwarded-for': request.headers.get('x-forwarded-for')
    },
    params: context.params || {},
    timestamp: new Date().toISOString(),
    ...context
  }
}

export async function handleApiRequest(request, handler, context = {}) {
  try {
    return await handler(request, context)
  } catch (error) {
    const errorContext = createErrorContext(request, context)

    console.error('API Error:', {
      error: error.message,
      stack: error.stack,
      context: errorContext
    })

    // Determine status code based on error type
    let statusCode = 500
    if (error.name === 'ValidationError') {
      statusCode = 400
    } else if (error.name === 'NotFoundError') {
      statusCode = 404
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403
    } else if (error.name === 'ConflictError') {
      statusCode = 409
    }

    return Response.json(
      {
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}

// app/api/contextual/route.js
import { handleApiRequest } from '@/lib/error-context'

export async function GET(request, context) {
  return handleApiRequest(request, async (req, ctx) => {
    const data = await fetchWithContext(ctx)
    return Response.json(data)
  }, context)
}
```

## Error Handling Middleware

### Reusable Error Handler
Create a middleware-style error handler:

```javascript
// lib/error-middleware.js
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      // Log error
      console.error('API Error:', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method
      })

      // Handle different error types
      if (error.status) {
        // Error already has a status code
        return Response.json(
          { error: error.message },
          { status: error.status }
        )
      } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        // JSON parsing error
        return Response.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      } else {
        // Generic server error
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  }
}

// app/api/middleware-example/route.js
import { withErrorHandler } from '@/lib/error-middleware'

const handler = withErrorHandler(async (request, context) => {
  const data = await complexOperation()
  return Response.json(data)
})

export { handler as GET, handler as POST }
```

## Database Error Handling

### Handling Database Errors
Properly handle database-specific errors:

```javascript
// lib/database-error-handler.js
export function handleDatabaseError(error) {
  // Prisma-specific error handling
  if (error.constructor.name === 'PrismaClientKnownRequestError') {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return {
          error: 'A record with this value already exists',
          status: 409
        }
      case 'P2025': // Record not found
        return {
          error: 'Record not found',
          status: 404
        }
      case 'P2003': // Foreign key constraint violation
        return {
          error: 'Cannot create record due to foreign key constraint',
          status: 400
        }
      default:
        return {
          error: 'Database operation failed',
          status: 500
        }
    }
  }
  // Handle other database errors
  else if (error.message.includes('connection')) {
    return {
      error: 'Database connection failed',
      status: 503
    }
  }
  else if (error.message.includes('timeout')) {
    return {
      error: 'Database operation timed out',
      status: 408
    }
  }
  else {
    return {
      error: 'Database operation failed',
      status: 500
    }
  }
}

// app/api/database-errors/route.js
import { handleDatabaseError } from '@/lib/database-error-handler'

export async function POST(request) {
  try {
    const data = await request.json()
    const result = await db.users.create(data)
    return Response.json(result, { status: 201 })
  } catch (error) {
    const dbError = handleDatabaseError(error)

    console.error('Database error:', {
      error: error.message,
      code: error.code,
      meta: error.meta
    })

    return Response.json(
      { error: dbError.error },
      { status: dbError.status }
    )
  }
}
```

## Validation Error Handling

### Comprehensive Validation
Handle validation errors comprehensively:

```javascript
// lib/validation-error-handler.js
export function handleValidationError(errors) {
  if (Array.isArray(errors)) {
    return {
      error: 'Validation failed',
      details: errors.map(err => ({
        field: err.field,
        message: err.message,
        value: err.value
      })),
      status: 400
    }
  } else {
    return {
      error: errors.message || 'Validation failed',
      status: 400
    }
  }
}

// lib/validator.js
export class Validator {
  constructor() {
    this.errors = []
  }

  required(value, field, message = 'is required') {
    if (value == null || value === '') {
      this.errors.push({ field, message: `${field} ${message}`, value })
    }
    return this
  }

  email(value, field) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      this.errors.push({ field, message: `${field} must be a valid email`, value })
    }
    return this
  }

  minLength(value, field, min) {
    if (value && value.length < min) {
      this.errors.push({ field, message: `${field} must be at least ${min} characters`, value })
    }
    return this
  }

  maxLength(value, field, max) {
    if (value && value.length > max) {
      this.errors.push({ field, message: `${field} must be no more than ${max} characters`, value })
    }
    return this
  }

  isNumber(value, field) {
    if (value != null && value !== '' && isNaN(parseFloat(value))) {
      this.errors.push({ field, message: `${field} must be a number`, value })
    }
    return this
  }

  validate() {
    const hasErrors = this.errors.length > 0
    return { valid: !hasErrors, errors: this.errors }
  }
}

// app/api/validation-example/route.js
import { Validator } from '@/lib/validator'
import { handleValidationError } from '@/lib/validation-error-handler'

export async function POST(request) {
  try {
    const data = await request.json()

    // Validate data
    const validator = new Validator()
    validator
      .required(data.name, 'name')
      .minLength(data.name, 'name', 2)
      .maxLength(data.name, 'name', 50)
      .required(data.email, 'email')
      .email(data.email, 'email')
      .isNumber(data.age, 'age')

    const validation = validator.validate()

    if (!validation.valid) {
      const errorResponse = handleValidationError(validation.errors)
      return Response.json(errorResponse, { status: errorResponse.status })
    }

    // Create user
    const user = await db.users.create(data)

    return Response.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

## Error Recovery Patterns

### Graceful Degradation
Implement graceful degradation for non-critical errors:

```javascript
// app/api/graceful-degradation/route.js
export async function GET(request) {
  try {
    // Primary data source
    const primaryData = await getPrimaryData()

    try {
      // Secondary data source (non-critical)
      const secondaryData = await getSecondaryData()
      return Response.json({
        ...primaryData,
        analytics: secondaryData // Include if available
      })
    } catch (secondaryError) {
      // Continue with primary data only
      console.warn('Secondary data unavailable:', secondaryError.message)
      return Response.json(primaryData)
    }
  } catch (primaryError) {
    console.error('Primary data unavailable:', primaryError)

    // Return cached data if available
    const cachedData = await getCachedData()
    if (cachedData) {
      console.info('Returning cached data')
      return Response.json(cachedData)
    }

    // Final fallback
    return Response.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}
```

### Circuit Breaker Pattern
Implement circuit breaker for external service calls:

```javascript
// lib/circuit-breaker.js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold
    this.timeout = timeout
    this.failureCount = 0
    this.lastFailureTime = null
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
  }

  async call(fn) {
    if (this.isOpen()) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  isOpen() {
    return this.state === 'OPEN'
  }

  onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  onFailure() {
    this.failureCount++
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
      this.lastFailureTime = Date.now()
    }
  }
}

// app/api/circuit-breaker/route.js
import { CircuitBreaker } from '@/lib/circuit-breaker'

const externalServiceCB = new CircuitBreaker(3, 30000) // 3 failures, 30s timeout

export async function GET(request) {
  try {
    const data = await externalServiceCB.call(async () => {
      const response = await fetch('https://external-service.com/api/data')
      if (!response.ok) throw new Error('External service error')
      return response.json()
    })

    return Response.json(data)
  } catch (error) {
    console.error('External service call failed:', error)

    // Return fallback data
    const fallbackData = await getFallbackData()
    return Response.json({
      ...fallbackData,
      warning: 'Using fallback data due to external service unavailability'
    })
  }
}
```

Proper error handling is crucial for building robust and maintainable APIs. Always log errors for debugging, return appropriate HTTP status codes, and provide meaningful error messages to API consumers.
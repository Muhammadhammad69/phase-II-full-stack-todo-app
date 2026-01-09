# Next.js API Routes - Authentication

## Overview

Authentication is a critical aspect of most APIs. This guide covers various authentication patterns and implementations in Next.js API routes, including JWT tokens, session-based authentication, API keys, and OAuth.

## JWT Token Authentication

### Basic JWT Implementation
Implement JWT-based authentication with token verification:

```javascript
// lib/jwt-auth.js
import jwt from 'jsonwebtoken'

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  })
}

// app/api/protected/route.js
import { verifyToken } from '@/lib/jwt-auth'

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

  if (!user) {
    return Response.json(
      { error: 'User not found' },
      { status: 401 }
    )
  }

  return Response.json({ user })
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json(
      { error: 'Authorization header required' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return Response.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  const data = await request.json()
  const resource = await createResource(data, decoded.userId)

  return Response.json(resource, { status: 201 })
}
```

### JWT with Role-Based Access
Implement role-based access control:

```javascript
// lib/role-auth.js
import { verifyToken } from '@/lib/jwt-auth'

export async function requireAuth(request, requiredRoles = []) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Authorization header required', status: 401 }
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return { authenticated: false, error: 'Invalid or expired token', status: 401 }
  }

  const user = await db.users.findById(decoded.userId)

  if (!user) {
    return { authenticated: false, error: 'User not found', status: 401 }
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return { authenticated: false, error: 'Insufficient permissions', status: 403 }
  }

  return { authenticated: true, user }
}

// app/api/admin/route.js
import { requireAuth } from '@/lib/role-auth'

export async function GET(request) {
  const authResult = await requireAuth(request, ['admin'])

  if (!authResult.authenticated) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  // User is authenticated and has admin role
  const adminData = await getAdminData()

  return Response.json(adminData)
}

export async function POST(request) {
  const authResult = await requireAuth(request, ['admin'])

  if (!authResult.authenticated) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const data = await request.json()
  const result = await createAdminResource(data)

  return Response.json(result, { status: 201 })
}
```

## Session-Based Authentication

### Cookie-Based Sessions
Implement session-based authentication using cookies:

```javascript
// lib/session.js
import crypto from 'crypto'

export async function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const session = {
    id: sessionId,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }

  // Store session in database
  await db.sessions.create(session)

  return session
}

export async function validateSession(sessionId) {
  if (!sessionId) return null

  const session = await db.sessions.findById(sessionId)

  if (!session || new Date() > session.expiresAt) {
    // Session expired, remove it
    if (session) {
      await db.sessions.delete(sessionId)
    }
    return null
  }

  // Refresh session expiration
  await db.sessions.update(sessionId, {
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })

  const user = await db.users.findById(session.userId)

  return { session, user }
}

export function createSessionCookie(sessionId) {
  return {
    name: 'sessionId',
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60, // 24 hours
    sameSite: 'strict',
    path: '/'
  }
}

// app/api/session/route.js
import { createSession, validateSession, createSessionCookie } from '@/lib/session'

export async function POST(request) {
  const data = await request.json()

  // Validate credentials
  const user = await db.users.authenticate(data.email, data.password)

  if (!user) {
    return Response.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Create session
  const session = await createSession(user.id)

  // Create response with session cookie
  const response = Response.json({
    user: { id: user.id, email: user.email, name: user.name }
  })

  // Set session cookie
  response.cookies.set(createSessionCookie(session.id))

  return response
}

export async function GET(request) {
  // Get session cookie
  const sessionId = request.cookies.get('sessionId')?.value

  const sessionResult = await validateSession(sessionId)

  if (!sessionResult) {
    return Response.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const { user } = sessionResult

  return Response.json({ user })
}

export async function DELETE(request) {
  const sessionId = request.cookies.get('sessionId')?.value

  if (sessionId) {
    await db.sessions.delete(sessionId)
  }

  const response = Response.json({ message: 'Logged out successfully' })

  // Clear session cookie
  response.cookies.delete('sessionId')

  return response
}
```

### Session Middleware Pattern
Create reusable session middleware:

```javascript
// lib/session-middleware.js
import { validateSession } from '@/lib/session'

export function withSession(handler) {
  return async (request, context) => {
    const sessionId = request.cookies.get('sessionId')?.value
    const sessionResult = await validateSession(sessionId)

    if (!sessionResult) {
      return Response.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Add user to request context
    request.user = sessionResult.user

    // Call the original handler with extended context
    return await handler(request, context)
  }
}

// app/api/protected-session/route.js
import { withSession } from '@/lib/session-middleware'

const handler = withSession(async (request, context) => {
  // User is guaranteed to be authenticated here
  const user = request.user

  if (request.method === 'GET') {
    return Response.json({ message: `Hello, ${user.name}!` })
  } else if (request.method === 'POST') {
    const data = await request.json()
    const resource = await createResource(data, user.id)
    return Response.json(resource, { status: 201 })
  }
})

export { handler as GET, handler as POST }
```

## API Key Authentication

### Basic API Key Implementation
Implement API key-based authentication:

```javascript
// lib/api-key-auth.js
import crypto from 'crypto'

export async function validateApiKey(key) {
  if (!key) return null

  // Hash the key for comparison (security best practice)
  const keyHash = crypto.createHash('sha256').update(key).digest('hex')

  const apiKey = await db.apiKeys.findByHash(keyHash)

  if (!apiKey || apiKey.revoked || new Date() > new Date(apiKey.expiresAt)) {
    return null
  }

  const user = await db.users.findById(apiKey.userId)

  return { apiKey, user }
}

// app/api/keys/protected/route.js
import { validateApiKey } from '@/lib/api-key-auth'

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return Response.json(
      { error: 'API key required' },
      { status: 401 }
    )
  }

  const authResult = await validateApiKey(apiKey)

  if (!authResult) {
    return Response.json(
      { error: 'Invalid or expired API key' },
      { status: 401 }
    )
  }

  const { user } = authResult

  return Response.json({ user, data: await getApiData() })
}

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return Response.json(
      { error: 'API key required' },
      { status: 401 }
    )
  }

  const authResult = await validateApiKey(apiKey)

  if (!authResult) {
    return Response.json(
      { error: 'Invalid or expired API key' },
      { status: 401 }
    )
  }

  const data = await request.json()
  const result = await createResource(data, authResult.user.id)

  return Response.json(result, { status: 201 })
}
```

## OAuth Integration

### OAuth with NextAuth.js Pattern
Implement OAuth using a pattern similar to NextAuth.js:

```javascript
// lib/oauth-handler.js
import { generateToken } from '@/lib/jwt-auth'

export async function handleOAuthCallback(provider, oauthData) {
  // Exchange code for tokens with OAuth provider
  const tokens = await exchangeCodeForTokens(provider, oauthData.code)

  // Get user profile from OAuth provider
  const userProfile = await getUserProfile(provider, tokens.accessToken)

  // Check if user exists
  let user = await db.users.findByOAuthId(provider, userProfile.id)

  if (!user) {
    // Create new user
    user = await db.users.create({
      email: userProfile.email,
      name: userProfile.name,
      oauthProviders: {
        [provider]: {
          id: userProfile.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      }
    })
  } else {
    // Update existing user's OAuth info
    await db.users.updateOAuthInfo(user.id, provider, {
      id: userProfile.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    })
  }

  // Generate JWT token
  const token = generateToken({ userId: user.id })

  return { user, token }
}

// app/api/auth/callback/route.js
import { handleOAuthCallback } from '@/lib/oauth-handler'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!provider || !code) {
    return Response.json(
      { error: 'Missing provider or code' },
      { status: 400 }
    )
  }

  try {
    const { user, token } = await handleOAuthCallback(provider, { code, state })

    // Create response with JWT token
    const response = Response.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })

    // Optionally set token in cookie as well
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60, // 24 hours
      sameSite: 'strict',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return Response.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
```

## Authentication Best Practices

### Secure Token Storage
Best practices for token security:

```javascript
// lib/token-security.js
import crypto from 'crypto'

// Create cryptographically secure tokens
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

// Hash sensitive data before storage
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Validate token format
export function isValidToken(token) {
  // Basic validation: must be hex string of appropriate length
  return /^[a-fA-F0-9]{64}$/.test(token) // For SHA-256 hash
}

// Rotate tokens periodically
export async function rotateToken(oldTokenHash) {
  const newToken = generateSecureToken()
  const newTokenHash = hashToken(newToken)

  // Update database with new token hash
  await db.tokens.update(oldTokenHash, { hash: newTokenHash })

  return newToken
}

// Blacklist tokens on logout
export async function blacklistToken(tokenHash) {
  await db.tokenBlacklist.create({
    hash: tokenHash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  })
}

export async function isTokenBlacklisted(tokenHash) {
  const blacklisted = await db.tokenBlacklist.findByHash(tokenHash)
  return !!blacklisted
}
```

### Rate Limiting for Authentication
Protect against brute force attacks:

```javascript
// lib/auth-rate-limiter.js
const authAttempts = new Map()

export function recordFailedAttempt(identifier) {
  const now = Date.now()
  const record = authAttempts.get(identifier) || { count: 0, lastAttempt: now }

  record.count++
  record.lastAttempt = now

  // Block for 15 minutes after 5 failed attempts
  if (record.count >= 5) {
    record.blockedUntil = now + 15 * 60 * 1000
  }

  authAttempts.set(identifier, record)

  return {
    blocked: record.blockedUntil && now < record.blockedUntil,
    attemptsLeft: Math.max(0, 5 - record.count),
    resetTime: record.blockedUntil
  }
}

export function resetFailedAttempts(identifier) {
  authAttempts.delete(identifier)
}

// app/api/auth/login/route.js
import { recordFailedAttempt, resetFailedAttempts } from '@/lib/auth-rate-limiter'

export async function POST(request) {
  const data = await request.json()
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  // Check rate limit
  const rateLimit = recordFailedAttempt(ip)

  if (rateLimit.blocked) {
    return Response.json(
      {
        error: 'Too many failed attempts. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    )
  }

  // Attempt authentication
  const user = await db.users.authenticate(data.email, data.password)

  if (!user) {
    // Failed attempt recorded above
    return Response.json(
      {
        error: 'Invalid credentials',
        attemptsLeft: rateLimit.attemptsLeft
      },
      { status: 401 }
    )
  }

  // Successful authentication - reset failed attempts
  resetFailedAttempts(ip)

  // Continue with successful login
  const session = await createSession(user.id)
  const response = Response.json({
    user: { id: user.id, email: user.email, name: user.name }
  })

  response.cookies.set(createSessionCookie(session.id))

  return response
}
```

Authentication is a critical security component of any API. Always follow security best practices, validate all inputs, use secure token storage, implement rate limiting, and keep your authentication libraries updated.
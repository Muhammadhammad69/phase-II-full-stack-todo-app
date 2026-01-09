---
name: nextjs-authentication
description: Implement authentication in Next.js applications. Learn session management, protected routes, and security best practices with NextAuth.js. Use when Claude needs to work with Next.js authentication, NextAuth.js setup, session management, protected routes, OAuth providers, or security best practices in Next.js applications.
---

# Authentication in Next.js - Secure User Management

## Overview
This skill covers implementing authentication in Next.js applications using NextAuth.js. You'll learn session management, protected routes, OAuth providers, and security best practices.

## Prerequisites
- Basic knowledge of Next.js and React
- Understanding of server and client components
- Knowledge of API routes

## 1. Authentication Basics

Authentication is the process of verifying user identity in your application. Key concepts include:

- Verify user identity through credentials or third-party providers
- Create secure sessions to maintain user state
- Protect sensitive routes and API endpoints
- Manage user state across the application
- Implement secure logout functionality
- Handle "Remember me" functionality with cookies

## 2. NextAuth.js Overview

NextAuth.js is a complete open-source authentication solution for Next.js applications that provides:

- Session management for both database and JWT strategies
- Support for multiple OAuth providers (GitHub, Google, Facebook, etc.)
- Credentials provider for email/password authentication
- JWT tokens for stateless authentication
- Role-based access control capabilities
- Built-in middleware for protected routes

## 3. Installing NextAuth.js

Install NextAuth.js and related dependencies:

```bash
npm install next-auth
```

For password hashing, also install bcrypt:

```bash
npm install bcrypt
# For TypeScript support
npm install --save-dev @types/bcrypt
```

## 4. Setting Up NextAuth.js with App Router

For Next.js App Router, create the API route at `app/api/auth/[...nextauth]/route.js`:

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt'

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check user in database
        const user = await db.users.findByEmail(credentials.email)
        if (!user) return null

        // Check password
        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!passwordValid) return null

        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for App Router
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    }
  }
})

export { handler as GET, handler as POST }
```

## 5. Environment Variables

Configure the necessary environment variables in `.env.local`:

```env
# NextAuth configuration
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000

# GitHub OAuth (if using GitHub provider)
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Google OAuth (if using Google provider)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database URL
DATABASE_URL=postgresql://...
```

## 6. OAuth Providers

NextAuth.js supports many OAuth providers. Here's how to configure Google OAuth:

```javascript
// app/api/auth/[...nextauth]/route.js
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
})
```

Popular providers include:
- GitHub
- Google
- Facebook
- Twitter/X
- Apple
- And many more (check NextAuth.js documentation)

## 7. SessionProvider in App Router

For the App Router, you need to wrap your application with SessionProvider. Since App Router doesn't have a single `_app.js` file, you'll need to create a client component wrapper:

```javascript
// app/providers.jsx (or .tsx)
'use client'

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
```

Then use it in your root layout:

```javascript
// app/layout.js
import { AuthProvider } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 8. Login Page Implementation

Create a login page with both credentials and OAuth options:

```javascript
// app/login/page.js
'use client'

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const email = e.target.email.value
    const password = e.target.password.value

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result.error) {
      setError('Invalid credentials')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <hr className="my-4" />

      <button
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
        className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
      >
        Sign in with GitHub
      </button>
    </div>
  )
}
```

## 9. Protected Routes - Server Components

Check authentication server-side using `getServerSession`:

```javascript
// app/dashboard/page.js
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>ID: {session.user.id}</p>
    </div>
  )
}
```

## 10. useSession Hook for Client Components

Access session data in Client Components using the `useSession` hook:

```javascript
// components/UserMenu.js
'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') {
    return <Link href="/login" className="text-blue-500">Sign In</Link>
  }

  return (
    <div className="flex items-center space-x-4">
      <span>Welcome {session.user.name}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  )
}
```

## 11. Password Hashing with Bcrypt

Never store plain text passwords. Always hash them during registration:

```javascript
// lib/auth.js
import bcrypt from 'bcrypt'

export async function hashPassword(password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}
```

Registration action with password hashing:

```javascript
// app/actions.js
'use server'

import { hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'

export async function registerUser(formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  // Validate inputs
  if (!email || !password) {
    return { error: 'Email and password required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  // Check if user already exists
  const existing = await db.users.findByEmail(email)
  if (existing) {
    return { error: 'Email already registered' }
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await db.users.create({
    email,
    password: hashedPassword
  })

  return { success: true, user }
}
```

## 12. Protected API Routes

Protect API endpoints by checking the session:

```javascript
// app/api/profile/route.js
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const user = await db.users.findById(session.user.id)
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name
  })
}

export async function PUT(request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const data = await request.json()
  const user = await db.users.update(session.user.id, data)
  return NextResponse.json(user)
}
```

## 13. Middleware for Protected Routes

Use Next.js middleware to protect multiple routes:

```javascript
// middleware.js
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Custom middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"]
}
```

Alternatively, implement custom middleware without NextAuth's helper:

```javascript
// middleware.js
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  })

  const isAuthenticated = !!token

  // Define protected routes
  const protectedPaths = ['/dashboard', '/profile', '/admin']
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedPath && !isAuthenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from auth pages
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && isAuthenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## 14. Role-Based Access Control

Implement role-based access for different user types:

```javascript
// app/admin/page.js
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function Admin() {
  const session = await getServerSession()

  if (!session || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p>Only admins can see this page.</p>
    </div>
  )
}
```

Add role checking to your NextAuth configuration:

```javascript
// app/api/auth/[...nextauth]/route.js
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.role = user.role || 'user' // default role
    }
    return token
  },
  async session({ session, token }) {
    session.user.id = token.id
    session.user.role = token.role
    return session
  }
}
```

## 15. Code Examples

### Example 1: Complete Login/Register Flow

```javascript
// app/register/page.js
'use client'

import { registerUser } from '@/actions/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (formData) => {
    const result = await registerUser(formData)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/login?registered=true')
    }
  }

  return (
    <form action={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength="8"
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </div>
    </form>
  )
}
```

### Example 2: Protecting Dashboard with Server Component

```javascript
// app/dashboard/page.js
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import UserMenu from '@/components/UserMenu'

export default async function Dashboard() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user.name}!</h2>
          <p className="text-gray-600">Your account is verified and ready to use.</p>
        </div>
      </main>
    </div>
  )
}

// components/UserMenu.js
'use client'

import { useSession, signOut } from "next-auth/react"

export default function UserMenu() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700">{session?.user?.name}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  )
}
```

### Example 3: OAuth Login with Error Handling

```javascript
// app/login/page.js
'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useSearchParams } from 'next/navigation'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleOAuthLogin = async (provider) => {
    setLoading(true)
    setError('')

    try {
      await signIn(provider, {
        callbackUrl,
        redirect: true
      })
    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <div className="space-y-4">
        <button
          onClick={() => handleOAuthLogin('github')}
          disabled={loading}
          className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <span>Sign in with GitHub</span>
          )}
        </button>

        <button
          onClick={() => handleOAuthLogin('google')}
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-500 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <span>Sign in with Google</span>
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
}
```

## 16. Real-World Scenarios

### SaaS Application
- User registration with email/password and OAuth options
- Email verification workflow
- Password reset functionality
- Subscription-based access control
- Session management across devices

### Blog Platform
- Author authentication for content creation
- Protected admin routes for content management
- Comment system for authenticated users
- User profile management
- Role-based permissions (admin, editor, author)

### E-commerce Site
- Customer account creation and management
- Order history accessible to authenticated users
- Saved addresses and payment methods
- OAuth login for convenience
- Role-based access for admin panel

### Community Platform
- User profile creation and management
- Different user roles (admin, moderator, member)
- Private messaging between users
- Content creation privileges
- Community moderation tools

## 17. Common Mistakes

1. **Storing passwords in plain text** - Always hash with bcrypt or similar; never log passwords
2. **Not checking session server-side** - Client-side checks aren't secure; always verify on server
3. **Exposing sensitive data** - Don't return passwords or sensitive fields in API responses
4. **Not using HTTPS in production** - Required for secure cookies; always use HTTPS in production
5. **Weak password requirements** - Enforce minimum length (8+ characters) and complexity
6. **Ignoring token expiry** - Set appropriate timeouts and implement refresh mechanisms
7. **Missing CSRF protection** - NextAuth handles this by default; don't disable security features
8. **Improper error messages** - Don't reveal whether an email exists in the system

## 18. Best Practices

1. **Hash passwords with bcrypt** - Use salt rounds of at least 10
2. **Check session server-side** - Never rely solely on client-side validation
3. **Use secure cookies** - Enable httpOnly, secure, and sameSite attributes
4. **Set NEXTAUTH_SECRET** - Use a strong random secret in production
5. **Use HTTPS in production** - Essential for secure authentication
6. **Implement rate limiting** - Protect against brute-force attacks on login
7. **Require strong passwords** - Enforce minimum length and complexity
8. **Log authentication events** - Track login attempts for security monitoring
9. **Regular security audits** - Review authentication code periodically
10. **Keep dependencies updated** - Update NextAuth.js and related packages regularly

## 19. Quick Reference

### Installation:
```bash
npm install next-auth bcrypt
```

### Basic Setup:
```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
export default NextAuth({ providers: [...] })
```

### Environment Variables:
```env
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
```

### Protected Route (Server):
```javascript
const session = await getServerSession()
if (!session) redirect('/login')
```

### Client Hook:
```javascript
'use client'
const { data: session } = useSession()
<button onClick={() => signOut()}>Sign Out</button>
```

### OAuth Provider:
```javascript
import GitHubProvider from "next-auth/providers/github"
providers: [GitHubProvider({ clientId, clientSecret })]
```

### Login:
```javascript
await signIn('credentials', { email, password })
await signIn('github', { callbackUrl: '/dashboard' })
```

### Password Hashing:
```javascript
import bcrypt from 'bcrypt'
const hashed = await bcrypt.hash(password, 10)
const valid = await bcrypt.compare(password, hashed)
```

### API Protection:
```javascript
const session = await getServerSession()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### SessionProvider (App Router):
```javascript
// app/providers.jsx
'use client'
import { SessionProvider } from "next-auth/react"
export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```
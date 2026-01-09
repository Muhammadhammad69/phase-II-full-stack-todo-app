---
name: nextjs-database-integration
description: Integrate databases with Next.js applications. Learn to use ORMs and build data layers for your application with Prisma and Neon. Use when Claude needs to work with database integration, Prisma ORM, Neon PostgreSQL, connection pooling, or data layer patterns in Next.js applications.
---

# Database Integration with Next.js - Data Layer

## Overview
This skill covers integrating databases with Next.js applications using Prisma ORM and Neon PostgreSQL. You'll learn to create data layers, handle migrations, optimize queries, and implement best practices for database operations.

## Prerequisites
- Basic knowledge of Next.js and React
- Understanding of data fetching and server actions
- Familiarity with SQL concepts

## 1. Database Options for Next.js

Next.js applications can connect to various databases depending on your needs:

- **PostgreSQL**: Reliable relational database with advanced features
- **MongoDB**: NoSQL document database for flexible schemas
- **MySQL**: Popular relational database alternative
- **SQLite**: Lightweight local database ideal for development
- **Neon**: Serverless PostgreSQL platform optimized for Next.js/Vercel

## 2. Neon PostgreSQL Setup

Neon provides serverless PostgreSQL hosting with several benefits:

- Auto-scaling compute resources
- Built-in connection pooling
- Pay-per-use pricing model
- Seamless integration with Vercel deployments
- Branch-based development for safer database changes

### Setup Process:
1. Create account at neon.com
2. Create a new project
3. Get your connection string from the Neon dashboard
4. Add the connection string to your `.env.local` file

## 3. Installing Prisma ORM

Prisma is a modern ORM that provides type-safe database access:

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

This creates:
- `prisma/schema.prisma`: Defines your database schema
- `prisma/migrations/`: Stores migration files
- Updates your `.env` file for database connection

## 4. Database Connection Configuration

Configure your database connection in `.env.local`:

```env
# Standard PostgreSQL connection
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Neon connection (non-pooled)
DATABASE_URL=postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/dbname?sslmode=require

# Neon pooled connection (recommended for serverless)
DATABASE_URL=postgresql://user:password@ep-xyz-pooler.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### Connection Pooling
For serverless environments like Next.js on Vercel, use the pooled connection string to handle connection limits efficiently.

## 5. Prisma Schema Definition

Define your database models in `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

## 6. Database Client Singleton Pattern

To prevent multiple database client instances in development (due to hot reloading), create a singleton pattern:

```javascript
// lib/db.js
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

For TypeScript, use a more type-safe approach:

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 7. Database Migrations

Manage schema changes with Prisma migrations:

```bash
# Create and apply a new migration
npx prisma migrate dev --name add_users_table

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate migration without applying
npx prisma migrate dev --create-only

# Check migration status
npx prisma migrate status
```

## 8. Basic CRUD Operations

Perform Create, Read, Update, and Delete operations:

```javascript
import prisma from '@/lib/db'

// CREATE - Insert new records
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe'
  }
})

// READ - Find unique record
const user = await prisma.user.findUnique({
  where: { id: 1 }
})

// READ - Find multiple records
const users = await prisma.user.findMany({
  where: { email: { contains: 'example.com' } },
  orderBy: { createdAt: 'desc' },
  take: 10
})

// UPDATE - Modify existing records
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane Doe' }
})

// DELETE - Remove records
await prisma.user.delete({
  where: { id: 1 }
})

// UPSERT - Update if exists, create if not
const user = await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { name: 'Updated Name' },
  create: { email: 'user@example.com', name: 'New User' }
})
```

## 9. Handling Relationships

Define and query related data effectively:

```javascript
// Schema with relationships (defined in prisma/schema.prisma)
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  posts Post[]  // One-to-many relationship
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}

// Query with related data
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
})

// Select only specific fields to optimize performance
const usersWithCount = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    _count: {
      select: { posts: true }
    }
  }
})
```

## 10. Filtering and Sorting

Apply filters and sorting to queries:

```javascript
// Basic filtering
const posts = await prisma.post.findMany({
  where: {
    published: true,
    title: { contains: 'Next.js' }
  }
})

// Advanced filtering with nested relations
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        published: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    }
  }
})

// Sorting
const posts = await prisma.post.findMany({
  orderBy: [
    { publishedAt: 'desc' },
    { title: 'asc' }
  ]
})

// Pagination
const posts = await prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})

// Count records
const total = await prisma.post.count({
  where: { published: true }
})
```

## 11. Query Optimization Techniques

Avoid common performance pitfalls:

```javascript
// ❌ BAD: N+1 query problem
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  })
}

// ✅ GOOD: Single query with relations
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true }
    }
  }
})

// ✅ GOOD: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    _count: {
      select: { posts: true }
    }
  }
})

// ✅ GOOD: Batch operations
const result = await prisma.$transaction([
  prisma.post.create({ data: { title: 'Post 1', authorId: 1 } }),
  prisma.post.create({ data: { title: 'Post 2', authorId: 1 } }),
  prisma.user.update({
    where: { id: 1 },
    data: { postCount: { increment: 2 } }
  })
])
```

## 12. Transactions for Data Consistency

Use transactions to ensure data integrity:

```javascript
import { Prisma } from '@prisma/client'

try {
  const result = await prisma.$transaction(async (tx) => {
    // Create a new post
    const post = await tx.post.create({
      data: {
        title: 'New Post',
        content: 'Post content',
        authorId: 1
      }
    })

    // Update user's post count
    const updatedUser = await tx.user.update({
      where: { id: 1 },
      data: { postCount: { increment: 1 } }
    })

    return { post, updatedUser }
  })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    console.error('Transaction failed:', error)
  }
  throw error
}

// Transaction with custom options
const result = await prisma.$transaction(
  [
    prisma.post.create({ data: { title: 'Post 1', authorId: 1 } }),
    prisma.post.create({ data: { title: 'Post 2', authorId: 1 } })
  ],
  {
    maxWait: 5000, // Maximum time to wait for db connection
    timeout: 10000 // Maximum time for transaction to execute
  }
)
```

## 13. Server Actions with Database Operations

Integrate database operations with server actions:

```javascript
// app/actions/posts.js
'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  try {
    const title = formData.get('title')
    const content = formData.get('content')
    const authorId = formData.get('authorId')

    if (!title || !content || !authorId) {
      return { error: 'All fields are required' }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(authorId),
        published: false
      }
    })

    revalidatePath('/posts')
    return { success: true, post }
  } catch (error) {
    console.error('Failed to create post:', error)
    return { error: 'Failed to create post' }
  }
}

export async function deletePost(postId) {
  try {
    await prisma.post.delete({
      where: { id: parseInt(postId) }
    })

    revalidatePath('/posts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete post:', error)
    return { error: 'Failed to delete post' }
  }
}

export async function publishPost(postId) {
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: { published: true }
    })

    revalidatePath('/posts')
    revalidatePath(`/posts/${postId}`)
    return { success: true, post }
  } catch (error) {
    console.error('Failed to publish post:', error)
    return { error: 'Failed to publish post' }
  }
}
```

## 14. Caching Strategies with Database Queries

Implement caching to improve performance:

```javascript
// Using React's cache function for request deduplication
import { cache } from 'react'
import prisma from '@/lib/db'

export const getPost = cache(async (id) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: { author: true }
  })
  return post
})

export const getPublishedPosts = cache(async (limit = 10) => {
  return await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
})

// Using revalidate tags for more sophisticated caching
import { revalidateTag, unstable_cache } from 'next/cache'

export const getCachedPosts = unstable_cache(
  async (authorId) => {
    return await prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' }
    })
  },
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
)

// Revalidate specific cache
export async function updatePost(postId, data) {
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data
  })

  // Revalidate the posts cache
  revalidateTag('posts')
  return updatedPost
}
```

## 15. Code Examples

### Example 1: Blog System with Prisma

```javascript
// prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  bio       String?
  avatar    String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id         Int      @id @default(autoincrement())
  title      String
  content    String
  excerpt    String?
  slug       String   @unique
  published  Boolean  @default(false)
  featured   Boolean  @default(false)
  views      Int      @default(0)
  author     User     @relation(fields: [authorId], references: [id])
  authorId   Int
  tags       Tag[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

// app/blog/page.js
import prisma from '@/lib/db'
import { cache } from 'react'

const getFeaturedPosts = cache(async () => {
  return await prisma.post.findMany({
    where: {
      published: true,
      featured: true
    },
    include: {
      author: {
        select: { name: true, avatar: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
})

export default async function BlogPage() {
  const posts = await getFeaturedPosts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.id} className="border-b pb-8">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center text-sm text-gray-500">
              By {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### Example 2: User Management API

```javascript
// app/api/users/route.js
import prisma from '@/lib/db'

// GET /api/users - List users with pagination
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10
  const search = searchParams.get('search')

  const whereClause = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {}

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          _count: {
            select: { posts: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ])

    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create user
export async function POST(request) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return Response.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: { email, name }
    })

    return Response.json(user, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return Response.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    console.error('Error creating user:', error)
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

### Example 3: E-commerce Product Management

```javascript
// prisma/schema.prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  price       Decimal
  stock       Int       @default(0)
  sku         String    @unique
  category    Category  @relation(fields: [categoryId], references: [id])
  categoryId  Int
  images      ProductImage[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ProductImage {
  id        Int      @id @default(autoincrement())
  url       String
  alt       String?
  product   Product  @relation(fields: [productId], references: [id])
  productId Int
  order     Int      @default(0)
}

// app/products/[id]/page.js
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Increment view count
  await prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images[0] && (
              <img
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {product.images.slice(1).map((image, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt || `${product.name} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
              {product.category.name}
            </span>
          </div>

          <div className="mb-6">
            <p className={`font-medium ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of stock'}
            </p>
          </div>

          <button
            disabled={product.stock === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium ${
              product.stock > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 16. Real-World Scenarios

### Blog Platform
- User, Post, Comment models with relationships
- Authorship and publishing workflows
- Tagging system for categorization
- Search and filtering capabilities
- View counting and analytics

### E-commerce Application
- Product catalog with categories and inventory
- Shopping cart functionality
- Order management system
- Customer profiles and order history
- Payment integration data tracking

### SaaS Application
- Multi-tenant data architecture
- User roles and permissions
- Subscription management
- Usage tracking and analytics
- Team collaboration features

### Community Platform
- User profiles and social connections
- Content creation and moderation
- Notification systems
- Activity feeds and engagement tracking
- Messaging and communication features

## 17. Common Mistakes

1. **Not using connection pooling** - Required for serverless functions; use pooled connections in Neon
2. **N+1 query problems** - Fetch related data in single queries using `include`; avoid loops with database calls
3. **Forgetting to handle migrations** - Track migrations in version control; deploy migrations before code changes
4. **Not implementing proper error handling** - Catch database errors; return meaningful error messages to users
5. **Not indexing frequently queried columns** - Add database indexes to improve query performance
6. **Hardcoding database URLs** - Always use environment variables; never commit connection strings to code
7. **Creating multiple Prisma client instances** - Use singleton pattern to prevent connection leaks
8. **Not using transactions for related operations** - Group related database operations for data consistency

## 18. Best Practices

1. **Use Prisma for type-safe database access** - Leverage auto-generated types and IntelliSense
2. **Maintain database client singleton** - Prevent multiple instances in development environment
3. **Avoid N+1 queries with proper includes** - Fetch related data efficiently in single queries
4. **Use transactions for data consistency** - Group related operations that must succeed or fail together
5. **Index frequently queried fields** - Improve database query performance significantly
6. **Validate input server-side** - Never trust client-side validation alone
7. **Use connection pooling for serverless** - Essential for handling connection limits
8. **Cache strategically with revalidate tags** - Balance performance with data freshness
9. **Monitor query performance** - Use Prisma's built-in logging to identify slow queries
10. **Implement proper backup strategies** - Regular automated backups for production data

## 19. Quick Reference

### Installation:
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Schema Definition:
```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
}
```

### Migrations:
```bash
npx prisma migrate dev --name add_users
npx prisma migrate deploy
```

### CRUD Operations:
```javascript
// Create
await prisma.user.create({ data: {...} })

// Read
await prisma.user.findUnique({ where: {...} })
await prisma.user.findMany()

// Update
await prisma.user.update({ where: {...}, data: {...} })

// Delete
await prisma.user.delete({ where: {...} })
```

### Relationships:
```javascript
// Include related data
await prisma.user.findMany({ include: { posts: true } })

// Select specific fields
await prisma.user.findMany({ select: { email: true, name: true } })
```

### Filtering:
```javascript
await prisma.post.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 10
})
```

### Transactions:
```javascript
await prisma.$transaction([
  prisma.post.create({...}),
  prisma.user.update({...})
])
```

### Environment Configuration:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
```

### Server Action Pattern:
```javascript
'use server'
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
```
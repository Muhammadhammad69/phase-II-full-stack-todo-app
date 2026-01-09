---
name: Neon with Prisma ORM - Modern Database Development
description: Integrate Neon database with Prisma ORM for modern database development. Learn Prisma schema configuration, connection pooling, migrations, relations, query optimization, and production deployment. Use when setting up Prisma with Neon, configuring Prisma schema, handling migrations, optimizing queries, managing relations, implementing production deployment, and troubleshooting Prisma-specific issues with Neon.
---

# Neon with Prisma ORM - Modern Database Development

## Prisma Setup with Neon

### Installing Prisma
```bash
# Initialize a new project
npm init -y

# Install Prisma as a development dependency
npm install prisma --save-dev

# Install Prisma Client
npm install @prisma/client

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### Environment Configuration
```bash
# .env
DATABASE_URL="postgresql://username:password@ep-host.region.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-host.region.neon.tech/dbname?sslmode=require"
```

**Important**: For Neon, you need both `DATABASE_URL` and `DIRECT_URL` when using migrations.

## Prisma Schema Configuration

### Basic Prisma Schema for Neon
```prisma
// schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]  // Add any preview features you need
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Required for Neon migrations
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}

model Post {
  id         Int        @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  title      String
  content    String?
  published  Boolean    @default(false)
  author     User       @relation(fields: [authorId], references: [id])
  authorId   Int
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

### Neon-Specific Schema Considerations
```prisma
// schema.prisma with Neon-specific considerations
generator client {
  provider = "prisma-client-js"
  // Enable connection pooling features
  engineType = "binary"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")

  // Neon-specific connection pooling
  // Note: Connection pooling is handled by Neon's built-in PgBouncer
}

// Example of Neon-compatible schema
model Project {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  // Neon supports all standard PostgreSQL types
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  status      String   @default("active")

  // Relations work normally with Neon
  teamMembers TeamMember[]
}

model TeamMember {
  id        Int      @id @default(autoincrement())
  projectId Int
  userId    Int
  role      String   @default("member")

  // Foreign keys work as expected
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId]) // Composite unique constraints work fine
}
```

## Connection Pooling with Prisma and Neon

### Prisma Connection Configuration
```javascript
// prisma.js
const { PrismaClient } = require('@prisma/client');

// Configure Prisma Client for Neon
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Enable logging for development
  log: ['query', 'info', 'warn', 'error'],

  // Configure connection pool settings
  __internal: {
    // Prisma uses its own connection pooling
    // Neon's PgBouncer handles additional pooling
  }
});

module.exports = { prisma };
```

### Using Pooled Connections with Prisma
```javascript
// For applications that benefit from Neon's connection pooling,
// use the pooled connection string in your DATABASE_URL
// DATABASE_URL="postgresql://username:password@ep-host-pooler.region.neon.tech/dbname?sslmode=require"

// app.js
const express = require('express');
const { prisma } = require('./prisma');

const app = express();

// Example endpoint using Prisma
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true
      },
      take: 10
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Prisma Migrations with Neon

### Setting Up Migrations
```bash
# Initialize Prisma (creates schema.prisma if it doesn't exist)
npx prisma init

# Create your first migration
npx prisma migrate dev --name init

# Create subsequent migrations
npx prisma migrate dev --name add-profiles-table

# Apply pending migrations to production
npx prisma migrate deploy
```

### Neon Migration Configuration
```prisma
// For Neon, ensure your schema includes directUrl for migrations
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Required for Neon migrations
}
```

### Migration Environment Setup
```bash
# .env for development
DATABASE_URL="postgresql://alex:password@ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://alex:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require"

# .env for production
DATABASE_URL="postgresql://user:pass@ep-production-host-pooler.region.neon.tech/proddb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-production-host.region.neon.tech/proddb?sslmode=require"
```

### Advanced Migration Commands
```bash
# Create a migration without applying it
npx prisma migrate dev --create-only --name add-new-field

# Reset the database (useful for development)
npx prisma migrate reset

# Generate SQL for a migration (without applying)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Resolve failed migrations (if needed)
npx prisma migrate resolve --applied <migration-name>
```

## Query Optimization with Prisma and Neon

### Efficient Query Patterns
```javascript
// ❌ Inefficient: Multiple queries
const users = await prisma.user.findMany();
const postsPromises = users.map(user =>
  prisma.post.findMany({ where: { authorId: user.id } })
);
const postsArrays = await Promise.all(postsPromises);

// ✅ Efficient: Single query with include
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: true
  }
});

// ✅ Even better: Select only needed fields
const usersWithPostCount = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: {
      select: { posts: true }
    }
  }
});

// ✅ Using where clauses efficiently
const activeUsers = await prisma.user.findMany({
  where: {
    AND: [
      { email: { contains: '@' } },
      { createdAt: { gt: new Date('2023-01-01') } }
    ]
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 20
});
```

### Pagination with Prisma
```javascript
// Cursor-based pagination (recommended for Neon)
async function getUsersPaginated(cursorId = null, limit = 10) {
  const users = await prisma.user.findMany({
    take: limit, // Use negative number for backward pagination
    ...(cursorId && {
      cursor: { id: cursorId },
      skip: 1 // Skip the cursor record itself
    }),
    orderBy: {
      id: 'asc'
    }
  });

  return users;
}

// Offset-based pagination (for smaller datasets)
async function getUsersWithOffset(skip = 0, take = 10) {
  const users = await prisma.user.findMany({
    skip,
    take,
    orderBy: {
      id: 'asc'
    }
  });

  return users;
}
```

### Raw SQL Queries (when needed)
```javascript
// When you need complex queries that Prisma doesn't support well
const complexQueryResult = await prisma.$queryRaw`
  SELECT
    u.name,
    COUNT(p.id) as post_count,
    AVG(LENGTH(p.content)) as avg_content_length
  FROM User u
  LEFT JOIN Post p ON u.id = p.authorId
  GROUP BY u.id, u.name
  HAVING COUNT(p.id) > 5
  ORDER BY post_count DESC
`;

// Execute raw SQL (for DDL operations)
await prisma.$executeRaw`
  CREATE INDEX CONCURRENTLY idx_users_email
  ON User(email)
  WHERE email IS NOT NULL
`;
```

## Relations and Joins with Prisma on Neon

### Working with Relations
```javascript
// Create user with nested data
const userWithProfile = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    profile: {
      create: {
        bio: 'Software engineer'
      }
    },
    posts: {
      create: [
        {
          title: 'My First Post',
          content: 'Hello world!'
        }
      ]
    }
  },
  include: {
    profile: true,
    posts: true
  }
});

// Update with nested relations
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: {
    profile: {
      upsert: {  // Update if exists, create if not
        create: { bio: 'New bio' },
        update: { bio: 'Updated bio' }
      }
    }
  },
  include: {
    profile: true
  }
});

// Delete with cascade effects
await prisma.user.delete({
  where: { id: 1 },
  include: {
    posts: true  // This will return deleted posts due to cascade
  }
});
```

### Complex Relation Queries
```javascript
// Find posts with author and comments
const postsWithDetails = await prisma.post.findMany({
  where: {
    published: true
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    comments: {
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }
  }
});

// Aggregation with relations
const userStats = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: {
      select: {
        posts: true,
        comments: true
      }
    }
  },
  where: {
    posts: {
      some: {
        published: true
      }
    }
  }
});
```

## Prisma Studio with Neon

### Launching Prisma Studio
```bash
# Launch Prisma Studio to visually browse your data
npx prisma studio
```

### Studio Configuration for Neon
```javascript
// Make sure your DATABASE_URL is set in .env
// Prisma Studio will use the same connection as your application
```

## Production Deployment Considerations

### Environment Configuration
```javascript
// production.config.js
const { PrismaClient } = require('@prisma/client');

// Production-optimized Prisma client
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' }
  ],
  // Connection pool settings for production
  __internal: {
    // Prisma's internal connection pool
  }
});

// Listen for query events in production for monitoring
if (process.env.NODE_ENV === 'production') {
  prisma.$on('query', (e) => {
    console.log(`Query: ${e.query}`)
    console.log(`Params: ${e.params}`)
    console.log(`Duration: ${e.duration}ms`)
  });
}

module.exports = { prisma };
```

### Deployment Commands
```bash
# Build your application
npm run build

# Generate Prisma client for production
npx prisma generate

# Deploy migrations before starting the app
npx prisma migrate deploy

# Start your application
node dist/index.js
```

### Health Checks and Monitoring
```javascript
// health.js
const { prisma } = require('./prisma');

async function healthCheck() {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Get connection info
    const connectionInfo = await prisma.$queryRaw`
      SELECT
        now() as current_time,
        current_database() as database_name
    `;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: connectionInfo[0].database_name
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { healthCheck };
```

## Troubleshooting Common Issues

### Neon-Specific Prisma Issues

#### Issue: "Connection was closed by the remote end"
- **Solution**: Use direct connections for migrations, pooled connections for application
```bash
# For migrations, use direct URL
DATABASE_URL="postgresql://user:pass@ep-host.region.neon.tech/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-host.region.neon.tech/db?sslmode=require"

# For application, use pooled URL
DATABASE_URL="postgresql://user:pass@ep-host-pooler.region.neon.tech/db?sslmode=require"
```

#### Issue: Migration failures with Neon
- **Solution**: Ensure `directUrl` is configured in schema.prisma
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // This is required for Neon migrations
}
```

#### Issue: Slow queries after compute restart
- **Solution**: Use connection pooling and implement retry logic
```javascript
const { prisma } = require('./prisma');

// Add retry logic for Neon's compute restarts
async function executeWithRetry(operation, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Check if it's a connection error that might be resolved by retry
      if (error.message.includes('connection') || error.message.includes('socket')) {
        console.log(`Attempt ${i + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      } else {
        throw error; // Don't retry if it's not a connection issue
      }
    }
  }
}

// Usage
const users = await executeWithRetry(() => prisma.user.findMany());
```

### Schema Migration Strategies
```javascript
// Safe migration patterns for Neon
async function safeSchemaUpdate() {
  // 1. Create a new branch in Neon for testing
  // 2. Apply migration to the branch
  // 3. Test thoroughly
  // 4. If successful, apply to production

  try {
    // Example: Adding a column with a default
    await prisma.$executeRaw`
      ALTER TABLE "User"
      ADD COLUMN "isActive" BOOLEAN DEFAULT true;
    `;

    // Update existing records if needed
    await prisma.user.updateMany({
      where: { isActive: null },
      data: { isActive: true }
    });

    console.log('Schema update completed successfully');
  } catch (error) {
    console.error('Schema update failed:', error);
    throw error;
  }
}
```

## Performance Optimization

### Prisma Performance Tips for Neon
```javascript
// 1. Use select to limit returned fields
const usersLight = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
});

// 2. Use where clauses to limit results
const recentActiveUsers = await prisma.user.findMany({
  where: {
    AND: [
      { lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Last 30 days
      { isActive: true }
    ]
  }
});

// 3. Use take and skip for pagination
const paginatedUsers = await prisma.user.findMany({
  take: 20,
  skip: 40, // Skip first 40 records
  orderBy: { createdAt: 'desc' }
});

// 4. Use distinct to avoid duplicates
const uniqueEmailDomains = await prisma.user.findMany({
  select: {
    email: true
  },
  distinct: ['email']
});
```

### Index Optimization
```javascript
// Define indexes in your Prisma schema
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique  // Creates unique index
  name         String
  createdAt    DateTime @default(now())

  @@index([createdAt])  // Creates index on createdAt
  @@index([email, createdAt])  // Creates composite index
}

// For complex indexes, use raw SQL after migration
async function createCustomIndexes() {
  // Create partial index
  await prisma.$executeRaw`
    CREATE INDEX CONCURRENTLY idx_active_users_created_at
    ON "User"(created_at)
    WHERE is_active = true
  `;

  // Create full-text search index
  await prisma.$executeRaw`
    CREATE INDEX CONCURRENTLY idx_posts_content_gin
    ON "Post" USING gin(to_tsvector('english', content))
  `;
}
```

## Integration with Popular Frameworks

### Next.js Integration
```javascript
// lib/prisma.js (Next.js)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// pages/api/users.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        include: {
          posts: {
            where: { published: true },
            select: { title: true, createdAt: true }
          }
        }
      });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### FastAPI Integration (Python)
```python
# prisma_client.py
from prisma import Prisma
import asyncio

# Note: Prisma Python client is in alpha
# For now, use the Node.js client with a separate API
# Or use raw SQL with asyncpg/SQLAlchemy

# For FastAPI integration, you'd typically use the Node.js client
# in a separate service or use raw PostgreSQL connections
```

## Quick Reference

### Essential Commands
```bash
# Initialize Prisma
npx prisma init

# Create and apply migration
npx prisma migrate dev --name migration-name

# Generate Prisma client
npx prisma generate

# Deploy to production
npx prisma migrate deploy

# Pull schema from database
npx prisma db pull

# Push schema to database (non-destructive)
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### Environment Variables for Neon
```bash
# For development
DATABASE_URL="postgresql://user:pass@ep-pooler.region.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep.region.neon.tech/dbname?sslmode=require"

# For production
DATABASE_URL="postgresql://user:pass@ep-prod-pooler.region.neon.tech/proddb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-prod.region.neon.tech/proddb?sslmode=require"
```

### Common Prisma Patterns for Neon
- Use pooled connections for application traffic
- Use direct connections for migrations
- Implement retry logic for compute restarts
- Use `include` instead of multiple queries
- Implement proper pagination for large datasets
- Use `select` to limit returned fields
- Create appropriate indexes for query patterns
- Test migrations on a branch before production
- Monitor query performance with Neon's console
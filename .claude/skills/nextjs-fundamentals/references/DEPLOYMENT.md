# Next.js Deployment Guide

## Vercel (Recommended)

### Zero-Configuration Deployment
Deploy to Vercel with zero configuration:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Git Integration
Connect your Git repository to Vercel for automatic deployments:

1. Push your Next.js app to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com) and import your project
3. Vercel automatically detects Next.js and sets up the build

### Environment Variables
Set environment variables in Vercel dashboard:

```javascript
// .env.local (not committed to Git)
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
```

In Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add your variables

### Custom Domains
Add custom domains in Vercel:

```bash
# Add domain via CLI
vercel domains add example.com
```

Or via dashboard in Project Settings > Domains.

## Static Exports

### Static Site Generation
Export your Next.js app as a static site:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
}

module.exports = nextConfig
```

Then build and export:

```bash
npm run build
# The build output will be in the `out` directory
```

### Static Hosting
Deploy the `out` directory to static hosting services:
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting provider

## Self-Hosting

### Node.js Server
Build and run your Next.js app on a Node.js server:

```bash
# Build the application
npm run build

# Start the server
npm run start
```

### Docker Deployment
Create a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Production build
FROM base AS builder
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run the Docker container:

```bash
docker build -t my-nextjs-app .
docker run -p 3000:3000 my-nextjs-app
```

## Configuration for Different Environments

### Environment-Specific Configuration
Configure different settings for development, staging, and production:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
  },
  // Different settings based on environment
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export', // Static export in production
  }),
  ...(process.env.DEPLOYMENT_ENV === 'vercel' && {
    // Vercel-specific configuration
    images: {
      unoptimized: true, // Vercel handles image optimization
    },
  }),
}

module.exports = nextConfig
```

### API Routes in Production
Handle API routes in different deployment scenarios:

```javascript
// app/api/hello/route.js
export async function GET(request) {
  // Environment-specific logic
  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.PROD_API_URL
    : process.env.DEV_API_URL

  const response = await fetch(`${apiUrl}/data`)
  const data = await response.json()

  return Response.json({ data })
}
```

## Build Optimization

### Standalone Output
Generate a standalone build for easier deployment:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Creates a standalone build
}

module.exports = nextConfig
```

### Asset Prefixing
Configure asset prefixes for CDN deployment:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: 'https://cdn.example.com',
  basePath: '/docs', // If deployed to a subdirectory
}

module.exports = nextConfig
```

## Monitoring and Analytics

### Error Tracking
Set up error tracking for production:

```javascript
// pages/_error.js or app/error.js
'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      console.error('Application error:', error)
      // Send to Sentry, LogRocket, etc.
    }
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Performance Monitoring
Track performance metrics:

```javascript
// lib/analytics.js
export function reportWebVitals(metric) {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Send metric to your analytics service
    console.log(metric)
  }
}

// pages/_app.js
import { useEffect } from 'react'
import { reportWebVitals } from '../lib/analytics'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    reportWebVitals(console.log)
  }, [])

  return <Component {...pageProps} />
}
```

## Scaling Considerations

### Serverless Functions
For Vercel deployments, API routes become serverless functions:

```javascript
// app/api/users/route.js
export const runtime = 'edge' // Use Edge runtime for lower latency

export async function GET(request) {
  // This runs as a serverless function
  const users = await getUsers()
  return Response.json({ users })
}
```

### Database Connections
Manage database connections efficiently:

```javascript
// lib/db.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Deployment Best Practices

### 1. Environment Variables
Always use environment variables for sensitive data:

```javascript
// Good
const apiKey = process.env.API_KEY

// Bad - don't hardcode sensitive data
const apiKey = 'secret-key-here'
```

### 2. Health Checks
Implement health checks for your application:

```javascript
// app/api/health/route.js
export async function GET() {
  // Perform health checks
  const isHealthy = await checkHealth()

  return Response.json(
    { status: isHealthy ? 'healthy' : 'unhealthy' },
    { status: isHealthy ? 200 : 503 }
  )
}
```

### 3. Build Times
Optimize build times by:
- Using `transpilePackages` for problematic packages
- Leveraging caching in CI/CD
- Optimizing image sizes before build

### 4. Security Headers
Add security headers to protect your application:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```
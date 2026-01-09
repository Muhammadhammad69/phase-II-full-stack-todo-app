---
name: "Next.js Advanced Patterns - Scaling Applications"
description: "Master advanced Next.js patterns for building scalable applications. Learn performance optimization and architectural best practices. Use when Claude needs to implement advanced Next.js patterns like ISR, parallel routes, streaming, caching strategies, middleware, edge functions, or performance optimization techniques for scaling applications."
---

# Next.js Advanced Patterns - Scaling Applications

Difficulty: Advanced
Duration: 45 minutes
Prerequisites: ["All previous Next.js skills"]
Tags: ["nextjs", "advanced", "patterns", "scalability", "architecture"]

## Description
Master advanced Next.js patterns for building scalable applications. Learn performance optimization and architectural best practices.

## Learning Objectives
- Implement Incremental Static Regeneration (ISR)
- Use parallel routes and intercepting routes
- Optimize bundle size
- Implement caching strategies
- Use middleware effectively
- Understand streaming and Suspense
- Implement edge functions
- Perform performance profiling and optimization
- Handle scale and high traffic

## Content

### Incremental Static Regeneration (ISR)

Incremental Static Regeneration (ISR) allows you to update static content after build time. This technique combines the performance benefits of static generation with the flexibility of dynamic content.

#### ISR Example in App Router
```javascript
// app/blog/[slug]/page.js
async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  const post = await res.json();
  return post;
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}
```

#### Revalidate Configuration
```javascript
// For pages router
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);

  return {
    props: { post },
    // Revalidate at most once per hour
    revalidate: 3600,
  };
}

// For app router using fetch
async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  return res.json();
}
```

#### generateStaticParams for Dynamic Routes
```javascript
// app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### Parallel Routes

Parallel routes allow you to simultaneously render multiple pages in the same layout. This is useful for modals, sidebars, or other UI that should appear alongside the main content.

#### Directory Structure with Named Slots
```
app/
├─ layout.tsx
├─ page.tsx
├─ @auth/
│  ├─ page.tsx
├─ @analytics/
│  ├─ page.tsx
└─ team/
   ├─ layout.tsx
   ├─ page.tsx
   ├─ @auth/
   │  ├─ page.tsx
   └─ @analytics/
      ├─ page.tsx
```

#### Root Layout with Parallel Slots
```tsx
// app/layout.tsx
import Link from 'next/link'

export default function Layout({
  children,
  auth,
  analytics
}: {
  children: React.ReactNode
  auth: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
      </nav>
      <div>{children}</div>
      <div>{auth}</div>
      <div>{analytics}</div>
    </>
  )
}
```

### Intercepting Routes

Intercepting routes allow you to render a route from elsewhere in the application as if it were part of the current layout. This is particularly useful for modals that should appear over the current page without changing the URL.

#### Intercepting Route Example
```tsx
// app/(..)login/page.tsx - intercepts /login route
import { Modal } from '@/app/ui/modal'
import { Login } from '@/app/ui/login'

export default function LoginPage() {
  return (
    <Modal>
      <Login />
    </Modal>
  )
}
```

### Middleware

Middleware allows you to run code before a request is completed. It gives you the ability to modify the response or redirect the request.

#### Basic Middleware with Request Header Manipulation
```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Clone the request headers and set a new header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello', 'world')

  // Create a new response with the modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set a custom header on the response
  response.headers.set('x-custom-header', 'custom-value')

  return response
}

// Matcher configuration to run middleware on specific paths
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

#### Advanced Matcher Configuration
```javascript
// middleware.js
export const config = {
  matcher: [
    // Match a single path
    '/dashboard',

    // Match paths with parameters
    '/users/:path*',

    // Match paths with specific extensions
    '/api/:path*',

    // Match specific paths with regex
    {
      source: '/admin/:path*',
      has: [
        {
          type: 'cookie',
          key: 'role',
          value: 'admin',
        },
      ],
    },
  ],
}
```

### Edge Middleware

Edge middleware runs on the edge network closer to the user, providing faster execution and lower latency.

#### Edge-Based Middleware Example
```javascript
// middleware.js
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
  runtime: 'edge', // Runs on the edge
}

export default async function middleware(request) {
  // This runs on the edge, so it has limited capabilities
  const url = request.nextUrl.clone()

  // Access geolocation data
  const country = request.geo?.country

  // Redirect based on location
  if (country === 'US' && url.pathname.startsWith('/eu')) {
    url.pathname = url.pathname.replace(/^\/eu/, '/us')
    return Response.redirect(url)
  }

  return NextResponse.next()
}
```

### React Server Components Streaming

Streaming allows you to progressively send content from the server to the client, improving perceived performance.

#### Streaming with Suspense Example
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { UserSidebar } from './user-sidebar'
import { Feed } from './feed'
import { Ad } from './ad'

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <UserSidebar />

      <div className="content">
        <Suspense fallback={<div>Loading feed...</div>}>
          <Feed />
        </Suspense>

        <Suspense fallback={<div>Loading ad...</div>}>
          <Ad />
        </Suspense>
      </div>
    </div>
  )
}
```

#### Async Server Component Example
```tsx
// app/dashboard/feed.tsx
import { getUserPosts } from '@/lib/user-posts'

export default async function Feed() {
  const posts = await getUserPosts()

  return (
    <div className="feed">
      {posts.map((post) => (
        <div key={post.id} className="post">
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
      ))}
    </div>
  )
}
```

### Suspense Boundaries

Suspense boundaries allow you to show fallback UI while content is loading.

#### Suspense Fallback Example
```tsx
// app/products/page.tsx
import { Suspense } from 'react'
import { ProductList } from './product-list'
import { Filters } from './filters'

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>

      <Suspense fallback={<Filters.Skeleton />}>
        <Filters />
      </Suspense>

      <Suspense fallback={<ProductList.Skeleton />}>
        <ProductList />
      </Suspense>
    </div>
  )
}
```

### Code Splitting Strategies

Code splitting breaks down your JavaScript bundle into smaller chunks, improving initial load time.

#### Route-Level Code Splitting
Next.js automatically performs route-level code splitting. Each page becomes its own chunk, meaning only the JavaScript required for that page is downloaded.

#### Dynamic Imports
```javascript
// components/chart.js
import dynamic from 'next/dynamic'

// Dynamically import without SSR
const Chart = dynamic(() => import('react-chartjs'), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
})

// With custom loading component
const Map = dynamic(() => import('../components/map'), {
  loading: () => <p>Loading map...</p>,
})

// With no SSR
const DynamicComponentNoSSR = dynamic(
  () => import('../components/no-ssr'),
  { ssr: false }
)

// With custom loader component
const WithCustomLoader = dynamic(
  () => import('../components/with-loader'),
  {
    loading: ({ error, loading }) => {
      if (error) return <p>Error!</p>
      if (loading) return <p>Loading...</p>
      return null
    },
  }
)
```

### Bundle Analysis

Analyze your bundle to identify large dependencies and optimize performance.

#### Installing and Using @next/bundle-analyzer
```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Your other Next.js config
})
```

Then run:
```bash
ANALYZE=true npm run build
```

### Tree Shaking

Tree shaking removes unused exports from your bundles, reducing bundle size.

#### Using Modern ES6 Exports for Better Tree Shaking
```javascript
// utils.js - Good for tree shaking
export const formatDate = (date) => {
  // Implementation
}

export const formatTime = (time) => {
  // Implementation
}

// main.js - Only imports what it needs
import { formatDate } from './utils' // formatTime will be shaken out
```

### Image Optimization at Scale

Optimize images for performance across your application.

#### Using Next.js Image Component
```tsx
import Image from 'next/image'

function ProductCard({ product }) {
  return (
    <div>
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={300}
        placeholder="blur"
        blurDataURL={product.blurDataUrl}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <h3>{product.name}</h3>
    </div>
  )
}
```

### Database Query Optimization

Optimize database queries to reduce response times and resource usage.

#### Implementing Query Caching
```javascript
// lib/db.js
import { cache } from 'react'

export const getProducts = cache(async () => {
  const products = await db.product.findMany({
    where: { published: true },
  })
  return products
})

export const getProduct = cache(async (id) => {
  const product = await db.product.findUnique({
    where: { id },
  })
  return product
})
```

### Caching Strategies

Implement multi-layer caching to improve performance.

#### Multi-Layer Caching Explanation
- **Browser Cache**: Cache assets locally in the user's browser
- **CDN Cache**: Cache content on distributed servers closer to users
- **Database Cache**: Cache database queries in memory (Redis/Memcached)
- **ISR Cache**: Incremental Static Regeneration for dynamic content

#### Caching with fetch API
```javascript
// app/api/products/route.js
export async function GET() {
  // Force cache (similar to getStaticProps)
  const staticData = await fetch(`https://api.example.com/products`, {
    cache: 'force-cache' // Default behavior
  });

  // No cache (similar to getServerSideProps)
  const dynamicData = await fetch(`https://api.example.com/recent-orders`, {
    cache: 'no-store'
  });

  // Revalidate cache every 10 seconds
  const revalidatedData = await fetch(`https://api.example.com/popular-products`, {
    next: { revalidate: 10 }
  });

  return Response.json({
    static: await staticData.json(),
    dynamic: await dynamicData.json(),
    popular: await revalidatedData.json()
  });
}
```

#### Redis Caching Example
```javascript
// lib/redis.js
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_SECRET,
})

export async function getCachedData(key, fetchFunction, ttl = 3600) {
  // Try to get from cache first
  const cached = await redis.get(key)
  if (cached) {
    return cached
  }

  // If not in cache, fetch and store
  const data = await fetchFunction()
  await redis.setex(key, ttl, data)

  return data
}
```

### CDN Configuration

Configure your CDN for optimal content delivery.

#### Next.js Image Optimization with CDN
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    path: '/_next/image',
  },
}
```

### Rate Limiting

Implement rate limiting to protect your API from abuse.

#### Basic Rate Limiting with Middleware
```javascript
// middleware.js
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

export default async function middleware(request) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}`
    );

    if (!success) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:function*", "/api/v1/:path*"],
};
```

### Request Deduplication

Prevent duplicate requests from overwhelming your system.

#### Deduplication with Cache Tags
```javascript
// lib/api.js
export async function fetchWithDedup(key, fetcher, options = {}) {
  'use cache'

  // Use cache tags for easy invalidation
  if (options.tag) {
    // Use appropriate cache directive based on use case
    'use cache: remote'
    cacheTag(options.tag)
  }

  return await fetcher()
}

// Usage in component
async function ProductDetails({ id }) {
  const product = await fetchWithDedup(
    `product-${id}`,
    () => fetch(`/api/products/${id}`).then(r => r.json()),
    { tag: `product-${id}` }
  )

  return <div>{product.name}</div>
}
```

## Performance Optimization

### Code Splitting and Dynamic Imports
- Use dynamic imports for heavy components
- Implement route-level code splitting
- Leverage Next.js automatic code splitting

### Tree Shaking
- Use ES6 exports for better tree shaking
- Remove unused dependencies
- Audit your bundle regularly

### Minification and Compression
- Enable gzip/brotli compression
- Minify JavaScript and CSS
- Optimize images and fonts

### Image, Font, and Script Optimization
- Use Next.js Image component
- Preload critical fonts with next/font
- Lazy load third-party scripts

## Monitoring at Scale

### Real User Monitoring (RUM)
Track real user interactions and performance metrics in production.

### Synthetic Monitoring
Simulate user journeys to detect issues before real users encounter them.

### Error Tracking
Implement comprehensive error tracking with tools like Sentry.

### Performance Budgets
Set performance budgets to prevent regressions.

### Core Web Vitals
Monitor and optimize Core Web Vitals: LCP, FID, CLS.

### Traffic Monitoring
Monitor traffic patterns and system performance.

### Cost Monitoring
Track infrastructure costs and optimize based on usage patterns.

## Scaling Strategies

### Database Replicas
Use read replicas to distribute database load.

### Caching to Reduce DB Load
Implement multi-layer caching to reduce database queries.

### CDN-Based Content Distribution
Use CDNs to serve static assets closer to users.

### Edge Functions for Computation
Offload computation to edge networks.

### Load Balancing
Distribute traffic across multiple instances.

### Auto-Scaling Infrastructure
Scale resources based on demand automatically.

## Quick Reference

### ISR Patterns
- Use `revalidate` option with fetch in App Router
- Use `getStaticProps` with `revalidate` in Pages Router
- Combine with `generateStaticParams` for dynamic routes

### Middleware Usage
- Configure with `matcher` to specify paths
- Use for authentication, redirects, headers
- Edge runtime for faster execution

### Streaming and Suspense
- Wrap async components with Suspense
- Use skeleton loaders for better UX
- Implement progressive loading

### Performance Optimization
- Use dynamic imports for code splitting
- Optimize images with Next.js Image
- Analyze bundles regularly
- Implement proper caching strategies

### Scaling Strategies
- Implement multi-layer caching
- Use CDNs for static assets
- Offload computation to edge
- Monitor performance metrics
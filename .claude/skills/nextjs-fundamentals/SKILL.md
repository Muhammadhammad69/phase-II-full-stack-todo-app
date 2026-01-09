---
name: nextjs-fundamentals
description: Comprehensive Next.js framework knowledge covering App Router, Pages Router, server components, data fetching, image optimization, and deployment. Use when Claude needs to work with Next.js applications for setting up new projects, understanding routing systems, implementing server and client components, optimizing performance, configuring data fetching strategies, working with API routes, deploying to platforms, and understanding Next.js architecture.
---

# Next.js Fundamentals - Modern React Framework

## Overview

Next.js is a powerful React framework for building full-stack web applications developed by Vercel. It extends React's capabilities with features like server-side rendering (SSR), static site generation (SSG), and hybrid approaches, all optimized through Rust-based JavaScript tooling for high-performance builds.

## Key Features

### 1. Rendering Strategies
- **Server-Side Rendering (SSR)**: Render pages on each request for fresh data
- **Static Site Generation (SSG)**: Pre-render pages at build time for optimal performance
- **Incremental Static Regeneration (ISR)**: Update static content without rebuilding the entire site
- **Client-Side Rendering (CSR)**: Traditional React SPA behavior when needed

### 2. Routing Systems

#### App Router (Recommended - v13+)
The modern approach using the `/app` directory with:
- Server Components by default for better performance
- Advanced layout system with nested layouts
- Built-in loading and error states
- Better code organization and performance

#### Pages Router (Legacy - still supported)
The traditional approach using the `/pages` directory with:
- Familiar file structure
- getStaticProps and getStaticPaths for SSG
- getServerSideProps for SSR

### 3. Component Types

#### Server Components (Default in App Router)
- Run on the server and can access backend resources directly
- Can access databases, APIs, environment variables
- Keep sensitive information server-side
- Better performance by reducing bundle size

```javascript
// app/page.js - Server Component (default)
export default function Page() {
  // Can access databases, APIs, environment variables
  const data = fetchDataFromDatabase()
  return <div>{data}</div>
}
```

#### Client Components
- Run in the browser and enable interactivity
- Use React hooks (useState, useEffect, etc.)
- Access browser APIs (localStorage, sessionStorage)
- Event listeners and handlers

```javascript
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### 4. File System Conventions (App Router)

- `layout.js` - Persistent layout for route segments
- `page.js` - Unique UI for route segment
- `loading.js` - Loading UI during data fetching
- `error.js` - Error boundary UI
- `not-found.js` - Not found UI
- `route.js` - API route handlers
- `middleware.js` - Request middleware

### 5. Performance Optimizations

#### Image Optimization
Next.js provides automatic image optimization through the `next/image` component:

```jsx
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/me.png"
      alt="Picture of the author"
      width={500}
      height={500}
    />
  )
}
```

#### Font Optimization
Optimize custom fonts using `next/font`:

```jsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

#### Automatic Code Splitting
Next.js automatically splits code by route, optimizing bundle sizes.

## Getting Started

### Creating a New Next.js Project
```bash
npx create-next-app@latest my-app
```

### Basic Page Structure (App Router)
```javascript
// app/page.js
export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <p>This is a Next.js application</p>
    </main>
  )
}
```

### Dynamic Routes
```javascript
// app/blog/[slug]/page.js
export default function Post({ params }) {
  return (
    <article>
      <h1>Blog Post: {params.slug}</h1>
      <p>Content for this blog post</p>
    </article>
  )
}
```

### Data Fetching in Server Components
```javascript
// app/products/page.js
export default async function Products() {
  const res = await fetch('https://api.example.com/products')
  const products = await res.json()

  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## API Routes

Create API endpoints in the `/app/api` directory:

```javascript
// app/api/hello/route.js
export async function GET(request) {
  return new Response('Hello, Next.js!')
}
```

## Configuration

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
        port: '',
        pathname: '/image/upload/**',
      }
    ],
  },
  experimental: {
    appDir: true, // Enable App Router
  }
}

module.exports = nextConfig
```

## Deployment

### Vercel (Recommended)
Deploy with zero configuration:
```bash
vercel
```

### Other Platforms
- Docker containers
- Traditional servers
- Cloud platforms (AWS, GCP, Azure)

## When to Use Next.js

Choose Next.js when you need:
- Server-side rendering for better SEO
- Static site generation for performance
- Built-in image and font optimization
- Full-stack JavaScript development
- Automatic code splitting
- File-based routing system
- TypeScript support out of the box
- API routes without separate backend

## Best Practices

1. Use Server Components by default in App Router
2. Leverage SSG for static content
3. Use ISR for frequently updated content
4. Implement proper error boundaries
5. Optimize images with the Image component
6. Use dynamic imports for code splitting
7. Configure proper metadata for SEO
8. Monitor Core Web Vitals

## References

For detailed information on specific topics, see the reference files:
- [ROUTING.md](references/ROUTING.md) - Comprehensive routing guide
- [DATA_FETCHING.md](references/DATA_FETCHING.md) - Detailed data fetching strategies
- [PERFORMANCE.md](references/PERFORMANCE.md) - Performance optimization techniques
- [DEPLOYMENT.md](references/DEPLOYMENT.md) - Deployment strategies and best practices
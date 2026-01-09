# Next.js Performance Optimization Guide

## Image Optimization

### Using the Image Component
The `next/image` component automatically optimizes images:

```javascript
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/me.png"
      alt="Picture of the author"
      width={500}
      height={500}
      // Optional: Specify loading strategy
      loading="lazy" // or "eager"
      // Optional: Specify priority for above-the-fold images
      priority
      // Optional: Specify image format preferences
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### Configuration in next.config.js
Configure image optimization settings:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configure allowed remote image hosts
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    // Configure image formats
    formats: ['image/webp'],
    // Configure image sizes for optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
```

### Responsive Images
Use the `fill` prop for responsive images:

```javascript
import Image from 'next/image'
import styles from './styles.module.css'

export default function ResponsiveImage() {
  return (
    <div className={styles.container}>
      <Image
        src="/hero.jpg"
        alt="Hero image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
```

## Font Optimization

### Google Fonts
Optimize Google Fonts automatically:

```javascript
// app/layout.js
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Improve loading performance
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Local Fonts
Optimize local fonts:

```javascript
// app/layout.js
import localFont from 'next/font/local'

const myFont = localFont({
  src: '../fonts/my-font.woff2',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={myFont.className}>
      <body>{children}</body>
    </html>
  )
}
```

## Code Splitting and Dynamic Imports

### Automatic Code Splitting
Next.js automatically splits code by route, but you can also split manually:

```javascript
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import heavy components
const HeavyComponent = dynamic(() => import('../components/heavy-component'))

// With loading component
const ComponentWithLoader = dynamic(
  () => import('../components/another-component'),
  {
    loading: () => <p>Loading...</p>
  }
)

// Without SSR
const ClientOnlyComponent = dynamic(
  () => import('../components/client-only'),
  { ssr: false }
)

export default function Page() {
  const [showComponent, setShowComponent] = useState(false)

  return (
    <div>
      <button onClick={() => setShowComponent(true)}>
        Show Heavy Component
      </button>

      {showComponent && <HeavyComponent />}
    </div>
  )
}
```

### Dynamic Imports for Libraries
Import heavy libraries only when needed:

```javascript
'use client'

import { useState } from 'react'

export default function Page() {
  const [chartLoaded, setChartLoaded] = useState(false)

  const loadChart = async () => {
    const { default: Chart } = await import('chart.js')
    // Use Chart
    setChartLoaded(true)
  }

  return (
    <div>
      {!chartLoaded && <button onClick={loadChart}>Load Chart</button>}
      {chartLoaded && <div>Chart is loaded</div>}
    </div>
  )
}
```

## Caching Strategies

### Server-Side Caching
Configure caching for data fetching:

```javascript
// app/page.js
// Revalidate every hour (3600 seconds)
export const revalidate = 3600

export default async function Page() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()

  return <div>{data.title}</div>
}
```

### Cache Tags
Use cache tags for granular cache invalidation:

```javascript
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// Cache function results
const getCachedPosts = unstable_cache(
  async () => {
    const res = await fetch('https://api.example.com/posts')
    return res.json()
  },
  ['posts'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
)

// Use cache tags for invalidation
export async function addPost(post) {
  await db.post.create({ data: post })

  // Revalidate cache tagged with 'posts'
  revalidateTag('posts')
}
```

## Optimizing Core Web Vitals

### Largest Contentful Paint (LCP)
- Preload critical resources
- Optimize largest page elements
- Use priority loading for hero images

```javascript
// Preload critical resources in layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/critical.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <Image
          src="/hero.jpg"
          alt="Hero"
          priority // Prioritize loading of above-the-fold images
          width={1200}
          height={600}
        />
        {children}
      </body>
    </html>
  )
}
```

### First Input Delay (FID)
- Minimize main thread work
- Reduce JavaScript bundle size
- Use web workers for heavy computations

### Cumulative Layout Shift (CLS)
- Always include width and height attributes on images and videos
- Reserve space for dynamic content
- Avoid inserting content above existing content

```javascript
// Always specify dimensions to prevent layout shift
<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={200}
  height={200}
  // Use placeholder while loading
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Bundle Optimization

### Analyzing Bundle Size
Analyze your bundle with webpack-bundle-analyzer:

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withBundleAnalyzer(nextConfig)
```

Then run: `ANALYZE=true npm run build`

### Optimizing Dependencies
Configure dependency optimization in next.config.js:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize specific packages
  experimental: {
    optimizePackageImports: ['lodash', '@mui/material'],
  },
  // Transpile specific packages
  transpilePackages: ['@repo/ui', 'shared-utils'],
}
```

## Lazy Loading and Intersection Observer

### Component-Level Lazy Loading
Use Suspense and dynamic imports for lazy loading:

```javascript
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const LazyFeature = dynamic(() => import('../components/feature'), {
  loading: () => <div>Loading feature...</div>,
})

export default function Page() {
  return (
    <div>
      <h1>Main content</h1>
      <Suspense fallback={<div>Loading sidebar...</div>}>
        <LazyFeature />
      </Suspense>
    </div>
  )
}
```

## Preloading and Prefetching

### Link Prefetching
Next.js automatically prefetches pages on hover, but you can control this:

```javascript
import Link from 'next/link'

// Disable prefetching
<Link href="/some-page" prefetch={false}>
  Some Page
</Link>

// Prefetch programmatically
import { useRouter } from 'next/router'

export default function Component() {
  const router = useRouter()

  return (
    <button
      onMouseEnter={() => router.prefetch('/dashboard')}
      onClick={() => router.push('/dashboard')}
    >
      Go to Dashboard
    </button>
  )
}
```

## Performance Monitoring

### Web Vitals Reporting
Monitor Core Web Vitals in your application:

```javascript
// pages/_app.js or app/layout.js
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Send web vitals to analytics
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }, [])

  return <Component {...pageProps} />
}
```
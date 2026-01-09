# Core Web Vitals Optimization with Next.js

## Overview

Core Web Vitals are a set of metrics that measure the user experience of web pages. This guide covers how to optimize these metrics using Next.js image and font optimization techniques.

## Core Web Vitals Metrics

### 1. Largest Contentful Paint (LCP)

LCP measures the time it takes for the largest content element to be visible in the viewport. It should be less than 2.5 seconds.

#### Image Optimization for LCP
```javascript
// pages/index.js
import Image from 'next/image'

export default function HomePage() {
  return (
    <div>
      {/* Hero image - this is likely the LCP element */}
      <Image
        src="/hero-image.jpg"
        alt="Hero Image"
        width={1200}
        height={600}
        priority // Mark as priority to load early
        quality={85} // Optimize quality for LCP
      />

      {/* Other content */}
      <div>
        <h1>Welcome to Our Site</h1>
        <p>This is the main content...</p>
      </div>
    </div>
  )
}
```

#### Font Optimization for LCP
```javascript
// app/layout.js
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use swap to prevent invisible text
  weight: ['400', '500', '600', '700'] // Only load necessary weights
})

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 2. First Input Delay (FID)

FID measures the time from when a user first interacts with a page to when the browser responds. It should be less than 100ms.

#### Optimizing for FID
```javascript
// lib/optimization.js
// Minimize JavaScript execution time
export function optimizeForFID() {
  // Defer non-critical JavaScript
  // Use requestIdleCallback for non-urgent tasks
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Non-critical work here
      console.log('Non-critical task executed during idle time')
    })
  } else {
    // Fallback for older browsers
    setTimeout(() => {
      console.log('Non-critical task executed')
    }, 1)
  }
}

// components/LazyComponent.js
import { useState, useEffect } from 'react'

export default function LazyComponent() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Mount component after initial render to reduce blocking time
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) {
    return <div>Loading...</div>
  }

  return <div>Lazy loaded component</div>
}
```

### 3. Cumulative Layout Shift (CLS)

CLS measures the visual stability of a page. It should be less than 0.1.

#### Preventing Layout Shift with Images
```javascript
// components/StableImage.js
import Image from 'next/image'

export default function StableImage({ src, alt, width, height }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

// components/GridWithPlaceholders.js
import Image from 'next/image'

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="product-card">
          {/* Reserve space with aspect ratio */}
          <div style={{ aspectRatio: '4/3' }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              placeholder="blur"
              blurDataURL={product.blurDataUrl}
            />
          </div>
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  )
}
```

#### Preventing Layout Shift with Fonts
```javascript
// lib/font-styling.js
// Preload font dimensions to prevent layout shift
export const fontStyling = `
  /* Reserve space for headings to prevent layout shift */
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.2;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
  }

  /* Ensure consistent baseline for text */
  body {
    line-height: 1.5;
  }

  /* Prevent layout shift from variable fonts */
  .font-variable {
    font-variation-settings: 'wght' 400;
  }
`
```

## Comprehensive Optimization Strategy

### 1. Optimizing All Metrics Together

```javascript
// app/optimized-page.js
import Image from 'next/image'
import { useLayoutEffect } from 'react'

// Optimize for all Core Web Vitals
export default function OptimizedPage({ content }) {
  // Preload critical resources
  useLayoutEffect(() => {
    // Preconnect to important origins
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.example.com'
    ]

    preconnectLinks.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      document.head.appendChild(link)
    })
  }, [])

  return (
    <div>
      {/* Critical above-the-fold content */}
      <header>
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={200}
          height={60}
          priority
          quality={75}
        />
        <h1>Page Title</h1>
      </header>

      {/* Main content optimized for LCP */}
      <main>
        <Image
          src="/hero-image.jpg"
          alt="Hero Image"
          width={1200}
          height={600}
          priority
          quality={85}
        />

        <div className="content">
          <p>{content.mainText}</p>
        </div>
      </main>

      {/* Non-critical content optimized for FID */}
      <aside>
        {content.sidebarItems.map(item => (
          <div key={item.id} className="sidebar-item">
            <Image
              src={item.image}
              alt={item.title}
              width={300}
              height={200}
              placeholder="blur"
              blurDataURL={item.blurDataUrl}
            />
          </div>
        ))}
      </aside>
    </div>
  )
}
```

### 2. Performance Monitoring Component

```javascript
// components/WebVitalsMonitor.js
'use client'

import { useState, useEffect } from 'react'

export default function WebVitalsMonitor({ children }) {
  const [metrics, setMetrics] = useState({
    lcp: null,
    cls: null,
    fid: null
  })

  useEffect(() => {
    // Performance monitoring using the Web Vitals library
    const observeWebVitals = async () => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'largest-contentful-paint') {
              setMetrics(prev => ({ ...prev, lcp: entry.renderTime || entry.loadTime }))
            }
          })
        })

        observer.observe({ entryTypes: ['largest-contentful-paint'] })

        // CLS monitoring
        let clsValue = 0
        const clsObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.hadRecentInput) return
            clsValue += entry.value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          })
        })

        clsObserver.observe({ entryTypes: ['layout-shift'] })

        return () => {
          observer.disconnect()
          clsObserver.disconnect()
        }
      }
    }

    observeWebVitals()
  }, [])

  return (
    <div>
      {children}
      {/* Hidden performance metrics for analytics */}
      <div
        className="sr-only"
        aria-hidden="true"
        data-web-vitals={JSON.stringify(metrics)}
      >
        Performance Metrics: LCP={metrics.lcp}, CLS={metrics.cls}
      </div>
    </div>
  )
}
```

## Measurement and Testing

### 1. Automated Testing

```javascript
// tests/core-web-vitals.test.js
describe('Core Web Vitals', () => {
  test('LCP should be under 2.5 seconds', async () => {
    // Use Puppeteer or Playwright to measure LCP
    const page = await browser.newPage()
    await page.goto('http://localhost:3000')

    // Measure LCP using Performance API
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    })

    expect(lcp).toBeLessThan(2500) // Less than 2.5 seconds
  })

  test('CLS should be under 0.1', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3000')

    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0
        new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          resolve(clsValue)
        }).observe({ entryTypes: ['layout-shift'] })
      })
    })

    expect(cls).toBeLessThan(0.1)
  })
})
```

### 2. Lighthouse Integration

```javascript
// lighthouse-config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Core Web Vitals thresholds
    performanceBudget: {
      resourceCounts: [
        { resourceType: 'total', budget: 150 },
        { resourceType: 'script', budget: 100 },
        { resourceType: 'third-party', budget: 50 }
      ],
      resourceSizes: [
        { resourceType: 'total', budget: 2000 },
        { resourceType: 'script', budget: 1000 },
        { resourceType: 'stylesheet', budget: 100 }
      ]
    },
    // Custom thresholds for Core Web Vitals
    throttlingMethod: 'simulate',
    throttling: {
      // Slow 4G network simulation
      rttMs: 150,
      throughputKbps: 1.5 * 1024,
      cpuSlowdownMultiplier: 4
    }
  }
}
```

## Performance Optimization Checklist

### LCP Optimization Checklist
- [ ] Use `priority` prop for above-the-fold images
- [ ] Preload critical images
- [ ] Optimize image quality (75-85 for photos)
- [ ] Use modern formats (WebP, AVIF)
- [ ] Use `next/font` with `display: 'swap'`
- [ ] Preload critical fonts
- [ ] Minimize critical CSS
- [ ] Optimize server response times

### FID Optimization Checklist
- [ ] Minimize main thread work
- [ ] Reduce JavaScript bundle size
- [ ] Use code splitting
- [ ] Defer non-critical JavaScript
- [ ] Use web workers for heavy computations
- [ ] Optimize third-party scripts

### CLS Optimization Checklist
- [ ] Always set `width` and `height` for images
- [ ] Use aspect ratio boxes for responsive images
- [ ] Reserve space for ads, embeds, and iframes
- [ ] Avoid inserting content above existing content
- [ ] Use `font-display: swap` for custom fonts
- [ ] Animate layout changes smoothly

## Real-World Optimization Examples

### E-commerce Homepage
```javascript
// pages/index.js
import Image from 'next/image'
import { useState } from 'react'

export default function HomePage({ hero, products, categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div>
      {/* Hero section - LCP optimization */}
      <section className="hero">
        <Image
          src={hero.image}
          alt={hero.alt}
          width={1200}
          height={600}
          priority
          quality={85}
        />
        <div className="hero-content">
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>
        </div>
      </section>

      {/* Categories - prevent layout shift */}
      <section className="categories" style={{ minHeight: '200px' }}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            style={{ height: '150px' }} // Reserve space
          >
            <Image
              src={category.image}
              alt={category.name}
              width={100}
              height={100}
              placeholder="blur"
              blurDataURL={category.blurDataUrl}
            />
            {category.name}
          </button>
        ))}
      </section>

      {/* Products grid - CLS prevention */}
      <section className="products-grid">
        <div className="grid-container">
          {products.map(product => (
            <div key={product.id} className="product-card">
              {/* Reserve space with aspect ratio */}
              <div style={{ aspectRatio: '1/1', position: 'relative' }}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL={product.blurDataUrl}
                />
              </div>
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

By following these optimization strategies, you can achieve excellent Core Web Vitals scores and provide a superior user experience.
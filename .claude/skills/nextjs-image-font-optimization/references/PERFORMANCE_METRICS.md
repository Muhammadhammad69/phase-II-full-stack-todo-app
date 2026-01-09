# Next.js Performance Metrics and Optimization

## Overview

This guide covers comprehensive performance metrics and optimization techniques for Next.js applications, focusing on image and font optimization and their impact on overall performance.

## Performance Measurement Tools

### 1. Web Vitals Measurement

Implement Web Vitals measurement in your Next.js application:

```javascript
// lib/web-vitals.js
import { ReportHandler } from 'web-vitals'

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry)
      getFID(onPerfEntry)
      getFCP(onPerfEntry)
      getLCP(onPerfEntry)
      getTTFB(onPerfEntry)
    })
  }
}

export default reportWebVitals
```

### 2. Custom Performance Monitoring

Create custom performance monitoring:

```javascript
// lib/performance-monitor.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      navigation: {},
      resource: {},
      paint: {},
      layout: {}
    }
  }

  // Measure image loading performance
  measureImageLoad(src, startTime) {
    const img = new Image()
    img.onload = () => {
      const loadTime = performance.now() - startTime
      this.metrics.resource[src] = {
        loadTime,
        size: this.estimateSize(src),
        format: this.getFileExtension(src),
        timestamp: Date.now()
      }
    }
    img.src = src
  }

  // Estimate file size based on format and dimensions
  estimateSize(src) {
    // Simplified estimation - in real app, you'd get actual sizes
    const ext = this.getFileExtension(src)
    switch(ext) {
      case 'webp':
        return { estimatedKB: 50, compression: 'high' }
      case 'avif':
        return { estimatedKB: 40, compression: 'very-high' }
      case 'jpg':
        return { estimatedKB: 80, compression: 'medium' }
      case 'png':
        return { estimatedKB: 120, compression: 'low' }
      default:
        return { estimatedKB: 100, compression: 'unknown' }
    }
  }

  getFileExtension(src) {
    return src.split('.').pop().toLowerCase()
  }

  // Measure font loading performance
  async measureFontLoad(fontFamily) {
    if ('fonts' in document) {
      const font = `16px ${fontFamily}`
      const start = performance.now()

      try {
        await document.fonts.load(font)
        const loadTime = performance.now() - start

        this.metrics.font = {
          family: fontFamily,
          loadTime,
          loaded: true,
          timestamp: Date.now()
        }
      } catch (error) {
        this.metrics.font = {
          family: fontFamily,
          loaded: false,
          error: error.message,
          timestamp: Date.now()
        }
      }
    }
  }

  getReport() {
    return {
      metrics: this.metrics,
      summary: {
        avgImageLoadTime: this.calculateAverage(Object.values(this.metrics.resource).map(r => r.loadTime)),
        avgFontLoadTime: this.metrics.font?.loadTime || 0,
        totalImages: Object.keys(this.metrics.resource).length,
        totalFonts: this.metrics.font ? 1 : 0
      }
    }
  }

  calculateAverage(values) {
    if (values.length === 0) return 0
    const sum = values.reduce((acc, val) => acc + (val || 0), 0)
    return sum / values.length
  }
}

export const perfMonitor = new PerformanceMonitor()
```

## Performance Optimization Patterns

### 1. Image Optimization Patterns

#### Lazy Loading with Intersection Observer
```javascript
// hooks/useIntersectionObserver.js
import { useState, useEffect } from 'react'

export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState(null)

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [element, options])

  return [setElement, isIntersecting]
}

// components/LazyImage.js
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export default function LazyImage({ src, alt, placeholder, ...props }) {
  const [elementRef, isVisible] = useIntersectionObserver()
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div ref={elementRef}>
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          {...props}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            ...props.style
          }}
        />
      ) : (
        <div className="placeholder">
          {placeholder || <div className="skeleton" />}
        </div>
      )}
    </div>
  )
}
```

#### Progressive Image Loading
```javascript
// components/ProgressiveImage.js
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ProgressiveImage({
  src,
  alt,
  width,
  height,
  lowQualitySrc,
  quality = 75,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoading) {
      const img = new Image()
      img.onload = () => {
        setCurrentSrc(src)
        setIsLoading(false)
      }
      img.src = src
    }
  }, [src, isLoading])

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      quality={isLoading ? 30 : quality}
      placeholder={lowQualitySrc ? "blur" : "empty"}
      blurDataURL={lowQualitySrc}
      style={{
        filter: isLoading ? 'blur(5px)' : 'none',
        transition: 'filter 0.3s ease',
        ...props.style
      }}
      {...props}
    />
  )
}
```

### 2. Font Optimization Patterns

#### Font Loading Strategy
```javascript
// hooks/useFontLoader.js
import { useState, useEffect } from 'react'

export function useFontLoader(fontFamily) {
  const [fontStatus, setFontStatus] = useState('loading')

  useEffect(() => {
    const loadFont = async () => {
      if (!('fonts' in document)) {
        setFontStatus('unsupported')
        return
      }

      try {
        const font = `16px ${fontFamily}`
        const loadStart = performance.now()

        await document.fonts.load(font)
        const loadEnd = performance.now()

        setFontStatus({
          status: 'loaded',
          loadTime: loadEnd - loadStart
        })
      } catch (error) {
        setFontStatus({
          status: 'error',
          error: error.message
        })
      }
    }

    loadFont()
  }, [fontFamily])

  return fontStatus
}

// components/FontAwareComponent.js
import { useFontLoader } from '@/hooks/useFontLoader'

export default function FontAwareComponent({ children, fontFamily }) {
  const fontStatus = useFontLoader(fontFamily)

  if (fontStatus === 'loading') {
    return (
      <div className="font-loading-placeholder">
        <div className="text-skeleton">Loading text...</div>
      </div>
    )
  }

  if (fontStatus.status === 'error') {
    console.warn('Font failed to load:', fontStatus.error)
    return <div className="fallback-text">{children}</div>
  }

  return <div className={`font-loaded ${fontFamily}`}>{children}</div>
}
```

## Performance Testing

### 1. Automated Performance Testing

#### Jest Performance Tests
```javascript
// tests/performance.test.js
import { render, screen } from '@testing-library/react'
import { perfMonitor } from '@/lib/performance-monitor'

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('Image should load within performance threshold', async () => {
    const startTime = performance.now()

    render(<Image src="/test-image.jpg" alt="Test" width={400} height={300} />)

    // Simulate image load time
    await act(async () => {
      jest.advanceTimersByTime(500) // Simulate 500ms load time
    })

    const loadTime = performance.now() - startTime

    // Assert performance threshold
    expect(loadTime).toBeLessThan(1000) // Should load within 1 second
  })

  test('Font loading should not exceed threshold', () => {
    const fontLoadStart = performance.now()

    // Simulate font loading
    const mockFontLoad = jest.fn().mockResolvedValue(true)
    mockFontLoad('16px TestFont')

    const fontLoadTime = performance.now() - fontLoadStart

    expect(fontLoadTime).toBeLessThan(500) // Font should load within 500ms
  })
})
```

#### Performance Budget Testing
```javascript
// tests/performance-budget.test.js
const PERFORMANCE_BUDGET = {
  lcp: 2500, // 2.5 seconds
  cls: 0.1,  // 0.1
  fid: 100,  // 100ms
  ttfb: 600, // 600ms
  fcp: 1800, // 1.8 seconds
  tti: 3800  // 3.8 seconds
}

describe('Performance Budget', () => {
  test('LCP should meet budget', async () => {
    const lcp = await measureLCP()
    expect(lcp).toBeLessThanOrEqual(PERFORMANCE_BUDGET.lcp)
  })

  test('CLS should meet budget', async () => {
    const cls = await measureCLS()
    expect(cls).toBeLessThanOrEqual(PERFORMANCE_BUDGET.cls)
  })

  test('FID should meet budget', async () => {
    const fid = await measureFID()
    expect(fid).toBeLessThanOrEqual(PERFORMANCE_BUDGET.fid)
  })
})

// Helper functions for measuring metrics
async function measureLCP() {
  // Implementation to measure LCP
  return new Promise(resolve => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcpEntry = entries[entries.length - 1]
      resolve(lcpEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  })
}

async function measureCLS() {
  // Implementation to measure CLS
  return new Promise(resolve => {
    let clsValue = 0
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })

    // Wait for a period to accumulate shifts
    setTimeout(() => resolve(clsValue), 5000)
  })
}

async function measureFID() {
  // Implementation to measure FID
  return new Promise(resolve => {
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0]
      if (firstInput) {
        resolve(firstInput.processingStart - firstInput.startTime)
      }
    }).observe({ entryTypes: ['first-input'] })
  })
}
```

## Performance Optimization Strategies

### 1. Image Optimization Strategies

#### Image CDN Integration
```javascript
// lib/image-optimizer.js
export class ImageOptimizer {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://cdn.example.com'
    this.defaultQuality = config.defaultQuality || 75
    this.formats = config.formats || ['webp', 'avif', 'jpeg']
  }

  buildImageUrl(src, options = {}) {
    const {
      width,
      height,
      quality = this.defaultQuality,
      format,
      fit = 'cover',
      crop
    } = options

    const url = new URL(src, this.baseUrl)

    // Add optimization parameters
    if (width) url.searchParams.set('w', width)
    if (height) url.searchParams.set('h', height)
    if (quality) url.searchParams.set('q', quality)
    if (format) url.searchParams.set('f', format)
    if (fit) url.searchParams.set('fit', fit)
    if (crop) url.searchParams.set('crop', crop)

    return url.toString()
  }

  // Generate responsive image sources
  generateResponsiveSources(src, sizes) {
    return sizes.map(size => ({
      src: this.buildImageUrl(src, { width: size }),
      width: size,
      media: `(max-width: ${size}px)`
    }))
  }
}

export const imageOptimizer = new ImageOptimizer()
```

#### Image Preloading
```javascript
// lib/image-preloader.js
export class ImagePreloader {
  constructor() {
    this.preloaded = new Set()
  }

  preload(images) {
    return Promise.all(
      images.map(src => this.preloadImage(src))
    )
  }

  preloadImage(src) {
    if (this.preloaded.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.preloaded.add(src)
        resolve(img)
      }
      img.onerror = reject
      img.src = src
    })
  }

  preloadCriticalImages() {
    // Preload above-the-fold images
    const criticalImages = [
      '/hero-image.jpg',
      '/logo.png',
      '/critical-icon.svg'
    ]

    return this.preload(criticalImages)
  }
}

export const imagePreloader = new ImagePreloader()
```

### 2. Font Optimization Strategies

#### Font Loading Optimization
```javascript
// lib/font-optimizer.js
export class FontOptimizer {
  constructor() {
    this.loadedFonts = new Set()
  }

  async loadFont(fontFamily, options = {}) {
    if (this.loadedFonts.has(fontFamily)) {
      return Promise.resolve()
    }

    if (!('fonts' in document)) {
      // Fallback for browsers without Font API
      this.loadedFonts.add(fontFamily)
      return Promise.resolve()
    }

    const { weight = '400', style = 'normal', timeout = 3000 } = options
    const fontFace = `${weight} ${style} ${fontFamily}`

    try {
      // Race against timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Font load timeout')), timeout)
      })

      const loadPromise = document.fonts.load(fontFace)

      await Promise.race([loadPromise, timeoutPromise])
      this.loadedFonts.add(fontFamily)
    } catch (error) {
      console.warn(`Font ${fontFamily} failed to load:`, error.message)
      // Still add to loaded set to prevent repeated attempts
      this.loadedFonts.add(fontFamily)
    }
  }

  async loadFontFamily(fontFamily, weights = ['400'], styles = ['normal']) {
    const promises = []

    for (const weight of weights) {
      for (const style of styles) {
        promises.push(this.loadFont(fontFamily, { weight, style }))
      }
    }

    await Promise.all(promises)
  }
}

export const fontOptimizer = new FontOptimizer()
```

## Performance Monitoring Dashboard

### 1. Performance Metrics Dashboard

```javascript
// components/PerformanceDashboard.js
'use client'

import { useState, useEffect } from 'react'
import { perfMonitor } from '@/lib/performance-monitor'

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setMetrics(perfMonitor.getReport())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isMonitoring])

  const startMonitoring = () => {
    setIsMonitoring(true)
    setMetrics(perfMonitor.getReport())
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  if (!metrics) {
    return (
      <div className="perf-dashboard">
        <h2>Performance Dashboard</h2>
        <button onClick={startMonitoring}>Start Monitoring</button>
      </div>
    )
  }

  return (
    <div className="perf-dashboard">
      <div className="dashboard-header">
        <h2>Performance Dashboard</h2>
        <button onClick={stopMonitoring}>Stop Monitoring</button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>LCP</h3>
          <div className="value">
            {metrics.summary.avgImageLoadTime ? `${Math.round(metrics.summary.avgImageLoadTime)}ms` : 'N/A'}
          </div>
          <div className={`status ${metrics.summary.avgImageLoadTime < 2500 ? 'good' : 'poor'}`}>
            {metrics.summary.avgImageLoadTime < 2500 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>

        <div className="metric-card">
          <h3>Images Loaded</h3>
          <div className="value">{metrics.summary.totalImages}</div>
          <div className="status">Total</div>
        </div>

        <div className="metric-card">
          <h3>Font Load Time</h3>
          <div className="value">
            {metrics.summary.avgFontLoadTime ? `${Math.round(metrics.summary.avgFontLoadTime)}ms` : 'N/A'}
          </div>
          <div className={`status ${metrics.summary.avgFontLoadTime < 300 ? 'good' : 'poor'}`}>
            {metrics.summary.avgFontLoadTime < 300 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>
      </div>

      <div className="detailed-metrics">
        <h3>Detailed Metrics</h3>
        <pre>{JSON.stringify(metrics.metrics, null, 2)}</pre>
      </div>
    </div>
  )
}
```

## Performance Optimization Best Practices

### 1. Image Best Practices

- Always use the `next/image` component
- Set explicit `width` and `height` to prevent layout shift
- Use `priority` for above-the-fold images
- Implement proper placeholder strategies
- Optimize for different screen densities
- Use modern formats (WebP, AVIF)
- Implement lazy loading for below-the-fold images
- Preload critical images
- Use responsive images with `sizes` prop

### 2. Font Best Practices

- Use `next/font` for automatic optimization
- Subset fonts to include only necessary characters
- Use `display: 'swap'` to prevent invisible text
- Preload critical fonts
- Limit the number of font families
- Use variable fonts when possible
- Implement font fallbacks
- Monitor font loading performance

### 3. General Performance Best Practices

- Minimize bundle size
- Use code splitting effectively
- Implement proper caching strategies
- Optimize for Core Web Vitals
- Monitor performance continuously
- Test on various devices and networks
- Use performance budgets
- Implement progressive enhancement

These performance optimization strategies will help you build fast, efficient Next.js applications with excellent user experience and optimal performance metrics.
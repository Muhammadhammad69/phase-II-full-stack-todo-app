# Next.js Image Optimization Guide

## Overview

Next.js provides powerful built-in image optimization through the `next/image` component. This guide covers advanced techniques and best practices for optimizing images in your Next.js applications.

## Advanced Image Optimization Techniques

### 1. Responsive Images with Art Direction

For different images based on screen size:

```javascript
// components/ResponsiveImage.js
import Image from 'next/image'

export default function ResponsiveImage({ mobileSrc, desktopSrc, alt }) {
  return (
    <div className="responsive-image-container">
      {/* Desktop image */}
      <Image
        src={desktopSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 0px, 100vw"
        className="desktop-image"
        style={{ display: 'none' }}
      />

      {/* Mobile image */}
      <Image
        src={mobileSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 0px"
        className="mobile-image"
        style={{ display: 'none' }}
      />

      {/* Fallback for non-JS environments */}
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet={mobileSrc}
        />
        <img
          src={desktopSrc}
          alt={alt}
          style={{ width: '100%', height: 'auto' }}
        />
      </picture>
    </div>
  )
}
```

### 2. Image Loading Strategies

Different loading behaviors for various use cases:

```javascript
// components/ImageGallery.js
import Image from 'next/image'

export default function ImageGallery({ images }) {
  return (
    <div className="gallery">
      {images.map((image, index) => (
        <div key={image.id} className="gallery-item">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            // First image is critical, load eagerly
            loading={index === 0 ? 'eager' : 'lazy'}
            // For images near viewport, load early
            priority={index < 3}
            // Placeholder for better UX
            placeholder="blur"
            blurDataURL={image.blurDataURL}
          />
        </div>
      ))}
    </div>
  )
}
```

### 3. Advanced Placeholder Techniques

Custom placeholder strategies for different image types:

```javascript
// lib/image-placeholders.js
export function generateBlurData(imagePath) {
  // Generate blur data URL for placeholder
  // This could use a service like imgproxy or Sharp
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <circle cx="200" cy="150" r="50" fill="#e0e0e0"/>
    </svg>
  `)}`
}

export function getDominantColor(imagePath) {
  // Calculate dominant color for color placeholders
  // Implementation would depend on your image processing service
  return '#f0f0f0'
}

// components/ColorPlaceholderImage.js
import Image from 'next/image'

export default function ColorPlaceholderImage({ src, alt, width, height, color }) {
  return (
    <div style={{ backgroundColor: color, width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        placeholder="empty"
        style={{ opacity: 0 }}
        onLoadingComplete={(img) => {
          img.style.transition = 'opacity 0.3s'
          img.style.opacity = 1
        }}
      />
    </div>
  )
}
```

### 4. Image Optimization Configuration

Advanced configuration in `next.config.js`:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configure remote image patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Additional image sizes for smaller images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Preferred formats
    formats: ['image/webp', 'image/avif'],

    // Minimum cache TTL (in seconds)
    minimumCacheTTL: 60,

    // Disable optimization for specific cases
    unoptimized: false,

    // Configure domains for legacy support
    domains: ['example.com', 'localhost'],
  },
}

module.exports = nextConfig
```

## Performance Optimization Patterns

### 1. Progressive Image Loading

Implement progressive image loading with multiple resolutions:

```javascript
// components/ProgressiveImage.js
import { useState } from 'react'
import Image from 'next/image'

export default function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  width,
  height
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImage, setLoadedImage] = useState(lowQualitySrc)

  const handleHighQualityLoad = () => {
    setIsLoading(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Low quality placeholder */}
      <Image
        src={loadedImage}
        alt={alt}
        width={width}
        height={height}
        style={{
          filter: isLoading ? 'blur(20px)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />

      {/* High quality image */}
      <Image
        src={highQualitySrc}
        alt={alt}
        width={width}
        height={height}
        style={{ display: 'none' }}
        onLoad={handleHighQualityLoad}
      />
    </div>
  )
}
```

### 2. Image Caching Strategies

Implement custom caching for frequently accessed images:

```javascript
// lib/image-cache.js
const imageCache = new Map()

export async function getCachedImage(src, options = {}) {
  const cacheKey = `${src}-${JSON.stringify(options)}`

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)
  }

  try {
    const response = await fetch(src, options)
    const blob = await response.blob()
    const dataUrl = URL.createObjectURL(blob)

    // Cache for 5 minutes
    setTimeout(() => {
      imageCache.delete(cacheKey)
      URL.revokeObjectURL(dataUrl)
    }, 5 * 60 * 1000)

    imageCache.set(cacheKey, dataUrl)
    return dataUrl
  } catch (error) {
    console.error('Image caching error:', error)
    return src
  }
}

// components/CachedImage.js
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getCachedImage } from '@/lib/image-cache'

export default function CachedImage({ src, alt, width, height }) {
  const [cachedSrc, setCachedSrc] = useState(src)

  useEffect(() => {
    const loadImage = async () => {
      const cached = await getCachedImage(src)
      setCachedSrc(cached)
    }

    loadImage()
  }, [src])

  return (
    <Image
      src={cachedSrc}
      alt={alt}
      width={width}
      height={height}
    />
  )
}
```

## Image Optimization for Different Use Cases

### 1. E-commerce Product Images

Optimization strategies for product images:

```javascript
// components/ProductImage.js
import Image from 'next/image'

export default function ProductImage({
  product,
  thumbnailSize = 300,
  detailSize = 800
}) {
  return (
    <div className="product-image-container">
      <div className="product-thumbnails">
        {product.images.map((img, index) => (
          <button
            key={index}
            className={`thumbnail ${index === 0 ? 'active' : ''}`}
          >
            <Image
              src={img.thumbnail}
              alt={`Product ${index + 1}`}
              width={thumbnailSize}
              height={thumbnailSize}
              placeholder="blur"
              blurDataURL={img.blurDataURL}
              quality={75}
            />
          </button>
        ))}
      </div>

      <div className="main-product-image">
        <Image
          src={product.mainImage}
          alt={product.name}
          width={detailSize}
          height={detailSize}
          priority
          quality={85}
          placeholder="blur"
          blurDataURL={product.mainBlurDataURL}
        />
      </div>
    </div>
  )
}
```

### 2. Blog Article Images

Optimization for blog content images:

```javascript
// components/BlogImage.js
import Image from 'next/image'

export default function BlogImage({
  src,
  alt,
  caption,
  width,
  height,
  isFullWidth = false
}) {
  return (
    <figure className={`blog-image ${isFullWidth ? 'full-width' : ''}`}>
      <div style={{ position: 'relative', width: '100%' }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={isFullWidth
            ? '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px'
            : '(max-width: 768px) 100vw, (max-width: 1200px) 800px, 800px'
          }
          quality={80}
          placeholder="blur"
          blurDataURL={calculateBlurDataURL(src)}
        />
      </div>
      {caption && (
        <figcaption>{caption}</figcaption>
      )}
    </figure>
  )
}

function calculateBlurDataURL(src) {
  // Implementation for calculating blur data URL
  // Could use a service or pre-generated data
  return 'data:image/svg+xml;base64,...'
}
```

### 3. Avatar and Profile Images

Optimization for user avatars:

```javascript
// components/Avatar.js
import Image from 'next/image'

export default function Avatar({
  src,
  alt,
  size = 40,
  isOnline = false,
  hasBorder = false
}) {
  const sizeClasses = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96
  }

  const actualSize = typeof size === 'string' ? sizeClasses[size] : size

  return (
    <div className={`avatar-container ${hasBorder ? 'bordered' : ''}`}>
      <div
        style={{
          position: 'relative',
          width: actualSize,
          height: actualSize,
          borderRadius: '50%',
          overflow: 'hidden'
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={actualSize}
          height={actualSize}
          className="avatar-image"
          placeholder="blur"
          blurDataURL={generateAvatarBlurData(actualSize)}
          quality={90}
        />
      </div>
      {isOnline && (
        <div className="online-status"></div>
      )}
    </div>
  )
}

function generateAvatarBlurData(size) {
  // Generate appropriate blur data based on avatar size
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#e0e0e0"/>
    </svg>
  `)}`
}
```

## Image Performance Monitoring

### 1. Performance Metrics Collection

Monitor image loading performance:

```javascript
// lib/image-metrics.js
export class ImageMetrics {
  constructor() {
    this.metrics = new Map()
  }

  recordImageLoad(imageUrl, loadTime, fileSize) {
    const entry = this.metrics.get(imageUrl) || {
      loadCount: 0,
      totalLoadTime: 0,
      totalFileSize: 0,
      samples: []
    }

    entry.loadCount++
    entry.totalLoadTime += loadTime
    entry.totalFileSize += fileSize
    entry.samples.push({ loadTime, fileSize, timestamp: Date.now() })

    // Keep only last 100 samples
    if (entry.samples.length > 100) {
      entry.samples.shift()
    }

    this.metrics.set(imageUrl, entry)
  }

  getAverageLoadTime(imageUrl) {
    const entry = this.metrics.get(imageUrl)
    if (!entry || entry.loadCount === 0) return 0
    return entry.totalLoadTime / entry.loadCount
  }

  getPerformanceReport() {
    const report = []
    for (const [url, data] of this.metrics) {
      report.push({
        url,
        averageLoadTime: this.getAverageLoadTime(url),
        averageFileSize: data.totalFileSize / data.loadCount,
        loadCount: data.loadCount
      })
    }
    return report
  }
}

const imageMetrics = new ImageMetrics()
export { imageMetrics }
```

### 2. Image Performance Component

Component that monitors and reports image performance:

```javascript
// components/MonImageLoad.js
import { useEffect } from 'react'
import { imageMetrics } from '@/lib/image-metrics'

export default function OnImageLoad({
  src,
  onLoad,
  onError,
  children
}) {
  useEffect(() => {
    const startTime = performance.now()
    const img = new Image()

    img.onload = () => {
      const loadTime = performance.now() - startTime
      imageMetrics.recordImageLoad(src, loadTime, img.naturalWidth * img.naturalHeight)
      onLoad?.(img)
    }

    img.onerror = (error) => {
      onError?.(error)
    }

    img.src = src

    return () => {
      // Cleanup if needed
    }
  }, [src, onLoad, onError])

  return children
}
```

## Image Optimization Best Practices

### 1. Preload Critical Images

Preload images that are critical for user experience:

```javascript
// app/head.js
export default function Head() {
  return (
    <>
      <link
        rel="preload"
        href="/hero-image.webp"
        as="image"
        type="image/webp"
      />
      <link
        rel="preload"
        href="/hero-image.jpg"
        as="image"
        type="image/jpeg"
      />
    </>
  )
}
```

### 2. Image Lazy Loading Configuration

Configure lazy loading thresholds:

```javascript
// components/CustomImage.js
import Image from 'next/image'

export default function CustomImage({
  src,
  alt,
  width,
  height,
  lazyThreshold = 0.5
}) {
  return (
    <div
      style={{ position: 'relative' }}
      data-observer-threshold={lazyThreshold}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        style={{
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
        onLoadingComplete={(img) => {
          img.style.opacity = 1
        }}
      />
    </div>
  )
}
```

These advanced image optimization techniques will help you create high-performance Next.js applications with excellent user experience and optimal Core Web Vitals scores.
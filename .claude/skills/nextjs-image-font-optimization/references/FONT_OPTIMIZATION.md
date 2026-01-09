# Next.js Font Optimization Guide

## Overview

Next.js provides a powerful font optimization system through the `next/font` module. This guide covers advanced techniques and best practices for optimizing fonts in your Next.js applications.

## Font Loading Strategies

### 1. Google Fonts Optimization

Advanced Google Fonts usage with custom configurations:

```javascript
// app/layout.js
import { Inter, Roboto_Mono, Playfair_Display } from 'next/font/google'

// Default configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during font load
  variable: '--font-inter', // CSS variable name
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic']
})

// Custom configuration with specific weights
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
  weight: ['400', '700'], // Only load specific weights
  preload: true // Preload font files (default: true)
})

// Variable font configuration
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: 'variable', // For variable fonts
  axes: ['slnt'] // For variable axes
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${robotoMono.variable} ${playfairDisplay.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### 2. Local Font Optimization

Loading custom local fonts with advanced configuration:

```javascript
// app/layout.js
import localFont from 'next/font/local'

// Load multiple font faces
const headingFont = localFont({
  src: [
    {
      path: './fonts/Heading-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Heading-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Heading-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
})

// Load italic variations
const bodyFontItalic = localFont({
  src: [
    {
      path: './fonts/Body-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Body-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-body-italic',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html className={`${headingFont.variable} ${bodyFontItalic.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
```

## Advanced Font Configuration

### 1. Font Subsetting and Optimization

Optimize fonts by including only necessary subsets:

```javascript
// lib/fonts.js
import { Inter, Roboto, Open_Sans } from 'next/font/google'

// Optimized for specific languages
export const interLatin = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const interCyrillic = Inter({
  subsets: ['cyrillic'],
  display: 'swap',
})

export const interArabic = Inter({
  subsets: ['arabic'],
  display: 'swap',
})

// Combined subset optimization
export const interMulti = Inter({
  subsets: [
    'latin',
    'cyrillic',
    'arabic',
    'chinese-simplified',
    'japanese',
    'korean'
  ],
  display: 'swap',
})

// Weight-specific optimization
export const openSansLight = Open_Sans({
  weight: ['300', '400'],
  subsets: ['latin'],
  display: 'swap',
})

export const openSansBold = Open_Sans({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})
```

### 2. Dynamic Font Loading

Load fonts dynamically based on user preferences:

```javascript
// components/DynamicFontLoader.js
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function DynamicFontLoader({ children }) {
  const [fontLoaded, setFontLoaded] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    // Load different fonts based on theme
    const fontUrl = theme === 'dark'
      ? '/fonts/dark-theme-font.woff2'
      : '/fonts/light-theme-font.woff2'

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = fontUrl

    link.onload = () => {
      document.documentElement.classList.add('fonts-loaded')
      setFontLoaded(true)
    }

    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [theme])

  return (
    <div className={fontLoaded ? 'fonts-loaded' : ''}>
      {children}
    </div>
  )
}
```

## Font Performance Optimization

### 1. Font Display Strategies

Implement different font display strategies for various scenarios:

```css
/* styles/globals.css */
/* For headings - prioritize text visibility */
.heading-font {
  font-display: swap;
}

/* For body text - balance between visibility and layout stability */
.body-font {
  font-display: optional;
}

/* For logos - prioritize layout stability */
.logo-font {
  font-display: block;
}

/* Custom font loading states */
.fonts-loading {
  /* Apply fallback fonts */
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.fonts-loaded {
  /* Apply custom fonts */
  font-family: var(--font-primary);
}
```

### 2. Font Loading Performance

Monitor and optimize font loading performance:

```javascript
// lib/font-performance.js
export class FontPerformance {
  constructor() {
    this.metrics = {}
  }

  measureFont(fontFamily) {
    const start = performance.now()

    // Create test elements to measure font loading
    const testElement = document.createElement('div')
    testElement.style.fontFamily = fontFamily
    testElement.style.position = 'absolute'
    testElement.style.visibility = 'hidden'
    testElement.textContent = 'Test'
    document.body.appendChild(testElement)

    // Measure text dimensions
    const dimensions = testElement.getBoundingClientRect()
    const loadTime = performance.now() - start

    document.body.removeChild(testElement)

    this.metrics[fontFamily] = {
      loadTime,
      dimensions,
      timestamp: Date.now()
    }

    return this.metrics[fontFamily]
  }

  getFontReport() {
    return {
      fonts: this.metrics,
      averageLoadTime: Object.values(this.metrics).reduce((sum, font) => sum + font.loadTime, 0) / Object.keys(this.metrics).length
    }
  }
}

export const fontPerformance = new FontPerformance()
```

## Advanced Font Techniques

### 1. Font Pairing Optimization

Optimize font pairings for readability and aesthetics:

```javascript
// lib/font-pairings.js
import {
  Inter,
  Playfair_Display,
  Roboto_Mono,
  Source_Code_Pro
} from 'next/font/google'

// Professional font pairing
export const professionalPairing = {
  heading: Playfair_Display({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
    weight: ['400', '700']
  }),
  body: Inter({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
    weight: ['300', '400', '500']
  }),
  code: Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-code',
    display: 'swap',
    weight: ['400', '500']
  })
}

// Technical documentation pairing
export const technicalPairing = {
  heading: Inter({
    subsets: ['latin'],
    variable: '--font-tech-heading',
    display: 'swap',
    weight: ['600', '700']
  }),
  body: Inter({
    subsets: ['latin'],
    variable: '--font-tech-body',
    display: 'swap',
    weight: ['400', '500']
  }),
  code: Source_Code_Pro({
    subsets: ['latin'],
    variable: '--font-tech-code',
    display: 'swap',
    weight: ['400', '500', '600']
  })
}
```

### 2. Responsive Font Sizing

Implement responsive font sizing with CSS variables:

```javascript
// app/layout.js
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

// styles/typography.css
export const typographyStyles = `
  :root {
    /* Responsive font sizes */
    --font-size-xs: clamp(0.75rem, 0.725rem + 0.125vw, 0.8rem);
    --font-size-sm: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);
    --font-size-base: clamp(1rem, 0.925rem + 0.375vw, 1.125rem);
    --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
    --font-size-xl: clamp(1.25rem, 1.075rem + 0.875vw, 1.5rem);
    --font-size-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
    --font-size-3xl: clamp(1.875rem, 1.525rem + 1.75vw, 2.5rem);
  }

  html {
    font-size: var(--font-size-base);
  }

  h1 {
    font-size: var(--font-size-3xl);
    font-weight: 700;
  }

  h2 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  body {
    font-size: var(--font-size-base);
  }

  .font-inter {
    font-family: var(--font-inter, system-ui, sans-serif);
  }
`
```

## Font Accessibility

### 1. Accessible Font Configuration

Ensure fonts are accessible to all users:

```javascript
// lib/accessibility-fonts.js
import { Inter, Roboto } from 'next/font/google'

// Accessible font with good contrast ratios
export const accessibleBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  // Ensure good readability
  style: ['normal'],
  // Include symbols for accessibility
  subsets: ['latin', 'latin-ext', 'symbols', 'latin-supplement']
})

// Dyslexia-friendly font option
export const dyslexiaFriendly = Roboto({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  // Roboto is considered dyslexia-friendly
  style: ['normal']
})
```

### 2. System Font Fallbacks

Implement proper system font fallbacks:

```javascript
// styles/fallbacks.css
.font-fallback {
  /* Sans-serif stack */
  font-family:
    var(--font-primary, ''),
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;

  /* Serif stack */
  --font-serif-stack:
    var(--font-serif, ''),
    'Georgia',
    'Times New Roman',
    Times,
    serif;

  /* Monospace stack */
  --font-mono-stack:
    var(--font-mono, ''),
    'SFMono-Regular',
    Consolas,
    'Roboto Mono',
    'Droid Sans Mono',
    'Liberation Mono',
    Menlo,
    Monaco,
    'Courier New',
    monospace;
}
```

## Font Performance Monitoring

### 1. Font Loading Analytics

Track font loading performance and user experience:

```javascript
// hooks/useFontMetrics.js
import { useEffect, useState } from 'react'

export function useFontMetrics() {
  const [fontMetrics, setFontMetrics] = useState({
    loading: true,
    fonts: [],
    performance: {}
  })

  useEffect(() => {
    const checkFontLoading = async () => {
      if ('fonts' in document) {
        const fontFaces = document.fonts

        // Check if fonts are loaded
        const loadedFonts = []
        for (const fontFace of fontFaces) {
          try {
            await fontFace.loaded
            loadedFonts.push({
              family: fontFace.family,
              style: fontFace.style,
              weight: fontFace.weight,
              loaded: true
            })
          } catch (error) {
            loadedFonts.push({
              family: fontFace.family,
              style: fontFace.style,
              weight: fontFace.weight,
              loaded: false,
              error: error.message
            })
          }
        }

        setFontMetrics({
          loading: false,
          fonts: loadedFonts,
          performance: {
            totalFonts: fontFaces.size,
            loadedFonts: loadedFonts.filter(f => f.loaded).length,
            loadTime: performance.now()
          }
        })
      } else {
        // Fallback for browsers without Font Loading API
        setFontMetrics({
          loading: false,
          fonts: [],
          performance: { fallback: true }
        })
      }
    }

    checkFontLoading()
  }, [])

  return fontMetrics
}
```

### 2. Font Performance Component

A component that provides font performance insights:

```javascript
// components/FontPerformanceMonitor.js
'use client'

import { useFontMetrics } from '@/hooks/useFontMetrics'

export default function FontPerformanceMonitor({ children }) {
  const { loading, fonts, performance } = useFontMetrics()

  if (loading) {
    return (
      <div className="font-loading-state">
        <p>Loading fonts...</p>
      </div>
    )
  }

  return (
    <div
      className="font-performance-container"
      data-font-status={performance.loadedFonts === performance.totalFonts ? 'complete' : 'partial'}
    >
      {children}

      {/* Hidden performance metrics for analytics */}
      <div
        className="sr-only"
        aria-hidden="true"
        data-font-metrics={JSON.stringify(performance)}
      />
    </div>
  )
}
```

These advanced font optimization techniques will help you create high-performance Next.js applications with excellent typography, optimal loading times, and great user experience across all devices and network conditions.
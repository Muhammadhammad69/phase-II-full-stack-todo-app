---
name: nextjs-image-font-optimization
description: Optimize images and fonts for better performance and Core Web Vitals using Next.js built-in optimizations. Learn to use the Next.js Image component for automatic optimization and next/font for efficient font loading. Use when Claude needs to implement image optimization, font optimization, improve Core Web Vitals scores, enhance page speed, or optimize for better user experience in Next.js applications.
---

# Image and Font Optimization - Performance Boost

## Overview

Next.js provides built-in optimization for images and fonts that significantly improve performance and Core Web Vitals scores. This skill covers how to use the Next.js Image component for automatic image optimization and the next/font module for efficient font loading to achieve better page speed and user experience.

## Image Optimization Benefits

Next.js Image component provides several key benefits:

- **Automatic format conversion** (WebP, AVIF)
- **Responsive images** for different screen sizes
- **Lazy loading** by default
- **Prevents layout shift** with width/height attributes
- **Bandwidth reduction** of 30-40%
- **Better performance scores**
- **No manual optimization** needed

## Next.js Image Component

The Image component replaces the HTML `<img>` tag and provides automatic optimization:

```javascript
import Image from 'next/image'

export default function Profile() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile picture"
      width={200}
      height={200}
    />
  )
}
```

### Image Component Props

- `src`: Image source (local or remote)
- `alt`: Alternative text
- `width`: Image width in pixels
- `height`: Image height in pixels
- `priority`: Load early (LCP images)
- `quality`: Output quality (1-100, default 75)
- `fill`: Fill container (alternative to width/height)
- `sizes`: Responsive sizes
- `placeholder`: Show while loading

```javascript
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  quality={80}
  priority={true}
/>
```

## Responsive Images

Use the `fill` prop for responsive images that fill their container:

```javascript
// Container must be position: relative
<div style={{ position: 'relative', width: '100%', height: 300 }}>
  <Image
    src="/hero.jpg"
    alt="Hero"
    fill
    sizes="(max-width: 768px) 100vw,
           (max-width: 1200px) 50vw,
           33vw"
    style={{ objectFit: 'cover' }}
  />
</div>
```

## Priority Images (LCP)

Use the `priority` prop for above-the-fold images that are critical for Largest Contentful Paint:

```javascript
// Hero image - use priority
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>

// Below-fold image - no priority
<Image
  src="/feature.jpg"
  alt="Feature"
  width={400}
  height={400}
/>
```

## Image Formats and Optimization

Next.js automatically handles format conversion:

- **AVIF**: Best compression (newest)
- **WebP**: Good compression (modern)
- **JPEG**: Compatibility (traditional)
- **PNG**: Transparency (larger)
- **SVG**: Vectors (scalable)

Next.js automatically:
- Converts formats based on browser support
- Serves AVIF to modern browsers
- Falls back to WebP
- Finally JPEG for compatibility

## Quality Setting

Adjust the quality property to balance file size and image quality:

```javascript
// High quality (larger file)
<Image
  src="/photo.jpg"
  alt="Photo"
  width={400}
  height={400}
  quality={95}
/>

// Lower quality (smaller file)
<Image
  src="/thumbnail.jpg"
  alt="Thumbnail"
  width={100}
  height={100}
  quality={50}
/>
```

## Placeholder Images (Blur-up)

Use placeholders to improve perceived performance:

```javascript
// Static blur
<Image
  src="/image.jpg"
  alt="Image"
  width={400}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Empty placeholder
<Image
  src="/image.jpg"
  alt="Image"
  width={400}
  height={400}
  placeholder="empty"
/>
```

## Remote Images

Configure allowed domains for security:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
}

// Use remote image
<Image
  src="https://cdn.example.com/image.jpg"
  alt="Remote"
  width={400}
  height={400}
/>
```

## Font Optimization with next/font

### Google Fonts

Load Google Fonts efficiently with automatic optimization:

```javascript
// app/layout.js
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.className} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Font Subsetting

Include only needed characters to reduce file size:

```javascript
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
})

// Only specific weights
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700']
})
```

### Custom Fonts

Load local font files:

```javascript
// app/layout.js
import localFont from 'next/font/local'

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
})

export default function RootLayout({ children }) {
  return (
    <html className={myFont.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Font Variable CSS

Use CSS variables for flexible font application:

```javascript
// app/layout.js
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  variable: '--font-playfair'
})

export default function RootLayout({ children }) {
  return (
    <html className={playfair.variable}>
      <body>{children}</body>
    </html>
  )
}

// styles/globals.css
body {
  font-family: var(--font-playfair, serif);
}

h1 {
  font-family: var(--font-playfair, serif);
}
```

## Core Web Vitals Impact

### Largest Contentful Paint (LCP)
- Image optimization helps reduce LCP time
- Use `priority` prop for LCP images
- Target: < 2.5 seconds

### Cumulative Layout Shift (CLS)
- Image width/height prevents layout shift
- Font optimization prevents FOIT/FOUT
- Target: < 0.1

### First Input Delay (FID)
- Code splitting helps FID
- Not directly impacted by image/font optimization
- Target: < 100ms

```javascript
// Prevent layout shift - always set width/height
<Image
  src="/image.jpg"
  alt="Image"
  width={400}
  height={400}
/>

// Or use fill with container
<div style={{ position: 'relative', width: 400, height: 400 }}>
  <Image
    src="/image.jpg"
    alt="Image"
    fill
  />
</div>
```

## Code Examples

### Example 1: Hero Image
```javascript
import Image from 'next/image'

export default function Hero() {
  return (
    <section>
      <Image
        src="/hero.jpg"
        alt="Hero section"
        width={1200}
        height={600}
        priority
        quality={85}
      />
    </section>
  )
}
```

### Example 2: Product Grid
```javascript
import Image from 'next/image'

export default function ProductGrid({ products }) {
  return (
    <div className="grid">
      {products.map(product => (
        <div key={product.id} className="product">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            quality={75}
            placeholder="blur"
            blurDataURL={product.blurDataUrl}
          />
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  )
}
```

### Example 3: Responsive Hero
```javascript
import Image from 'next/image'

export default function ResponsiveHero() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 400 }}>
      <Image
        src="/hero-large.jpg"
        alt="Hero"
        fill
        priority
        sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 80vw,
               100vw"
        style={{ objectFit: 'cover' }}
        quality={80}
      />
    </div>
  )
}
```

### Example 4: Typography with Fonts
```javascript
import { Inter, Merriweather } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif'
})

export default function Layout({ children }) {
  return (
    <html className={`${inter.className} ${merriweather.variable}`}>
      <body>
        <header style={{ fontFamily: 'var(--font-serif)' }}>
          <h1>My Blog</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### Example 5: Avatar with Placeholder
```javascript
import Image from 'next/image'

export default function Avatar({ user }) {
  return (
    <Image
      src={user.avatar}
      alt={user.name}
      width={64}
      height={64}
      className="rounded-full"
      placeholder="blur"
      blurDataURL={user.avatarBlur}
      quality={80}
    />
  )
}
```

## Real-World Scenarios

### 1. E-commerce Site
- Hero image with priority
- Product grid with blur placeholders
- Responsive product photos
- Quality: 75-85 for photos

### 2. Blog
- Featured image with priority
- Inline article images
- Author avatars with blur
- Quality: 75-80

### 3. Portfolio
- Large project images
- Responsive layouts
- Optimized for mobile
- Blur placeholders

### 4. SaaS Dashboard
- Company logo (priority)
- User avatars
- Data visualization images
- Icons (use SVG)

## Common Mistakes

1. **Not setting width/height**
   - Causes layout shift (bad CLS)
   - Always required
   - Exception: fill prop

2. **Using `<img>` instead of Image**
   - Misses all optimizations
   - Manual srcset needed
   - Always use Image component

3. **Not using priority wisely**
   - Priority for LCP images only
   - Max 1-2 priority images
   - Too many defeats purpose

4. **Remote images without config**
   - Won't work
   - Must configure remotePatterns
   - Security measure

5. **Not subsetting fonts**
   - Large font files
   - Slow loading
   - Always subset

6. **Using too many fonts**
   - Increases page weight
   - Slows down loading
   - Keep to 2-3 fonts max

## Best Practices

1. Always use Image component
2. Set width and height
3. Use priority for above-fold
4. Set quality appropriately
5. Use responsive sizes
6. Add blur placeholders
7. Subset fonts
8. Use Google Fonts when possible
9. Monitor Lighthouse score
10. Test on slow networks

## Quick Reference

### Image Component:
```javascript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={400}
  quality={75}
  priority
  placeholder="blur"
/>
```

### Responsive Image:
```javascript
<div style={{ position: 'relative', width: '100%', height: 400 }}>
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

### Google Fonts:
```javascript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

<html className={inter.className}>
```

### Font Variable:
```javascript
const playfair = Playfair_Display({
  variable: '--font-serif'
})

<h1 style={{ fontFamily: 'var(--font-serif)' }}>Title</h1>
```

### Remote Images (next.config.js):
```javascript
images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: 'example.com'
  }]
}
```

### Image Formats:
- AVIF: Best (modern)
- WebP: Good (modern)
- JPEG: Compatibility
- PNG: Transparency

### Core Web Vitals Targets:
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

## References

For detailed information on specific topics, see the reference files:
- [IMAGE_OPTIMIZATION.md](references/IMAGE_OPTIMIZATION.md) - Advanced image optimization techniques
- [FONT_OPTIMIZATION.md](references/FONT_OPTIMIZATION.md) - Comprehensive font optimization guide
- [CORE_WEB_VITALS.md](references/CORE_WEB_VITALS.md) - Core Web Vitals improvement strategies
- [PERFORMANCE_METRICS.md](references/PERFORMANCE_METRICS.md) - Performance measurement and optimization
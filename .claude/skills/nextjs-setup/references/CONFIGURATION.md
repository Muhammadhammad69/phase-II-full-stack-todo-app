# Next.js Configuration Guide

## next.config.js Overview

The `next.config.js` file is a Node.js module that exports a configuration object. This file is run by the Next.js server and build phases but is not included in the browser build.

### Basic Configuration Structure

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
}

module.exports = nextConfig
```

## Common Configuration Options

### Images Configuration

Configure image optimization and security settings:

```javascript
const nextConfig = {
  images: {
    // Allow images from specific hosts
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

    // Configure image formats
    formats: ['image/webp'],

    // Configure image sizes for optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // For static exports, disable optimization
    unoptimized: true,
  },
}
```

### Environment Variables

Define environment variables that will be available to the client:

```javascript
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
  },
}
```

**Note:** Only variables added to `env` will be available on the client side. Server-side environment variables are available directly via `process.env`.

### Output Configuration

Configure the build output format:

```javascript
const nextConfig = {
  // For static exports (no server)
  output: 'export',

  // For server-side deployments
  output: 'server', // default

  // For standalone server deployments
  output: 'standalone', // creates a standalone build
}
```

### Base Path Configuration

Deploy your application under a sub-path:

```javascript
const nextConfig = {
  basePath: '/docs', // App will be served from /docs instead of /
}
```

### Asset Prefix

Configure where static assets are served from (useful with CDNs):

```javascript
const nextConfig = {
  assetPrefix: 'https://cdn.example.com', // Assets will be loaded from CDN
}
```

### React Strict Mode

Enable React Strict Mode for development:

```javascript
const nextConfig = {
  reactStrictMode: true, // Recommended for new projects
}
```

### TypeScript and JavaScript Configuration

Configure TypeScript and JavaScript compilation:

```javascript
const nextConfig = {
  typescript: {
    // Disable type checking during production builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
}
```

## Advanced Configuration Options

### Rewrites

Rewrite URLs to different paths:

```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog/:slug',
        destination: '/news/:slug', // Matched parameters can be used
      },
      {
        source: '/get/:path*',
        destination: 'https://example.com/:path*', // Wildcard parameter
      },
      {
        source: '/old-about/:path*',
        destination: '/about', // Different route with wildcard
      },
    ]
  },
}
```

### Redirects

Redirect URLs to different paths:

```javascript
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/old-blog/:path*',
        destination: '/blog/:path*', // Wildcard parameter
        permanent: true, // 308 redirect
      },
      {
        source: '/v1/:path*',
        destination: '/api/:path*', // Another wildcard redirect
        permanent: false, // 307 redirect
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}
```

### Headers

Add custom headers to responses:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
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
      {
        // Add CORS headers to API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}
```

### Middleware Configuration

Configure middleware behavior:

```javascript
const nextConfig = {
  experimental: {
    // Configure middleware matcher
    middlewarePrefetch: 'flexible', // Enable middleware prefetching

    // Other experimental options
    serverComponentsExternalPackages: [
      'package-name', // Allow server components to import external packages
    ],
  },
}
```

### Compiler Configuration

Configure the Next.js compiler:

```javascript
const nextConfig = {
  compiler: {
    // Enable emotion CSS-in-JS library
    emotion: true,

    // Enable styled-components
    styledComponents: {
      ssr: true,
      displayName: true,
      meaninglessFileExtensions: ['style.js'],
    },

    // Configure relay GraphQL
    relay: {
      src: './src',
      artifactDirectory: './src/__generated__',
    },
  },
}
```

## Production-Specific Configuration

### Standalone Output

For deploying as a standalone server:

```javascript
const nextConfig = {
  output: 'standalone',

  experimental: {
    // Optimize for standalone output
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
}
```

### Export Configuration (Static Sites)

For static site generation:

```javascript
const nextConfig = {
  output: 'export',

  // Disable features that require a server
  images: {
    unoptimized: true, // Optimize images during build instead of serving
  },

  // Configure trailing slashes
  trailingSlash: true, // Add/remove trailing slashes
}
```

## Complete Configuration Example

Here's a comprehensive `next.config.js` file with common configurations:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Configure images
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
    formats: ['image/webp'],
  },

  // Configure base path if deploying under subdirectory
  // basePath: '/my-app',

  // Configure asset prefix for CDN usage
  // assetPrefix: 'https://cdn.example.com',

  // Enable experimental features
  experimental: {
    // Enable App Router (enabled by default)
    appDir: true,
  },

  // Configure redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ]
  },

  // Configure rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ]
  },

  // Configure custom headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Environment-Specific Configuration

You can configure different settings based on the environment:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Default configuration
  reactStrictMode: true,

  // Environment-specific configuration
  ...(process.env.NODE_ENV === 'production' && {
    // Production-specific settings
    output: 'export', // Static export in production
    images: {
      unoptimized: true,
    },
  }),

  ...(process.env.ANALYZE === 'true' && {
    // Only include when ANALYZE=true
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        }
      }
      return config
    },
  }),
}

module.exports = nextConfig
```

## Troubleshooting Configuration Issues

### Common Issues and Solutions

1. **TypeScript errors in configuration:**
   ```javascript
   // Add JSDoc type annotation
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // config here
   }
   ```

2. **ESLint warnings:**
   ```javascript
   // Add to .eslintrc.js
   module.exports = {
     extends: ['next/core-web-vitals'],
   }
   ```

3. **Webpack configuration conflicts:**
   ```javascript
   const nextConfig = {
     webpack: (config, { isServer, webpack }) => {
       // Only modify client-side config
       if (!isServer) {
         // Add client-specific webpack config
       }
       return config
     },
   }
   ```

Remember that `next.config.js` is a Node.js module and cannot contain client-side code. The configuration is used during the build process and server runtime, but is not included in the client-side bundle.
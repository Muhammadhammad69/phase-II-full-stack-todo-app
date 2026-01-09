# Next.js Environment Variables Guide

## Overview

Next.js has built-in support for loading environment variables from `.env*` files into `process.env`. When you define variables in a `.env` file, they are automatically loaded into the Node.js environment, making them accessible throughout your application.

## Environment Variable Files

### File Types and Loading Priority

Next.js loads environment variables from the following files, in order of priority (highest to lowest):

1. `.env.local` - Local overrides (not committed to git)
2. `.env.[mode].local` - Local overrides specific to a mode (development, production, etc.)
3. `.env.[mode]` - Mode-specific variables
4. `.env` - Shared variables (committed to git)

### Available File Names

- `.env` - Loaded in all environments
- `.env.local` - Loaded in all environments, git ignored
- `.env.development`, `.env.test`, `.env.production` - Mode-specific files
- `.env.development.local`, `.env.test.local`, `.env.production.local` - Local overrides for specific modes

## Public Environment Variables

### NEXT_PUBLIC_ Prefix

To expose environment variables to the browser (in client-side code), you must prefix them with `NEXT_PUBLIC_`.

```env
# .env.local
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword

# This will be available in both server and client
NEXT_PUBLIC_ANALYTICS_ID=abc123
NEXT_PUBLIC_SITE_NAME=My Site
```

### Accessing Public Variables

```javascript
// This works in both server and client components
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

// This component can run on both server and client
export default function Header() {
  return <h1>{process.env.NEXT_PUBLIC_SITE_NAME}</h1>;
}
```

## Server-Side Environment Variables

### Server-Only Variables

Variables without the `NEXT_PUBLIC_` prefix are only available on the server and will be undefined in the browser.

```javascript
// app/api/users/route.js
export async function GET() {
  // These variables are only available on the server
  const dbHost = process.env.DB_HOST;      // ✓ Available
  const dbUser = process.env.DB_USER;      // ✓ Available
  const dbPass = process.env.DB_PASS;      // ✓ Available

  // This would be undefined on the server
  const secret = process.env.SECRET_VAR;   // ✓ Available if defined

  return Response.json({ message: 'Success' });
}
```

## Loading Environment Variables

### Automatic Loading

Next.js automatically loads environment variables from `.env` files:

```env
# .env
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_API_URL=https://api.example.com
NODE_ENV=development
PORT=3000
```

### Accessing Variables

```javascript
// Server-side (API routes, server components, getServerSideProps, etc.)
const dbHost = process.env.DB_HOST;

// Client-side (client components, browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Environment Variable Usage Examples

### 1. Database Configuration

```env
# .env.local (never commit to git)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecretjwtkey
```

```javascript
// lib/database.js
export const dbConfig = {
  host: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
};
```

### 2. API Keys and Secrets

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG....
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

```javascript
// lib/payment.js
export async function processPayment(amount) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // Process payment...
}
```

### 3. Public Configuration

```env
# .env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-...
NEXT_PUBLIC_SITE_NAME="My Awesome Site"
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

```javascript
// components/PaymentForm.js
'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentForm() {
  // Use stripePromise...
}
```

## Using Environment Variables in Different Contexts

### 1. Server Components

```javascript
// app/page.js (server component)
export default async function Page() {
  // All environment variables available
  const apiUrl = process.env.API_URL;
  const dbUrl = process.env.DATABASE_URL;
  const secret = process.env.JWT_SECRET;

  // Fetch data using environment variables
  const response = await fetch(`${apiUrl}/data`);

  return <div>Server component with env vars</div>;
}
```

### 2. Client Components

```javascript
// components/ClientComponent.js
'use client';

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Only NEXT_PUBLIC_ variables available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${apiUrl}/client-data`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>Client component: {data?.message}</div>;
}
```

### 3. API Routes

```javascript
// app/api/users/route.js
export async function GET(request) {
  // All environment variables available
  const dbUrl = process.env.DATABASE_URL;
  const adminKey = process.env.ADMIN_API_KEY;

  // Verify admin access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${adminKey}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch and return user data
  const users = await fetchUsersFromDB();
  return Response.json(users);
}
```

### 4. Build-Time Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Only these will be available in client-side code
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
  },

  // You can also use environment variables in configuration
  async redirects() {
    if (process.env.REDIRECT_ENABLED === 'true') {
      return [
        {
          source: '/old-page',
          destination: process.env.NEW_PAGE_URL || '/new-page',
          permanent: true,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
```

## Security Best Practices

### 1. Never Commit Secrets to Git

Always add sensitive environment files to `.gitignore`:

```gitignore
# Environment variables
.env.local
.env.*.local
.env.production
.env.staging
```

### 2. Use .env.example for Documentation

Create a `.env.example` file to document required variables:

```env
# .env.example
# Copy this file to .env.local and fill in the values

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# API Keys
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...

# Public variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_NAME="My Site"
```

### 3. Validate Required Environment Variables

```javascript
// lib/env.js
export function getEnvVar(name, defaultValue = null) {
  const value = process.env[name];

  if (!value && defaultValue === null) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }

  return value || defaultValue;
}

// Usage
const dbUrl = getEnvVar('DATABASE_URL');
const siteName = getEnvVar('NEXT_PUBLIC_SITE_NAME', 'Default Site');
```

### 4. Environment-Specific Variables

Different environments often need different configurations:

```env
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/devdb
```

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_SITE_URL=https://myapp.com
DATABASE_URL=postgresql://produser:prodpass@prodhost:5432/proddb
```

## Testing Environment Variables

### 1. Mocking in Tests

```javascript
// __tests__/api.test.js
describe('API Routes', () => {
  beforeEach(() => {
    // Set up environment variables for testing
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
  });

  test('should connect to test database', async () => {
    // Test code here
  });
});
```

### 2. Validation During Development

```javascript
// lib/config.js
export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_SITE_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
}

// Validate at startup
if (typeof window === 'undefined') { // Server-side only
  validateEnvironment();
}
```

## Common Pitfalls and Solutions

### 1. Variables Not Loading

**Problem:** Environment variables are undefined.

**Solution:** Ensure the `.env` file is in the project root and variables are properly formatted:

```env
# Correct
NEXT_PUBLIC_API_URL=https://api.example.com
PORT=3000

# Incorrect (no spaces around =)
NEXT_PUBLIC_API_URL = https://api.example.com
```

### 2. Client-Side Access to Server Variables

**Problem:** Trying to access server-only variables in client components.

**Solution:** Use only `NEXT_PUBLIC_` prefixed variables in client code:

```javascript
// ❌ Wrong
const secret = process.env.JWT_SECRET; // Will be undefined in browser

// ✅ Correct
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Available in browser
```

### 3. Build-Time vs Runtime Variables

**Problem:** Need different values during build vs runtime.

**Solution:** Use build-time environment variables in `next.config.js`:

```javascript
// next.config.js
const nextConfig = {
  env: {
    BUILD_TIME_VAR: process.env.BUILD_TIME_VAR || 'default',
  },
};

// For runtime variables, pass them through server components to client
// app/page.js
export default async function Page() {
  const runtimeVar = process.env.RUNTIME_VAR; // Server-only

  return <ClientComponent runtimeVar={runtimeVar} />;
}
```

## Best Practices Summary

1. **Use `NEXT_PUBLIC_` prefix** for variables that need to be accessible in the browser
2. **Never commit secrets** to version control
3. **Document required variables** in `.env.example`
4. **Validate required variables** at startup
5. **Use different files** for different environments
6. **Keep sensitive data** on the server side
7. **Test environment configurations** in your CI/CD pipeline
8. **Use consistent naming** for environment variables

Following these practices will help you securely and effectively use environment variables in your Next.js applications.
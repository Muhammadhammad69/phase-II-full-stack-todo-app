---
name: "Deployment and Production - Going Live"
description: "Deploy Next.js applications to production. Learn about Vercel, Docker, and self-hosting options. Use when Claude needs to deploy Next.js applications to production environments, configure deployment settings, set up CI/CD pipelines, or optimize for production performance."
---

# Deployment and Production - Going Live

Difficulty: Intermediate
Duration: 35 minutes
Prerequisites: ["Setting Up Next.js"]
Tags: ["nextjs", "deployment", "production", "vercel", "optimization"]

## Description
Deploy Next.js applications to production. Learn about Vercel, Docker, and self-hosting options.

## Learning Objectives
- Deploy to Vercel (recommended)
- Deploy with Docker
- Self-host Next.js
- Configure environment variables
- Optimize for production
- Implement monitoring
- Handle errors in production
- Set up CI/CD
- Database migrations in production
- Performance monitoring

## Content

### Vercel Deployment (Easiest)

Vercel is the recommended platform for Next.js deployment, offering seamless integration and optimal performance.

#### Vercel Deployment Steps (GitHub-based workflow)
1. Push your Next.js application to a GitHub repository
2. Visit [vercel.com](https://vercel.com) and connect your GitHub account
3. Import your project from GitHub
4. Configure build settings (usually auto-detected)
5. Deploy and get your production URL

#### Git Integration for Auto-Deployment
- Connect your Git repository to Vercel
- Enable automatic deployments on every push to main branch
- Configure branch-specific deployments for staging environments

#### Environment Variables in Vercel
- Add environment variables in the Vercel dashboard
- Differentiate between development, preview, and production environments
- Use encrypted environment variables for sensitive data

#### Custom Domains on Vercel
- Add custom domains in the Vercel dashboard
- Configure DNS settings with your domain registrar
- Enable SSL certificates automatically

### Docker Deployment

Containerize your Next.js application for consistent deployments across different environments.

#### Dockerfile for Next.js Production Build
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Docker Compose Setup
Create a docker-compose.yml file for multi-container applications:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

### Traditional Server Hosting

Self-hosting options for more control over your deployment environment.

#### Serverless vs Traditional
- Serverless: Automatic scaling, pay-per-execution, easier maintenance
- Traditional: Full control, predictable costs, custom configurations

#### Setting Up Node.js Server
Configure your package.json with the required scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Build and start your application:
```bash
npm run build
npm run start
```

Enable standalone output mode in next.config.js for smaller deployment bundles:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Build Optimization

Configure your next.config.js for production optimization:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp'],
  },
  webpack(config) {
    // Add custom webpack configurations for production
    config.optimization.minimize = true;
    return config;
  },
}
```

### Image Optimization in Production

Optimize images for production performance:
- Use WebP format when possible
- Configure allowed domains in next.config.js
- Implement lazy loading for images below the fold

### Database Connection Pooling

Configure database connection pooling for production:
- Use connection pooling libraries like pg-pool for PostgreSQL
- Implement proper error handling for database connections
- Set appropriate timeout and retry mechanisms

### Error Tracking

Implement error tracking with Sentry:

```javascript
// app/layout.js or app/providers.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Monitor performance with various tools:
- Vercel Analytics for Vercel-hosted applications
- Google Analytics for user behavior tracking
- Sentry for error and performance monitoring
- Datadog for comprehensive infrastructure monitoring

### Logging Strategy

Implement a proper logging strategy:
- Use structured logging with JSON format
- Log important events and errors
- Implement log rotation and retention policies
- Send logs to centralized logging services

## Environment Variables Examples

### Vercel Dashboard
- Add variables in Project Settings → Environment Variables
- Different values for Preview and Production environments

### .env.production
```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NEXTAUTH_SECRET=supersecretstring
NEXTAUTH_URL=https://myapp.vercel.app
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

### Essential Environment Variables
- DATABASE_URL: Database connection string
- NEXTAUTH_SECRET: Secret for NextAuth.js
- NEXTAUTH_URL: Base URL for authentication
- NEXT_PUBLIC_*: Variables available to client-side code

## Production Checklist

- [ ] Environment variables properly configured
- [ ] Database migrations tested in production
- [ ] Image optimization configured
- [ ] Error tracking implemented
- [ ] Performance monitoring set up
- [ ] Backup strategy in place
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Performance optimization applied
- [ ] Logging strategy implemented
- [ ] Authentication properly secured
- [ ] Rate limiting implemented
- [ ] CORS configured appropriately
- [ ] Sitemap and robots.txt configured

## CI/CD Pipeline

### GitHub Actions Workflow for Vercel Deployment
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```

## Monitoring Solutions

### Vercel Analytics
Built-in analytics for Vercel-hosted applications
- Page views and user behavior
- Performance metrics
- Error tracking

### Third-party Monitoring
- Google Analytics: User behavior tracking
- Sentry: Error and performance monitoring
- Datadog: Infrastructure monitoring
- Custom logging solutions

## Quick Reference

### Vercel Deployment
1. Push to GitHub
2. Import project on Vercel
3. Configure environment variables
4. Deploy

### Docker Setup
1. Create Dockerfile with multi-stage build
2. Set up docker-compose.yml for multi-service
3. Build and run containers
4. Configure volumes for persistence

### Environment Configuration
1. Set up .env.production file
2. Add variables to deployment platform
3. Use NEXT_PUBLIC_ for client-side variables
4. Secure sensitive information

### Production Checklist
1. Verify environment variables
2. Test database migrations
3. Configure image optimization
4. Set up error tracking
5. Implement monitoring
6. Ensure security measures
7. Optimize performance
8. Test backup procedures
---
name: ba:generate-config
description: Generate configuration files in different formats (TypeScript, JavaScript, JSON) and sample environment files
allowed-tools: [Write, Read, Bash]
---

# Better-Auth Configuration Generation Command

This command generates configuration files in different formats (TypeScript, JavaScript, JSON) and creates sample environment files for Better-Auth.

## What This Command Does

1. Generates configuration files in TypeScript, JavaScript, and JSON formats
2. Creates sample environment files (.env.example, .env.local.example)
3. Generates configuration templates with best practices
4. Creates sample configuration files with different setups
5. Provides validation for generated configurations

## Configuration File Formats

### TypeScript Configuration (Recommended)

Generates `auth.config.ts` with type safety:

```typescript
// auth.config.ts
import { betterAuth } from "better-auth";
import { postgresAdapter } from "@better-auth/postgres-adapter";
import { drizzle } from "drizzle-orm/postgresql-core";

// PostgreSQL adapter setup
const db = drizzle(/* your pg client */);

const auth = betterAuth({
  database: postgresAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendEmailVerificationOnSignUp: true,
  },
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours
    rememberMe: true,
    updateAge: 1000 * 60 * 60, // 1 hour
  },
  account: {
    accountLinking: {
      enabled: true,
      stripSameType: true,
    },
  },
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  trustKey: process.env.BETTER_AUTH_TRUST_KEY,
});

export default auth;
```

### JavaScript Configuration

Generates `auth.config.js` for JavaScript projects:

```javascript
// auth.config.js
const { betterAuth } = require("better-auth");
const { postgresAdapter } = require("@better-auth/postgres-adapter");

const auth = betterAuth({
  database: postgresAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendEmailVerificationOnSignUp: true,
  },
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours
    rememberMe: true,
    updateAge: 1000 * 60 * 60, // 1 hour
  },
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
});

module.exports = auth;
```

### JSON Configuration

Generates `auth.config.json` for simple setups:

```json
{
  "database": {
    "provider": "pg",
    "connectionString": "postgresql://username:password@localhost:5432/database"
  },
  "socialProviders": {
    "google": {
      "clientId": "process.env.GOOGLE_CLIENT_ID",
      "clientSecret": "process.env.GOOGLE_CLIENT_SECRET"
    },
    "github": {
      "clientId": "process.env.GITHUB_CLIENT_ID",
      "clientSecret": "process.env.GITHUB_CLIENT_SECRET"
    }
  },
  "emailAndPassword": {
    "enabled": true,
    "requireEmailVerification": true,
    "sendEmailVerificationOnSignUp": true
  },
  "session": {
    "expiresIn": 86400,
    "rememberMe": true
  },
  "secret": "process.env.AUTH_SECRET",
  "baseURL": "http://localhost:3000"
}
```

## Environment File Templates

### .env.example

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication Secrets
AUTH_SECRET=your_super_secret_auth_key_here
BETTER_AUTH_TRUST_KEY=your_trust_key_here

# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# Email Configuration (if using email verification/password reset)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
FROM_EMAIL=no-reply@yourdomain.com

# Security Headers
SECURE_COOKIES=false # Set to true in production with HTTPS
```

### .env.local.example

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_local_postgres_password
POSTGRES_DB=better_auth_dev
DATABASE_URL=postgresql://postgres:your_local_postgres_password@localhost:5432/better_auth_dev

# Authentication Secrets
AUTH_SECRET=dev_super_secret_key_that_should_be_32_characters_at_least
BETTER_AUTH_TRUST_KEY=dev_trust_key_for_encryption

# OAuth Provider Credentials (Development)
# Get these from your respective developer consoles
GOOGLE_CLIENT_ID=your_dev_google_client_id
GOOGLE_CLIENT_SECRET=your_dev_google_client_secret
GITHUB_CLIENT_ID=your_dev_github_client_id
GITHUB_CLIENT_SECRET=your_dev_github_client_secret

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# Email Configuration (Development - using Ethereal or similar)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_test_smtp_user
SMTP_PASSWORD=your_test_smtp_password
FROM_EMAIL=test@yourdomain.com

# Security Headers
SECURE_COOKIES=false
```

## Advanced Configuration Templates

### Production-Ready Configuration

```typescript
// auth.prod.config.ts
import { betterAuth } from "better-auth";
import { postgresAdapter } from "@better-auth/postgres-adapter";

const auth = betterAuth({
  database: postgresAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: process.env.GITHUB_CALLBACK_URL,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendEmailVerificationOnSignUp: true,
    password: {
      // Strong password requirements for production
      minLength: 12,
      requireSpecialChar: true,
      requireNumbers: true,
      requireUppercase: true,
    },
  },
  session: {
    expiresIn: 8 * 60 * 60, // 8 hours for production
    rememberMe: true,
    updateAge: 30 * 60, // 30 minutes
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  },
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.NEXTAUTH_URL!,
  trustKey: process.env.BETTER_AUTH_TRUST_KEY!,
  // Security headers for production
  advanced: {
    cors: {
      origin: [process.env.SITE_URL!],
      credentials: true,
    },
  },
});

export default auth;
```

### Multi-Environment Configuration

```typescript
// auth.multi-env.config.ts
import { betterAuth } from "better-auth";
import { postgresAdapter } from "@better-auth/postgres-adapter";

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const auth = betterAuth({
  database: postgresAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: isProduction
        ? process.env.PROD_GOOGLE_CALLBACK_URL
        : process.env.DEV_GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: isProduction
        ? process.env.PROD_GITHUB_CALLBACK_URL
        : process.env.DEV_GITHUB_CALLBACK_URL,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: isProduction, // Optional in dev
    sendEmailVerificationOnSignUp: true,
    password: {
      minLength: isProduction ? 12 : 8, // Stricter in production
      requireSpecialChar: isProduction,
      requireNumbers: true,
      requireUppercase: isProduction,
    },
  },
  session: {
    expiresIn: isProduction ? 8 * 60 * 60 : 24 * 60 * 60, // 8 hrs prod, 24 hrs dev
    rememberMe: true,
    updateAge: isProduction ? 30 * 60 : 60 * 60, // 30 mins prod, 1 hr dev
  },
  rateLimit: isProduction ? {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  } : undefined, // Disable in development
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.NEXTAUTH_URL!,
  trustKey: process.env.BETTER_AUTH_TRUST_KEY!,
  advanced: {
    cors: {
      origin: isProduction
        ? [process.env.PROD_SITE_URL!]
        : [process.env.DEV_SITE_URL!, 'http://localhost:3000'],
      credentials: true,
    },
  },
});

export default auth;
```

## Configuration Validation

The generated configurations include validation to ensure they follow best practices:

1. Required environment variables are checked
2. Security settings are appropriate for the environment
3. OAuth provider configurations are complete
4. Session settings follow security best practices
5. Rate limiting is configured for production

## Generated Files Summary

Running this command creates:

- `auth.config.ts` - Main TypeScript configuration
- `auth.config.js` - JavaScript alternative
- `auth.config.json` - JSON configuration
- `.env.example` - Example environment variables
- `.env.local.example` - Local development environment template
- `auth.prod.config.ts` - Production-ready configuration
- `auth.multi-env.config.ts` - Multi-environment configuration

## Next Steps After Generation

1. Review the generated configuration files
2. Update environment variables in your actual .env files
3. Customize the configuration based on your specific needs
4. Test the configuration in your development environment
5. Deploy the configuration to your staging/production environments
6. Verify that all authentication flows work correctly
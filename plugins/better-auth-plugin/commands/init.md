---
name: ba:init-auth
description: Initialize Better-Auth configuration and project structure with default settings
allowed-tools: [Write, Read, Bash]
---

# Better-Auth Initialization Command

This command initializes Better-Auth configuration and project structure with default settings.

## What This Command Does

1. Creates the basic Better-Auth configuration file
2. Sets up the default database configuration (PostgreSQL)
3. Generates a .env.example file with required variables
4. Creates basic auth routes and middleware
5. Sets up default session and security configurations

## Execution Steps

First, let's create the Better-Auth configuration file:

```typescript
// auth.config.ts
import { betterAuth } from "better-auth";
import { postgresAdapter } from "@better-auth/postgres-adapter";
import { drizzle } from "drizzle-orm/postgresql-core";

// This is a template - you'll need to customize it for your specific setup
const auth = betterAuth({
  database: postgresAdapter(
    drizzle(/* your pg client */),
    {
      provider: "pg",
    }
  ),
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
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours
    rememberMe: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  secret: process.env.AUTH_SECRET!,
});

export default auth;
```

Next, let's create the .env.example file:

```
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication Secrets
AUTH_SECRET=your_super_secret_auth_key_here

# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

Now, let's create a basic middleware file for authentication:

```typescript
// middleware.ts (for Next.js) or similar auth middleware
import { auth } from './auth.config';

export function withAuthProtection(req, res, next) {
  // Verify session exists and is valid
  const session = auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user info to request for downstream use
  req.user = session.user;
  next();
}

// Example route protection
export function protectRoute(handler) {
  return async (req, res) => {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res, session.user);
  };
}
```

Finally, let's create a basic API route example:

```typescript
// pages/api/auth/[...betterAuth].ts (for Next.js) or equivalent
import auth from '../../../auth.config';

export default auth.$handle();
```

## Package Installation

Run the following command to install required packages:

```bash
npm install better-auth @better-auth/postgres-adapter drizzle-orm @better-auth/email-password
```

For development:

```bash
npm install -D @types/node
```

## Additional Configuration Options

After running this command, you may want to customize:

1. Session timeout duration
2. Enabled OAuth providers
3. Database adapter based on your choice
4. Email verification settings
5. Password reset options
6. Custom branding for emails

## Next Steps

1. Update the .env file with your actual credentials
2. Modify the auth.config.ts to match your specific needs
3. Run database migrations if using SQL database
4. Test the authentication flow
5. Set up OAuth provider credentials

Remember to keep your secrets secure and never commit .env files to version control.
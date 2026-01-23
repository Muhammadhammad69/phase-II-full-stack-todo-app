---
name: ba:setup-oauth
description: Configure OAuth providers with credentials and generate necessary configuration files
allowed-tools: [Write, Read, Bash]
---

# Better-Auth OAuth Setup Command

This command helps configure OAuth providers with credentials and generates necessary configuration files.

## What This Command Does

1. Prompts for OAuth provider selection (Google, GitHub, Facebook, Discord, Twitter)
2. Collects OAuth credentials from the user
3. Updates the auth configuration file with provider settings
4. Generates environment variable entries
5. Creates OAuth-specific configuration files
6. Validates the entered credentials format

## Supported OAuth Providers

- Google OAuth 2.0
- GitHub OAuth
- Facebook OAuth
- Discord OAuth
- Twitter/X OAuth

## Configuration Templates

### Google OAuth Configuration Template

```typescript
// Add to your auth.config.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
  },
}
```

Environment variables needed:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### GitHub OAuth Configuration Template

```typescript
// Add to your auth.config.ts
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUri: process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
  },
}
```

Environment variables needed:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback/github
```

### Facebook OAuth Configuration Template

```typescript
// Add to your auth.config.ts
socialProviders: {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook`,
  },
}
```

Environment variables needed:
```
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/callback/facebook
```

### Discord OAuth Configuration Template

```typescript
// Add to your auth.config.ts
socialProviders: {
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: process.env.DISCORD_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`,
  },
}
```

Environment variables needed:
```
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord
```

### Twitter/X OAuth Configuration Template

```typescript
// Add to your auth.config.ts
socialProviders: {
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    redirectUri: process.env.TWITTER_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`,
  },
}
```

Environment variables needed:
```
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/callback/twitter
```

## Multi-Provider Setup

This command supports setting up multiple providers at once. Example usage:

```
/ba:setup-oauth Google GitHub Discord
```

## Validation Steps

This command will:

1. Validate that the OAuth credentials have the correct format
2. Check that redirect URIs match between your configuration and provider settings
3. Verify that required environment variables are present
4. Test the connection to OAuth providers if possible

## Callback URL Configuration

Remember to configure the following callback URLs in your OAuth provider dashboards:

- Development: `http://localhost:3000/api/auth/callback/[provider]`
- Production: `https://yourdomain.com/api/auth/callback/[provider]`

## Security Considerations

- Never commit OAuth credentials to version control
- Use environment variables to store sensitive information
- Rotate OAuth credentials periodically
- Monitor OAuth provider usage for suspicious activity
- Ensure HTTPS is used in production environments

## Next Steps After Setup

1. Update your .env file with the new credentials
2. Add the provider configuration to your auth.config.ts
3. Register the callback URLs with each OAuth provider
4. Test the OAuth flow for each configured provider
5. Verify that user accounts are created/linked properly
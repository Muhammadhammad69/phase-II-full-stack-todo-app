---
name: OAuth Configuration
description: When setting up OAuth providers, configuring OAuth credentials, troubleshooting OAuth flows, or implementing OAuth security measures
version: 1.0.0
---

# OAuth Configuration Guide for Better-Auth

## Google OAuth Setup

### Step 1: Create Google Cloud Project
- Go to Google Cloud Console (console.cloud.google.com)
- Click "Select a project" and then "New Project"
- Enter project name and create

### Step 2: Enable APIs
- Navigate to "APIs & Services > Library"
- Search for "Google+ API" and enable it
- Also enable "People API" for user information

### Step 3: Create OAuth Credentials
- Go to "APIs & Services > Credentials"
- Click "Create Credentials > OAuth 2.0 Client IDs"
- Select "Web application" as application type
- Add authorized redirect URIs:
  - For development: http://localhost:3000/api/auth/callback/google
  - For production: https://yourdomain.com/api/auth/callback/google

### Step 4: Configure Better-Auth
```javascript
import Google from "@better-auth/oauth/providers/google";

const auth = betterAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ]
});
```

### Environment Variables:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth Application
- Go to GitHub Settings > Developer settings > OAuth Apps
- Click "New OAuth App"
- Fill in application details:
  - Application name
  - Homepage URL (e.g., https://yourdomain.com)
  - Authorization callback URL:
    - Development: http://localhost:3000/api/auth/callback/github
    - Production: https://yourdomain.com/api/auth/callback/github

### Step 2: Configure Better-Auth
```javascript
import GitHub from "@better-auth/oauth/providers/github";

const auth = betterAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  ]
});
```

### Environment Variables:
```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

## Facebook OAuth Setup

### Step 1: Create Facebook App
- Go to Facebook Developers (developers.facebook.com)
- Click "My Apps" > "Create App"
- Select "Consumer" as app type
- Enter display name and contact email

### Step 2: Add Facebook Login Product
- In your app dashboard, click "+ Add Product"
- Select "Facebook Login"
- Click "Quickstart" or "Settings"

### Step 3: Configure Settings
- Add valid OAuth redirect URIs:
  - Development: http://localhost:3000/api/auth/callback/facebook
  - Production: https://yourdomain.com/api/auth/callback/facebook
- Note your App ID and App Secret

### Step 4: Configure Better-Auth
```javascript
import Facebook from "@better-auth/oauth/providers/facebook";

const auth = betterAuth({
  providers: [
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  ]
});
```

### Environment Variables:
```
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
```

## Discord OAuth Setup

### Step 1: Create Discord Application
- Go to Discord Developer Portal (discord.com/developers/applications)
- Click "New Application"
- Enter application name

### Step 2: Add Bot (Optional)
- Go to "Bot" section
- Click "Add Bot" if needed
- Note the Client ID and Client Secret under "General Information"

### Step 3: Configure OAuth2
- Go to "OAuth2 > General"
- Add redirect URIs:
  - Development: http://localhost:3000/api/auth/callback/discord
  - Production: https://yourdomain.com/api/auth/callback/discord

### Step 4: Configure Better-Auth
```javascript
import Discord from "@better-auth/oauth/providers/discord";

const auth = betterAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  ]
});
```

### Environment Variables:
```
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

## Twitter/X OAuth Setup

### Step 1: Create Twitter App
- Go to Twitter Developer Portal (developer.twitter.com/en/apps)
- Click "Create an app"
- Fill in app name, description, and website

### Step 2: Configure App Permissions
- Go to your app's "Keys and Tokens" tab
- Under "App permissions", select "Read and Write" or appropriate level
- Generate API key and secret

### Step 3: Set Up OAuth 2.0
- Go to "Authentication settings"
- Enable OAuth 2.0
- Add redirect URIs:
  - Development: http://localhost:3000/api/auth/callback/twitter
  - Production: https://yourdomain.com/api/auth/callback/twitter
- Add your Terms of Service and Privacy Policy URLs

### Step 4: Configure Better-Auth
```javascript
import Twitter from "@better-auth/oauth/providers/twitter";

const auth = betterAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    })
  ]
});
```

### Environment Variables:
```
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
```

## OAuth Security Best Practices

### Secure Credential Storage
- Never hardcode OAuth credentials in source code
- Use environment variables or secure vaults
- Rotate credentials regularly
- Restrict access to credential storage

### Callback URL Security
- Use HTTPS in production
- Validate callback URLs server-side
- Implement state parameters to prevent CSRF
- Ensure callback URLs match exactly what's registered with providers

### Scope Management
- Request minimal required scopes
- Review scopes regularly for necessity
- Document what each scope is used for
- Consider incremental authorization for sensitive scopes

### Token Handling
- Store refresh tokens securely (encrypted)
- Implement proper token refresh mechanisms
- Handle token expiration gracefully
- Log token usage for security monitoring

## OAuth Error Handling

### Common OAuth Errors
- `access_denied`: User declined permission
- `invalid_request`: Malformed request
- `unauthorized_client`: Client not authorized
- `unsupported_response_type`: Unsupported response type
- `invalid_scope`: Requested scope is invalid
- `server_error`: Internal server error
- `temporarily_unavailable`: Service temporarily unavailable

### Error Response Handling
```javascript
try {
  const user = await auth.signIn.oauth.callback({
    // callback params
  });
} catch (error) {
  if (error.message.includes('access_denied')) {
    // Handle user denial
  } else if (error.message.includes('invalid_grant')) {
    // Handle invalid credentials
  } else {
    // Handle other errors
  }
}
```

## OAuth Configuration Validation

### Checklist Before Going Live
- [ ] All redirect URIs match provider configuration exactly
- [ ] Credentials are properly secured
- [ ] Error handling is implemented
- [ ] User consent flows are clear
- [ ] Privacy policy and terms of service are accessible
- [ ] Rate limits are understood and planned for
- [ ] Account deletion process includes deauthorization

### Testing OAuth Flows
- Test with multiple user accounts
- Test error scenarios (denied permissions, network issues)
- Test with different browsers and devices
- Verify session management after OAuth
- Check that user data is properly stored and accessible
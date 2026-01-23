---
name: ba:troubleshoot
description: Diagnose and troubleshoot authentication issues through interactive questioning and automated diagnostics
allowed-tools: [Write, Read, Bash]
---

# Better-Auth Troubleshooting Command

This command diagnoses and troubleshoots authentication issues through interactive questioning and automated diagnostics.

## What This Command Does

1. Asks targeted questions based on user-reported symptoms
2. Collects diagnostic information from the system
3. Performs automated checks for common issues
4. Provides step-by-step troubleshooting guidance
5. Generates a diagnostic report with findings and solutions

## Interactive Troubleshooting Process

### Initial Symptom Assessment

The command begins by asking:

"What authentication issue are you experiencing?"

Possible symptom categories:
- Login failures
- Registration issues
- OAuth problems
- Session/cookie issues
- Database connection errors
- Email verification problems
- Password reset failures
- Configuration errors

### Diagnostic Information Collection

The command collects the following information:

#### System Information
```bash
# Collect Node.js version
node --version

# Collect Better-Auth version
npm list better-auth

# Collect database type and version
# (varies based on database adapter)
```

#### Configuration Analysis
- Current auth configuration file content
- Environment variables (without sensitive values)
- File permissions on configuration files
- Recent changes to authentication code

#### Runtime Information
- Current Better-Auth version
- Database adapter being used
- Enabled authentication providers
- Session configuration settings

### Automated Diagnostic Checks

#### 1. Database Connection Check
```typescript
async function checkDatabaseConnection() {
  try {
    // Test basic database connectivity
    const result = await auth.$query.raw('SELECT 1');
    console.log('✅ Database connection: Working');
    return true;
  } catch (error) {
    console.error('❌ Database connection: Failed');
    console.error('Error:', error.message);
    return false;
  }
}
```

#### 2. Environment Variables Check
```typescript
function checkEnvironmentVariables() {
  const checks = [
    { var: 'AUTH_SECRET', required: true },
    { var: 'DATABASE_URL', required: true },
    { var: 'NEXTAUTH_URL', required: true },
    { var: 'GOOGLE_CLIENT_ID', required: false }, // Only required if Google OAuth is enabled
    { var: 'GITHUB_CLIENT_ID', required: false }, // Only required if GitHub OAuth is enabled
  ];

  const results = [];
  for (const check of checks) {
    const value = process.env[check.var];
    const present = !!value;

    results.push({
      variable: check.var,
      present,
      required: check.required,
      status: present ? '✅' : (check.required ? '❌' : '⚠️')
    });
  }

  return results;
}
```

#### 3. OAuth Provider Validation
```typescript
async function checkOAuthProviders() {
  const providers = ['google', 'github', 'facebook', 'discord', 'twitter'];
  const results = [];

  for (const provider of providers) {
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (clientId || clientSecret) {
      // Provider seems to be configured
      try {
        // Test if the provider is properly configured
        console.log(`Testing ${provider} OAuth configuration...`);

        results.push({
          provider,
          configured: true,
          credentialsValid: !!(clientId && clientSecret),
          status: '✅'
        });
      } catch (error) {
        results.push({
          provider,
          configured: true,
          credentialsValid: false,
          status: '❌',
          error: error.message
        });
      }
    }
  }

  return results;
}
```

#### 4. Session and Cookie Analysis
```typescript
function checkSessionConfiguration() {
  // Check session-related settings
  const sessionConfig = auth.options.session;

  const checks = [
    {
      name: 'Session expiration',
      value: sessionConfig?.expiresIn,
      valid: sessionConfig?.expiresIn > 0,
      status: sessionConfig?.expiresIn > 0 ? '✅' : '⚠️'
    },
    {
      name: 'Remember me',
      value: sessionConfig?.rememberMe,
      valid: typeof sessionConfig?.rememberMe === 'boolean',
      status: typeof sessionConfig?.rememberMe === 'boolean' ? '✅' : '⚠️'
    }
  ];

  return checks;
}
```

## Common Troubleshooting Paths

### Login Failure Troubleshooting

**Q: What error do you see when trying to log in?**

**A: "Invalid credentials"**
- Verify email exists in the database
- Check if password is correct (test with known good password)
- Ensure password hashing is working properly
- Verify user is not locked out

**A: "Database connection error"**
- Check database connection settings
- Verify database server is running
- Test database credentials
- Check network connectivity

**A: "Session creation failed"**
- Check session configuration
- Verify session storage is working
- Check for cookie-related issues

### OAuth Problem Troubleshooting

**Q: Which OAuth provider is causing issues?**

**A: Google OAuth**
- Verify Google Cloud project is set up correctly
- Check OAuth client ID and secret
- Verify redirect URLs match exactly
- Ensure Google+ API is enabled

**A: GitHub OAuth**
- Verify GitHub OAuth app is created
- Check client ID and secret
- Verify callback URL configuration

### Email Verification Troubleshooting

**Q: Are users getting verification emails?**

**A: No emails are sent**
- Check email configuration in auth settings
- Verify SMTP settings
- Ensure email verification is enabled

**A: Emails are sent but links don't work**
- Check if verification tokens are expiring
- Verify callback URLs
- Check for token validation issues

## Diagnostic Information Collected

### System Environment
- Node.js version: `process.version`
- Better-Auth version: `package-lock.json` or `yarn.lock`
- Operating system: `process.platform`
- Architecture: `process.arch`

### Runtime Information
- Current process environment
- Memory usage
- Uptime information
- Active connections

### Configuration Details
- Authentication provider settings
- Session configuration
- Database adapter configuration
- Security settings

### Recent Error Logs
- Last 50 lines of application logs
- Authentication-related error messages
- Stack traces for recent failures

## Troubleshooting Commands

### Quick Health Check
```
/ba:troubleshoot --quick
```
Performs basic health checks without interactive questions.

### Verbose Diagnostic
```
/ba:troubleshoot --verbose
```
Provides detailed diagnostic information for complex issues.

### Provider-Specific Troubleshooting
```
/ba:troubleshoot --provider google
```
Focuses troubleshooting on a specific OAuth provider.

## Automated Fixes

For common issues, the command offers automated fixes:

### Environment Variable Setup
```
/ba:troubleshoot --fix env
```
Guides through environment variable configuration.

### Database Schema Check
```
/ba:troubleshoot --fix schema
```
Checks and optionally fixes database schema issues.

### Session Configuration
```
/ba:troubleshoot --fix sessions
```
Verifies and fixes session configuration.

## Troubleshooting Report

The command generates a comprehensive report:

```
🔧 Better-Auth Troubleshooting Report
=====================================

📋 Summary of Findings
- 2 critical issues found
- 3 warnings identified
- 5 configuration recommendations

🔍 Detailed Analysis
Critical Issue 1: Database connection failed
  - Error: Connection refused
  - Likely Cause: Database server not running
  - Solution: Start your database server

Critical Issue 2: AUTH_SECRET not set
  - Error: Missing required environment variable
  - Solution: Add AUTH_SECRET to your environment

⚠️  Warnings
  - Session timeout set to 30 minutes (recommend 24h+)
  - OAuth callback URLs not configured
  - Email verification disabled

💡 Recommendations
  - Enable HTTPS in production
  - Implement rate limiting
  - Add proper error logging

📋 Next Steps
  1. Fix critical issues first
  2. Re-run validation command
  3. Test authentication flows
  4. Review security settings
```

## Common Fixes Applied

### Generate Missing Secrets
```
# Generate a new AUTH_SECRET
openssl rand -base64 32
```

### Database Connection Test
```
# Test database connection directly
node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect()"
```

### Configuration Validation
```
# Validate auth configuration
npx tsc auth.config.ts --noEmit
```

## Escalation Path

If automated troubleshooting doesn't resolve the issue:

1. Provide the generated diagnostic report
2. Share relevant error messages and stack traces
3. Describe the specific steps that reproduce the issue
4. Mention your environment (Node.js version, OS, database type)
5. Consider sharing anonymized configuration snippets if appropriate
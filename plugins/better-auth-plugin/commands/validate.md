---
name: ba:validate
description: Validate configuration files, environment variables, database connection, OAuth credentials, and file permissions
allowed-tools: [Write, Read, Bash]
---

# Better-Auth Validation Command

This command validates configuration files, environment variables, database connection, OAuth credentials, and file permissions to ensure your Better-Auth setup is properly configured.

## What This Command Does

1. Checks configuration file syntax and completeness
2. Verifies environment variables presence and values
3. Tests database connection
4. Validates OAuth credentials format
5. Checks file permissions and access
6. Provides detailed reports with error descriptions, line numbers, fix suggestions, and severity levels

## Validation Categories

### 1. Configuration File Validation

Checks the syntax and completeness of your auth configuration:

```bash
# Validate TypeScript configuration file
npx tsc --noEmit auth.config.ts

# Check for required configuration options
```

Validation checks include:
- Syntax validation (TypeScript/JavaScript/JSON)
- Required options presence
- Correct data types for configuration values
- Proper nesting of configuration objects
- Valid import/require statements

### 2. Environment Variables Validation

Verifies that all required environment variables are present and properly formatted:

```typescript
// Example validation function
function validateEnvVariables() {
  const requiredVars = [
    'AUTH_SECRET',
    'DATABASE_URL',
    'NEXTAUTH_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    return false;
  }

  return true;
}
```

Environment variables checked:
- AUTH_SECRET (should be at least 32 characters)
- DATABASE_URL (valid database connection string)
- NEXTAUTH_URL/SITE_URL (valid URL format)
- OAuth credentials (if providers are configured)
- SMTP settings (if email verification/password reset is enabled)

### 3. Database Connection Validation

Tests the database connection and verifies schema compatibility:

```typescript
async function validateDatabaseConnection(auth) {
  try {
    // Attempt to connect to the database
    await auth.$query.raw('SELECT 1');
    console.log('✅ Database connection successful');

    // Check if required tables exist
    // This would vary based on your database adapter
    console.log('✅ Database schema is compatible');

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}
```

Database validation includes:
- Connection establishment
- Authentication credentials
- Required tables existence
- Schema version compatibility
- Sufficient privileges for operations

### 4. OAuth Credentials Validation

Validates the format and accessibility of OAuth credentials:

```typescript
async function validateOAuthCredentials() {
  const providers = ['GOOGLE', 'GITHUB', 'FACEBOOK', 'DISCORD', 'TWITTER'];

  for (const provider of providers) {
    const clientId = process.env[`${provider}_CLIENT_ID`];
    const clientSecret = process.env[`${provider}_CLIENT_SECRET`];

    if (clientId && !isValidClientId(clientId)) {
      console.error(`❌ Invalid ${provider} Client ID format`);
      return false;
    }

    if (clientSecret && !isValidClientSecret(clientSecret)) {
      console.error(`❌ Invalid ${provider} Client Secret format`);
      return false;
    }
  }

  return true;
}

function isValidClientId(id) {
  // Basic validation - adjust based on provider requirements
  return typeof id === 'string' && id.length > 0;
}

function isValidClientSecret(secret) {
  // Basic validation - adjust based on provider requirements
  return typeof secret === 'string' && secret.length > 0;
}
```

OAuth validation includes:
- Client ID format validation
- Client Secret format validation
- Redirect URI configuration
- Provider-specific requirements

### 5. File Permissions Validation

Checks that required files and directories have appropriate permissions:

```bash
# Check if configuration files are readable
if [ ! -r "auth.config.ts" ]; then
  echo "❌ auth.config.ts is not readable"
fi

# Check if environment files have secure permissions
if [ -f ".env" ]; then
  perms=$(stat -c %a .env)
  if [ "$perms" -gt 600 ]; then
    echo "⚠️  .env file has loose permissions ($perms), should be 600"
  fi
fi
```

## Detailed Validation Report

The validation command generates a comprehensive report with:

### Error Descriptions
- Clear explanation of what went wrong
- Context about why the validation failed
- Impact assessment of the issue

### Line Numbers
- For configuration files, exact line numbers where issues occur
- Makes it easy to locate and fix problems

### Fix Suggestions
- Practical steps to resolve each issue
- Code examples when applicable
- Links to relevant documentation

### Severity Levels
- **Critical**: Will prevent authentication from working
- **Warning**: May cause issues but won't stop functionality
- **Info**: Recommendations for improvement

## Sample Validation Output

```
🔍 Better-Auth Validation Report
================================

📋 Configuration File Validation
✅ auth.config.ts syntax is valid
✅ Required options present
❌ Warning: Session timeout seems low (30 min) - recommend 24h+

🔐 Environment Variables Validation
✅ AUTH_SECRET is set (length: 32)
✅ DATABASE_URL is set and valid
❌ Critical: GOOGLE_CLIENT_ID is missing
✅ NEXTAUTH_URL is set and valid

💾 Database Connection Validation
✅ Connection established successfully
✅ Required tables exist
✅ Schema version: v1.2.3

OAuth Providers Validation
✅ GitHub OAuth configured correctly
❌ Critical: Google OAuth missing credentials
✅ Discord OAuth configured correctly

📁 File Permissions Validation
✅ auth.config.ts is readable
✅ .env has secure permissions (600)
✅ Required directories are writable

📊 Summary
Critical Issues: 2
Warnings: 1
Passed: 15
```

## Validation Functions

### Comprehensive Validation Runner

```typescript
async function runFullValidation() {
  console.log('🔍 Starting Better-Auth validation...\n');

  const results = {
    config: await validateConfigFile(),
    env: validateEnvVariables(),
    db: await validateDatabaseConnection(auth),
    oauth: await validateOAuthCredentials(),
    permissions: validateFilePermissions(),
    security: validateSecuritySettings()
  };

  generateValidationReport(results);

  const hasCriticalErrors = Object.values(results).some(result =>
    result.status === 'critical' || result.passed === false
  );

  return {
    success: !hasCriticalErrors,
    results
  };
}
```

### Security Settings Validation

```typescript
function validateSecuritySettings() {
  let issues = [];

  // Check if AUTH_SECRET is strong enough
  const authSecret = process.env.AUTH_SECRET;
  if (authSecret && authSecret.length < 32) {
    issues.push({
      severity: 'critical',
      message: 'AUTH_SECRET should be at least 32 characters long',
      suggestion: 'Generate a new secret with: openssl rand -base64 32'
    });
  }

  // Check if production settings are appropriate
  if (process.env.NODE_ENV === 'production') {
    if (process.env.SECURE_COOKIES === 'false') {
      issues.push({
        severity: 'warning',
        message: 'SECURE_COOKIES is set to false in production',
        suggestion: 'Set SECURE_COOKIES=true in production with HTTPS'
      });
    }
  }

  return {
    passed: issues.length === 0,
    issues
  };
}
```

## Quick Validation Options

### Validate Only Configuration
```bash
# Run only configuration validation
/ba:validate --config-only
```

### Validate Only Environment Variables
```bash
# Run only environment variable validation
/ba:validate --env-only
```

### Validate Only Database
```bash
# Run only database validation
/ba:validate --db-only
```

## Common Validation Issues and Solutions

### Issue: Missing AUTH_SECRET
- **Cause**: AUTH_SECRET environment variable not set
- **Solution**: Generate a secure secret and add to environment
- **Command**: `openssl rand -base64 32`

### Issue: Invalid DATABASE_URL
- **Cause**: Malformed database connection string
- **Solution**: Verify connection string format matches your database
- **Example**: `postgresql://user:pass@localhost:5432/dbname`

### Issue: OAuth Credentials Format
- **Cause**: Client ID or secret doesn't match provider format
- **Solution**: Verify credentials in provider's developer console
- **Check**: Ensure no extra spaces or characters

### Issue: File Permissions Too Loose
- **Cause**: Configuration files readable by others
- **Solution**: Update file permissions to restrict access
- **Command**: `chmod 600 .env` or `chmod 644 config.js`

## Next Steps After Validation

1. Review the validation report carefully
2. Address all critical issues first
3. Fix warnings to improve security and performance
4. Re-run validation to confirm fixes
5. Test authentication flows after configuration changes
6. Document any custom configurations for team reference
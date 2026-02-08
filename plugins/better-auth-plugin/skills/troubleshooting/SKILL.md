---
name: Authentication Troubleshooting
description: When diagnosing authentication issues, resolving configuration problems, debugging login failures, or fixing common Better-Auth errors
version: 1.0.0
---

# Authentication Troubleshooting Guide for Better-Auth

## Database Connection Errors

Common database issues and solutions:

### Connection Refused
- Check if database server is running
- Verify host, port, username, and password in configuration
- Ensure firewall allows connections on the database port
- Test connection using database client directly

### Invalid Credentials
- Verify database username and password
- Check if user has appropriate permissions
- Ensure database exists and is accessible
- Look for typos in credentials

### SSL/TLS Issues
- Configure SSL settings appropriately for your database provider
- Verify certificate paths and validity
- Check if database requires SSL connection
- Consider using connection strings with SSL options

## Environment Variable Issues

Configuration troubleshooting:

### Missing Environment Variables
- Verify all required environment variables are set
- Check for typos in variable names
- Ensure variables are available in the runtime environment
- Differentiate between development and production environments

### Incorrect Values
- Validate OAuth client IDs and secrets
- Check database connection strings for correctness
- Verify callback URLs match exactly
- Ensure signing secrets are properly formatted

## OAuth Provider Problems

Troubleshooting OAuth configurations:

### Credential Issues
- Double-check client ID and secret from provider dashboard
- Verify credentials match the environment (dev vs prod)
- Ensure provider application is properly configured
- Check if credentials have expired or been revoked

### Callback URL Mismatches
- Verify callback URLs match exactly what's registered with provider
- Include correct protocol (http/https)
- Check for trailing slashes differences
- Ensure URLs match between provider config and application

### Scope Configuration
- Verify requested scopes are approved by the provider
- Check if additional verification is needed for certain scopes
- Ensure scopes match the intended functionality
- Review provider documentation for scope limitations

## Session and Token Validation Failures

Debugging session-related issues:

### Session Not Persisting
- Check if cookies are being blocked by browser
- Verify cookie domain and path settings
- Ensure HTTPS configuration matches environment
- Check SameSite attribute settings

### Token Validation Failures
- Verify signing secrets match between services
- Check token expiration times
- Validate token format and structure
- Ensure clock synchronization between services

### Cross-Domain Issues
- Configure CORS appropriately
- Verify origin headers
- Check if authentication spans multiple domains
- Implement proper token sharing mechanisms

## Password Validation Failures

Resolving password-related issues:

### Hashing Mismatches
- Verify password hashing algorithm consistency
- Check if bcrypt cost factor matches stored hashes
- Ensure proper comparison functions are used
- Review migration from different hashing methods

### Validation Rules
- Confirm password validation rules are consistent
- Check for special character requirements
- Verify length requirements
- Ensure validation matches user expectations

## CORS and Network Issues

Cross-origin troubleshooting:

### Preflight Requests
- Verify OPTIONS requests are handled properly
- Check if preflight headers match actual request
- Ensure credentials are handled correctly
- Validate Access-Control-Allow-Headers

### Origin Mismatches
- Verify origin headers match allowed origins
- Check for protocol differences (http vs https)
- Ensure port numbers are included if non-standard
- Consider wildcard usage carefully

## Debugging Strategies

Effective troubleshooting approaches:

### Log Analysis
- Enable detailed logging for authentication flows
- Look for error patterns in logs
- Correlate timestamps across different services
- Check for resource exhaustion issues

### Step-by-Step Testing
- Test authentication flow incrementally
- Isolate components to identify failure points
- Use test credentials to avoid account lockouts
- Verify each step independently

### Common Error Messages
- "Invalid credentials": Usually indicates wrong username/password
- "Connection timeout": Network or database connectivity issues
- "Invalid token": Expired or malformed authentication token
- "Access denied": Authorization or permission issues
- "Callback mismatch": OAuth provider configuration issue

## Diagnostic Information Collection

Gather relevant information for troubleshooting:

### System Information
- Node.js version
- Better-Auth version
- Database type and version
- Operating system details

### Configuration Details
- Authentication provider settings
- Database connection details (without credentials)
- Environment variables (without sensitive values)
- CORS configuration

### Error Details
- Full error messages and stack traces
- Timestamps of when issues occur
- Frequency of occurrence
- Conditions that trigger the issue

## Common Fixes

Quick solutions for frequent issues:

### Environment Setup
- Ensure all required environment variables are set
- Verify .env file is properly loaded
- Check file permissions on configuration files

### Configuration Validation
- Validate JSON configuration syntax
- Check for missing required fields
- Verify data types match expected values

### Service Restart
- Restart authentication service after configuration changes
- Clear any cached configurations
- Ensure all dependent services are restarted

## Testing Authentication Flows

Systematic testing approach:

### Registration Flow
- Test new user creation
- Verify email verification process
- Check password validation
- Validate error handling

### Login Flow
- Test successful authentication
- Verify session creation
- Check error handling for invalid credentials
- Test account lockout mechanisms

### OAuth Flow
- Test provider redirection
- Verify callback handling
- Check user creation/update after OAuth
- Validate token exchange process
---
name: Authentication Best Practices
description: When implementing authentication systems, securing user accounts, managing sessions, or optimizing authentication performance
version: 1.0.0
---

# Authentication Best Practices for Better-Auth

## Password Hashing

Always use industry-standard password hashing algorithms:

- Use bcrypt, Argon2, or PBKDF2 for password hashing
- Never store plain-text passwords
- Use appropriate cost factors (bcrypt: 10-12, Argon2: tune parameters based on your server's capability)
- Implement salting automatically (handled by bcrypt/Argon2)

Example with bcrypt:
```javascript
const bcrypt = require('bcrypt');

// During user registration
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// During login
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

## Session Management

Proper session handling is crucial for security:

- Set appropriate session expiration times (recommended: 24 hours for persistent sessions)
- Implement automatic session renewal before expiration
- Use secure session storage (Redis for distributed systems)
- Implement session invalidation on password change
- Use session rotation after privilege escalation

## Token Handling

Secure token management practices:

- Use short-lived access tokens (15-30 minutes)
- Implement refresh tokens for extended sessions (24 hours)
- Store refresh tokens securely (HTTP-only cookies or secure local storage)
- Implement token rotation with each use
- Invalidate tokens on logout
- Use proper token signing algorithms (JWT with strong secrets)

## Account Security Features

Essential security measures:

- Implement account lockout after failed attempts (typically 5-10 attempts)
- Add rate limiting to authentication endpoints
- Enable email verification for new accounts
- Implement secure password reset workflows
- Add two-factor authentication options
- Monitor for suspicious login patterns

## Performance Optimization

Authentication performance considerations:

- Cache validated sessions to reduce database lookups
- Optimize database queries for user lookup
- Use connection pooling for database operations
- Implement CDN caching for static auth assets
- Consider token-based authentication for API-heavy applications

## Email Verification Workflows

Secure email verification implementation:

- Generate unique, expiring tokens for verification
- Send verification emails immediately after registration
- Allow users to resend verification emails
- Prevent verification of already-verified accounts
- Clean up unverified accounts after a reasonable time period

## Password Reset Flows

Secure password reset procedures:

- Generate time-limited, single-use tokens
- Invalidate tokens after successful password reset
- Notify users of password changes via email
- Require current password for password change (if already logged in)
- Implement proper token entropy to prevent guessing attacks

## Error Handling

Secure error messaging:

- Don't reveal whether an email exists in the system
- Use generic error messages for failed login attempts
- Log authentication failures for monitoring
- Implement progressive delays for repeated failures
- Protect against enumeration attacks

## Regular Security Audits

Maintain security through regular reviews:

- Periodically rotate signing secrets
- Review active sessions and invalidate old ones
- Audit authentication logs for anomalies
- Update dependencies regularly
- Test authentication flows regularly
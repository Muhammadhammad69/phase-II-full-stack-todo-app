---
name: Security Guidance
description: When addressing security vulnerabilities, implementing security measures, preventing common attacks, or following security best practices in authentication systems
version: 1.0.0
---

# Security Guidance for Better-Auth

## CSRF Protection

Cross-Site Request Forgery protection is essential:

- Use state parameters for OAuth flows
- Implement CSRF tokens for stateful sessions
- Validate origin and referer headers appropriately
- Use SameSite cookie attributes (strict or lax)
- Consider double-submit cookie pattern for stateless systems

Implementation example:
```javascript
// For OAuth flows
const csrfToken = crypto.randomBytes(32).toString('hex');
req.session.csrfToken = csrfToken;

// Verify on callback
if (req.query.state !== req.session.csrfToken) {
  throw new Error('Invalid CSRF token');
}
```

## Rate Limiting

Protect authentication endpoints from abuse:

- Implement IP-based rate limiting (typically 5-10 attempts per minute)
- Use sliding window counters for more sophisticated limits
- Apply stricter limits to sensitive endpoints (password resets, login)
- Consider adaptive rate limiting based on user behavior
- Implement account-based rate limiting in addition to IP-based

## Secure HTTP Headers

Configure security-enhancing headers:

- Strict-Transport-Security (HSTS) with appropriate max-age
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME-type confusion
- Content-Security-Policy to prevent XSS
- Referrer-Policy for privacy protection

## CORS Configuration

Secure Cross-Origin Resource Sharing:

- Only allow origins you control
- Never use wildcard (*) for credentials-enabled requests
- Validate Origin headers on server-side
- Implement preflight caching appropriately
- Consider dynamic origin validation based on environment

## SQL Injection Prevention

Protect against database query manipulation:

- Use parameterized queries or prepared statements
- Validate and sanitize all inputs
- Implement proper ORM query methods
- Use allow-lists for dynamic query construction
- Regularly audit queries for unsafe patterns

## XSS Protection

Prevent Cross-Site Scripting attacks:

- Sanitize user inputs before displaying
- Use appropriate encoding when outputting data
- Implement Content Security Policy
- Use HTTP-only cookies for sensitive data
- Validate file uploads and content types

## OWASP Top 10 - Authentication Related

Address common vulnerabilities:

### A07:2021 – Identification and Authentication Failures
- Weak authentication protocols
- Unverified email addresses during registration
- Predictable credentials
- Missing brute force protections

### A03:2021 – Injection
- LDAP injection
- ORM injection
- Expression Language injection

### A01:2021 – Broken Access Control
- Insufficient authentication checks
- Missing authorization validation
- Exposed sensitive data

## Secure Storage

Protect sensitive data at rest:

- Encrypt sensitive data in databases
- Use proper key management
- Store tokens securely (preferably in HTTP-only cookies)
- Hash sensitive identifiers
- Implement proper backup encryption

## Logging and Monitoring

Implement security monitoring:

- Log authentication events (successful/failed)
- Monitor for unusual patterns
- Alert on potential attacks
- Maintain audit trails
- Protect log integrity

## Session Security

Secure session management:

- Use secure, HttpOnly cookies
- Implement proper session timeouts
- Use cryptographically strong session identifiers
- Regenerate session IDs after privilege changes
- Implement concurrent session controls

## Certificate and Key Management

Manage cryptographic materials properly:

- Rotate signing secrets regularly
- Use strong random number generators
- Store secrets in secure vaults
- Implement proper certificate lifecycle
- Monitor for certificate expiration

## Input Validation

Validate all user inputs:

- Use allow-lists when possible
- Sanitize inputs for expected data types
- Validate lengths and formats
- Reject unexpected characters
- Implement proper error handling without information leakage
# Data Model: Better Auth Integration

## User Entity
- **email** (VARCHAR, PRIMARY KEY): User's email address for authentication
- **username** (TEXT): User's chosen username
- **id** (VARCHAR): Unique identifier for the user
- **password** (TEXT): Hashed password using bcrypt
- **created_at** (TIMESTAMP): Account creation timestamp
- **updated_at** (TIMESTAMP): Last update timestamp

### Validation Rules
- Email: Must be valid email format (using zod validation)
- Username: Required field, alphanumeric with underscores/hyphens allowed
- Password: Minimum 8 characters with at least one uppercase, lowercase, number, and special character
- Id: Auto-generated UUID or similar unique identifier

### State Transitions
- Unregistered → Registered (upon successful signup)
- Registered → Active Session (upon successful login)
- Active Session → Inactive (upon logout/expiry)

## JWT Token Entity
- **id** (String): User's unique identifier
- **email** (String): User's email address
- **exp** (Number): Expiration timestamp (7 days from issue)

### Validation Rules
- Token must be signed with JWT_SECRET_KEY
- Token must not be expired
- Token signature must be valid

## Authentication Session Entity
- **userId** (String): Reference to user.id
- **token** (String): JWT token stored in HTTP-only cookie
- **expiresAt** (Date): Session expiration time

### Validation Rules
- Session must be associated with valid user
- Token must match user's current valid session
- Session must not be expired
# Quickstart Guide: Better Auth Integration

## Setup Steps

1. **Initialize Better-Auth Plugin**
   - Run `/ba:init-auth` to initialize authentication
   - Run `/ba:validate` to verify setup

2. **Database Preparation**
   - Ensure NeonDB connection is configured with DATABASE_URL
   - Add password column to users table if not already present

3. **Environment Variables**
   - Verify JWT_SECRET_KEY is set in .env
   - Confirm JWT_ALGORITHM is set to HS256

4. **API Routes Setup**
   - Create POST /api/auth/signup endpoint
   - Create POST /api/auth/login endpoint

## Key Components

- **Validation Layer**: Zod schemas for request validation
- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Management**: Token generation and cookie storage
- **Error Handling**: Generic error messages for security

## Testing

- Run `/ba:create-user` to create test user
- Run `/ba:test-auth` to verify authentication flow
- Test signup and login flows manually
# Feature Specification: Better Auth Integration

**Feature Branch**: `001-better-auth-integration`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "002-better-auth-integeration

Must run this command /sp.specify
Branch Name: 002-better-auth-integeration

You are a senior backend and authentication architect
working in a Next.js App Router project using Spec-Driven Development (SDD).

Write a COMPLETE SPECIFICATION for adding
**Login & Signup authentication** using **Better-Auth**
in an existing Next.js project.

This specification must be detailed, secure, and production-ready.

────────────────────────────────────────
PROJECT CONTEXT
────────────────────────────────────────
Framework: Next.js (App Router)
Database: NeonDB (PostgreSQL)
Authentication: Better-Auth
Token Strategy: JWT (Cookie-based)
Package Manager: npm

────────────────────────────────────────
AUTHENTICATION OBJECTIVE
────────────────────────────────────────
Implement **Signup** and **Login** functionality such that:

- Users can create an account (signup)
- User credentials are securely stored in database
- Passwords are hashed before saving
- Users can log in using email & password
- On successful login, a JWT token is issued
- JWT token is stored in an HTTP cookie
- Proper validation & error handling is applied

────────────────────────────────────────
API ROUTES (MANDATORY)
────────────────────────────────────────

Signup Route:
- POST /api/auth/signup

Login Route:
- POST /api/auth/login

These routes must:
- Validate request payload
- Handle errors safely
- Return meaningful responses

────────────────────────────────────────
DATABASE REQUIREMENTS
────────────────────────────────────────
Database: NeonDB (PostgreSQL)

Existing users table:

- email        VARCHAR   PRIMARY KEY
- username     TEXT
- id           VARCHAR
- created_at   TIMESTAMP
- updated_at   TIMESTAMP

Required Change:
- Add a new column:
  - password TEXT (hashed)

User credentials MUST be stored securely.

────────────────────────────────────────
PASSWORD & SECURITY RULES
────────────────────────────────────────
- Use bcryptjs to hash passwords before saving
- Never store plain text passwords
- Compare hashed passwords on login
- Apply proper error handling for invalid credentials

────────────────────────────────────────
VALIDATION
────────────────────────────────────────
- Use zod for request schema validation
- Validate:
  - email format
  - password length & strength
  - required fields
- zod is already installed
- If additional libraries are required, install them using npm

────────────────────────────────────────
JWT CONFIGURATION
────────────────────────────────────────
- Use jsonwebtoken library (already installed)
- Issue JWT on successful login
- JWT payload MUST include:
  - id
  - email (or both)

JWT settings (already defined in .env):

DATABASE_URL=********
JWT_SECRET_KEY=*******
JWT_ALGORITHM=HS256

- JWT secret MUST be read from environment variables
- JWT token must be stored in cookies
- Cookie should be HTTP-only and secure (where applicable)

────────────────────────────────────────
REDIRECTION FLOW
────────────────────────────────────────
- After successful signup:
  → Redirect user to Login page

- After successful login:
  → Authentication cookie is set
  → User is considered authenticated
  → Redirect user to todos page

────────────────────────────────────────
BETTER-AUTH PLUGIN (MANDATORY)
────────────────────────────────────────
Use **better-auth-plugin** for authentication setup and workflows.

Mandatory commands to integrate in workflow:
- /ba:init-auth
- /ba:generate-config
- /ba:validate
- /ba:create-user
- /ba:test-auth
- /ba:troubleshoot (if issues arise)

Better-Auth MUST be the primary auth orchestration layer.

────────────────────────────────────────
AGENTS TO USE (STRICT)
────────────────────────────────────────
- nextjs-development-assistant
  - For App Router issues
  - API route behavior
  - Cookie handling

- neon-database-assistant
  - For NeonDB schema changes
  - SQL validation
  - Connection & migration safety

────────────────────────────────────────
ERROR HANDLING
────────────────────────────────────────
- Handle invalid input errors
- Handle duplicate email signup attempts
- Handle incorrect login credentials
- Handle database connection failures
- Never expose sensitive error details to client

────────────────────────────────────────
SPEC-KIT-PLUS REQUIREMENTS
────────────────────────────────────────
- This specification MUST be saved in spec.md
- Follow Spec-Kit-Plus structure and conventions
- Authentication decisions must be spec-driven
- No implementation code in this step

────────────────────────────────────────
OUT OF SCOPE
────────────────────────────────────────
- OAuth providers (Google, GitHub, etc.)
- Password reset or email verification
- UI design or styling changes

────────────────────────────────────────
FINAL EXPECTATION
────────────────────────────────────────
Produce a clear, structured authentication SPEC that defines:
- API behavior
- Database changes
- Security rules
- Validation strategy
- Token handling
- Better-Auth integration

IMPORTANT:
This is a SPECIFICATION ONLY.
Do NOT write implementation code."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration (Priority: P1)

A new user wants to create an account on the application by providing their email, username, and password. The user fills out a registration form and submits it to create their account.

**Why this priority**: This is the foundational functionality that allows new users to join the platform and access the application's features.

**Independent Test**: Can be fully tested by filling out a registration form with valid credentials and successfully creating a new user account in the database with hashed password.

**Acceptance Scenarios**:

1. **Given** a user is on the registration page, **When** they submit valid credentials (email, username, password), **Then** a new account is created with hashed password and they are redirected to the login page
2. **Given** a user submits invalid credentials (invalid email format, weak password), **Then** appropriate validation errors are returned and the account is not created

---

### User Story 2 - User Login (Priority: P1)

An existing user wants to log into the application using their email and password. The user enters their credentials and authenticates to access protected features.

**Why this priority**: This is the core authentication functionality that enables existing users to access the application's protected features.

**Independent Test**: Can be fully tested by submitting valid credentials and receiving a JWT token in an HTTP cookie that grants access to protected resources.

**Acceptance Scenarios**:

1. **Given** a user has a valid account, **When** they submit correct email and password, **Then** they receive a JWT token in an HTTP cookie and are redirected to the todos page
2. **Given** a user submits incorrect credentials, **When** they attempt to log in, **Then** an appropriate error message is returned and no token is issued

---

### User Story 3 - Secure Session Management (Priority: P2)

After authentication, the user's session must be maintained securely using JWT tokens stored in HTTP-only cookies to prevent unauthorized access.

**Why this priority**: Essential for maintaining security and preventing session hijacking or unauthorized access to protected resources.

**Independent Test**: Can be fully tested by verifying that JWT tokens are properly issued upon login, stored in secure cookies, and validated for subsequent requests to protected endpoints.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they make subsequent requests to protected endpoints, **Then** their JWT token is validated and they maintain access
2. **Given** a user's JWT token expires or is invalid, **When** they access protected resources, **Then** they are denied access and redirected to login

---

### Edge Cases

- What happens when a user attempts to register with an email that already exists in the system?
- How does the system handle database connection failures during authentication operations?
- What occurs when the JWT secret key is not configured properly in environment variables?
- How does the system respond when password hashing fails unexpectedly?
- What happens if the user tries to log in with malformed email or password inputs?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create accounts via email, username, and password
- **FR-002**: System MUST validate email format and password strength requirements during registration
- **FR-003**: System MUST hash passwords using bcrypt before storing in the database
- **FR-004**: System MUST store user credentials securely in the NeonDB users table
- **FR-005**: System MUST allow users to authenticate using email and password
- **FR-006**: System MUST issue JWT tokens upon successful authentication
- **FR-007**: System MUST store JWT tokens in HTTP-only secure cookies
- **FR-008**: System MUST redirect users to login page after successful registration
- **FR-009**: System MUST redirect users to todos page after successful login
- **FR-010**: System MUST validate JWT tokens for protected route access
- **FR-011**: System MUST handle duplicate email registration attempts with appropriate error messages
- **FR-012**: System MUST handle invalid login credentials with appropriate error messages
- **FR-013**: System MUST use Better-Auth as the primary authentication orchestration layer
- **FR-014**: System MUST implement proper error handling without exposing sensitive information
- **FR-015**: System MUST validate request payloads using Zod schema validation

### Key Entities

- **User**: Represents a registered user with email (primary key), username, hashed password, and timestamps
- **JWT Token**: Represents an authentication token containing user ID and email for session management
- **Authentication Session**: Represents a user's authenticated state managed through secure cookies

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully register new accounts with valid credentials in under 5 seconds
- **SC-002**: Users can successfully authenticate with valid credentials in under 3 seconds
- **SC-003**: 99% of authentication requests return appropriate responses (success or meaningful error)
- **SC-004**: Passwords are securely hashed and never stored in plain text in the database
- **SC-005**: JWT tokens are properly issued and validated for all protected route access
- **SC-006**: All authentication-related errors are handled gracefully without exposing sensitive information
- **SC-007**: Registration and login forms properly validate inputs according to defined criteria

## Clarifications

### Session 2026-01-23

- Q: What should be the exact request payload structure for the signup and login API endpoints? → A: Signup: {email, username, password}; Login: {email, password}
- Q: What should be the JWT token expiration time and cookie configuration options? → A: 7 days expiration with httpOnly=true, secure=true, sameSite='lax', maxAge=7 days
- Q: What should be the minimum password length and security rules for user passwords? → A: Minimum 8 characters with at least one uppercase, lowercase, number, and special character
- Q: What should be the strategy for error messages when authentication fails (duplicate users, invalid credentials)? → A: Generic error messages to prevent user enumeration
- Q: What should be the bcrypt salt rounds value for password hashing? → A: 12 rounds for security/performance balance

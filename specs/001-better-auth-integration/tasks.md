# 001-better-auth-integration Tasks

## Overview
This document breaks down the Better-Auth login/signup implementation into atomic, testable tasks following spec-kit-plus discipline. All work happens in `/frontend` with Better-Auth plugin commands and agents as specified.

## Phases
- **Phase 1**: Setup Better-Auth configuration
- **Phase 2**: Database preparation
- **Phase 3**: Signup API implementation
- **Phase 4**: Login API implementation
- **Phase 5**: Validation & Error handling
- **Phase 6**: Protected route validation & redirects
- **Phase 7**: Testing & verification

---

## Phase 1 — Setup Better-Auth

### Goal
Initialize Better-Auth configuration and validate setup

### Independent Test Criteria
- Better-Auth configuration files exist and are valid
- Environment variables are properly configured
- Database connection works

### Tasks

- [X] T001 Initialize Better-Auth configuration in /frontend
- [X] T002 Generate Better-Auth config files in /frontend
- [X] T003 Validate Better-Auth setup in /frontend

---

## Phase 2 — Database Preparation

### Goal
Prepare database schema with password column for user authentication

### Independent Test Criteria
- Users table has password column of type TEXT
- Database schema matches authentication requirements

### Tasks

- [X] T004 Add password column to users table in Neon PostgreSQL database

---

## Phase 3 — Signup API Implementation

### Goal
Implement signup API route with validation, password hashing, database storage, and redirect

### User Story
[US1] As a new user, I want to create an account with email, username, and password so that I can access the application

### Independent Test Criteria
- Signup API accepts email, username, and password
- Password is validated and hashed using bcryptjs
- User is stored in database with hashed password
- Zod validation rejects invalid inputs
- Redirects to login page on success
- Returns appropriate error when email already exists

### Tasks

- [X] T005 [US1] Create signup API route at /frontend/app/api/auth/signup
- [X] T006 [US1] Implement zod validation for signup input {email, username, password} in /frontend/app/api/auth/signup
- [X] T007 [US1] Hash password with bcryptjs in signup API
- [X] T008 [US1] Store user in database with hashed password in signup API
- [X] T009 [US1] Redirect user to login page after successful signup
- [X] T010 [US1] Check for duplicate email and return 409 Conflict when exists

---

## Phase 4 — Login API Implementation

### Goal
Implement login API route with validation, password comparison, JWT token issuance, and redirect

### User Story
[US2] As an existing user, I want to log in with my email and password so that I can access my account

### Independent Test Criteria
- Login API validates email and password with zod
- Password comparison works using bcryptjs
- JWT token is issued using jsonwebtoken
- JWT is stored in HTTP-only cookie with httpOnly=true, secure=true, sameSite='lax', path='/'
- Token payload contains user id and email
- Redirects to todos page on success

### Tasks

- [X] T011 [US2] Create login API route at /frontend/app/api/auth/login
- [X] T012 [US2] Implement zod validation for login input {email, password} in /frontend/app/api/auth/login
- [X] T013 [US2] Compare password using bcryptjs in login API
- [X] T014 [US2] Issue JWT token using jsonwebtoken in login API
- [X] T015 [US2] Store JWT in HTTP-only cookie with httpOnly=true, secure=true, sameSite='lax', path='/' in login API
- [X] T016 [US2] Redirect user to todos page after successful login

---

## Phase 5 — Validation & Error Handling

### Goal
Implement comprehensive input validation and error handling for auth routes

### Independent Test Criteria
- Invalid signup/login requests are rejected with proper messages
- Safe error messages are returned (generic to prevent user enumeration)
- All validation follows zod schemas
- Proper error status codes are returned

### Tasks

- [X] T017 Add error handling for signup route in /frontend/app/api/auth/signup
- [X] T018 Add error handling for login route in /frontend/app/api/auth/login

---

## Phase 6 — Protected Route Validation & Redirects

### Goal
Implement JWT validation on protected routes and proper redirect behavior

### Independent Test Criteria
- JWT tokens are validated on protected routes
- Unauthenticated users are redirected to login page
- Valid JWT tokens grant access to protected resources
- Expired/invalid tokens deny access

### Tasks

- [X] T019 Validate JWT on protected routes by reading from cookie and verifying
- [X] T020 Redirect unauthenticated users to login page on protected routes

---

## Phase 7 — Testing & Verification

### Goal
Test and verify all authentication flows work correctly

### Independent Test Criteria
- Signup and login flows work end-to-end
- Database entries are correct
- JWT is properly stored in cookie
- All auth flows are functional
- Redirect behavior works correctly
- Any issues are troubleshooted and resolved

### Tasks

- [X] T021 Test signup flow using /ba:test-auth
- [X] T022 Test login flow using /ba:test-auth
- [X] T023 Verify JWT issuance and cookie setting with proper attributes
- [X] T024 Test redirect behavior after signup and login
- [X] T025 Verify JWT validation on protected routes
- [X] T026 Troubleshoot any authentication issues using /ba:troubleshoot
- [X] T027 Verify database entries for users

---

## Dependencies
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phases 3 and 4
- Phases 3 and 4 can run in parallel
- Phase 5 depends on completion of Phases 3 and 4
- Phase 6 depends on completion of Phase 4
- Phase 7 depends on completion of Phases 3, 4, 5, and 6

## Parallel Opportunities
- [P] Tasks T001-T003 in Phase 1 can run sequentially as setup
- [P] Tasks T011-T016 in Phase 4 can run in parallel with Tasks T005-T010 in Phase 3
- [P] Tasks T017-T018 in Phase 5 can run in parallel after Phases 3 and 4 complete
- [P] Tasks T019-T020 in Phase 6 can run in parallel after Phase 4 completes
- [P] Tasks T021-T027 in Phase 7 can run in parallel after dependencies are met

## Implementation Strategy
1. Start with MVP (just basic signup/login functionality)
2. Add validation and error handling
3. Implement JWT validation on protected routes
4. Complete testing and verification
5. Deliver incrementally with each phase being independently testable
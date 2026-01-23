# 001-better-auth-integration Tasks

## Overview
This document breaks down the Better-Auth login/signup implementation into atomic, testable tasks following spec-kit-plus discipline. All work happens in `/frontend` with Better-Auth plugin commands and agents as specified.

## Phases
- **Phase 1**: Setup Better-Auth configuration
- **Phase 2**: Database preparation
- **Phase 3**: Signup API implementation
- **Phase 4**: Login API implementation
- **Phase 5**: Validation & Error handling
- **Phase 6**: Testing & verification

---

## Phase 1 — Setup Better-Auth

### Goal
Initialize Better-Auth configuration and validate setup

### Independent Test Criteria
- Better-Auth configuration files exist and are valid
- Environment variables are properly configured
- Database connection works

### Tasks

- [ ] T001 Initialize Better-Auth configuration in /frontend
- [ ] T002 Generate Better-Auth config files in /frontend
- [ ] T003 Validate Better-Auth setup in /frontend

---

## Phase 2 — Database Preparation

### Goal
Prepare database schema with password column for user authentication

### Independent Test Criteria
- Users table has password column of type TEXT
- Database schema matches authentication requirements

### Tasks

- [ ] T004 Add password column to users table in Neon PostgreSQL database

---

## Phase 3 — Signup API Implementation

### Goal
Implement signup API route with validation, password hashing, and database storage

### User Story
[US1] As a new user, I want to create an account with email and password so that I can access the application

### Independent Test Criteria
- Signup API accepts email and password
- Password is validated and hashed using bcryptjs
- User is stored in database with hashed password
- Zod validation rejects invalid inputs
- Redirects to login page on success

### Tasks

- [ ] T005 [US1] Create signup API route at /frontend/app/api/auth/signup
- [ ] T006 [US1] Implement zod validation for signup input in /frontend/app/api/auth/signup
- [ ] T007 [US1] Hash password with bcryptjs in signup API
- [ ] T008 [US1] Store user in database with hashed password in signup API

---

## Phase 4 — Login API Implementation

### Goal
Implement login API route with validation, password comparison, and JWT token issuance

### User Story
[US2] As an existing user, I want to log in with my email and password so that I can access my account

### Independent Test Criteria
- Login API validates email and password with zod
- Password comparison works using bcryptjs
- JWT token is issued using jsonwebtoken
- JWT is stored in HTTP-only cookie
- Token payload contains user id and email

### Tasks

- [ ] T009 [US2] Create login API route at /frontend/app/api/auth/login
- [ ] T010 [US2] Implement zod validation for login input in /frontend/app/api/auth/login
- [ ] T011 [US2] Compare password using bcryptjs in login API
- [ ] T012 [US2] Issue JWT token using jsonwebtoken in login API
- [ ] T013 [US2] Store JWT in HTTP-only cookie in login API

---

## Phase 5 — Validation & Error Handling

### Goal
Implement comprehensive input validation and error handling for auth routes

### Independent Test Criteria
- Invalid signup/login requests are rejected with proper messages
- Duplicate email prevention works
- Safe error messages are returned
- All validation follows zod schemas

### Tasks

- [ ] T014 Implement zod validation for signup in /frontend/app/api/auth/signup
- [ ] T015 Implement zod validation for login in /frontend/app/api/auth/login
- [ ] T016 Add error handling for signup route in /frontend/app/api/auth/signup
- [ ] T017 Add error handling for login route in /frontend/app/api/auth/login
- [ ] T018 Prevent duplicate emails in signup process

---

## Phase 6 — Testing & Verification

### Goal
Test and verify all authentication flows work correctly

### Independent Test Criteria
- Signup and login flows work end-to-end
- Database entries are correct
- JWT is properly stored in cookie
- All auth flows are functional
- Any issues are troubleshooted and resolved

### Tasks

- [ ] T019 Test signup flow using /ba:test-auth
- [ ] T020 Test login flow using /ba:test-auth
- [ ] T021 Verify JWT issuance and cookie setting
- [ ] T022 Troubleshoot any authentication issues using /ba:troubleshoot
- [ ] T023 Verify database entries for users

---

## Dependencies
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phases 3 and 4
- Phases 3 and 4 can run in parallel
- Phase 5 depends on completion of Phases 3 and 4
- Phase 6 depends on completion of Phase 5

## Parallel Opportunities
- [P] Tasks T001-T003 in Phase 1 can run sequentially as setup
- [P] Tasks T009-T013 in Phase 4 can run in parallel with Tasks T005-T008 in Phase 3
- [P] Tasks T014-T018 in Phase 5 can be parallelized
- [P] Tasks T019-T023 in Phase 6 can run in parallel after dependencies are met

## Implementation Strategy
1. Start with MVP (just basic signup/login functionality)
2. Add validation and error handling
3. Complete testing and verification
4. Deliver incrementally with each phase being independently testable
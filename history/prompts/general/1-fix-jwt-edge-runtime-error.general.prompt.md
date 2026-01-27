---
id: 1
title: Fix JWT Edge Runtime Error
stage: general
date: 2026-01-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-better-auth-integration
user: claude
command: fix-jwt-edge-runtime-error
labels: ["jwt", "edge-runtime", "authentication", "middleware"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - frontend/lib/auth/jwt.ts
 - frontend/middleware/auth.ts
 - frontend/middleware.ts
 - frontend/app/api/auth/login/route.ts
tests:
 - none
---

## Prompt

JWT verification error: Error: The edge runtime does not support Node.js 'crypto' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime
    at verifyToken (phase-2-todo-app\frontend\lib\auth\jwt.ts:31:25)
    at authenticateRequest (phase-2-todo-app\frontend\middleware\auth.ts:14:30)
    at middleware (phase-2-todo-app\frontend\middleware.ts:16:48)

Resolve the JWT verification error that occurs in the Next.js Edge Runtime because the jsonwebtoken library relies on Node.js crypto module which is not available in Edge Runtime.

## Response snapshot

Fixed the JWT verification error by replacing the `jsonwebtoken` library with the `jose` library, which is compatible with Next.js Edge Runtime. The changes made were:

1. Updated `frontend/lib/auth/jwt.ts` to use `jose` library instead of `jsonwebtoken`:
   - Replaced `jwt.sign()` with `SignJWT` class from `jose`
   - Replaced `jwt.verify()` with `jwtVerify` function from `jose`
   - Made functions async to comply with `jose` API
   - Added proper encoding of the secret key

2. Updated `frontend/middleware/auth.ts` to handle async JWT verification:
   - Made `authenticateRequest` function async
   - Added `await` when calling `verifyToken`

3. Updated `frontend/middleware.ts` to handle async middleware:
   - Made middleware function async
   - Added `await` when calling `authenticateRequest`

4. Updated `frontend/app/api/auth/login/route.ts` to handle async JWT signing:
   - Added `await` when calling `signToken`

These changes ensure that the JWT functionality works properly in the Next.js Edge Runtime without relying on Node.js-specific modules.

## Outcome

- ✅ Impact: Fixed JWT verification error in Edge Runtime
- 🧪 Tests: none
- 📁 Files: 4 files updated to use jose library
- 🔁 Next prompts: None needed
- 🧠 Reflection: Using the jose library is the correct approach for Edge Runtime compatibility

## Evaluation notes (flywheel)

- Failure modes observed: Edge Runtime error due to Node.js crypto module usage
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
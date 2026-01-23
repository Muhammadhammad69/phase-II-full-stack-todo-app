---
name: ba:create-user
description: Create new users with customizable properties including email, name, password, role, and metadata
allowed-tools: [Write, Read, Bash]
---

# Better-Auth User Creation Command

This command creates new users with customizable properties including email, name, password, role, and metadata.

## What This Command Does

1. Prompts for user details (email, name, password)
2. Optionally assigns user roles (admin, user, moderator)
3. Sets email verification status
4. Adds custom metadata/fields
5. Creates the user in the configured database
6. Optionally sends welcome/verification email

## Required Parameters

- Email (required): User's email address
- Name (required): User's full name
- Password (required): User's password (will be securely hashed)

## Optional Parameters

- Role: Assign user role (admin, user, moderator, or custom role)
- Email Verified: Set initial email verification status (true/false)
- Metadata: Add custom fields and properties to user record

## User Creation Process

### Basic User Creation

```typescript
import { auth } from './auth.config';

// Create a user with minimal information
const newUser = await auth.api.signUp({
  body: {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'securePassword123',
  },
});
```

### Advanced User Creation with Role and Metadata

```typescript
// Create a user with role and custom metadata
const newUserWithRole = await auth.api.signUp({
  body: {
    email: 'admin@example.com',
    name: 'Jane Admin',
    password: 'securePassword123',
    role: 'admin', // if your schema supports roles
    metadata: {
      department: 'engineering',
      joinDate: new Date().toISOString(),
      preferences: {
        newsletter: true,
        notifications: ['email', 'push'],
      },
    },
  },
});
```

## Role Assignment

This command supports role-based access control:

- Admin: Full system access
- Moderator: Content moderation privileges
- User: Standard user privileges
- Custom roles: Defined per application needs

### Example Role-Based Logic

```typescript
// Check user role in your application
function checkPermission(user, requiredRole) {
  const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'admin': 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
```

## Email Verification Status

Control initial email verification status:

- `verified: true`: User can immediately access restricted features
- `verified: false`: User must verify email before full access (default)

```typescript
// Manually set verification status (if your schema allows)
const userWithVerifiedStatus = await auth.api.signUp({
  body: {
    email: 'verified@example.com',
    name: 'Verified User',
    password: 'securePassword123',
    emailVerified: true, // Skip verification step
  },
});
```

## Custom Metadata

Add custom fields to user records:

```typescript
const userWithMetadata = await auth.api.signUp({
  body: {
    email: 'employee@example.com',
    name: 'Employee Name',
    password: 'securePassword123',
    metadata: {
      employeeId: 'EMP001',
      department: 'Sales',
      manager: 'manager@example.com',
      startDate: '2023-01-15',
      permissions: ['read', 'write'],
    },
  },
});
```

## User Validation

This command performs the following validations:

1. Email format validation
2. Password strength requirements
3. Duplicate email checking
4. Required field verification
5. Role assignment validation

## Bulk User Creation

For creating multiple users, you can use this pattern:

```typescript
const usersData = [
  { email: 'user1@example.com', name: 'User One', password: 'pass1' },
  { email: 'user2@example.com', name: 'User Two', password: 'pass2' },
  // ... more users
];

const createdUsers = [];
for (const userData of usersData) {
  try {
    const user = await auth.api.signUp({ body: userData });
    createdUsers.push(user);
  } catch (error) {
    console.error(`Failed to create user ${userData.email}:`, error.message);
  }
}
```

## Security Considerations

- Passwords are automatically hashed using industry-standard algorithms
- Email addresses are validated for proper format
- User input is sanitized to prevent injection attacks
- Rate limiting may apply to prevent abuse

## Error Handling

Common errors this command handles:

- Duplicate email: "User with this email already exists"
- Invalid email: "Invalid email format"
- Weak password: "Password does not meet requirements"
- Missing required fields: "Missing required field: [field name]"

## Next Steps After User Creation

1. Verify user was created successfully in the database
2. Check that user receives appropriate welcome/verification email
3. Confirm assigned role has correct permissions
4. Test login with the new user credentials
5. Verify custom metadata was saved correctly
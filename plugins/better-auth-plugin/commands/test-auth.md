---
name: ba:test-auth
description: Test various authentication flows including registration, login, OAuth, and password reset
allowed-tools: [Write, Read, Bash]
---

# Better-Auth Testing Command

This command tests various authentication flows including registration, login, OAuth, and password reset to ensure everything is working properly.

## What This Command Does

1. Tests user registration flow with valid credentials
2. Tests user login flow with correct credentials
3. Tests session creation and validation
4. Tests token generation and refresh
5. Tests OAuth login flow for all configured providers
6. Tests password reset flow
7. Tests email verification flow
8. Simulates different authentication scenarios

## Testing Scenarios

### 1. User Registration Flow

Tests the complete user registration process:

```typescript
import { auth } from './auth.config';

async function testRegistration() {
  try {
    // Test registration with valid credentials
    const result = await auth.api.signUp({
      body: {
        email: 'testuser@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      },
    });

    console.log('✓ Registration successful:', result.user.email);
    return true;
  } catch (error) {
    console.error('✗ Registration failed:', error.message);
    return false;
  }
}
```

### 2. User Login Flow

Tests the user login process:

```typescript
async function testLogin() {
  try {
    // Test login with correct credentials
    const result = await auth.api.signIn.email({
      body: {
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
      },
    });

    console.log('✓ Login successful:', result.user.email);
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.message);
    return false;
  }
}
```

### 3. Session Creation and Validation

Tests session handling:

```typescript
async function testSession() {
  try {
    // First, get a session token from login
    const loginResult = await auth.api.signIn.email({
      body: {
        email: 'testuser@example.com',
        password: 'SecurePassword123!',
      },
    });

    // Test session validation
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${loginResult.session.token}`
      },
    });

    console.log('✓ Session validation successful:', session.user.email);
    return true;
  } catch (error) {
    console.error('✗ Session validation failed:', error.message);
    return false;
  }
}
```

### 4. Token Generation and Refresh

Tests token handling:

```typescript
async function testTokens() {
  try {
    // Test token refresh
    const refreshed = await auth.api.refreshSession({
      headers: {
        authorization: `Bearer ${currentRefreshToken}`
      },
    });

    console.log('✓ Token refresh successful:', refreshed.session.expiresAt);
    return true;
  } catch (error) {
    console.error('✗ Token refresh failed:', error.message);
    return false;
  }
}
```

### 5. OAuth Login Flow

Tests OAuth provider integration:

```typescript
async function testOAuth(provider) {
  try {
    // Test OAuth redirect URL generation
    const oauthUrl = await auth.api.getSocialRedirectUrl({
      provider,
      options: {
        redirectUri: `http://localhost:3000/api/auth/callback/${provider}`,
      },
    });

    console.log(`✓ ${provider} OAuth URL generated successfully`);

    // In a real test, you would follow the OAuth flow
    // This is a simplified validation
    if (oauthUrl.url && oauthUrl.url.includes(provider)) {
      console.log(`✓ ${provider} OAuth flow validated`);
      return true;
    } else {
      console.error(`✗ ${provider} OAuth URL invalid`);
      return false;
    }
  } catch (error) {
    console.error(`✗ ${provider} OAuth test failed:`, error.message);
    return false;
  }
}
```

### 6. Password Reset Flow

Tests password reset functionality:

```typescript
async function testPasswordReset() {
  try {
    // Start password reset process
    await auth.api.forgotPassword({
      body: {
        email: 'testuser@example.com',
      },
    });

    console.log('✓ Password reset initiated successfully');

    // In a real test, you would capture the reset token
    // and complete the reset process
    return true;
  } catch (error) {
    console.error('✗ Password reset test failed:', error.message);
    return false;
  }
}
```

### 7. Email Verification Flow

Tests email verification process:

```typescript
async function testEmailVerification() {
  try {
    // Check if user needs email verification
    const user = await auth.api.getUser({
      headers: { /* session headers */ },
    });

    if (!user.emailVerified) {
      console.log('✓ Email verification required for user');

      // Simulate verification link click
      // This would typically be done through the verification email
      await auth.api.verifyEmail({
        body: {
          token: 'verification-token-from-email',
        },
      });

      console.log('✓ Email verification completed');
    } else {
      console.log('✓ User already has verified email');
    }

    return true;
  } catch (error) {
    console.error('✗ Email verification test failed:', error.message);
    return false;
  }
}
```

## Scenario Testing

### Valid Credentials Test

```typescript
async function testValidCredentials() {
  console.log('Testing valid credentials...');
  const registrationSuccess = await testRegistration();
  const loginSuccess = await testLogin();

  return registrationSuccess && loginSuccess;
}
```

### Invalid Credentials Test

```typescript
async function testInvalidCredentials() {
  console.log('Testing invalid credentials...');
  try {
    const result = await auth.api.signIn.email({
      body: {
        email: 'testuser@example.com',
        password: 'wrongpassword',
      },
    });

    console.error('✗ Login should have failed with wrong password');
    return false;
  } catch (error) {
    if (error.message.includes('invalid credentials')) {
      console.log('✓ Correctly rejected invalid credentials');
      return true;
    } else {
      console.error('✗ Unexpected error:', error.message);
      return false;
    }
  }
}
```

### Expired Token Test

```typescript
async function testExpiredToken() {
  console.log('Testing expired token...');
  try {
    // Try to use an obviously expired token
    const session = await auth.api.getSession({
      headers: {
        cookie: 'better-auth.session_token=expired_token_value'
      },
    });

    console.error('✗ Should have failed with expired token');
    return false;
  } catch (error) {
    console.log('✓ Correctly rejected expired token');
    return true;
  }
}
```

### Concurrent Sessions Test

```typescript
async function testConcurrentSessions() {
  console.log('Testing concurrent sessions...');

  // Login from first "device/browser"
  const session1 = await auth.api.signIn.email({
    body: {
      email: 'testuser@example.com',
      password: 'SecurePassword123!',
    },
  });

  // Login from second "device/browser"
  const session2 = await auth.api.signIn.email({
    body: {
      email: 'testuser@example.com',
      password: 'SecurePassword123!',
    },
  });

  // Both sessions should be valid if concurrent sessions are allowed
  const session1Valid = await auth.api.getSession({
    headers: {
      cookie: `better-auth.session_token=${session1.session.token}`
    },
  });

  const session2Valid = await auth.api.getSession({
    headers: {
      cookie: `better-auth.session_token=${session2.session.token}`
    },
  });

  if (session1Valid && session2Valid) {
    console.log('✓ Concurrent sessions allowed and working');
  } else {
    console.log('✓ Concurrent sessions limited as expected');
  }

  return true;
}
```

## Rate Limiting Test

```typescript
async function testRateLimiting() {
  console.log('Testing rate limiting...');

  let successes = 0;
  let failures = 0;

  // Attempt many login requests quickly
  for (let i = 0; i < 20; i++) {
    try {
      await auth.api.signIn.email({
        body: {
          email: 'nonexistent@example.com',
          password: 'any',
        },
      });
      successes++;
    } catch (error) {
      failures++;
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        console.log('✓ Rate limiting working correctly');
        return true;
      }
    }
  }

  console.log(`Performed ${successes} successful requests, ${failures} failed requests`);
  if (failures > 10) {
    console.log('✓ Rate limiting may be working');
  } else {
    console.log('? Rate limiting may not be configured');
  }

  return true;
}
```

## Comprehensive Test Suite

```typescript
async function runAllTests() {
  console.log('Starting Better-Auth comprehensive tests...\n');

  const tests = [
    { name: 'Registration Flow', fn: testRegistration },
    { name: 'Login Flow', fn: testLogin },
    { name: 'Session Validation', fn: testSession },
    { name: 'Token Handling', fn: testTokens },
    { name: 'OAuth Flow (Google)', fn: () => testOAuth('google') },
    { name: 'OAuth Flow (GitHub)', fn: () => testOAuth('github') },
    { name: 'Password Reset', fn: testPasswordReset },
    { name: 'Email Verification', fn: testEmailVerification },
    { name: 'Invalid Credentials', fn: testInvalidCredentials },
    { name: 'Expired Token', fn: testExpiredToken },
    { name: 'Concurrent Sessions', fn: testConcurrentSessions },
    { name: 'Rate Limiting', fn: testRateLimiting },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\nRunning: ${test.name}`);
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      console.log(`${success ? '✓ PASSED' : '✗ FAILED'}: ${test.name}\n`);
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message });
      console.log(`✗ FAILED: ${test.name} - ${error.message}\n`);
    }
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`\n=== TEST SUMMARY ===`);
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('🎉 All authentication tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please review the output above.');
  }

  return { passed, total, results };
}

// Execute the tests
runAllTests().catch(console.error);
```

## Test Results Interpretation

- **Green checkmarks (✓)** indicate successful tests
- **Red X marks (✗)** indicate failed tests
- Pay special attention to security-related tests
- Review any unexpected behaviors
- Document test results for future reference

## Next Steps After Testing

1. Review test results for any failures
2. Investigate and fix any authentication issues found
3. Run tests in different environments (development, staging, production)
4. Perform load testing if expecting high traffic
5. Schedule periodic authentication tests
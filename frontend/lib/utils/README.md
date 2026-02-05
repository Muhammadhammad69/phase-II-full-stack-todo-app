# Authentication Utilities

This folder contains utility functions for handling authentication in the frontend application.

## Files

### `cookieUtils.ts`
Provides utility functions for handling cookies in the browser, including:
- `getCookie(name)` - Get a cookie value by name
- `setCookie(name, value, options)` - Set a cookie with the given name, value, and options
- `deleteCookie(name, path, domain)` - Delete a cookie by name
- `getAuthToken()` - Get the JWT token from cookies (specifically looks for 'auth_token')
- `verifyAuthToken()` - Verify if the auth token exists and is valid
- `checkAuthAndRedirect(redirectPath)` - Check if user is authenticated and redirect to login if not
- `clearAuthTokens()` - Remove authentication tokens from cookies

### `authCheck.ts`
Provides helper functions for authentication checks:
- `checkAuthAndRedirect(redirectPath)` - Check if user is authenticated and redirect to login if not
- `isAuthenticated()` - Verify if the auth token exists and is valid
- `getAuthToken()` - Get the auth token from cookies

### `withAuthProtection.tsx`
Provides React utilities for protecting components:
- `withAuthProtection(WrappedComponent, redirectPath)` - Higher-order component that protects a component by checking authentication
- `useAuthCheck(redirectPath)` - Custom hook to check authentication status in components

## Usage Examples

### In a client-side component:
```typescript
import { useEffect } from 'react';
import { cookieUtils } from '@/lib/utils/cookieUtils';

const MyComponent = () => {
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await cookieUtils.verifyAuthToken();
      if (!isAuthenticated) {
        // Redirect to login
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  return <div>Protected Content</div>;
};
```

### Using the custom hook:
```typescript
import { useAuthCheck } from '@/lib/utils/withAuthProtection';

const ProtectedComponent = () => {
  const { loading, authenticated } = useAuthCheck('/login');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null; // Will redirect automatically
  }

  return <div>Protected Content</div>;
};
```

### Using the HOC:
```typescript
import { withAuthProtection } from '@/lib/utils/withAuthProtection';

const MyComponent = () => {
  return <div>Protected Content</div>;
};

export default withAuthProtection(MyComponent, '/login');
```

## Authentication Flow

1. User logs in via the `/api/auth/login` route
2. Server sets an HTTP-only cookie named `auth_token` with the JWT
3. Client-side code can verify the token using the utilities in this folder
4. If token is invalid or missing, user is redirected to the login page
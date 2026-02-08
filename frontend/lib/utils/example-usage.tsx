// Example usage of the new auth utilities in a component

'use client';

import { useEffect, useState } from 'react';
import { cookieUtils } from '@/lib/utils/cookieUtils';

const ExampleProtectedComponent = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the auth_token cookie exists and is valid
        const isAuthenticated = await cookieUtils.verifyAuthToken();

        if (!isAuthenticated) {
          // If not authenticated, redirect to login
          // This will happen automatically when the checkAuthAndRedirect function is called
          await cookieUtils.checkAuthAndRedirect('/login');
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Redirect to login on error as well
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  if (!hasAccess) {
    return null; // Component will redirect before rendering anything
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>You can see this content because you are authenticated!</p>
    </div>
  );
};

export default ExampleProtectedComponent;
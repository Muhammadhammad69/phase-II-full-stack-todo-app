// frontend/src/components/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { authService, AuthService } from '../api/AuthService';
import { useAuth as useOriginalAuth } from '../contexts/AuthContext';

interface UseAuthState {
  user: { email: string; name?: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends UseAuthState {
  login: (email: string, password: string) => Promise<{ message: string; success: boolean }>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ message: string; success: boolean }>;
  validateAuthState: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

/**
 * Custom hook for authentication state management
 * This wraps the existing AuthContext to provide additional authentication utilities
 */
export function useAuth(): UseAuthReturn {
  // Use the existing AuthContext
  const originalAuth = useOriginalAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate the current auth state
  const validateAuthState = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await authService.validateSession();
      return isValid;
    } catch (err) {
      console.error('Error validating auth state:', err);
      return false;
    }
  }, []);

  // Refresh token if needed
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshed = await authService.refreshToken();
      return refreshed;
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh token');
      return false;
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Validate the current session
        const isValid = await authService.validateSession();
        if (!isValid && originalAuth.user) {
          // If session is invalid but we have a user in context, clear it
          await originalAuth.logout();
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return combined auth state and functions
  return {
    user: originalAuth.user,
    isAuthenticated: originalAuth.isAuthenticated && AuthService.isTokenValid(),
    isLoading: originalAuth.isLoading || isLoading,
    error: originalAuth.error || error,
    login: originalAuth.login,
    logout: originalAuth.logout,
    signup: originalAuth.signup,
    validateAuthState,
    refreshToken,
  };
}
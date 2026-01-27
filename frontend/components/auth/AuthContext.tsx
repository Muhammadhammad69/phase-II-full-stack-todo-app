'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default credentials as specified in requirements
const DEFAULT_CREDENTIALS = {
  email: 'hammad@gmail.com',
  password: 'hammad123'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Check if user is logged in by verifying the auth cookie with the server
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        if (response.ok) {
          const { user: userData } = await response.json();
          if (userData) {
            setUser(userData);
            // Optionally save to localStorage for UI persistence
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } else {
          // If not authenticated, clear any local data
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // If there's an error checking auth status, clear local data
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        const userData = { email, name: email.split('@')[0] }; // Extract name from email
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        setIsLoading(false);
        return true;
      } else {
        // Login failed - set error message
        setError(data.error || 'Login failed. Please try again.');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username: name, password }), // Use 'username' to match API schema
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful - don't save user to localStorage on signup, only on login
        // The user will need to login after signup
        setIsLoading(false);
        return true;
      } else {
        // Signup failed - set error message
        setError(data.error || 'Signup failed. Please try again.');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call the logout API to remove the auth_token cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.refresh();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear user data from context and localStorage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
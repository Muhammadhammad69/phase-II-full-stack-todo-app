'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth/auth';
interface ApiResponse {
  message: string;
  success: boolean;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<ApiResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default credentials as specified in requirements


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const {setError: setTasksError} = useTasks();
  // const [state, dispatch] = useReducer(tasksReducer, initialState);
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

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    setIsLoading(true);
    setError('');
    let data: ApiResponse = { message: 'Login failed! Please try again later.', success: false };
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      data = await response.json();
      
      if (response.ok) {
        // Login successful
     
        const userData = data.user!; // Extract user data from response
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        setIsLoading(false);
        
      } else {
        // Login failed - set error message
        setError('Login failed. Please try again.');
        setIsLoading(false);
        
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      setIsLoading(false);
      
    } finally {
      return data;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<ApiResponse> => {
    setIsLoading(true);
    setError('');
    let data: ApiResponse = { message: 'Signup failed! Please try again later.', success: false };
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username: name, password }), // Use 'username' to match API schema
      });

      data = await response.json();

      if (response.ok) {
        // Signup successful - don't save user to localStorage on signup, only on login
        // The user will need to login after signup
        setIsLoading(false);
        
      } else {
        // Signup failed - set error message
        setError("Signup failed. Please try again.");
        setIsLoading(false);
        
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
      setIsLoading(false);
      
    }finally {
      return data
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
      // setTasksError(null);
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

export { AuthContext };
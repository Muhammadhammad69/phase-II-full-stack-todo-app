'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulated authentication with hardcoded credentials
    if (email === DEFAULT_CREDENTIALS.email && password === DEFAULT_CREDENTIALS.password) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const userData = { email, name: email.split('@')[0] }; // Extract name from email
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      setIsLoading(false);
      return true;
    } else {
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo purposes, we'll treat signup as successful
    // In a real app, you'd validate and create the user
    const userData = { email, name };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
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
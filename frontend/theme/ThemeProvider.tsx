'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { theme, cssVariables } from '@/theme/config';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useEffect(() => {
    // Apply CSS custom properties to the root element
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value as string);
    });
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
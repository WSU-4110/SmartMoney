import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

interface ThemeContextType {
  theme: typeof DefaultTheme; // Use a more specific type if needed
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  value: ThemeContextType; // Specify that value is required
}

// Define the ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, value }) => {
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

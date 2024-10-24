import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

interface ThemeContextType {
  theme: typeof DefaultTheme; 
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  value: ThemeContextType; 
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, value }) => {
  return (
    <ThemeContext.Provider value={value}>
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

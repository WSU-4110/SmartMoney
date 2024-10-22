import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

interface ThemeContextType {
  theme: any; // You can use a more specific type if needed
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


export const ThemeProvider = ({ children, value }: { children: ReactNode; value: ThemeContextType }) => {
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

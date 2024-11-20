import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: typeof DefaultTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, toggleTheme } = usePersistedTheme();
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

const THEME_STORAGE_KEY = 'appTheme';

export const usePersistedTheme = () => {
  const [theme, setTheme] = useState(DefaultTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme === 'dark' ? DarkTheme : DefaultTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme.dark ? DefaultTheme : DarkTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.dark ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

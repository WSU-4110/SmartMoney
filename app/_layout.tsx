import React, { useEffect, useState } from 'react';
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './themeContext'; // Ensure this path is correct

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [theme, setTheme] = useState(DefaultTheme); // Initialize theme state
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.dark ? DefaultTheme : DarkTheme));
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Ensure all hooks are called regardless of loading state
  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <NavigationThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

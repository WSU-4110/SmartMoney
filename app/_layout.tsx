import React, { useEffect, useState } from 'react';
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './themeContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { AuthProvider } from './auth/AuthProvider';
import { useAuthProtection } from '@/hooks/useAuthProtection';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auth protection wrapper component
function AuthCheck({ children }: { children: React.ReactNode }) {
  useAuthProtection();
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [theme, setTheme] = useState(DefaultTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.dark ? DefaultTheme : DarkTheme));
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <NavigationThemeProvider value={theme}>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style={theme.dark ? 'light' : 'dark'} />
            <AuthCheck>
              <Stack>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </AuthCheck>
          </SafeAreaProvider>
        </AuthProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
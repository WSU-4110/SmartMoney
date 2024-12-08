import React, { useEffect } from 'react';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, usePersistedTheme } from './themeContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../components/auth/AuthProvider';
import { useAuthProtection } from '@/hooks/useAuthProtection';

SplashScreen.preventAutoHideAsync();

function AuthCheck({ children }: { children: React.ReactNode }) {
  useAuthProtection();
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { theme, toggleTheme } = usePersistedTheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
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

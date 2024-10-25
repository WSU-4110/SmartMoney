import React, { useEffect, useState } from 'react'; 
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './themeContext'; 
import { StatusBar } from 'expo-status-bar'; // Correct import
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

  return (
    <ThemeProvider value={{ theme, toggleTheme }}>
      <NavigationThemeProvider value={theme}>
        <StatusBar 
          style={theme.dark ? 'light' : 'dark'} // Use 'light' and 'dark' for expo-status-bar
        />
        <SafeAreaProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
        </SafeAreaProvider>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

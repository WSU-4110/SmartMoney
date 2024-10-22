import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../themeContext'; // Import ThemeProvider and useTheme

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme, toggleTheme } = useTheme(); // Use the theme and toggleTheme function here

  return (
    <ThemeProvider value={{ theme, toggleTheme }}> {/* Wrap Tabs inside ThemeProvider */}
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
            position: 'absolute',
            bottom: 40,
            justifyContent: 'center',
            alignSelf: 'center',
            height: 70,
            marginHorizontal: 40,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 40,
            paddingVertical: 8,
            borderWidth: 1,
            borderTopWidth: 1,
            borderColor: colorScheme === 'dark' ? Colors.light.primary : Colors.light.primary,
            borderTopColor: colorScheme === 'dark' ? Colors.light.primary : Colors.light.primary,
          },

          tabBarShowLabel: false,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}>

        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'bank' : 'bank-outline'} size={30} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="accountDetails"
          options={{
            title: 'Data',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'pie-chart' : 'pie-chart-outline'} size={30} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} size={30} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="budgetPlanner"
          options={{
            title: 'Advanced Data',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} size={30} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome name={focused ? 'user' : 'user-o'} size={30} color={color} />
            ),
          }}
        />

      </Tabs>
    </ThemeProvider>
  );
}

import React, { FC } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../themeContext'; // Adjust the path based on your structure

const SettingsPage: FC = () => {
  const { theme, toggleTheme } = useTheme(); // Get the theme and toggleTheme function
  const currentColors = Colors[theme.dark ? 'dark' : 'light']; // Update this line to use theme

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Settings</Text>

        {/* Appearance Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: currentColors.text }]}>Appearance</Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>Dark Mode</Text>
            <Switch
              value={theme.dark} // Use theme.dark here
              onValueChange={toggleTheme} // Use toggleTheme here
              thumbColor={theme.dark ? currentColors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: currentColors.primary }}
            />
          </View>
        </View>

        {/* Other sections remain unchanged... */}
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingText: {
    fontSize: 16,
  },
  settingSubText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    marginTop: 40,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
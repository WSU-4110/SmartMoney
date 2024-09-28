import React, { FC, useState } from 'react';
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
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';

const SettingsPage: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  //state for toggles
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((previousState) => !previousState);
    //logic to switch the app theme will be added here
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((previousState) => !previousState);
    //logic to enable/disable notifications will be added here
  };

  const toggleBiometrics = () => {
    setBiometricsEnabled((previousState) => !previousState);
    //logic to enable/disable biometrics will be added here
  };

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
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              thumbColor={isDarkMode ? currentColors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: currentColors.primary }}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: currentColors.text }]}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>
              Enable Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              thumbColor={notificationsEnabled ? currentColors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: currentColors.primary }}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: currentColors.text }]}>Security</Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>Use Biometrics</Text>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              thumbColor={biometricsEnabled ? currentColors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: currentColors.primary }}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: currentColors.text }]}>Account</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>
              Change Password
            </Text>
            <FontAwesome name="angle-right" size={24} color={currentColors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>
              Privacy Settings
            </Text>
            <FontAwesome name="angle-right" size={24} color={currentColors.icon} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: currentColors.text }]}>About</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>Terms of Service</Text>
            <FontAwesome name="angle-right" size={24} color={currentColors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>Privacy Policy</Text>
            <FontAwesome name="angle-right" size={24} color={currentColors.icon} />
          </TouchableOpacity>
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>App Version</Text>
            <Text style={[styles.settingSubText, { color: currentColors.secondary }]}>1.0.0</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: currentColors.accent }]}
        >
          <Text style={[styles.logoutButtonText, { color: currentColors.background }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 90
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

export default SettingsPage;
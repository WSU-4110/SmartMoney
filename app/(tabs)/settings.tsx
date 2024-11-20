import React, { useState } from 'react';
import { View, Text, Switch, Pressable, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../themeContext';
import { useAuth } from '@/app/auth/AuthProvider';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleBiometrics = () => setBiometricsEnabled(!biometricsEnabled);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Text>Dark Mode</Text>
          <Switch
            value={theme.dark}
            onValueChange={toggleTheme}
            thumbColor={theme.dark ? '#000' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#023c69' }}
            accessibilityLabel="Dark Mode"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            thumbColor={notificationsEnabled ? '#000' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#023c69' }}
            accessibilityLabel="Enable Notifications"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.row}>
          <Text>Use Biometrics</Text>
          <Switch
            value={biometricsEnabled}
            onValueChange={toggleBiometrics}
            thumbColor={biometricsEnabled ? '#000' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#023c69' }}
            accessibilityLabel="Use Biometrics"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <Text>App Version</Text>
          <Text>1.0.0</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report</Text>
        <Text>Report an issue</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SettingsPage;
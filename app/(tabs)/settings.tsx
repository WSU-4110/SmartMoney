import React, { FC, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/app/auth/AuthProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { NotificationManager } from '@/utils/NotificationManager';

const SettingsPage: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];
  const { logout } = useAuth();

  // State for toggles
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  // const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // State for bug report modal and input
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bugReportText, setBugReportText] = useState('');

  const toggleDarkMode = () => {
    setIsDarkMode((previousState: any) => !previousState);
    //logic to switch the app theme will be added here
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  useEffect(() => {
    NotificationManager.getNotificationStatus().then(setNotificationsEnabled);
  }, []);
  
  const toggleNotifications = async () => {
    try {
      const newState = !notificationsEnabled;
      const success = newState 
        ? await NotificationManager.enableNotifications()
        : await NotificationManager.disableNotifications();
      
      if (success) {
        setNotificationsEnabled(newState);
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive updates.'
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const toggleBiometrics = () => {
    setBiometricsEnabled((previousState: any) => !previousState);
    //logic to enable/disable biometrics will be added here
  };


  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleReportBug = () => setIsModalVisible(true);

  const submitBugReport = () => {
    if (bugReportText.trim()) {
      // Submitting the bug report
      Alert.alert('Bug Report Submitted', 'Thank you for your feedback!');
      setBugReportText('');
      setIsModalVisible(false);
    } else {
      Alert.alert('Error', 'Please enter a description of the issue.');
    }
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
            <Text style={[styles.settingText, { color: currentColors.text }]}>Change Password</Text>
            <FontAwesome name="angle-right" size={24} color={currentColors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>Privacy Settings</Text>
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

        {/* Report a Bug */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: currentColors.text }]}>Report</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleReportBug}>
            <Text style={[styles.settingText, { color: currentColors.text }]}>Report a Bug</Text>
            <FontAwesome name="angle-right" size={24} color={currentColors.icon} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: currentColors.accent }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: currentColors.background }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bug Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Report a Bug</Text>
            <TextInput
              style={[styles.textInput, { borderColor: currentColors.secondary }]}
              placeholder="Describe the issue here"
              placeholderTextColor={currentColors.secondary}
              multiline
              value={bugReportText}
              onChangeText={setBugReportText}
            />
            <Button title="Submit" onPress={submitBugReport} color={currentColors.primary} />
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
              <Text style={{ color: currentColors.primary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 20, paddingHorizontal: 20, paddingBottom: 90 },
  sectionTitle: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  sectionContainer: { marginBottom: 30 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingText: { fontSize: 16 },
  settingSubText: { fontSize: 16, color: '#666' }, // Added this line
  logoutButton: { marginTop: 40, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { fontSize: 18, fontWeight: '600' },

  // Modal styles
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 15 },
  textInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  closeButton: { marginTop: 10 },
});

export default SettingsPage;
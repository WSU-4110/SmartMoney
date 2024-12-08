import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';

export class NotificationManager {
  static async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted!');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async enableNotifications() {
    try {
      const permissionGranted = await this.requestPermissions();
      if (permissionGranted) {
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }

  static async disableNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      return false;
    }
  }

  static async getNotificationStatus() {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error getting notification status:', error);
      return false;
    }
  }

  static async scheduleNotification(title: string, body: string, seconds: number = 0) {
    try {
      const isEnabled = await this.getNotificationStatus();
      if (!isEnabled) return false;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: seconds > 0 ? { seconds } : null,
      });
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }
}
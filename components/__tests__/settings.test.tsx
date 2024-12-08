import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsPage from '../../app/(tabs)/settings';
import { useTheme } from '../../app/themeContext';
import { useAuth } from '../../components/auth/AuthProvider';
import { Alert } from 'react-native';

// Mock the custom hooks
jest.mock('../../app/themeContext');
jest.mock('../../components/auth/AuthProvider');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
});

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('SettingsPage', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock theme context with a default implementation
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: { dark: false },
      toggleTheme: jest.fn(), // Mock this to prevent any unexpected side effects
    }));

    // Mock auth provider
    (useAuth as jest.Mock).mockImplementation(() => ({
      logout: mockLogout,
    }));
  });

  it('renders the settings page correctly', () => {
    const { getByText } = render(<SettingsPage />);

    // Check for main sections
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Appearance')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Security')).toBeTruthy();
    expect(getByText('Account')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
    expect(getByText('Report')).toBeTruthy();
  });

  it('toggles dark mode when the switch is pressed', () => {
    const { getByTestId } = render(<SettingsPage />);

    const darkModeSwitch = getByTestId('dark-mode-switch');
    expect(darkModeSwitch.props.value).toBe(false); // Initial state

    fireEvent(darkModeSwitch, 'onValueChange', true);

    expect(darkModeSwitch.props.value).toBe(true); // Updated state
  });

  it('toggles notifications when the switch is pressed', () => {
    const { getByTestId } = render(<SettingsPage />);

    const notificationSwitch = getByTestId('notifications-switch');
    expect(notificationSwitch.props.value).toBe(true); // Initial state

    fireEvent(notificationSwitch, 'onValueChange', false);

    expect(notificationSwitch.props.value).toBe(false); // Updated state
  });

  it('logs out the user when the logout button is pressed', async () => {
    const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((_, __, callbacks) => {
      // Find and call the logout callback
      callbacks?.find(cb => cb.text === 'Logout')?.onPress?.();
    });

    const { getByText } = render(<SettingsPage />);

    const logoutButton = getByText('Log Out');
    fireEvent.press(logoutButton);

    expect(mockAlert).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('displays the app version correctly', () => {
    const { getByText } = render(<SettingsPage />);
    expect(getByText('App Version')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
  });
});

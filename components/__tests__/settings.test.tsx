import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsPage from '@/app/(tabs)/settings';
import { useTheme } from '@/app/themeContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert } from 'react-native';

// Mock the custom hooks
jest.mock('../themeContext');
jest.mock('@/app/auth/AuthProvider');
jest.mock('@react-native-async-storage/async-storage');

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('SettingsPage', () => {
  const mockToggleTheme = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock theme context with a more complete implementation
    (useTheme as jest.Mock).mockImplementation(() => ({
      theme: { dark: false },
      toggleTheme: mockToggleTheme,
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
    const { getByRole } = render(<SettingsPage />);

    const darkModeSwitch = getByRole('switch', { name: 'Dark Mode' });
    fireEvent(darkModeSwitch, 'valueChange', true);  // Changed this line
    
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('toggles notifications when the switch is pressed', () => {
    const { getByRole } = render(<SettingsPage />);

    const notificationSwitch = getByRole('switch', { name: 'Enable Notifications' });
    fireEvent(notificationSwitch, 'valueChange', true);
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
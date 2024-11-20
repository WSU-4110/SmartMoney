import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import SettingsPage from '../../app/(tabs)/settings';
import { useAuth } from '@/components/auth/AuthProvider';
import { router } from 'expo-router';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/components/auth/AuthProvider');
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

const mockLogout = jest.fn();

(useAuth as jest.Mock).mockReturnValue({
    logout: mockLogout,
});

describe('SettingsPage', () => {
    it('SettingsPage renders correctly', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText('Settings')).toBeTruthy();
    });

    it('SettingsPage handles logout', async () => {
        const { getByTestId } = render(<SettingsPage />);
        const logoutButton = getByTestId('logout-button');
        const alertMock = require('react-native/Libraries/Alert/Alert').alert;

        // Simulate pressing the logout button
        fireEvent.press(logoutButton);

        // Simulate user pressing "Logout" on the alert
        expect(alertMock).toHaveBeenCalled();
        const alertLogoutHandler = alertMock.mock.calls[0][2][1].onPress; // Get the onPress handler for the "Logout" button

        await act(async () => alertLogoutHandler()); // Simulate pressing "Logout"

        // Verify logout behavior
        expect(mockLogout).toHaveBeenCalled();
        expect(router.replace).toHaveBeenCalledWith('/login');
    });
});

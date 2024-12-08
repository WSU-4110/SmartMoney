import React from 'react';
import { create, act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';

// Mock for AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock for WebBrowser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'success' }),
  maybeCompleteAuthSession: jest.fn(), // Mock missing function
}));

// Mock for AuthSession
jest.mock('expo-auth-session', () => ({
  useAuthRequest: jest.fn(() => [
    null,
    null,
    jest.fn().mockResolvedValue({ type: 'success', params: { access_token: 'token' } }),
  ]),
  makeRedirectUri: jest.fn(() => 'mock-redirect-uri'), // Mock makeRedirectUri
}));

const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/picture.jpg',
};

describe('AuthProvider', () => {
  let root: any;
  let authContext: ReturnType<typeof useAuth>;

  const TestComponent = () => {
    const auth = useAuth();
    authContext = auth;
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset all mocks
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
    (AsyncStorage.removeItem as jest.Mock).mockReset();
    (WebBrowser.openAuthSessionAsync as jest.Mock).mockReset();
    (WebBrowser.maybeCompleteAuthSession as jest.Mock).mockReset();
    (makeRedirectUri as jest.Mock).mockClear();

    // Set default implementations
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({ type: 'success' });
    (WebBrowser.maybeCompleteAuthSession as jest.Mock).mockReturnValue(undefined);
    (makeRedirectUri as jest.Mock).mockReturnValue('mock-redirect-uri');
  });

  afterEach(() => {
    if (root) {
      root.unmount();
    }
  });

  it('1. initializes with correct default state', async () => {
    await act(async () => {
      root = create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authContext.user).toBeNull();
    expect(authContext.loading).toBeFalsy();
  });

  it('2. loads existing user from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockUser));

    await act(async () => {
      root = create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
    expect(authContext.user).toEqual(mockUser);
  });

  it('3. handles empty storage state', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    await act(async () => {
      root = create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authContext.user).toBeNull();
  });

  it('4. provides login method', async () => {
    await act(async () => {
      root = create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authContext.login).toBeDefined();
    expect(typeof authContext.login).toBe('function');
  });

  it('5. provides logout method', async () => {
    await act(async () => {
      root = create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authContext.logout).toBeDefined();
    expect(typeof authContext.logout).toBe('function');
  });

  it('6. cleans up user data on logout', async () => {
    await act(async () => {
      root = create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authContext.logout();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_session');
    expect(authContext.user).toBeNull();
  });
});

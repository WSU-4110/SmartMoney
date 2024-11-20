import React, { createContext, useState, useContext, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../../api/apiClient';

WebBrowser.maybeCompleteAuthSession();

type Auth0User = {
  email: string;
  name: string;
  picture?: string;
};

type AuthContextType = {
  user: Auth0User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Auth0 credentials here! 
const auth0ClientId = 'Pnak3Yy0ajxOYgJahmUw02s8lengVT60';
const auth0Domain = 'dev-rcywf4y1jwsrcvo1.us.auth0.com';

// Auth0 endpoints here! 
const discovery = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Auth0User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: auth0ClientId,
      redirectUri: makeRedirectUri({
        scheme: 'myapp',
        path: 'expo-auth-session'
      }),
      responseType: 'token',
      scopes: ['openid', 'profile', 'email'],
      extraParams: {
        prompt: 'login'
      }
    },
    discovery
  );

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      getUserInfo(access_token);
    } else if (response?.type === 'error') {
      setAuthError(response.error?.message || 'Authentication failed');
      Alert.alert('Login Error', 'There was a problem logging in. Please try again.');
    }
  }, [response]);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async (accessToken: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://${auth0Domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await response.json();
      setUser(userInfo);
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));

      try {
        const serverResponse = await api.post('/user/auth', {
          email: userInfo.email,
        });
        await AsyncStorage.setItem('userId', serverResponse.data.user.userId);
        console.log('Server response:', serverResponse.data);
        console.log('User ID:', await AsyncStorage.getItem('userId'));
        return serverResponse.data;
      } catch (error: any) {
        console.error('API call failed:', error.message);
      }

    } catch (error) {
      console.error('Error getting user info:', error);
      Alert.alert('Error', 'Failed to get user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await AsyncStorage.removeItem('user');
      const result = await promptAsync();
      if (!result) {
        throw new Error('No response from auth provider');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Login Error', 'Failed to start login process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('auth_session');
      setUser(null);
      
      const returnTo = makeRedirectUri({
        scheme: 'myapp',
        path: 'expo-auth-session'
      });
      
      // First, clear the Auth0 session
      const logoutUrl = `https://${auth0Domain}/v2/logout?` +
        `client_id=${auth0ClientId}` +
        `&returnTo=${encodeURIComponent(returnTo)}` +
        '&federated';

      await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo);

      // Then force a new login prompt
      const loginUrl = `https://${auth0Domain}/authorize?` +
        `client_id=${auth0ClientId}` +
        `&redirect_uri=${encodeURIComponent(returnTo)}` +
        '&response_type=token' +
        '&scope=openid%20profile%20email' +
        '&prompt=login';

      await WebBrowser.openAuthSessionAsync(loginUrl, returnTo);
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
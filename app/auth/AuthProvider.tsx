import React, { createContext, useState, useContext, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

type Auth0User =
 {
  email: string;
  name: string;
  picture?: string;
};

type AuthContextType = 
{
  user: Auth0User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Auth0 credentials here! 
const auth0ClientId = 'Pnak3Yy0ajxOYgJahmUw02s8lengVT60';
const auth0Domain = 'dev-rcywf4y1jwsrcvo1.us.auth0.com';
//allowed callback urls all implemented in the auth0 dashboard.
// Auth0 endpoints here! 
const discovery = 
{
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => 
  {
  const [user, setUser] = useState<Auth0User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: auth0ClientId,
      redirectUri: makeRedirectUri(
        {
        scheme: 'myapp',
        path: 'expo-auth-session'
      }),
      responseType: 'token',
      scopes: ['openid', 'profile', 'email'],
    },
    discovery
  );

  useEffect(() => 
    {
    loadUser();
  }, []);

  useEffect(() => 
    {
    if (response?.type === 'success') 
     
      {
      const { access_token } = response.params;
      getUserInfo(access_token);
    } else if (response?.type === 'error') 
      
      {
      setAuthError(response.error?.message || 'Authentication failed');
      Alert.alert('Login Error', 'There was a problem logging in. Please try again.');
    }
  }, [response]);

  const loadUser = async () => 
    {
    try
     {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) 
        {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) 
    
    {
      console.error('Error loading user:', error);
    } finally 
    
    {
      setLoading(false);
    }
  };

  const getUserInfo = async (accessToken: string) => 
    {
    try 
    {
      setLoading(true);
      const response = await fetch(`https://${auth0Domain}/userinfo`,
         {
        headers: 
        {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) 
        {
        throw new Error('Failed to get user info');
      }

      const userInfo = await response.json();
      setUser(userInfo);
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
    } catch (error) 
    
    {
      console.error('Error getting user info:', error);
      Alert.alert('Error', 'Failed to get user information. Please try again.');
    } finally
    
    {
      setLoading(false);
    }
  };

  const login = async () => 
    {
    try 
    {
      setLoading(true);
      setAuthError(null);
      const result = await promptAsync();
      if (!result) 
        {
        throw new Error('No response from auth provider');
      }
    } catch (error) 
    
    {
      console.error('Error logging in:', error);
      Alert.alert('Login Error', 'Failed to start login process. Please try again.');
    } finally
     {
      setLoading(false);
    }
  };

  const logout = async () => 
    {
    try 
    {
      setLoading(true);
      await AsyncStorage.removeItem('user');
      setUser(null);
      
      const returnTo = makeRedirectUri(
        {
        scheme: 'myapp',
        path: 'expo-auth-session'
      });
      
      const logoutUrl = `https://${auth0Domain}/v2/logout?` +
        `client_id=${auth0ClientId}` +
        `&returnTo=${encodeURIComponent(returnTo)}`;

      await WebBrowser.openAuthSessionAsync(logoutUrl, returnTo);
    } catch (error) 
    
    {
      console.error('Error logging out:', error);
      Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
    } finally 
    {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => 
  {
  const context = useContext(AuthContext);
  if (!context) 
    {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
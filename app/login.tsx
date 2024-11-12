import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/app/auth/AuthProvider';
import { router } from 'expo-router';
import { useTheme } from './themeContext';


export default function LoginScreen(): JSX.Element {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme(); 
  const currentColors = Colors[theme.dark ? 'dark' : 'light'];

  const handleLogin = async () => {
    await login();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/SmartMoneySplashwSign.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: currentColors.text }]}>
            SmartMoney
          </Text>
          <Text style={[styles.tagline, { color: currentColors.secondary }]}>
            Your Personal Finance Tracker
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <FontAwesome name="bar-chart" size={24} color={currentColors.primary} />
            <Text style={[styles.featureText, { color: currentColors.text }]}>
              Track your expenses
            </Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="bank" size={24} color={currentColors.primary} />
            <Text style={[styles.featureText, { color: currentColors.text }]}>
              Manage multiple accounts
            </Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="bell" size={24} color={currentColors.primary} />
            <Text style={[styles.featureText, { color: currentColors.text }]}>
              Get important alerts
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: currentColors.primary }]}
          onPress={handleLogin}
        >
          <FontAwesome name="sign-in" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: currentColors.secondary }]}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 550,
    height: 350,
    marginBottom: 20,
    alignItems: 'center'
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
  },
  tagline: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 18,
    marginLeft: 15,
    flex: 1,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  termsContainer: {
    marginHorizontal: 20,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
import { useEffect } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { useAuth } from '@/components/auth/AuthProvider';

export function useAuthProtection() {
  const segments = useSegments();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const inProtectedRoute = segments[0] === '(tabs)';
      
      if (!user && inProtectedRoute) {
        // Redirect to login if trying to access protected route while not authenticated
        router.replace('/login');
      } else if (user && segments[0] === 'login') {
        // Redirect to home if authenticated user tries to access login
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, segments]);

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user
  };
}
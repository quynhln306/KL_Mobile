/**
 * App Entry Point
 * Redirect to login or main app based on auth status
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts';
import { LoadingSpinner } from '@/components/shared';

export default function Index() {
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && role) {
        // Already logged in, navigate based on role
        if (role === 'admin') {
          router.replace('/(admin)/(tabs)');
        } else {
          router.replace('/(client)/(tabs)');
        }
      } else {
        // Not logged in, go to login
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, role]);

  return <LoadingSpinner message="Đang tải..." />;
}

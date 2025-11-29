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
          router.replace('/(admin)/(tabs)' as any);
        } else if (role === 'guide') {
          router.replace('/(guide)/(tabs)' as any);
        } else {
          router.replace('/(client)/(tabs)' as any);
        }
      } else {
        // Not logged in, go to login
        router.replace('/(auth)/login' as any);
      }
    }
  }, [isAuthenticated, isLoading, role]);

  return <LoadingSpinner message="Đang tải..." />;
}

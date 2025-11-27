import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ErrorBoundary } from '@/components/shared';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
              {/* Auth screens */}
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/register" />
              
              {/* Client screens */}
              <Stack.Screen name="(client)/(tabs)" />
              
              {/* Admin screens */}
              <Stack.Screen name="(admin)/(tabs)" />
              
              {/* Old screens - will remove later */}
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
              <StatusBar style="dark" translucent backgroundColor="transparent" />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

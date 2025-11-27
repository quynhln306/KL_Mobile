/**
 * Client Layout
 * Stack navigation cho các screens ngoài tabs
 */

import { Stack } from 'expo-router';
import { Platform, StatusBar } from 'react-native';

export default function ClientLayout() {
  // Lấy chiều cao status bar để tránh camera notch
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          height: 56 + statusBarHeight, // Header height + status bar height
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        // Thêm padding top để tránh camera notch
        headerStatusBarHeight: statusBarHeight,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="cart" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="checkout" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="tour/[id]" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="booking/[id]" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="orders/[id]" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="profile/edit" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="profile/change-password" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

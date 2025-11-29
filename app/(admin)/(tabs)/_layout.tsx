/**
 * Admin Tabs Layout
 * Giao diện navigation 4 tabs cho admin
 * Dashboard | Đơn hàng | Quản lý | Cá nhân
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS } from '@/components/admin';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ADMIN_COLORS.primary,
        tabBarInactiveTintColor: ADMIN_COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: ADMIN_COLORS.card,
          borderTopColor: ADMIN_COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: ADMIN_COLORS.primary,
        },
        headerTintColor: ADMIN_COLORS.textInverse,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          headerTitle: 'Quản lý đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          title: 'Quản lý',
          headerTitle: 'Quản lý',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          headerTitle: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

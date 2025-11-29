/**
 * Guide Tab Layout
 * Bottom tabs cho hướng dẫn viên
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GUIDE_COLORS = {
  primary: '#10B981', // Màu xanh lá cho guide
  inactive: '#9CA3AF',
};

export default function GuideTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GUIDE_COLORS.primary,
        tabBarInactiveTintColor: GUIDE_COLORS.inactive,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Lịch làm việc',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

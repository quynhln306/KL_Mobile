/**
 * Client Tabs Layout
 */

import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useCart } from '@/contexts';

function CartButton() {
  const { tourCount } = useCart();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(client)/cart' as any)}
      style={styles.cartButton}
    >
      <Ionicons name="cart-outline" size={24} color="#007AFF" />
      {tourCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tourCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: true,
        headerRight: () => <CartButton />,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          headerTitle: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: 'Tours',
          headerTitle: 'Khám phá Tours',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          headerTitle: 'Đơn hàng của tôi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
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

const styles = StyleSheet.create({
  cartButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

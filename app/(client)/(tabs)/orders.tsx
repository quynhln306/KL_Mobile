/**
 * Client Orders Tab
 * Danh sách đơn hàng của user
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { orderService } from '@/services';
import { OrderCard } from '@/components/client';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { Order } from '@/types';
import { useAuth } from '@/contexts';

type OrderStatus = 'all' | 'initial' | 'done';

const statusFilters: { key: OrderStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'initial', label: 'Khởi tạo' },
  { key: 'done', label: 'Hoàn thành' },
];

export default function ClientOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const result = await orderService.getMyOrders({
        page: 1,
        limit: 50,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      });

      if (result.success && result.data) {
        // Handle different response structures
        let items: Order[] = [];
        
        if (Array.isArray(result.data)) {
          // Backend trả về array trực tiếp
          items = result.data;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          // Backend trả về object với items
          items = result.data.items;
        } else if ((result.data as any).orders && Array.isArray((result.data as any).orders)) {
          // Backend trả về object với orders
          items = (result.data as any).orders;
        }
        
        setOrders(items);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/(client)/orders/${order.id}` as any);
  };

  const handleStatusFilter = (status: OrderStatus) => {
    setSelectedStatus(status);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={() => handleOrderPress(item)} />
  );

  const renderStatusFilter = ({
    item,
  }: {
    item: typeof statusFilters[0];
  }) => {
    const isSelected = selectedStatus === item.key;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected && styles.filterButtonActive,
        ]}
        onPress={() => handleStatusFilter(item.key)}
      >
        <Text
          style={[
            styles.filterText,
            isSelected && styles.filterTextActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Chưa đăng nhập"
        message="Vui lòng đăng nhập để xem đơn hàng"
        icon="🔐"
        actionLabel="Đăng nhập"
        onAction={() => router.replace('/(auth)/login' as any)}
      />
    );
  }

  if (loading) {
    return <LoadingSpinner message="Đang tải đơn hàng..." />;
  }

  return (
    <View style={styles.container}>
      {/* Status Filters */}
      <View style={styles.filtersSection}>
        <FlatList
          data={statusFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={renderStatusFilter}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Orders List */}
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState
          title="Chưa có đơn hàng"
          message={
            selectedStatus === 'all'
              ? 'Bạn chưa có đơn hàng nào'
              : `Không có đơn hàng ${statusFilters.find((f) => f.key === selectedStatus)?.label.toLowerCase()}`
          }
          icon="📋"
          actionLabel="Khám phá tours"
          onAction={() => router.push('/(client)/(tabs)/tours' as any)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filtersContainer: {
    gap: 10,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
  },
});

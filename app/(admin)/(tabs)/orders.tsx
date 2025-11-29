/**
 * Admin Orders Management Screen
 * Quản lý đơn hàng với search và filter
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { adminService } from '@/services/admin.service';
import { Order } from '@/types';
import {
  OrderCard,
  SearchBar,
  FilterChips,
  EmptyState,
  ADMIN_COLORS,
  ADMIN_SPACING,
} from '@/components/admin';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'initial', label: 'Khởi tạo' },
  { key: 'done', label: 'Hoàn thành' },
  { key: 'cancel', label: 'Đã hủy' },
];

export default function AdminOrders() {
  const params = useLocalSearchParams<{ status?: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>(params.status || 'all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const queryParams: any = {};
      if (filter !== 'all') {
        queryParams.status = filter;
      }
      const response = await adminService.getOrders(queryParams);
      if (response.success && response.data) {
        let filteredOrders = response.data.orders || [];
        
        // Client-side search filter
        if (search.trim()) {
          const searchLower = search.toLowerCase();
          filteredOrders = filteredOrders.filter(
            (order: Order) =>
              order.code?.toLowerCase().includes(searchLower) ||
              order.fullName?.toLowerCase().includes(searchLower) ||
              order.phone?.includes(search)
          );
        }
        
        setOrders(filteredOrders);
      }
    } catch (error) {
      // Silent fail - orders won't be loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (!loading) {
        fetchOrders();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [filter, search]);



  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => router.push(`/(admin)/order/${item.id}` as any)}
      showActions={false}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm mã đơn, tên, SĐT..."
      />

      {/* Filter Chips */}
      <FilterChips
        options={FILTER_OPTIONS}
        selected={filter}
        onSelect={setFilter}
      />

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Không có đơn hàng"
            subtitle={search ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có đơn hàng nào trong danh mục này'}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: ADMIN_SPACING.lg,
    paddingTop: ADMIN_SPACING.sm,
  },
});

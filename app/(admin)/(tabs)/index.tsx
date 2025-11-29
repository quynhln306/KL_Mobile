/**
 * Admin Dashboard Screen
 * Hiển thị thống kê tổng quan và đơn hàng cần xử lý
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';
import { adminService } from '@/services/admin.service';
import {
  StatCard,
  OrderCard,
  SectionHeader,
  EmptyState,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
} from '@/components/admin';

interface DashboardStats {
  totalTours?: number;
  totalOrders?: number;
  totalRevenue?: number;
  totalUsers?: number;
  totalGuides?: number;
  totalReviews?: number;
  pendingOrders?: number;
  todayOrders?: number;
  todayRevenue?: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsResponse = await adminService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch recent orders
      const ordersResponse = await adminService.getOrders({ limit: 5 });
      if (ordersResponse.success && ordersResponse.data) {
        setRecentOrders(ordersResponse.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);



  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '0 ₫';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}tr`;
    }
    if (amount >= 1000) {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }
    return amount + ' ₫';
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initial':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'done':
        return '#34C759';
      case 'cancel':
        return '#FF3B30';
      default:
        return ADMIN_COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'initial':
        return 'Khởi tạo';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'done':
        return 'Hoàn thành';
      case 'cancel':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.fullName || 'Admin'}!</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="receipt"
          title="Đơn hôm nay"
          value={stats?.todayOrders || 0}
          color={ADMIN_COLORS.success}
        />
        <StatCard
          icon="receipt-outline"
          title="Tổng đơn"
          value={stats?.totalOrders || 0}
          color={ADMIN_COLORS.info}
          onPress={() => router.push('/(admin)/(tabs)/orders' as any)}
        />
        <StatCard
          icon="map"
          title="Tours"
          value={stats?.totalTours || 0}
          color="#AF52DE"
          onPress={() => router.push('/(admin)/tours' as any)}
        />
        <StatCard
          icon="people"
          title="Người dùng"
          value={stats?.totalUsers || 0}
          color="#007AFF"
        />
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueHeader}>
          <Text style={styles.revenueLabel}>Tổng doanh thu</Text>
          <Text style={styles.revenueNote}>
            (Từ {stats?.totalOrders || 0} đơn hàng)
          </Text>
        </View>
        <Text style={styles.revenueValue}>{formatFullCurrency(stats?.totalRevenue || 0)}</Text>
      </View>

      {/* Recent Orders */}
      <SectionHeader
        title="Đơn hàng gần đây"
        icon="receipt"
        actionText="Xem tất cả"
        onAction={() => router.push('/(admin)/(tabs)/orders' as any)}
      />

      <View style={styles.ordersSection}>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/(admin)/order/${order.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.code || order.id}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + '20' }
                ]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderCustomer} numberOfLines={1}>
                {order.fullName || 'Khách hàng'}
              </Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </Text>
                <Text style={styles.orderAmount}>
                  {formatFullCurrency(order.total || 0)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyOrders}>
            <Ionicons name="receipt-outline" size={48} color={ADMIN_COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        )}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: ADMIN_SPACING.xxl }} />
    </ScrollView>
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
    backgroundColor: ADMIN_COLORS.background,
  },
  loadingText: {
    marginTop: ADMIN_SPACING.md,
    fontSize: 16,
    color: ADMIN_COLORS.textSecondary,
  },
  header: {
    backgroundColor: ADMIN_COLORS.primary,
    paddingHorizontal: ADMIN_SPACING.xl,
    paddingTop: ADMIN_SPACING.xl,
    paddingBottom: ADMIN_SPACING.xxl,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: ADMIN_COLORS.textInverse,
  },
  date: {
    fontSize: 14,
    color: ADMIN_COLORS.textInverse,
    opacity: 0.8,
    marginTop: ADMIN_SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: ADMIN_SPACING.md,
    gap: ADMIN_SPACING.md,
    marginTop: -ADMIN_SPACING.lg,
  },
  revenueCard: {
    backgroundColor: ADMIN_COLORS.card,
    marginHorizontal: ADMIN_SPACING.md,
    marginTop: ADMIN_SPACING.sm,
    borderRadius: 16,
    padding: ADMIN_SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ADMIN_SPACING.sm,
  },
  revenueLabel: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
  },
  revenueNote: {
    fontSize: 12,
    color: ADMIN_COLORS.textSecondary,
    opacity: 0.7,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '700',
    color: ADMIN_COLORS.success,
  },
  ordersSection: {
    paddingHorizontal: ADMIN_SPACING.lg,
  },
  orderCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    marginBottom: ADMIN_SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ADMIN_SPACING.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: ADMIN_SPACING.sm,
    paddingVertical: ADMIN_SPACING.xs,
    borderRadius: ADMIN_RADIUS.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCustomer: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
    marginBottom: ADMIN_SPACING.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ADMIN_COLORS.border,
    paddingTop: ADMIN_SPACING.sm,
  },
  orderDate: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.primary,
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
    marginTop: ADMIN_SPACING.sm,
  },
});

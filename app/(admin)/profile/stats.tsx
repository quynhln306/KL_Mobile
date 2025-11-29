/**
 * Admin Stats Overview Screen
 * Thống kê tổng quan hệ thống
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/admin.service';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS, ADMIN_SHADOWS } from '@/components/admin';

interface DashboardStats {
  totalTours: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalGuides?: number;
  totalReviews?: number;
}

export default function AdminStatsScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data as any);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor={ADMIN_COLORS.primary} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={ADMIN_COLORS.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thống kê tổng quan</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={ADMIN_COLORS.primary} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={ADMIN_COLORS.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê tổng quan</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="cash"
            iconColor={ADMIN_COLORS.success}
            label="Doanh thu"
            value={formatCurrency(stats?.totalRevenue || 0)}
          />
          <StatCard
            icon="receipt"
            iconColor={ADMIN_COLORS.info}
            label="Đơn hàng"
            value={stats?.totalOrders?.toString() || '0'}
          />
          <StatCard
            icon="map"
            iconColor={ADMIN_COLORS.primary}
            label="Tours"
            value={stats?.totalTours?.toString() || '0'}
          />
          <StatCard
            icon="people"
            iconColor={ADMIN_COLORS.warning}
            label="Khách hàng"
            value={stats?.totalUsers?.toString() || '0'}
          />
          <StatCard
            icon="person-circle"
            iconColor={ADMIN_COLORS.success}
            label="Hướng dẫn viên"
            value={stats?.totalGuides?.toString() || '0'}
          />
          <StatCard
            icon="star"
            iconColor="#FFD700"
            label="Đánh giá"
            value={stats?.totalReviews?.toString() || '0'}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <QuickAction
            icon="receipt-outline"
            label="Quản lý đơn hàng"
            onPress={() => router.push('/(admin)/(tabs)/orders' as any)}
          />
          <QuickAction
            icon="map-outline"
            label="Quản lý tours"
            onPress={() => router.push('/(admin)/tours' as any)}
          />
          <QuickAction
            icon="people-outline"
            label="Quản lý HDV"
            onPress={() => router.push('/(admin)/guides' as any)}
          />
          <QuickAction
            icon="star-outline"
            label="Quản lý đánh giá"
            onPress={() => router.push('/(admin)/reviews' as any)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, iconColor, label, value }: any) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={28} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionLeft}>
        <Ionicons name={icon} size={22} color={ADMIN_COLORS.primary} />
        <Text style={styles.quickActionLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={ADMIN_COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ADMIN_COLORS.primary,
  },
  backButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: ADMIN_COLORS.textInverse,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: ADMIN_SPACING.md,
    gap: ADMIN_SPACING.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    alignItems: 'center',
    ...ADMIN_SHADOWS.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    marginTop: ADMIN_SPACING.sm,
  },
  statLabel: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
    marginTop: ADMIN_SPACING.xs,
  },
  section: {
    backgroundColor: ADMIN_COLORS.card,
    marginHorizontal: ADMIN_SPACING.lg,
    marginTop: ADMIN_SPACING.md,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.md,
    ...ADMIN_SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ADMIN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.md,
  },
  quickActionLabel: {
    fontSize: 15,
    color: ADMIN_COLORS.textPrimary,
  },
});

/**
 * Admin Management Screen
 * Menu quản lý: Tours, HDV, Phân công, Đánh giá
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  MenuRow,
  SectionHeader,
  StatCard,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
  ADMIN_SHADOWS,
} from '@/components/admin';
import { adminService } from '@/services/admin.service';

interface ManagementStats {
  totalTours: number;
  totalGuides: number;
  totalReviews: number;
  pendingSchedules: number;
}

export default function ManagementScreen() {
  const [stats, setStats] = useState<ManagementStats>({
    totalTours: 0,
    totalGuides: 0,
    totalReviews: 0,
    pendingSchedules: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch basic stats from dashboard API
      const response = await adminService.getDashboardStats();
      if (response.success && response.data) {
        const data = response.data as any; // Backend returns more fields than type definition
        setStats({
          totalTours: data.totalTours || 0,
          totalGuides: data.totalGuides || 0,
          totalReviews: data.totalReviews || 0,
          pendingSchedules: 0, // Will be updated when schedules API is ready
        });
      }
    } catch (error) {
      // Silent fail - stats won't be loaded
    } finally {
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={ADMIN_COLORS.primary}
        />
      }
    >
      {/* Stats Overview */}
      <SectionHeader title="Tổng quan" icon="analytics-outline" />
      <View style={styles.statsGrid}>
        <View style={styles.miniStatCard}>
          <Ionicons name="map" size={24} color={ADMIN_COLORS.info} />
          <Text style={styles.miniStatValue}>{stats.totalTours}</Text>
          <Text style={styles.miniStatLabel}>Tours</Text>
        </View>
        <View style={styles.miniStatCard}>
          <Ionicons name="people" size={24} color={ADMIN_COLORS.success} />
          <Text style={styles.miniStatValue}>{stats.totalGuides}</Text>
          <Text style={styles.miniStatLabel}>HDV</Text>
        </View>
        <View style={styles.miniStatCard}>
          <Ionicons name="star" size={24} color={ADMIN_COLORS.warning} />
          <Text style={styles.miniStatValue}>{stats.totalReviews}</Text>
          <Text style={styles.miniStatLabel}>Đánh giá</Text>
        </View>
      </View>

      {/* Menu Items */}
      <SectionHeader title="Danh mục" icon="list-outline" />
      <View style={styles.menuContainer}>
        <MenuRow
          icon="map"
          iconColor={ADMIN_COLORS.info}
          title="Tours"
          subtitle="Xem danh sách, trạng thái tours"
          value={stats.totalTours}
          onPress={() => router.push('/(admin)/tours' as any)}
        />
        <MenuRow
          icon="people"
          iconColor={ADMIN_COLORS.success}
          title="Hướng dẫn viên"
          subtitle="Danh sách HDV, lịch làm việc"
          value={stats.totalGuides}
          onPress={() => router.push('/(admin)/guides' as any)}
        />
        <MenuRow
          icon="calendar"
          iconColor={ADMIN_COLORS.primary}
          title="Phân công"
          subtitle="Xem lịch phân công HDV"
          onPress={() => router.push('/(admin)/schedules' as any)}
        />
        <MenuRow
          icon="star"
          iconColor={ADMIN_COLORS.warning}
          title="Đánh giá"
          subtitle="Xem và quản lý reviews"
          value={stats.totalReviews}
          onPress={() => router.push('/(admin)/reviews' as any)}
          showBorder={false}
        />
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={20} color={ADMIN_COLORS.info} />
          <Text style={styles.tipText}>
            Sử dụng web admin để tạo mới và chỉnh sửa chi tiết. Mobile chỉ để giám sát và xử lý nhanh.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: ADMIN_SPACING.lg,
    gap: ADMIN_SPACING.md,
    marginBottom: ADMIN_SPACING.lg,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.md,
    alignItems: 'center',
    ...ADMIN_SHADOWS.sm,
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    marginTop: ADMIN_SPACING.sm,
  },
  miniStatLabel: {
    fontSize: 12,
    color: ADMIN_COLORS.textSecondary,
    marginTop: ADMIN_SPACING.xs,
  },
  menuContainer: {
    backgroundColor: ADMIN_COLORS.card,
    marginHorizontal: ADMIN_SPACING.lg,
    borderRadius: ADMIN_RADIUS.md,
    overflow: 'hidden',
    ...ADMIN_SHADOWS.sm,
  },
  tipsContainer: {
    padding: ADMIN_SPACING.lg,
    marginTop: ADMIN_SPACING.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: ADMIN_COLORS.infoLight,
    padding: ADMIN_SPACING.md,
    borderRadius: ADMIN_RADIUS.sm,
    gap: ADMIN_SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: ADMIN_COLORS.info,
    lineHeight: 18,
  },
});

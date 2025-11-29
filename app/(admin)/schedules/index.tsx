/**
 * Admin Schedules Screen
 * Xem lịch phân công HDV
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  EmptyState,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
  ADMIN_SHADOWS,
} from '@/components/admin';
import { adminService } from '@/services/admin.service';
import { GuideSchedule } from '@/types';

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState<GuideSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedules = async () => {
    try {
      const response = await adminService.getGuideSchedules({});
      if (response.success && response.data) {
        setSchedules(response.data.schedules || []);
      }
    } catch (error) {
      // Silent fail - schedules won't be loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getScheduleStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Sắp tới', color: ADMIN_COLORS.info };
    if (now > end) return { label: 'Đã qua', color: ADMIN_COLORS.textTertiary };
    return { label: 'Đang diễn ra', color: ADMIN_COLORS.success };
  };

  const renderScheduleItem = ({ item }: { item: GuideSchedule }) => {
    const status = getScheduleStatus(item.startDate, item.endDate);

    return (
      <View style={styles.scheduleCard}>
        <View style={styles.dateColumn}>
          <Text style={styles.dateRange}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={ADMIN_COLORS.success} />
            <Text style={styles.guideName}>{item.guide?.name || 'HDV'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="map" size={16} color={ADMIN_COLORS.info} />
            <Text style={styles.tourName} numberOfLines={1}>
              {item.tour?.name || 'Tour'}
            </Text>
          </View>
          {item.type === 'leave' && (
            <View style={styles.leaveTag}>
              <Ionicons name="calendar-outline" size={12} color={ADMIN_COLORS.warning} />
              <Text style={styles.leaveText}>Nghỉ phép</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
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
        <Text style={styles.headerTitle}>Lịch phân công</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        <FlatList
          data={schedules}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ADMIN_COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="Chưa có lịch phân công"
              subtitle="Sử dụng web admin để phân công HDV cho tour"
            />
          }
        />
      </View>
    </SafeAreaView>
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
  },
  listContent: {
    padding: ADMIN_SPACING.lg,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    marginBottom: ADMIN_SPACING.md,
    ...ADMIN_SHADOWS.sm,
  },
  dateColumn: {
    width: 90,
    borderRightWidth: 1,
    borderRightColor: ADMIN_COLORS.border,
    paddingRight: ADMIN_SPACING.md,
    marginRight: ADMIN_SPACING.md,
  },
  dateRange: {
    fontSize: 13,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: ADMIN_SPACING.sm,
    paddingVertical: 2,
    borderRadius: ADMIN_RADIUS.xs,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.sm,
    marginBottom: ADMIN_SPACING.xs,
  },
  guideName: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
  },
  tourName: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
    flex: 1,
  },
  leaveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: ADMIN_SPACING.xs,
  },
  leaveText: {
    fontSize: 12,
    color: ADMIN_COLORS.warning,
    fontWeight: '500',
  },
});

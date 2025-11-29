/**
 * Guide Dashboard Screen
 * Trang chủ hướng dẫn viên
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
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts';
import { guideService } from '@/services/guide.service';

const GUIDE_COLORS = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  background: '#F3F4F6',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  warning: '#F59E0B',
  info: '#3B82F6',
};

interface DashboardData {
  currentTour: any;
  upcomingTours: any[];
  completedTours: any[];
  stats: {
    totalTours: number;
    completedTours: number;
  };
}

export default function GuideDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await guideService.getDashboard();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GUIDE_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={GUIDE_COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Hướng dẫn viên'}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HDV</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase" size={24} color={GUIDE_COLORS.primary} />
            <Text style={styles.statValue}>{data?.stats?.totalTours || 0}</Text>
            <Text style={styles.statLabel}>Tổng tour</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={GUIDE_COLORS.primary} />
            <Text style={styles.statValue}>{data?.stats?.completedTours || 0}</Text>
            <Text style={styles.statLabel}>Đã hoàn thành</Text>
          </View>
        </View>

        {/* Current Tour */}
        {data?.currentTour && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="navigate" size={18} color={GUIDE_COLORS.primary} /> Tour đang dẫn
            </Text>
            <View style={styles.currentTourCard}>
              {data.currentTour.tour?.avatar && (
                <Image
                  source={{ uri: data.currentTour.tour.avatar }}
                  style={styles.tourImage}
                />
              )}
              <View style={styles.tourInfo}>
                <Text style={styles.tourName}>{data.currentTour.tour?.name || 'Tour'}</Text>
                <View style={styles.tourMeta}>
                  <Ionicons name="calendar" size={14} color={GUIDE_COLORS.textSecondary} />
                  <Text style={styles.tourMetaText}>
                    {formatDate(data.currentTour.startDate)} - {formatDate(data.currentTour.endDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Upcoming Tours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={18} color={GUIDE_COLORS.info} /> Tour sắp tới
          </Text>
          {data?.upcomingTours && data.upcomingTours.length > 0 ? (
            data.upcomingTours.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleIcon}>
                  <Ionicons name="map" size={20} color={GUIDE_COLORS.info} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleName}>{schedule.tour?.name || 'Tour'}</Text>
                  <Text style={styles.scheduleDate}>
                    {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={40} color={GUIDE_COLORS.border} />
              <Text style={styles.emptyText}>Không có tour sắp tới</Text>
            </View>
          )}
        </View>

        {/* Completed Tours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="checkmark-done" size={18} color={GUIDE_COLORS.primary} /> Đã hoàn thành gần đây
          </Text>
          {data?.completedTours && data.completedTours.length > 0 ? (
            data.completedTours.slice(0, 3).map((schedule) => (
              <View key={schedule.id} style={[styles.scheduleCard, styles.completedCard]}>
                <View style={[styles.scheduleIcon, styles.completedIcon]}>
                  <Ionicons name="checkmark" size={20} color={GUIDE_COLORS.primary} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleName}>{schedule.tour?.name || 'Tour'}</Text>
                  <Text style={styles.scheduleDate}>
                    {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="trophy-outline" size={40} color={GUIDE_COLORS.border} />
              <Text style={styles.emptyText}>Chưa có tour hoàn thành</Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GUIDE_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: GUIDE_COLORS.primary,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  container: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.background,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: GUIDE_COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    marginBottom: 12,
  },
  currentTourCard: {
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: GUIDE_COLORS.primary,
  },
  tourImage: {
    width: '100%',
    height: 150,
  },
  tourInfo: {
    padding: 16,
  },
  tourName: {
    fontSize: 16,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    marginBottom: 8,
  },
  tourMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tourMetaText: {
    fontSize: 14,
    color: GUIDE_COLORS.textSecondary,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  completedCard: {
    opacity: 0.8,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedIcon: {
    backgroundColor: GUIDE_COLORS.primaryLight,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 15,
    fontWeight: '600',
    color: GUIDE_COLORS.textPrimary,
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 13,
    color: GUIDE_COLORS.textSecondary,
  },
  emptyBox: {
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: GUIDE_COLORS.textSecondary,
    marginTop: 8,
  },
});

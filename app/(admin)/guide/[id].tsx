/**
 * Admin Guide Detail Screen
 * Xem chi tiết hướng dẫn viên và lịch làm việc
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/admin.service';
import { Guide, GuideSchedule } from '@/types';
import {
  StatusBadge,
  InfoRow,
  SectionHeader,
  EmptyState,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
} from '@/components/admin';

export default function GuideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [schedules, setSchedules] = useState<GuideSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch guide detail
      const guideResponse = await adminService.getGuideDetail(Number(id));
      if (guideResponse.success && guideResponse.data) {
        setGuide(guideResponse.data.guide);
      }

      // Fetch guide schedules
      const schedulesResponse = await adminService.getGuideSchedules({
        guideId: Number(id),
      });
      if (schedulesResponse.success && schedulesResponse.data) {
        setSchedules(schedulesResponse.data.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching guide:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hướng dẫn viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getScheduleStatus = (schedule: GuideSchedule) => {
    const now = new Date();
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);

    if (now < start) return { label: 'Sắp tới', color: ADMIN_COLORS.info };
    if (now > end) return { label: 'Đã hoàn thành', color: ADMIN_COLORS.textSecondary };
    return { label: 'Đang diễn ra', color: ADMIN_COLORS.success };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy HDV"
          subtitle="Hướng dẫn viên này có thể đã bị xóa"
          actionText="Quay lại"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  // Filter schedules
  const upcomingSchedules = schedules.filter((s) => new Date(s.startDate) > new Date());
  const ongoingSchedules = schedules.filter((s) => {
    const now = new Date();
    return new Date(s.startDate) <= now && new Date(s.endDate) >= now;
  });

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
        <Text style={styles.headerTitle}>Chi tiết HDV</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {guide.avatar ? (
              <Image source={{ uri: guide.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={ADMIN_COLORS.textInverse} />
              </View>
            )}
          </View>
          <Text style={styles.guideName}>{guide.name}</Text>
          <StatusBadge status={guide.status} size="md" />
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <SectionHeader title="Thông tin liên hệ" icon="call" />
          <View style={styles.sectionContent}>
            {guide.phone && (
              <InfoRow icon="call" label="Điện thoại" value={guide.phone} type="phone" />
            )}
            {guide.email && (
              <InfoRow icon="mail" label="Email" value={guide.email} type="email" />
            )}
          </View>
        </View>

        {/* Description */}
        {guide.description && (
          <View style={styles.section}>
            <SectionHeader title="Giới thiệu" icon="document-text" />
            <View style={styles.sectionContent}>
              <Text style={styles.description}>{guide.description}</Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <SectionHeader title="Thống kê" icon="stats-chart" />
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={ADMIN_COLORS.info} />
              <Text style={styles.statValue}>{schedules.length}</Text>
              <Text style={styles.statLabel}>Tổng lịch</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={ADMIN_COLORS.warning} />
              <Text style={styles.statValue}>{upcomingSchedules.length}</Text>
              <Text style={styles.statLabel}>Sắp tới</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={ADMIN_COLORS.success} />
              <Text style={styles.statValue}>{ongoingSchedules.length}</Text>
              <Text style={styles.statLabel}>Đang dẫn</Text>
            </View>
          </View>
        </View>

        {/* Schedules */}
        <View style={styles.section}>
          <SectionHeader title="Lịch làm việc" icon="calendar" />
          {schedules.length > 0 ? (
            <View style={styles.schedulesContainer}>
              {schedules.slice(0, 10).map((schedule) => {
                const status = getScheduleStatus(schedule);
                return (
                  <View key={schedule.id} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <View style={styles.scheduleLeft}>
                        <Text style={styles.scheduleDate}>
                          {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                        </Text>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text style={[styles.statusLabel, { color: status.color }]}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                    {schedule.tour && (
                      <Text style={styles.tourName}>{schedule.tour.name}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="Chưa có lịch"
              subtitle="Hướng dẫn viên chưa được phân công tour nào"
            />
          )}
        </View>

        <View style={{ height: ADMIN_SPACING.xxl }} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: ADMIN_COLORS.card,
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.xxl,
    paddingHorizontal: ADMIN_SPACING.lg,
  },
  avatarContainer: {
    marginBottom: ADMIN_SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: ADMIN_COLORS.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ADMIN_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: ADMIN_COLORS.primary,
  },
  guideName: {
    fontSize: 22,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.sm,
  },
  section: {
    marginTop: ADMIN_SPACING.lg,
  },
  sectionContent: {
    backgroundColor: ADMIN_COLORS.card,
    marginHorizontal: ADMIN_SPACING.lg,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: ADMIN_COLORS.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: ADMIN_SPACING.lg,
    gap: ADMIN_SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    alignItems: 'center',
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
  schedulesContainer: {
    paddingHorizontal: ADMIN_SPACING.lg,
  },
  scheduleCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    marginBottom: ADMIN_SPACING.md,
  },
  scheduleHeader: {
    marginBottom: ADMIN_SPACING.sm,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ADMIN_SPACING.sm,
  },
  scheduleDate: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tourName: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
  },
});

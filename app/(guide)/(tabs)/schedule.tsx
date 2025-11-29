/**
 * Guide Schedule Screen
 * Lịch làm việc theo tháng
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
  StatusBar,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  error: '#EF4444',
  errorLight: '#FEE2E2',
};

interface Schedule {
  id: number;
  type: 'tour' | 'leave';
  startDate: string;
  endDate: string;
  startDateFormat?: string;
  endDateFormat?: string;
  leaveStatus?: 'pending' | 'approved' | 'rejected';
  leaveReason?: string;
  tour?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface TourDetail {
  id: number;
  name: string;
  avatar?: string;
  locations?: number[];
  locationNames?: string[];
  time?: string;
  vehicle?: string;
  information?: string;
  itinerary?: Array<{ day: string; title: string }>;
  schedule?: {
    startDateFormat: string;
    endDateFormat: string;
  };
}

export default function GuideSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  
  // Tour detail modal
  const [tourModalVisible, setTourModalVisible] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourDetail | null>(null);
  const [loadingTour, setLoadingTour] = useState(false);
  
  // Current month/year
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchSchedule = async () => {
    try {
      const response = await guideService.getSchedule({ month, year });
      if (response.success && response.data) {
        setSchedules(response.data.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSchedule();
  }, [month, year]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, [month, year]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToToday = () => {
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getScheduleStatus = (schedule: Schedule) => {
    if (schedule.type === 'leave') {
      switch (schedule.leaveStatus) {
        case 'approved':
          return { label: 'Đã duyệt', color: GUIDE_COLORS.primary, bg: GUIDE_COLORS.primaryLight };
        case 'rejected':
          return { label: 'Từ chối', color: GUIDE_COLORS.error, bg: GUIDE_COLORS.errorLight };
        default:
          return { label: 'Chờ duyệt', color: GUIDE_COLORS.warning, bg: GUIDE_COLORS.warningLight };
      }
    }
    
    // Tour status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    
    if (today < start) {
      return { label: 'Sắp tới', color: GUIDE_COLORS.info, bg: GUIDE_COLORS.infoLight };
    } else if (today > end) {
      return { label: 'Hoàn thành', color: GUIDE_COLORS.textSecondary, bg: GUIDE_COLORS.border };
    } else {
      return { label: 'Đang diễn ra', color: GUIDE_COLORS.primary, bg: GUIDE_COLORS.primaryLight };
    }
  };

  // Hủy đơn xin nghỉ
  const handleCancelLeave = (schedule: Schedule) => {
    Alert.alert(
      'Hủy đơn xin nghỉ',
      'Bạn có chắc muốn hủy đơn xin nghỉ này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(schedule.id);
              const response = await guideService.cancelLeaveRequest(schedule.id);
              if (response.success) {
                Alert.alert('Thành công', 'Đã hủy đơn xin nghỉ');
                fetchSchedule();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể hủy đơn');
              }
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  // Xem chi tiết tour
  const handleViewTour = async (tourId: number) => {
    try {
      setLoadingTour(true);
      setTourModalVisible(true);
      const response = await guideService.getTourDetail(tourId);
      if (response.success && response.data) {
        setSelectedTour(response.data.tour);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin tour');
      setTourModalVisible(false);
    } finally {
      setLoadingTour(false);
    }
  };

  // Stats
  const tourCount = schedules.filter(s => s.type === 'tour').length;
  const leaveCount = schedules.filter(s => s.type === 'leave').length;
  const pendingLeaves = schedules.filter(s => s.type === 'leave' && s.leaveStatus === 'pending').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={GUIDE_COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(guide)/leave-request' as any)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
            <Ionicons name="chevron-back" size={24} color={GUIDE_COLORS.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday}>
            <Text style={styles.monthTitle}>Tháng {month}/{year}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color={GUIDE_COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase" size={20} color={GUIDE_COLORS.info} />
            <Text style={styles.statValue}>{tourCount}</Text>
            <Text style={styles.statLabel}>Tour</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="umbrella" size={20} color={GUIDE_COLORS.warning} />
            <Text style={styles.statValue}>{leaveCount}</Text>
            <Text style={styles.statLabel}>Nghỉ phép</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color={GUIDE_COLORS.error} />
            <Text style={styles.statValue}>{pendingLeaves}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>
        </View>

        {/* Schedule List */}
        {loading ? (
          <ActivityIndicator size="large" color={GUIDE_COLORS.primary} style={{ marginTop: 40 }} />
        ) : schedules.length > 0 ? (
          <View style={styles.scheduleList}>
            {schedules.map((schedule) => {
              const status = getScheduleStatus(schedule);
              const isTour = schedule.type === 'tour';
              const canCancel = !isTour && schedule.leaveStatus === 'pending';
              
              return (
                <TouchableOpacity 
                  key={schedule.id} 
                  style={styles.scheduleCard}
                  onPress={() => isTour && schedule.tour?.id && handleViewTour(schedule.tour.id)}
                  activeOpacity={isTour ? 0.7 : 1}
                >
                  <View style={styles.scheduleLeft}>
                    <View style={[styles.scheduleIcon, { backgroundColor: status.bg }]}>
                      <Ionicons 
                        name={isTour ? 'map' : 'umbrella'} 
                        size={20} 
                        color={status.color} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.scheduleContent}>
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.scheduleName}>
                        {isTour ? schedule.tour?.name || 'Tour' : 'Nghỉ phép'}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.scheduleDate}>
                      <Ionicons name="calendar-outline" size={14} color={GUIDE_COLORS.textSecondary} />
                      <Text style={styles.dateText}>
                        {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                      </Text>
                    </View>
                    
                    {!isTour && schedule.leaveReason && (
                      <Text style={styles.leaveReason} numberOfLines={1}>
                        Lý do: {schedule.leaveReason}
                      </Text>
                    )}

                    {/* Nút hủy đơn xin nghỉ */}
                    {canCancel && (
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => handleCancelLeave(schedule)}
                        disabled={cancellingId === schedule.id}
                      >
                        {cancellingId === schedule.id ? (
                          <ActivityIndicator size="small" color={GUIDE_COLORS.error} />
                        ) : (
                          <>
                            <Ionicons name="close-circle" size={16} color={GUIDE_COLORS.error} />
                            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Hint xem chi tiết tour */}
                    {isTour && (
                      <View style={styles.viewDetailHint}>
                        <Text style={styles.viewDetailText}>Nhấn để xem chi tiết</Text>
                        <Ionicons name="chevron-forward" size={14} color={GUIDE_COLORS.textSecondary} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={60} color={GUIDE_COLORS.border} />
            <Text style={styles.emptyTitle}>Không có lịch</Text>
            <Text style={styles.emptyText}>Tháng này chưa có lịch làm việc</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Tour Detail Modal */}
      <Modal
        visible={tourModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTourModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết Tour</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setTourModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={GUIDE_COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {loadingTour ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={GUIDE_COLORS.primary} />
            </View>
          ) : selectedTour ? (
            <ScrollView style={styles.modalContent}>
              {/* Tour Image */}
              {selectedTour.avatar && (
                <Image source={{ uri: selectedTour.avatar }} style={styles.tourImage} />
              )}

              {/* Tour Name */}
              <Text style={styles.tourName}>{selectedTour.name}</Text>

              {/* Tour Info */}
              <View style={styles.tourInfoCard}>
                {selectedTour.schedule && (
                  <View style={styles.tourInfoRow}>
                    <Ionicons name="calendar" size={18} color={GUIDE_COLORS.primary} />
                    <Text style={styles.tourInfoLabel}>Thời gian dẫn:</Text>
                    <Text style={styles.tourInfoValue}>
                      {selectedTour.schedule.startDateFormat} - {selectedTour.schedule.endDateFormat}
                    </Text>
                  </View>
                )}
                
                {selectedTour.time && (
                  <View style={styles.tourInfoRow}>
                    <Ionicons name="time" size={18} color={GUIDE_COLORS.info} />
                    <Text style={styles.tourInfoLabel}>Thời lượng:</Text>
                    <Text style={styles.tourInfoValue}>{selectedTour.time}</Text>
                  </View>
                )}

                {selectedTour.vehicle && (
                  <View style={styles.tourInfoRow}>
                    <Ionicons name="car" size={18} color={GUIDE_COLORS.warning} />
                    <Text style={styles.tourInfoLabel}>Phương tiện:</Text>
                    <Text style={styles.tourInfoValue}>{selectedTour.vehicle}</Text>
                  </View>
                )}

                {selectedTour.locationNames && selectedTour.locationNames.length > 0 && (
                  <View style={styles.tourInfoRow}>
                    <Ionicons name="location" size={18} color={GUIDE_COLORS.error} />
                    <Text style={styles.tourInfoLabel}>Địa điểm:</Text>
                    <Text style={styles.tourInfoValue}>{selectedTour.locationNames.join(' → ')}</Text>
                  </View>
                )}
              </View>

              {/* Tour Itinerary */}
              {selectedTour.itinerary && selectedTour.itinerary.length > 0 && (
                <View style={styles.itinerarySection}>
                  <Text style={styles.sectionTitle}>Lịch trình</Text>
                  {selectedTour.itinerary.map((item: any, index: number) => (
                    <View key={index} style={styles.itineraryItemSimple}>
                      <View style={styles.itineraryBullet}>
                        <Text style={styles.itineraryBulletText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.itineraryTitleSimple} numberOfLines={2}>
                        {item.title || `Ngày ${index + 1}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: GUIDE_COLORS.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.background,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GUIDE_COLORS.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GUIDE_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: GUIDE_COLORS.textSecondary,
  },
  scheduleList: {
    paddingHorizontal: 16,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: GUIDE_COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  scheduleLeft: {
    marginRight: 12,
  },
  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleName: {
    fontSize: 15,
    fontWeight: '600',
    color: GUIDE_COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scheduleDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: GUIDE_COLORS.textSecondary,
  },
  leaveReason: {
    fontSize: 12,
    color: GUIDE_COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GUIDE_COLORS.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: GUIDE_COLORS.textSecondary,
    marginTop: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: GUIDE_COLORS.errorLight,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: GUIDE_COLORS.error,
  },
  viewDetailHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  viewDetailText: {
    fontSize: 12,
    color: GUIDE_COLORS.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GUIDE_COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: GUIDE_COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
  },
  tourImage: {
    width: '100%',
    height: 200,
  },
  tourName: {
    fontSize: 20,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    padding: 16,
    backgroundColor: GUIDE_COLORS.card,
  },
  tourInfoCard: {
    backgroundColor: GUIDE_COLORS.card,
    marginTop: 12,
    padding: 16,
  },
  tourInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GUIDE_COLORS.border,
    gap: 10,
  },
  tourInfoLabel: {
    fontSize: 14,
    color: GUIDE_COLORS.textSecondary,
    width: 100,
  },
  tourInfoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: GUIDE_COLORS.textPrimary,
  },
  itinerarySection: {
    backgroundColor: GUIDE_COLORS.card,
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GUIDE_COLORS.textPrimary,
    marginBottom: 12,
  },
  itineraryItemSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GUIDE_COLORS.border,
  },
  itineraryBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GUIDE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itineraryBulletText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itineraryTitleSimple: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: GUIDE_COLORS.textPrimary,
  },
});

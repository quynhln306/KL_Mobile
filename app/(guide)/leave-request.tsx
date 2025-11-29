/**
 * Guide Leave Request Screen
 * Form gửi đơn xin nghỉ phép
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
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
  error: '#EF4444',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
};

interface ConflictTour {
  tourId: number;
  tourName: string;
  startDate: string;
  endDate: string;
  startDateFormat: string;
  endDateFormat: string;
  locations?: string[];
}

export default function LeaveRequestScreen() {
  // Format: DD/MM/YYYY
  const today = new Date();
  const formatDateDisplay = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };
  
  const [startDateStr, setStartDateStr] = useState(formatDateDisplay(today));
  const [endDateStr, setEndDateStr] = useState(formatDateDisplay(today));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictTours, setConflictTours] = useState<ConflictTour[]>([]);

  const parseDate = (str: string): Date | null => {
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const y = parseInt(parts[2]);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    return new Date(y, m, d);
  };

  const formatDateForAPI = (str: string): string => {
    // Parse DD/MM/YYYY và trả về YYYY-MM-DD
    const parts = str.split('/');
    if (parts.length !== 3) return '';
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`; // Format: YYYY-MM-DD
  };

  const calculateDays = (): number => {
    const start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    if (!start || !end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Check conflict khi ngày thay đổi
  const checkConflict = useCallback(async () => {
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    
    if (!startDate || !endDate || endDate < startDate) {
      setConflictTours([]);
      return;
    }

    try {
      setCheckingConflict(true);
      const response = await guideService.checkConflict({
        startDate: formatDateForAPI(startDateStr),
        endDate: formatDateForAPI(endDateStr),
      });

      if (response.success && response.data) {
        setConflictTours(response.data.conflictTours || []);
      }
    } catch (error) {
      console.log('Check conflict error:', error);
    } finally {
      setCheckingConflict(false);
    }
  }, [startDateStr, endDateStr]);

  // Debounce check conflict
  useEffect(() => {
    const timer = setTimeout(() => {
      checkConflict();
    }, 500);
    return () => clearTimeout(timer);
  }, [checkConflict]);

  const handleSubmit = async () => {
    // Validate
    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do xin nghỉ');
      return;
    }

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    
    if (!startDate || !endDate) {
      Alert.alert('Lỗi', 'Ngày không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    if (startDate < todayDate) {
      Alert.alert('Lỗi', 'Không thể xin nghỉ vào ngày trong quá khứ');
      return;
    }

    try {
      setLoading(true);
      const response = await guideService.createLeaveRequest({
        startDate: formatDateForAPI(startDateStr),
        endDate: formatDateForAPI(endDateStr),
        reason: reason.trim(),
      });

      if (response.success) {
        const hasConflict = response.data?.hasConflict;
        Alert.alert(
          hasConflict ? '⚠️ Lưu ý' : 'Thành công',
          response.message || 'Gửi đơn xin nghỉ thành công!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể gửi đơn xin nghỉ');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={GUIDE_COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xin nghỉ phép</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={GUIDE_COLORS.primary} />
          <Text style={styles.infoText}>
            Đơn xin nghỉ sẽ được gửi đến quản lý để duyệt. Bạn sẽ nhận thông báo khi đơn được xử lý.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Start Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày bắt đầu (DD/MM/YYYY)</Text>
            <View style={styles.dateInput}>
              <Ionicons name="calendar" size={20} color={GUIDE_COLORS.primary} />
              <TextInput
                style={styles.dateTextInput}
                value={startDateStr}
                onChangeText={setStartDateStr}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={GUIDE_COLORS.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* End Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày kết thúc (DD/MM/YYYY)</Text>
            <View style={styles.dateInput}>
              <Ionicons name="calendar" size={20} color={GUIDE_COLORS.primary} />
              <TextInput
                style={styles.dateTextInput}
                value={endDateStr}
                onChangeText={setEndDateStr}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={GUIDE_COLORS.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Duration */}
          <View style={styles.durationBox}>
            <Ionicons name="time" size={18} color={GUIDE_COLORS.textSecondary} />
            <Text style={styles.durationText}>
              Tổng: {calculateDays()} ngày
            </Text>
            {checkingConflict && (
              <ActivityIndicator size="small" color={GUIDE_COLORS.primary} style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Conflict Warning */}
          {conflictTours.length > 0 && (
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={20} color={GUIDE_COLORS.warning} />
                <Text style={styles.warningTitle}>
                  ⚠️ Bạn có {conflictTours.length} tour trong thời gian này
                </Text>
              </View>
              <Text style={styles.warningSubtitle}>
                Bạn vẫn có thể gửi đơn. Admin sẽ tìm người thay thế.
              </Text>
              {conflictTours.map((tour, index) => (
                <View key={tour.tourId} style={styles.conflictTourItem}>
                  <Ionicons name="airplane" size={16} color={GUIDE_COLORS.warning} />
                  <View style={styles.conflictTourInfo}>
                    <Text style={styles.conflictTourName}>{tour.tourName}</Text>
                    <Text style={styles.conflictTourDate}>
                      {tour.startDateFormat} - {tour.endDateFormat}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Reason */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lý do xin nghỉ *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Nhập lý do xin nghỉ..."
              placeholderTextColor={GUIDE_COLORS.textSecondary}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitText}>Đang gửi...</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Gửi đơn xin nghỉ</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: GUIDE_COLORS.primary,
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
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: GUIDE_COLORS.background,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: GUIDE_COLORS.primaryLight,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: GUIDE_COLORS.primary,
    lineHeight: 20,
  },
  form: {
    backgroundColor: GUIDE_COLORS.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: GUIDE_COLORS.textPrimary,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GUIDE_COLORS.background,
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    color: GUIDE_COLORS.textPrimary,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GUIDE_COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    color: GUIDE_COLORS.textSecondary,
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: GUIDE_COLORS.warningLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: GUIDE_COLORS.warning,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: GUIDE_COLORS.warning,
    flex: 1,
  },
  warningSubtitle: {
    fontSize: 13,
    color: GUIDE_COLORS.textSecondary,
    marginBottom: 10,
    marginLeft: 28,
  },
  conflictTourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    gap: 10,
  },
  conflictTourInfo: {
    flex: 1,
  },
  conflictTourName: {
    fontSize: 14,
    fontWeight: '500',
    color: GUIDE_COLORS.textPrimary,
  },
  conflictTourDate: {
    fontSize: 12,
    color: GUIDE_COLORS.textSecondary,
    marginTop: 2,
  },
  textArea: {
    backgroundColor: GUIDE_COLORS.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: GUIDE_COLORS.textPrimary,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GUIDE_COLORS.primary,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

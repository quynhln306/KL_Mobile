/**
 * Admin Tour Detail Screen
 * Xem chi tiết tour với tabs: Thông tin, Lịch trình, Đánh giá
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatHTMLForDisplay } from '@/utils/html';
import { extractImagesFromHTML, removeImagesFromHTML } from '@/utils/image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { adminService } from '@/services/admin.service';
import { Tour, TourSchedule } from '@/types';
import {
  StatusBadge,
  InfoRow,
  SectionHeader,
  EmptyState,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
} from '@/components/admin';

type TabType = 'info' | 'schedule' | 'reviews';

export default function TourDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const fetchTour = async () => {
    try {
      const response = await adminService.getTourDetail(Number(id));
      if (response.success && response.data) {
        const tourData = response.data.tour;
        console.log('Tour rating:', tourData.rating);
        console.log('Tour reviewCount:', tourData.reviewCount);
        setTour(tourData);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTour();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Không tìm thấy tour"
          subtitle="Tour này có thể đã bị xóa"
          actionText="Quay lại"
          onAction={() => router.back()}
        />
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
        <Text style={styles.headerTitle}>Chi tiết Tour</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {(tour.avatar || (tour.images && tour.images.length > 0)) ? (
          <Image
            source={{ uri: tour.avatar || tour.images![0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={48} color={ADMIN_COLORS.textTertiary} />
            <Text style={styles.placeholderText}>Chưa có hình ảnh</Text>
          </View>
        )}

        {/* Title & Status */}
        <View style={styles.titleSection}>
          <Text style={styles.tourName}>{tour.name}</Text>
          <StatusBadge status={tour.status === 'active' ? 'active' : 'inactive'} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TabButton
            label="Thông tin"
            active={activeTab === 'info'}
            onPress={() => setActiveTab('info')}
          />
          <TabButton
            label="Lịch trình"
            active={activeTab === 'schedule'}
            onPress={() => setActiveTab('schedule')}
          />
          <TabButton
            label="Đánh giá"
            active={activeTab === 'reviews'}
            onPress={() => setActiveTab('reviews')}
          />
        </View>

        {/* Tab Content */}
        {activeTab === 'info' && <InfoTab tour={tour} formatCurrency={formatCurrency} formatDate={formatDate} />}
        {activeTab === 'schedule' && <ScheduleTab schedules={tour.schedules} />}
        {activeTab === 'reviews' && <ReviewsTab tourId={tour.id} rating={tour.rating} reviewCount={tour.reviewCount} />}

        <View style={{ height: ADMIN_SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Tab Button Component
function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Info Tab
function InfoTab({ tour, formatCurrency, formatDate }: { tour: Tour; formatCurrency: (n: number) => string; formatDate: (s?: string) => string }) {
  return (
    <View style={styles.tabContent}>
      {/* Price Section */}
      <View style={styles.section}>
        <SectionHeader title="Giá tour" icon="cash" />
        <View style={styles.sectionContent}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Người lớn</Text>
            <View>
              {tour.priceNewAdult !== tour.priceAdult && (
                <Text style={styles.priceOld}>{formatCurrency(tour.priceAdult)}</Text>
              )}
              <Text style={styles.priceNew}>{formatCurrency(tour.priceNewAdult)}</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Trẻ em</Text>
            <Text style={styles.priceNew}>{formatCurrency(tour.priceNewChildren)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Em bé</Text>
            <Text style={styles.priceNew}>{formatCurrency(tour.priceNewBaby)}</Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.section}>
        <SectionHeader title="Thông tin" icon="information-circle" />
        <View style={styles.sectionContent}>
          <InfoRow icon="location" label="Điểm đến" value={tour.locations?.[0] || 'N/A'} />
          <InfoRow icon="time" label="Thời gian" value={tour.time || 'N/A'} />
          <InfoRow icon="bus" label="Phương tiện" value={tour.vehicle || 'N/A'} />
          <InfoRow icon="calendar" label="Khởi hành" value={formatDate(tour.departureDate)} />
        </View>
      </View>

      {/* Stock Section */}
      <View style={styles.section}>
        <SectionHeader title="Chỗ trống" icon="people" />
        <View style={styles.sectionContent}>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Người lớn</Text>
            <Text style={styles.stockValue}>{tour.stockAdult} chỗ</Text>
          </View>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Trẻ em</Text>
            <Text style={styles.stockValue}>{tour.stockChildren} chỗ</Text>
          </View>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Em bé</Text>
            <Text style={styles.stockValue}>{tour.stockBaby} chỗ</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {tour.information && (() => {
        const infoImages = extractImagesFromHTML(tour.information);
        const infoText = removeImagesFromHTML(tour.information);
        
        return (
          <View style={styles.section}>
            <SectionHeader title="Mô tả" icon="document-text" />
            <View style={styles.sectionContent}>
              {/* Images from information */}
              {infoImages.length > 0 && (
                <View style={styles.infoImagesContainer}>
                  {infoImages.map((imageUrl, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageUrl }}
                      style={styles.infoImage}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}
              
              {/* Information text (without images) */}
              {infoText && (
                <Text style={styles.description}>
                  {formatHTMLForDisplay(infoText)}
                </Text>
              )}
            </View>
          </View>
        );
      })()}
    </View>
  );
}

// Schedule Tab
function ScheduleTab({ schedules }: { schedules?: TourSchedule[] }) {
  if (!schedules || schedules.length === 0) {
    return (
      <View style={styles.tabContent}>
        <EmptyState
          icon="calendar-outline"
          title="Chưa có lịch trình"
          subtitle="Tour này chưa có lịch trình chi tiết"
        />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {schedules.map((schedule, index) => (
        <View key={index} style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>Ngày {schedule.day}</Text>
            </View>
          </View>
          {schedule.title && <Text style={styles.scheduleTitle}>{schedule.title}</Text>}
          {schedule.description && (
            <Text style={styles.scheduleDesc}>{schedule.description}</Text>
          )}
          {schedule.activities && schedule.activities.length > 0 && (
            <View style={styles.activities}>
              {schedule.activities.map((activity, idx) => (
                <View key={idx} style={styles.activityRow}>
                  <Ionicons name="checkmark-circle" size={16} color={ADMIN_COLORS.success} />
                  <Text style={styles.activityText}>{activity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// Reviews Tab
function ReviewsTab({ tourId, rating, reviewCount }: { tourId: number; rating?: number; reviewCount?: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [tourId]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await adminService.getReviews({ tourId, limit: 10 });
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.ratingCard}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingValue}>{rating?.toFixed(1) || '0.0'}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= (rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewCount}>{reviewCount || 0} đánh giá</Text>
      </View>

      {loadingReviews ? (
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} style={{ marginTop: 20 }} />
      ) : reviews.length > 0 ? (
        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <Ionicons name="person-circle" size={32} color={ADMIN_COLORS.textSecondary} />
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUserName}>{review.user?.fullName || 'Người dùng'}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="star-outline"
          title="Chưa có đánh giá"
          subtitle="Tour này chưa có đánh giá nào"
        />
      )}
    </View>
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
  heroImage: {
    width: SCREEN_WIDTH,
    height: 250,
    backgroundColor: ADMIN_COLORS.border,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.background,
  },
  placeholderText: {
    fontSize: 14,
    color: ADMIN_COLORS.textTertiary,
    marginTop: ADMIN_SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: ADMIN_SPACING.lg,
    backgroundColor: ADMIN_COLORS.card,
  },
  tourName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    marginRight: ADMIN_SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: ADMIN_COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: ADMIN_SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: ADMIN_COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: ADMIN_COLORS.textSecondary,
  },
  tabTextActive: {
    color: ADMIN_COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: ADMIN_SPACING.lg,
  },
  section: {
    marginBottom: ADMIN_SPACING.lg,
  },
  sectionContent: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  priceLabel: {
    fontSize: 15,
    color: ADMIN_COLORS.textPrimary,
  },
  priceOld: {
    fontSize: 13,
    color: ADMIN_COLORS.textTertiary,
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  priceNew: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.primary,
    textAlign: 'right',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ADMIN_SPACING.sm,
  },
  stockLabel: {
    fontSize: 15,
    color: ADMIN_COLORS.textPrimary,
  },
  stockValue: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.success,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: ADMIN_COLORS.textPrimary,
  },
  infoImagesContainer: {
    gap: ADMIN_SPACING.md,
    marginBottom: ADMIN_SPACING.lg,
  },
  infoImage: {
    width: '100%',
    height: 200,
    borderRadius: ADMIN_RADIUS.md,
    backgroundColor: ADMIN_COLORS.border,
  },
  scheduleCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    marginBottom: ADMIN_SPACING.md,
  },
  scheduleHeader: {
    marginBottom: ADMIN_SPACING.md,
  },
  dayBadge: {
    backgroundColor: ADMIN_COLORS.primaryLight,
    paddingHorizontal: ADMIN_SPACING.md,
    paddingVertical: ADMIN_SPACING.xs,
    borderRadius: ADMIN_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: ADMIN_COLORS.primary,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.xs,
  },
  scheduleDesc: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: ADMIN_SPACING.sm,
  },
  activities: {
    gap: ADMIN_SPACING.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ADMIN_SPACING.sm,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: ADMIN_COLORS.textPrimary,
    lineHeight: 20,
  },
  ratingCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ADMIN_SPACING.lg,
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 15,
    color: ADMIN_COLORS.textSecondary,
  },
  reviewsList: {
    gap: ADMIN_SPACING.md,
  },
  reviewCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ADMIN_SPACING.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.sm,
    flex: 1,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: ADMIN_COLORS.textPrimary,
  },
});

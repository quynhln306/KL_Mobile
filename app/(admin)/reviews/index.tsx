/**
 * Admin Reviews List Screen
 * Quản lý đánh giá tour
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/admin.service';
import { Review } from '@/types';
import {
  FilterChips,
  EmptyState,
  ADMIN_COLORS,
  ADMIN_SPACING,
  ADMIN_RADIUS,
  ADMIN_SHADOWS,
} from '@/components/admin';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: '5', label: '5⭐' },
  { key: '4', label: '4⭐' },
  { key: '3', label: '3⭐' },
  { key: '1-2', label: '1-2⭐' },
];

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchReviews = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        if (filter === '1-2') {
          // Client-side filter for 1-2 stars
        } else {
          params.rating = parseInt(filter);
        }
      }

      const response = await adminService.getReviews(params);
      if (response.success && response.data) {
        let filteredReviews = response.data.reviews || [];

        // Client-side filter for 1-2 stars
        if (filter === '1-2') {
          filteredReviews = filteredReviews.filter((r: Review) => r.rating <= 2);
        }

        setReviews(filteredReviews);
      }
    } catch (error) {
      // Silent fail - reviews won't be loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, [filter]);

  const handleDeleteReview = (reviewId: number) => {
    Alert.alert(
      'Xóa đánh giá',
      'Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteReview(reviewId);
              fetchReviews();
              Alert.alert('Thành công', 'Đã xóa đánh giá');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa đánh giá');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.user?.avatar ? (
              <Text>👤</Text>
            ) : (
              <Ionicons name="person" size={20} color={ADMIN_COLORS.textSecondary} />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user?.fullName || 'Người dùng'}</Text>
            {renderStars(item.rating)}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteReview(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={ADMIN_COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Comment */}
      {item.comment && (
        <Text style={styles.comment} numberOfLines={3}>
          {item.comment}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.reviewFooter}>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (loading) {
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
        <Text style={styles.headerTitle}>Đánh giá</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        {/* Filter Chips */}
        <FilterChips options={FILTER_OPTIONS} selected={filter} onSelect={setFilter} />

        {/* Reviews List */}
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="star-outline"
              title="Chưa có đánh giá"
              subtitle="Chưa có đánh giá nào trong danh mục này"
            />
          }
          showsVerticalScrollIndicator={false}
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
  reviewCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    marginBottom: ADMIN_SPACING.md,
    ...ADMIN_SHADOWS.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ADMIN_SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ADMIN_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ADMIN_SPACING.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  deleteBtn: {
    padding: ADMIN_SPACING.xs,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.md,
  },
  reviewFooter: {
    borderTopWidth: 1,
    borderTopColor: ADMIN_COLORS.border,
    paddingTop: ADMIN_SPACING.sm,
  },
  date: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
  },
});

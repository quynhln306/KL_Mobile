/**
 * All Reviews Screen
 * Màn hình xem tất cả đánh giá của tour
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { reviewService } from '@/services';
import { ScreenHeader } from '@/components/shared';
import { RatingDisplay, ReviewCard } from '@/components/client';
import { Review, ReviewStats } from '@/services/review.service';

export default function AllReviewsScreen() {
  const { tourId } = useLocalSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReviews(1);
  }, [tourId]);

  const loadReviews = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const tourIdNum = parseInt(tourId as string);
      const result = await reviewService.getTourReviews(tourIdNum, pageNum, 20);

      if (result.success && result.data) {
        if (pageNum === 1) {
          setReviews(result.data.reviews);
          setStats(result.data.stats);
        } else {
          setReviews((prev) => [...prev, ...result.data.reviews]);
        }

        // Check if has more
        const { page: currentPage, totalPages } = result.data.pagination;
        setHasMore(currentPage < totalPages);
        setPage(pageNum);
      }
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      if (pageNum === 1) {
        Alert.alert('Lỗi', 'Không thể tải đánh giá');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadReviews(page + 1);
    }
  };

  const handleEditReview = (review: Review) => {
    // Navigate to edit screen - cần orderId
    Alert.alert('Thông báo', 'Để chỉnh sửa đánh giá, vui lòng vào chi tiết đơn hàng');
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await reviewService.deleteReview(review.id);
              
              if (result.success) {
                Alert.alert('Thành công', result.message || 'Đã xóa đánh giá');
                // Reload reviews
                loadReviews(1);
              } else {
                Alert.alert('Lỗi', result.message || 'Không thể xóa đánh giá');
              }
            } catch (error: any) {
              console.error('Error deleting review:', error);
              Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => {
    if (!stats) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tất cả đánh giá</Text>
        <RatingDisplay
          rating={stats.averageRating}
          totalReviews={stats.totalReviews}
          size="large"
        />

        {/* Rating Breakdown */}
        <View style={styles.breakdownContainer}>
          {[5, 4, 3, 2, 1].map((star) => {
            const data = stats.ratingBreakdown[star as keyof typeof stats.ratingBreakdown];
            return (
              <View key={star} style={styles.breakdownRow}>
                <Text style={styles.breakdownStar}>{star} ⭐</Text>
                <View style={styles.breakdownBar}>
                  <View
                    style={[
                      styles.breakdownBarFill,
                      { width: `${data.percentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.breakdownCount}>{data.count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Đánh giá" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Đánh giá" />
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReviewCard 
            review={item}
            onEdit={() => handleEditReview(item)}
            onDelete={() => handleDeleteReview(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  listContent: {
    padding: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  breakdownContainer: {
    marginTop: 20,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownStar: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    width: 50,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    width: 40,
    textAlign: 'right',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

/**
 * Create Review Screen
 * Màn hình viết đánh giá cho tour
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reviewService, orderService } from '@/services';
import { ScreenHeader } from '@/components/shared';

export default function CreateReviewScreen() {
  const { orderId, tourId, reviewId } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);
  const isEditMode = !!reviewId;

  useEffect(() => {
    loadOrderDetail();
    if (isEditMode) {
      loadExistingReview();
    } else {
      checkExistingReview();
    }
  }, [orderId, tourId, reviewId]);

  const loadOrderDetail = async () => {
    try {
      setLoadingOrder(true);
      const orderIdNum = parseInt(orderId as string);
      const result = await orderService.getOrderDetail(orderIdNum);
      
      if (result.success && result.data) {
        // result.data có structure { order: Order }
        const order = result.data.order || result.data;
        setOrderData(order);
        
        // Tìm tour trong order items
        const tourItem = order.items?.find(
          (item: any) => item.tourId == tourId
        );
        
        if (!tourItem) {
          Alert.alert('Lỗi', 'Không tìm thấy tour trong đơn hàng này');
          router.back();
        }
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      router.back();
    } finally {
      setLoadingOrder(false);
    }
  };

  const loadExistingReview = async () => {
    try {
      const tourIdNum = parseInt(tourId as string);
      const orderIdNum = parseInt(orderId as string);
      const result = await reviewService.getMyReview(tourIdNum, orderIdNum);
      
      if (result.success && result.data) {
        setExistingReview(result.data);
        setRating(result.data.rating);
        setComment(result.data.comment || '');
      }
    } catch (error: any) {
      // Silent fail - review won't be loaded
    }
  };

  const checkExistingReview = async () => {
    try {
      const tourIdNum = parseInt(tourId as string);
      const orderIdNum = parseInt(orderId as string);
      const result = await reviewService.getMyReview(tourIdNum, orderIdNum);
      
      if (result.success && result.data) {
        const reviewData = result.data;
        // Đã có review, chuyển sang edit mode
        Alert.alert(
          'Thông báo',
          'Bạn đã đánh giá tour này rồi. Bạn có muốn chỉnh sửa đánh giá không?',
          [
            {
              text: 'Hủy',
              onPress: () => router.back(),
              style: 'cancel',
            },
            {
              text: 'Chỉnh sửa',
              onPress: () => {
                setExistingReview(reviewData);
                setRating(reviewData.rating);
                setComment(reviewData.comment || '');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      // Silent fail - check won't complete
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length > 0 && comment.trim().length < 10) {
      Alert.alert('Thông báo', 'Nội dung đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    try {
      setLoading(true);
      
      let result;
      if (existingReview) {
        // Update existing review
        result = await reviewService.updateReview(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });
      } else {
        // Create new review
        result = await reviewService.createReview({
          tourId: parseInt(tourId as string),
          orderId: parseInt(orderId as string),
          rating,
          comment: comment.trim() || undefined,
        });
      }

      if (result.success) {
        Alert.alert('Thành công', result.message || 'Đánh giá của bạn đã được gửi', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
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
              setLoading(true);
              const result = await reviewService.deleteReview(existingReview.id);
              
              if (result.success) {
                Alert.alert('Thành công', result.message || 'Đã xóa đánh giá', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert('Lỗi', result.message || 'Không thể xóa đánh giá');
              }
            } catch (error: any) {
              console.error('Error deleting review:', error);
              Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? '#FFB800' : '#C7C7CC'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loadingOrder) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Đánh giá tour" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // Tìm tour trong order items
  const tourItem = orderData?.items?.find(
    (item: any) => item.tourId == tourId
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={existingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá tour'} />
      
      <ScrollView style={styles.scrollView}>
        {/* Tour Info */}
        {tourItem && (
          <View style={styles.tourInfo}>
            {tourItem.tourAvatar && (
              <Image
                source={{ uri: tourItem.tourAvatar }}
                style={styles.tourImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.tourDetails}>
              <Text style={styles.tourName} numberOfLines={2}>
                {tourItem.tourName}
              </Text>
              <Text style={styles.orderCode}>
                Mã đơn: {orderData.code}
              </Text>
            </View>
          </View>
        )}

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
          <Text style={styles.sectionSubtitle}>
            Bạn cảm thấy tour này như thế nào?
          </Text>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Tuyệt vời'}
            </Text>
          )}
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chia sẻ trải nghiệm</Text>
          <Text style={styles.sectionSubtitle}>
            Hãy chia sẻ cảm nhận của bạn về tour này (tùy chọn)
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Viết đánh giá của bạn..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={1000}
          />
          <Text style={styles.characterCount}>
            {comment.length}/1000 ký tự
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        {existingReview && (
          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.submitButtonDisabled]}
            onPress={handleDelete}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
            existingReview && styles.submitButtonWithDelete,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  tourInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  tourImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  tourDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  tourName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  orderCode: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  commentInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000000',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonWithDelete: {
    flex: 1,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 56,
    backgroundColor: '#FFF0F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
});

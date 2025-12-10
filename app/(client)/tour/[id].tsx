/**
 * Tour Detail Screen
 * Hiển thị thông tin chi tiết tour
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ImageView from 'react-native-image-viewing';
import { tourService, reviewService } from '@/services';
import { LoadingSpinner, ScreenHeader } from '@/components/shared';
import { RatingDisplay, ReviewCard } from '@/components/client';
import { Tour } from '@/types';
import { Review, ReviewStats } from '@/services/review.service';
import { formatCurrency, formatDate } from '@/utils/format';
import { formatHTMLForDisplay } from '@/utils/html';
import { extractImagesFromHTML, removeImagesFromHTML } from '@/utils/image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TourDetailScreen() {
  const { id } = useLocalSearchParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadTourDetail();
    loadReviews();
  }, [id]);

  const loadTourDetail = async () => {
    try {
      setLoading(true);
      const tourId = parseInt(id as string);
      const result = await tourService.getTourDetail(tourId);
      setTour(result);
    } catch (error: any) {
      console.error('Error loading tour detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tour. Vui lòng thử lại.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const tourId = parseInt(id as string);
      const result = await reviewService.getTourReviews(tourId, 1, 5); // Load 5 reviews đầu
      
      if (result.success && result.data) {
        setReviews(result.data.reviews);
        setReviewStats(result.data.stats);
      }
    } catch (error: any) {
      // Silent fail - reviews won't be loaded
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleBookNow = () => {
    if (!tour) return;
    router.push(`/(client)/booking/${tour.id}` as any);
  };

  const handleImagePress = (imageUrl: string) => {
    // Collect all images to find correct index
    const allImages: string[] = [];
    
    // Add carousel images
    if (tour?.images && tour.images.length > 0) {
      allImages.push(...tour.images);
    }
    
    // Add information images
    if (tour?.information) {
      const infoImages = extractImagesFromHTML(tour.information);
      allImages.push(...infoImages);
    }
    
    // Add schedule images
    if (tour?.schedules) {
      let schedules = tour.schedules;
      if (typeof schedules === 'string') {
        try {
          schedules = JSON.parse(schedules);
        } catch (e) {
          schedules = [];
        }
      }
      
      if (Array.isArray(schedules)) {
        schedules.forEach((schedule: any) => {
          const descHTML = schedule.desc || schedule.description || '';
          const images = extractImagesFromHTML(descHTML);
          allImages.push(...images);
        });
      }
    }
    
    // Find index of clicked image in all images
    const index = allImages.findIndex(img => img === imageUrl);
    setImageViewerIndex(index >= 0 ? index : 0);
    setImageViewerVisible(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin tour..." />;
  }

  if (!tour) {
    return null;
  }

  const hasDiscount =
    tour.priceNewAdult > 0 && tour.priceNewAdult < tour.priceAdult;
  const discountPercent = hasDiscount
    ? Math.round(((tour.priceAdult - tour.priceNewAdult) / tour.priceAdult) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Chi tiết tour" />
      <ScrollView style={styles.scrollView}>
        {/* Image Gallery Carousel */}
        {tour.images && tour.images.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={tour.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleImagePress(item)}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
            {/* Pagination Indicator */}
            <View style={styles.paginationContainer}>
              <View style={styles.paginationDots}>
                {tour.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{tour.images.length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{tour.name}</Text>

          {/* Info Row */}
          <View style={styles.infoRow}>
            {tour.time && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{tour.time}</Text>
              </View>
            )}
            {tour.vehicle && (
              <View style={styles.infoItem}>
                <Ionicons name="car-outline" size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{tour.vehicle}</Text>
              </View>
            )}
            {tour.stockAdult !== undefined && (
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={16} color="#8E8E93" />
                <Text style={styles.infoText}>{tour.stockAdult} chỗ</Text>
              </View>
            )}
          </View>

          {/* Departure Date */}
          {tour.departureDate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ngày khởi hành</Text>
              <View style={styles.dateCard}>
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={styles.dateText}>
                  {formatDate(tour.departureDate)}
                </Text>
              </View>
            </View>
          )}

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giá tour</Text>
            <View style={styles.priceCard}>
              {/* Người lớn */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Người lớn (từ 12 tuổi):</Text>
                <View style={styles.priceValues}>
                  {hasDiscount ? (
                    <Text style={styles.oldPrice}>
                      {formatCurrency(tour.priceAdult)}
                    </Text>
                  ) : null}
                  <Text style={styles.newPrice}>
                    {formatCurrency(tour.priceNewAdult ?? 0)}
                  </Text>
                  {hasDiscount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discountPercent}%</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Trẻ em */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Trẻ em (2-11 tuổi):</Text>
                <Text style={styles.newPrice}>
                  {formatCurrency(tour.priceNewChildren ?? 0)}
                </Text>
              </View>

              {/* Em bé */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Em bé (dưới 2 tuổi):</Text>
                <Text style={styles.newPrice}>
                  {formatCurrency(tour.priceNewBaby ?? 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Information */}
          {tour.information && (() => {
            const infoImages = extractImagesFromHTML(tour.information);
            const infoText = removeImagesFromHTML(tour.information);
            
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin tour</Text>
                
                {/* Images from information */}
                {infoImages.length > 0 && (
                  <View style={styles.infoImagesContainer}>
                    {infoImages.map((imageUrl, imgIndex) => (
                      <TouchableOpacity
                        key={imgIndex}
                        activeOpacity={0.8}
                        onPress={() => handleImagePress(imageUrl)}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.infoImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Information text (without images) */}
                {infoText && (
                  <Text style={styles.information}>
                    {formatHTMLForDisplay(infoText)}
                  </Text>
                )}
              </View>
            );
          })()}

          {/* Schedules */}
          {(() => {
            // Parse schedules if it's a string
            let schedules = tour.schedules;
            if (typeof schedules === 'string') {
              try {
                schedules = JSON.parse(schedules);
              } catch (e) {
                schedules = [];
              }
            }

            if (!Array.isArray(schedules) || schedules.length === 0) {
              return null;
            }

            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lịch trình chi tiết</Text>
                {schedules.map((schedule: any, index: number) => {
                  // Parse activities if it's a string
                  let activities = schedule.activities;
                  if (typeof activities === 'string') {
                    try {
                      activities = JSON.parse(activities);
                    } catch (e) {
                      activities = [];
                    }
                  }

                  // Extract images from description
                  const descHTML = schedule.desc || schedule.description || '';
                  const images = extractImagesFromHTML(descHTML);
                  const textWithoutImages = removeImagesFromHTML(descHTML);

                  return (
                    <View key={index} style={styles.scheduleItem}>
                      <View style={styles.scheduleDay}>
                        <Text style={styles.scheduleDayText}>
                          Ngày {schedule.day || index + 1}
                        </Text>
                      </View>
                      <View style={styles.scheduleContent}>
                        {schedule.title && (
                          <Text style={styles.scheduleTitle}>
                            {formatHTMLForDisplay(
                              schedule.title.replace(/^Ngày\s+\d+\s*/i, '')
                            )}
                          </Text>
                        )}

                        {/* Images from description */}
                        {images.length > 0 && (
                          <View style={styles.scheduleImagesContainer}>
                            {images.map((imageUrl, imgIndex) => (
                              <TouchableOpacity
                                key={imgIndex}
                                activeOpacity={0.8}
                                onPress={() => handleImagePress(imageUrl)}
                              >
                                <Image
                                  source={{ uri: imageUrl }}
                                  style={styles.scheduleImage}
                                  resizeMode="cover"
                                />
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        
                        {/* Description text (without images) */}
                        {textWithoutImages && (
                          <Text style={styles.scheduleDesc}>
                            {formatHTMLForDisplay(textWithoutImages)}
                          </Text>
                        )}

                        {/* Activities */}
                        {Array.isArray(activities) && activities.length > 0 && (
                          <View style={styles.activitiesContainer}>
                            {activities.map((activity: string, actIndex: number) => (
                              <View key={actIndex} style={styles.activityItem}>
                                <View style={styles.activityBullet} />
                                <Text style={styles.activityText}>
                                  {formatHTMLForDisplay(activity)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })()}

          {/* Reviews Section */}
          {reviewStats && reviewStats.totalReviews > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#000000', marginBottom: 16, paddingHorizontal: 16 }}>
                Đánh giá từ khách hàng
              </Text>
              
              {/* Rating Summary */}
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <RatingDisplay 
                  rating={reviewStats.averageRating} 
                  totalReviews={reviewStats.totalReviews}
                  size="large"
                />
              </View>

              {/* Reviews List */}
              {loadingReviews ? (
                <Text style={{ textAlign: 'center', color: '#8E8E93', padding: 20 }}>
                  Đang tải đánh giá...
                </Text>
              ) : (
                <View style={{ paddingHorizontal: 16 }}>
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard 
                      key={review.id} 
                      review={review}
                      onEdit={() => {
                        Alert.alert('Thông báo', 'Để chỉnh sửa đánh giá, vui lòng vào chi tiết đơn hàng');
                      }}
                      onDelete={async () => {
                        Alert.alert(
                          'Xác nhận xóa',
                          'Bạn có chắc chắn muốn xóa đánh giá này không?',
                          [
                            { text: 'Hủy', style: 'cancel' },
                            {
                              text: 'Xóa',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  const result = await reviewService.deleteReview(review.id);
                                  if (result.success) {
                                    Alert.alert('Thành công', 'Đã xóa đánh giá');
                                    loadReviews(); // Reload
                                  }
                                } catch (error: any) {
                                  Alert.alert('Lỗi', error.message);
                                }
                              },
                            },
                          ]
                        );
                      }}
                    />
                  ))}
                  
                  {reviewStats.totalReviews > 3 && (
                    <TouchableOpacity 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: 16,
                        backgroundColor: '#F0F8FF',
                        borderRadius: 12,
                        marginTop: 8,
                      }}
                      onPress={() => {
                        router.push(`/(client)/review/${tour.id}` as any);
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#007AFF', marginRight: 4 }}>
                        Xem tất cả {reviewStats.totalReviews} đánh giá
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Từ</Text>
          <Text style={styles.bottomPriceValue}>
            {formatCurrency(tour.priceNewAdult)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Image Viewer with Zoom */}
      <ImageView
        images={(() => {
          // Collect all images from tour
          const allImages: string[] = [];
          
          // Add carousel images
          if (tour.images && tour.images.length > 0) {
            allImages.push(...tour.images);
          }
          
          // Add information images
          if (tour.information) {
            const infoImages = extractImagesFromHTML(tour.information);
            allImages.push(...infoImages);
          }
          
          // Add schedule images
          if (tour.schedules) {
            let schedules = tour.schedules;
            if (typeof schedules === 'string') {
              try {
                schedules = JSON.parse(schedules);
              } catch (e) {
                schedules = [];
              }
            }
            
            if (Array.isArray(schedules)) {
              schedules.forEach((schedule: any) => {
                const descHTML = schedule.desc || schedule.description || '';
                const images = extractImagesFromHTML(descHTML);
                allImages.push(...images);
              });
            }
          }
          
          return allImages.map(uri => ({ uri }));
        })()}
        imageIndex={imageViewerIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#F2F2F7',
  },
  carouselContainer: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: '#F2F2F7',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#FF9500',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  priceCard: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  priceValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldPrice: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  information: {
    fontSize: 14,
    lineHeight: 22,
    color: '#000000',
  },
  infoImagesContainer: {
    marginBottom: 12,
    gap: 8,
  },
  infoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  scheduleDay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  scheduleDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
  scheduleImagesContainer: {
    marginTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  scheduleImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  activitiesContainer: {
    marginTop: 12,
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  activityBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 6,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 16,
  },
  bottomPrice: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});

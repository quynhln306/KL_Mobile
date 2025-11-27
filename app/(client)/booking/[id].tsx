/**
 * Booking Screen
 * Chọn số lượng và thêm vào giỏ hàng
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { tourService } from '@/services';
import { QuantitySelector } from '@/components/client';
import { LoadingSpinner, Button, ScreenHeader } from '@/components/shared';
import { Tour } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { useCart } from '@/contexts';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [quantityAdult, setQuantityAdult] = useState(0);
  const [quantityChildren, setQuantityChildren] = useState(0);
  const [quantityBaby, setQuantityBaby] = useState(0);

  const { addToCart } = useCart();

  useEffect(() => {
    loadTourDetail();
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

  const calculateTotal = () => {
    if (!tour) return 0;

    const adultTotal = quantityAdult * tour.priceNewAdult;
    const childrenTotal = quantityChildren * tour.priceNewChildren;
    const babyTotal = quantityBaby * tour.priceNewBaby;

    return adultTotal + childrenTotal + babyTotal;
  };

  const handleAddToCart = async () => {
    if (!tour) return;

    // Validate - Must have at least 1 adult
    if (quantityAdult === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 người lớn');
      return;
    }

    // Validate - Must have at least one person
    if (quantityAdult === 0 && quantityChildren === 0 && quantityBaby === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số lượng');
      return;
    }

    // Validate stock for each type
    if (quantityAdult > tour.stockAdult) {
      Alert.alert('Thông báo', `Chỉ còn ${tour.stockAdult} chỗ cho người lớn`);
      return;
    }

    if (quantityChildren > 0 && tour.stockChildren && quantityChildren > tour.stockChildren) {
      Alert.alert('Thông báo', `Chỉ còn ${tour.stockChildren} chỗ cho trẻ em`);
      return;
    }

    if (quantityBaby > 0 && tour.stockBaby && quantityBaby > tour.stockBaby) {
      Alert.alert('Thông báo', `Chỉ còn ${tour.stockBaby} chỗ cho trẻ sơ sinh`);
      return;
    }

    try {
      setAdding(true);

      await addToCart({
        tourId: tour.id,
        quantityAdult,
        quantityChildren,
        quantityBaby,
        // Add tour info for display in cart
        name: tour.name,
        slug: tour.slug,
        avatar: tour.avatar,
        departureDate: tour.departureDate,
        priceNewAdult: tour.priceNewAdult,
        priceNewChildren: tour.priceNewChildren,
        priceNewBaby: tour.priceNewBaby,
        stockAdult: tour.stockAdult,
        stockChildren: tour.stockChildren,
        stockBaby: tour.stockBaby,
      });

      Alert.alert(
        'Thành công',
        'Đã thêm vào giỏ hàng',
        [
          {
            text: 'Tiếp tục mua',
            style: 'cancel',
            onPress: () => router.back(),
          },
          {
            text: 'Xem giỏ hàng',
            onPress: () => router.push('/(client)/cart' as any),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải..." />;
  }

  if (!tour) {
    return null;
  }

  const total = calculateTotal();
  
  // Check if tour is sold out (no adult slots available)
  const isSoldOut = tour.stockAdult === 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Đặt tour" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Tour Info */}
        <View style={styles.tourCard}>
          {tour.avatar && (
            <Image source={{ uri: tour.avatar }} style={styles.tourImage} />
          )}
          <View style={styles.tourInfo}>
            <Text style={styles.tourName} numberOfLines={2}>
              {tour.name}
            </Text>
            {tour.departureDate && (
              <Text style={styles.tourDate}>
                Khởi hành: {formatDate(tour.departureDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Quantity Selectors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn số lượng</Text>

          <QuantitySelector
            label="Người lớn"
            value={quantityAdult}
            onChange={setQuantityAdult}
            min={0}
            max={tour.stockAdult}
            price={tour.priceNewAdult}
            priceLabel="/người"
          />

          {tour.priceNewChildren > 0 && (
            <QuantitySelector
              label="Trẻ em (2-11 tuổi)"
              value={quantityChildren}
              onChange={setQuantityChildren}
              min={0}
              max={tour.stockChildren || 0}
              price={tour.priceNewChildren}
              priceLabel="/trẻ"
            />
          )}

          {tour.priceNewBaby > 0 && (
            <QuantitySelector
              label="Trẻ sơ sinh (< 2 tuổi)"
              value={quantityBaby}
              onChange={setQuantityBaby}
              min={0}
              max={tour.stockBaby || 0}
              price={tour.priceNewBaby}
              priceLabel="/em bé"
            />
          )}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng cộng</Text>
          <View style={styles.summaryCard}>
            {quantityAdult > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Người lớn x {quantityAdult}
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(quantityAdult * tour.priceNewAdult)}
                </Text>
              </View>
            )}

            {quantityChildren > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Trẻ em x {quantityChildren}
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(quantityChildren * tour.priceNewChildren)}
                </Text>
              </View>
            )}

            {quantityBaby > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Trẻ sơ sinh x {quantityBaby}
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(quantityBaby * tour.priceNewBaby)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng tiền</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {isSoldOut ? (
          <View style={styles.soldOutContainer}>
            <Text style={styles.soldOutText}>Tour này đã hết chỗ</Text>
          </View>
        ) : (
          <>
            <View style={styles.bottomTotal}>
              <Text style={styles.bottomTotalLabel}>Tổng tiền</Text>
              <Text style={styles.bottomTotalValue}>{formatCurrency(total)}</Text>
            </View>
            <Button
              title="Thêm vào giỏ"
              onPress={handleAddToCart}
              loading={adding}
              disabled={adding}
              style={styles.addButton}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  tourCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  tourImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  tourInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tourName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tourDate: {
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 16,
  },
  bottomTotal: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },
  addButton: {
    flex: 1,
  },
  soldOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  soldOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

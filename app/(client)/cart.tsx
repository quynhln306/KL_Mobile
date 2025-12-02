/**
 * Cart Screen
 * Giỏ hàng - xem và quản lý các tour đã chọn
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts';
import { Button, EmptyState } from '@/components/shared';
import { QuantitySelector } from '@/components/client';
import { formatCurrency, formatDate } from '@/utils/format';
import { CartItem } from '@/types';
import { apiClient } from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api';
import { AppliedCoupon } from '@/contexts/CartContext';

export default function CartScreen() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalAmount, 
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart();
  
  // State cho mã khuyến mãi
  const [couponCode, setCouponCode] = useState(appliedCoupon?.coupon.code || '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleUpdateQuantity = (tourId: number, updates: Partial<Pick<CartItem, 'quantityAdult' | 'quantityChildren' | 'quantityBaby'>>) => {
    updateQuantity(tourId, updates);

    // Auto remove if all quantities are 0
    const item = items.find((i) => i.tourId === tourId);
    if (item) {
      const newQuantities = { ...item, ...updates };
      if (
        newQuantities.quantityAdult === 0 &&
        newQuantities.quantityChildren === 0 &&
        newQuantities.quantityBaby === 0
      ) {
        removeFromCart(tourId);
      }
    }
  };

  const handleRemoveItem = (tourId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tour này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeFromCart(tourId),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }

    router.push('/(client)/checkout' as any);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xóa giỏ hàng',
      'Bạn có chắc muốn xóa tất cả tour trong giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: () => {
            clearCart();
            setCouponCode('');
            setCouponError('');
          },
        },
      ]
    );
  };

  // Áp dụng mã khuyến mãi
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const orderTotal = getTotalAmount();
      const response = await apiClient.post(API_ENDPOINTS.CLIENT.COUPON_VALIDATE, {
        code: couponCode.trim().toUpperCase(),
        orderTotal,
      });

      if (response.data.success && response.data.data.valid) {
        setAppliedCoupon({
          coupon: response.data.data.coupon,
          discountAmount: response.data.data.discountAmount,
        });
        setCouponError('');
      } else {
        setCouponError(response.data.data.message || 'Mã khuyến mãi không hợp lệ');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setCouponError(error.message || 'Có lỗi xảy ra');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Xóa mã khuyến mãi
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        message="Bạn chưa thêm tour nào vào giỏ hàng"
        icon="🛒"
        actionLabel="Khám phá tours"
        onAction={() => router.push('/(client)/(tabs)/tours' as any)}
      />
    );
  }

  const subtotal = getTotalAmount();
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discountAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header with Back button and Clear All */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
        </View>
        <TouchableOpacity 
          onPress={handleClearCart} 
          style={styles.clearButton}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={styles.clearButtonText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {items.map((item) => (
          <View key={item.tourId} style={styles.cartItem}>
            {/* Tour Info */}
            <View style={styles.itemHeader}>
              {item.avatar && (
                <Image source={{ uri: item.avatar }} style={styles.itemImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.departureDate && (
                  <Text style={styles.itemDate}>
                    {formatDate(item.departureDate)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.tourId)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            {/* Quantities with Selectors */}
            <View style={styles.quantities}>
              <QuantitySelector
                label="Người lớn"
                value={item.quantityAdult}
                onChange={(value) =>
                  handleUpdateQuantity(item.tourId, { quantityAdult: value })
                }
                min={0}
                max={item.stockAdult || 99}
                price={item.priceNewAdult}
                priceLabel="/người"
              />

              {(item.quantityChildren > 0 || (item.priceNewChildren && item.priceNewChildren > 0)) && (
                <QuantitySelector
                  label="Trẻ em (2-11 tuổi)"
                  value={item.quantityChildren}
                  onChange={(value) =>
                    handleUpdateQuantity(item.tourId, { quantityChildren: value })
                  }
                  min={0}
                  max={item.stockChildren || 99}
                  price={item.priceNewChildren || 0}
                  priceLabel="/trẻ"
                />
              )}

              {(item.quantityBaby > 0 || (item.priceNewBaby && item.priceNewBaby > 0)) && (
                <QuantitySelector
                  label="Trẻ sơ sinh (< 2 tuổi)"
                  value={item.quantityBaby}
                  onChange={(value) =>
                    handleUpdateQuantity(item.tourId, { quantityBaby: value })
                  }
                  min={0}
                  max={item.stockBaby || 99}
                  price={item.priceNewBaby || 0}
                  priceLabel="/em bé"
                />
              )}
            </View>

            {/* Item Total */}
            <View style={styles.itemTotal}>
              <Text style={styles.itemTotalLabel}>Tổng</Text>
              <Text style={styles.itemTotalValue}>
                {formatCurrency(
                  (item.priceNewAdult || 0) * item.quantityAdult +
                    (item.priceNewChildren || 0) * item.quantityChildren +
                    (item.priceNewBaby || 0) * item.quantityBaby
                )}
              </Text>
            </View>
          </View>
        ))}

        {/* Coupon Section */}
        <View style={styles.couponSection}>
          <Text style={styles.couponTitle}>Mã khuyến mãi</Text>
          
          {appliedCoupon ? (
            // Đã áp dụng mã
            <View style={styles.appliedCoupon}>
              <View style={styles.appliedCouponInfo}>
                <Ionicons name="pricetag" size={20} color="#34C759" />
                <View style={styles.appliedCouponText}>
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.coupon.code}</Text>
                  <Text style={styles.appliedCouponDiscount}>
                    Giảm {formatCurrency(appliedCoupon.discountAmount)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            // Chưa áp dụng mã
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Nhập mã khuyến mãi"
                  placeholderTextColor="#8E8E93"
                  value={couponCode}
                  onChangeText={(text) => {
                    setCouponCode(text.toUpperCase());
                    setCouponError('');
                  }}
                  autoCapitalize="characters"
                  editable={!couponLoading}
                />
                <TouchableOpacity
                  style={[styles.applyCouponBtn, couponLoading && styles.applyCouponBtnDisabled]}
                  onPress={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyCouponBtnText}>Áp dụng</Text>
                  )}
                </TouchableOpacity>
              </View>
              {couponError ? (
                <Text style={styles.couponError}>{couponError}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {appliedCoupon && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>-{formatCurrency(discountAmount)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Tổng cộng</Text>
          <Text style={styles.bottomTotalValue}>{formatCurrency(total)}</Text>
          {appliedCoupon && (
            <Text style={styles.bottomDiscount}>Đã giảm {formatCurrency(discountAmount)}</Text>
          )}
        </View>
        <Button
          title="Thanh toán"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  removeButton: {
    padding: 4,
  },
  quantities: {
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  quantityPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  itemTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  itemTotalValue: {
    fontSize: 18,
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
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
  },
  checkoutButton: {
    flex: 1,
  },
  bottomDiscount: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 2,
  },
  // Coupon styles
  couponSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#F9F9F9',
  },
  applyCouponBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  applyCouponBtnDisabled: {
    backgroundColor: '#A0A0A0',
  },
  applyCouponBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  couponError: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 8,
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appliedCouponText: {
    gap: 2,
  },
  appliedCouponCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34C759',
  },
  appliedCouponDiscount: {
    fontSize: 13,
    color: '#666666',
  },
  removeCouponBtn: {
    padding: 4,
  },
  // Order Summary styles
  orderSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: '#000000',
  },
  discountValue: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },
});

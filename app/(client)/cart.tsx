/**
 * Cart Screen
 * Giỏ hàng - xem và quản lý các tour đã chọn
 */

import React from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts';
import { Button, EmptyState } from '@/components/shared';
import { QuantitySelector } from '@/components/client';
import { formatCurrency, formatDate } from '@/utils/format';
import { CartItem } from '@/types';

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, getTotalAmount, clearCart } = useCart();

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
          onPress: () => clearCart(),
        },
      ]
    );
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

  const total = getTotalAmount();

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
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Tổng cộng</Text>
          <Text style={styles.bottomTotalValue}>{formatCurrency(total)}</Text>
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
});

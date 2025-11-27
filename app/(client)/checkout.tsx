/**
 * Checkout Screen
 * Thanh toán - nhập thông tin và tạo đơn hàng
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart, useAuth } from '@/contexts';
import { orderService } from '@/services';
import { Button, Input, ScreenHeader } from '@/components/shared';
import { formatCurrency } from '@/utils/format';
import { isValidPhone } from '@/utils/validation';

type PaymentMethod = 'cash' | 'zalopay' | 'momo';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, getTotalAmount, clearCart } = useCart();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);

  const [fullNameError, setFullNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    setFullNameError('');
    setPhoneError('');

    if (!fullName.trim()) {
      setFullNameError('Vui lòng nhập họ tên');
      isValid = false;
    }

    if (!phone.trim()) {
      setPhoneError('Vui lòng nhập số điện thoại');
      isValid = false;
    } else if (!isValidPhone(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      isValid = false;
    }

    return isValid;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }

    try {
      setLoading(true);

      const result = await orderService.createOrder({
        fullName,
        phone,
        note,
        paymentMethod,
        items: items.map((item) => ({
          tourId: item.tourId,
          quantityAdult: item.quantityAdult,
          quantityChildren: item.quantityChildren,
          quantityBaby: item.quantityBaby,
        })),
      });

      if (result.success) {
        // Clear cart
        clearCart();

        Alert.alert(
          'Đặt tour thành công!',
          'Đơn hàng của bạn đã được tạo. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
          [
            {
              text: 'Xem đơn hàng',
              onPress: () => {
                router.replace('/(client)/(tabs)/orders' as any);
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotalAmount();

  const paymentMethods = [
    { value: 'cash' as PaymentMethod, label: 'Tiền mặt', icon: 'cash-outline' },
    { value: 'zalopay' as PaymentMethod, label: 'ZaloPay', icon: 'wallet-outline' },
    { value: 'momo' as PaymentMethod, label: 'MoMo', icon: 'card-outline' },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Thanh toán" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>

          <Input
            label="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên"
            error={fullNameError}
          />

          <Input
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            error={phoneError}
          />

          <Input
            label="Ghi chú (tùy chọn)"
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú cho đơn hàng"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentMethod,
                paymentMethod === method.value && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod(method.value)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodLeft}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={paymentMethod === method.value ? '#007AFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.paymentMethodLabel,
                    paymentMethod === method.value &&
                      styles.paymentMethodLabelActive,
                  ]}
                >
                  {method.label}
                </Text>
              </View>
              {paymentMethod === method.value && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số lượng tour</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số người</Text>
              <Text style={styles.summaryValue}>
                {items.reduce(
                  (sum, item) =>
                    sum +
                    item.quantityAdult +
                    item.quantityChildren +
                    item.quantityBaby,
                  0
                )}
              </Text>
            </View>

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
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotalValue}>{formatCurrency(total)}</Text>
        </View>
        <Button
          title="Đặt tour"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading}
          style={styles.placeOrderButton}
        />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  paymentMethodLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
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
  placeOrderButton: {
    flex: 1,
  },
});

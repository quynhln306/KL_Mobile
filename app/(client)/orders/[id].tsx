/**
 * Order Detail Screen
 * Hiển thị chi tiết đơn hàng
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '@/services';
import { LoadingSpinner, Button, ScreenHeader } from '@/components/shared';
import { StatusBadge } from '@/components/client';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderId = parseInt(id as string);
      const result = await orderService.getOrderDetail(orderId);

      if (result.success && result.data) {
        setOrder(result.data.order);
      }
    } catch (error: any) {
      console.error('Error loading order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Liên hệ hỗ trợ',
      'Hotline: 1900-xxxx\nEmail: support@tourapp.com'
    );
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin đơn hàng..." />;
  }

  if (!order) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Chi tiết đơn hàng" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
              <Text style={styles.orderDate}>
                {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
              </Text>
            </View>
            <StatusBadge status={order.status as any} size="medium" />
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ tên</Text>
                <Text style={styles.infoValue}>{order.fullName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{order.phone}</Text>
              </View>
            </View>

            {order.note && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ghi chú</Text>
                  <Text style={styles.infoValue}>{order.note}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách tours</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
              // Calculate item total
              const itemTotal =
                (item.quantityAdult * (item.priceNewAdult || 0)) +
                (item.quantityChildren * (item.priceNewChildren || 0)) +
                (item.quantityBaby * (item.priceNewBaby || 0));

              return (
                <View key={index} style={styles.tourCard}>
                  {item.avatar && (
                    <Image
                      source={{ uri: item.avatar }}
                      style={styles.tourImage}
                    />
                  )}
                  <View style={styles.tourInfo}>
                    <Text style={styles.tourName} numberOfLines={2}>
                      {item.name || 'Tour'}
                    </Text>

                    {/* Quantities */}
                    <View style={styles.quantitiesContainer}>
                      {item.quantityAdult > 0 && (
                        <Text style={styles.quantityText}>
                          Người lớn: {item.quantityAdult} x {formatCurrency(item.priceNewAdult || 0)}
                        </Text>
                      )}
                      {item.quantityChildren > 0 && (
                        <Text style={styles.quantityText}>
                          Trẻ em: {item.quantityChildren} x {formatCurrency(item.priceNewChildren || 0)}
                        </Text>
                      )}
                      {item.quantityBaby > 0 && (
                        <Text style={styles.quantityText}>
                          Trẻ sơ sinh: {item.quantityBaby} x {formatCurrency(item.priceNewBaby || 0)}
                        </Text>
                      )}
                    </View>

                    {/* Price */}
                    <Text style={styles.tourPrice}>
                      {formatCurrency(itemTotal)}
                    </Text>

                    {/* Review Button - Only show for completed orders */}
                    {order.status === 'done' && (
                      <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => {
                          router.push({
                            pathname: '/(client)/review/create',
                            params: {
                              orderId: order.id,
                              tourId: item.tourId,
                            },
                          } as any);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="star-outline" size={16} color="#007AFF" />
                        <Text style={styles.reviewButtonText}>Đánh giá</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Không có tour nào</Text>
          )}
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.card}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phương thức</Text>
              <View style={styles.paymentMethod}>
                <Ionicons
                  name={
                    order.paymentMethod === 'cash'
                      ? 'cash-outline'
                      : 'card-outline'
                  }
                  size={16}
                  color="#007AFF"
                />
                <Text style={styles.paymentMethodText}>
                  {order.paymentMethod === 'cash'
                    ? 'Tiền mặt'
                    : order.paymentMethod === 'zalopay'
                    ? 'ZaloPay'
                    : order.paymentMethod === 'momo'
                    ? 'MoMo'
                    : order.paymentMethod}
                </Text>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Trạng thái</Text>
              <View
                style={[
                  styles.paymentStatusBadge,
                  order.paymentStatus === 'paid'
                    ? styles.paymentStatusPaid
                    : styles.paymentStatusUnpaid,
                ]}
              >
                <Ionicons
                  name={
                    order.paymentStatus === 'paid'
                      ? 'checkmark-circle'
                      : 'time-outline'
                  }
                  size={16}
                  color={order.paymentStatus === 'paid' ? '#34C759' : '#FF9500'}
                />
                <Text
                  style={[
                    styles.paymentStatusText,
                    order.paymentStatus === 'paid'
                      ? styles.paymentStatusTextPaid
                      : styles.paymentStatusTextUnpaid,
                  ]}
                >
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng tiền</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.supportText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  tourCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
    justifyContent: 'space-between',
  },
  tourName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  quantitiesContainer: {
    gap: 2,
  },
  quantityText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethodText: {
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
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 8,
  },
  supportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paymentStatusPaid: {
    backgroundColor: '#E8F5E8',
  },
  paymentStatusUnpaid: {
    backgroundColor: '#FFF3E0',
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentStatusTextPaid: {
    color: '#34C759',
  },
  paymentStatusTextUnpaid: {
    color: '#FF9500',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});

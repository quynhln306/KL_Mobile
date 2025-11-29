/**
 * Admin Order Detail Screen
 * Chi tiết đơn hàng
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '@/services/admin.service';
import { Order } from '@/types';

const STATUS_CONFIG = {
  initial: { label: 'Khởi tạo', color: '#FF9500', icon: 'time' },
  confirmed: { label: 'Đã xác nhận', color: '#007AFF', icon: 'checkmark-circle' },
  done: { label: 'Hoàn thành', color: '#34C759', icon: 'checkmark-done-circle' },
  cancel: { label: 'Đã hủy', color: '#FF3B30', icon: 'close-circle' },
} as const;

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const response = await adminService.getOrderDetail(Number(id));
      if (response.success && response.data) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = (newStatus: string) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn cập nhật trạng thái đơn hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await adminService.updateOrderStatus(Number(id), newStatus as any);
              fetchOrder();
              Alert.alert('Thành công', 'Đã cập nhật trạng thái');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount?: any): string => {
    // Handle null/undefined
    if (amount === null || amount === undefined) {
      return '0 ₫';
    }
    
    // Convert to number if it's a string
    let numAmount: number;
    if (typeof amount === 'string') {
      numAmount = parseFloat(amount);
    } else if (typeof amount === 'number') {
      numAmount = amount;
    } else {
      return '0 ₫';
    }
    
    // Check if valid number
    if (isNaN(numAmount)) {
      return '0 ₫';
    }
    
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(numAmount);
    } catch (error) {
      return '0 ₫';
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.initial;
  const headerTitle = 'Đơn hàng #' + String(order.code || order.id || 'N/A');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusConfig.color + '15' }]}>
          <Ionicons name={statusConfig.icon as any} size={32} color={statusConfig.color} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <InfoRow icon="person-outline" label="Họ tên" value={String(order.fullName || 'N/A')} />
          <InfoRow icon="call-outline" label="Điện thoại" value={String(order.phone || 'N/A')} />
          {order.note ? (
            <InfoRow icon="document-text-outline" label="Ghi chú" value={String(order.note)} />
          ) : null}
        </View>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết tour</Text>
            {order.items.map((item, index) => {
              // Safely extract numeric values
              let adultQty = 0;
              let childQty = 0;
              let babyQty = 0;
              
              try {
                if (item.quantityAdult !== null && item.quantityAdult !== undefined) {
                  adultQty = typeof item.quantityAdult === 'number' 
                    ? item.quantityAdult 
                    : parseInt(String(item.quantityAdult), 10) || 0;
                }
                if (item.quantityChildren !== null && item.quantityChildren !== undefined) {
                  childQty = typeof item.quantityChildren === 'number'
                    ? item.quantityChildren
                    : parseInt(String(item.quantityChildren), 10) || 0;
                }
                if (item.quantityBaby !== null && item.quantityBaby !== undefined) {
                  babyQty = typeof item.quantityBaby === 'number'
                    ? item.quantityBaby
                    : parseInt(String(item.quantityBaby), 10) || 0;
                }
              } catch (e) {
                console.error('Error parsing quantities:', e);
              }
              
              // Get tour name - ensure it's a string
              let tourName = 'Tour';
              try {
                if (item.name) {
                  const nameStr = String(item.name);
                  if (nameStr && nameStr !== '[object Object]') {
                    tourName = nameStr.trim();
                  }
                } else if (item.tourName) {
                  const tourNameStr = String(item.tourName);
                  if (tourNameStr && tourNameStr !== '[object Object]') {
                    tourName = tourNameStr.trim();
                  }
                }
              } catch (e) {
                console.error('Error parsing tour name:', e);
              }
              
              // Format departure date safely
              let departureDateStr = '';
              try {
                if (item.departureDate) {
                  const date = new Date(item.departureDate);
                  if (!isNaN(date.getTime())) {
                    departureDateStr = date.toLocaleDateString('vi-VN');
                  }
                }
              } catch (e) {
                console.error('Error parsing date:', e);
              }
              
              // Build strings safely - ensure all parts are strings
              const quantityText = 'Người lớn: ' + String(adultQty) + ' | Trẻ em: ' + String(childQty) + ' | Em bé: ' + String(babyQty);
              const dateText = departureDateStr ? 'Ngày khởi hành: ' + departureDateStr : '';
              
              return (
                <View key={String(index)} style={styles.itemCard}>
                  <Text style={styles.itemName}>{tourName}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>{quantityText}</Text>
                    {dateText ? (
                      <Text style={styles.itemDate}>{dateText}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tạm tính</Text>
            <Text style={styles.paymentValue}>{formatCurrency(order.subTotal)}</Text>
          </View>
          
          {order.couponDiscount && order.couponDiscount > 0 ? (
            <CouponDiscountRow 
              couponCode={order.couponCode} 
              discount={order.couponDiscount}
              formatCurrency={formatCurrency}
            />
          ) : null}
          
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
          
          <InfoRow
            icon="card-outline"
            label="Phương thức"
            value={order.paymentMethod === 'cod' ? 'Thanh toán khi nhận' : String(order.paymentMethod || 'N/A')}
          />
          <InfoRow icon="time-outline" label="Ngày đặt" value={formatDate(order.createdAt)} />
        </View>

        {/* Action Buttons */}
        {order.status === 'initial' && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleUpdateStatus('confirmed')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Xác nhận đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleUpdateStatus('cancel')}
            >
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Hủy đơn</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'confirmed' && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.doneButton]}
              onPress={() => handleUpdateStatus('done')}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CouponDiscountRow({ 
  couponCode, 
  discount, 
  formatCurrency 
}: { 
  couponCode: any; 
  discount: any; 
  formatCurrency: (amount: any) => string;
}) {
  let labelText = 'Giảm giá';
  if (couponCode) {
    const codeStr = String(couponCode);
    labelText = 'Giảm giá (' + codeStr + ')';
  }
  
  const discountText = '-' + formatCurrency(discount);
  
  return (
    <View style={styles.paymentRow}>
      <Text style={styles.paymentLabel}>{labelText}</Text>
      <Text style={[styles.paymentValue, { color: '#34C759' }]}>{discountText}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value?: any }) {
  let displayValue = 'N/A';
  
  if (value !== null && value !== undefined) {
    if (typeof value === 'string') {
      displayValue = value;
    } else if (typeof value === 'number') {
      displayValue = String(value);
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Có' : 'Không';
    } else {
      displayValue = String(value);
    }
  }
  
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color="#8E8E93" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{displayValue}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF6B35',
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
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    maxWidth: '50%',
    textAlign: 'right',
  },
  itemCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  itemDetails: {
    gap: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#3C3C43',
  },
  itemDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  paymentValue: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF3B3015',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  doneButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

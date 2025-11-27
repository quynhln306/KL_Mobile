/**
 * OrderCard Component
 * Hiển thị đơn hàng trong danh sách
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

// Inline StatusBadge component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'initial':
        return {
          label: 'Khởi tạo',
          color: '#FF9500',
          backgroundColor: '#FFF3E0',
        };
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          color: '#5AC8FA',
          backgroundColor: '#E3F2FD',
        };
      case 'done':
        return {
          label: 'Hoàn thành',
          color: '#34C759',
          backgroundColor: '#E8F5E8',
        };
      case 'cancel':
        return {
          label: 'Đã hủy',
          color: '#FF3B30',
          backgroundColor: '#FFEBEE',
        };
      default:
        return {
          label: 'Không xác định',
          color: '#8E8E93',
          backgroundColor: '#F2F2F7',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: config.backgroundColor,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderDate}>
          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
        </Text>
        <StatusBadge status={order.status} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#8E8E93" />
            <Text style={styles.customerName}>{order.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#8E8E93" />
            <Text style={styles.customerPhone}>{order.phone}</Text>
          </View>
        </View>

        {/* Tours Count */}
        <View style={styles.toursInfo}>
          <Ionicons name="map-outline" size={16} color="#8E8E93" />
          <Text style={styles.toursText}>
            {order.items?.length || 0} tour{(order.items?.length || 0) > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.paymentInfo}>
            <Ionicons name="card-outline" size={14} color="#8E8E93" />
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'cash'
                ? 'Tiền mặt'
                : order.paymentMethod === 'zalopay'
                ? 'ZaloPay'
                : order.paymentMethod === 'momo'
                ? 'MoMo'
                : order.paymentMethod}
            </Text>
          </View>
          {/* Payment Status Badge */}
          <View
            style={[
              styles.paymentStatusBadge,
              order.paymentStatus === 'paid'
                ? styles.paymentStatusPaid
                : styles.paymentStatusUnpaid,
            ]}
          >
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
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  content: {
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  toursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  toursText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#8E8E93',
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paymentStatusPaid: {
    backgroundColor: '#E8F5E8',
  },
  paymentStatusUnpaid: {
    backgroundColor: '#FFF3E0',
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentStatusTextPaid: {
    color: '#34C759',
  },
  paymentStatusTextUnpaid: {
    color: '#FF9500',
  },
});

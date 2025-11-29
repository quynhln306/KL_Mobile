/**
 * OrderCard Component
 * Card hiển thị thông tin đơn hàng với quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS, ADMIN_SHADOWS } from './theme';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export function OrderCard({
  order,
  onPress,
  onConfirm,
  onCancel,
  showActions = true,
}: OrderCardProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const tourName = order.items?.[0]?.tourName || order.items?.[0]?.name || 'Tour';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.code || order.id || 'N/A'}</Text>
        <StatusBadge status={order.status} size="sm" />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.tourName} numberOfLines={1}>
          {tourName}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color={ADMIN_COLORS.textSecondary} />
          <Text style={styles.metaText}>{order.fullName || 'Khách hàng'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={ADMIN_COLORS.textSecondary} />
          <Text style={styles.metaText}>{formatDate(order.createdAt)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalAmount}>{formatCurrency(order.total || 0)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    padding: ADMIN_SPACING.lg,
    marginBottom: ADMIN_SPACING.md,
    ...ADMIN_SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ADMIN_SPACING.md,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
  },
  info: {
    marginBottom: ADMIN_SPACING.md,
  },
  tourName: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    marginBottom: ADMIN_SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.xs,
    marginTop: ADMIN_SPACING.xs,
  },
  metaText: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ADMIN_COLORS.border,
    paddingTop: ADMIN_SPACING.md,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: ADMIN_COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: ADMIN_SPACING.sm,
  },
  actionBtn: {
    paddingHorizontal: ADMIN_SPACING.md,
    paddingVertical: ADMIN_SPACING.sm,
    borderRadius: ADMIN_RADIUS.sm,
  },
  confirmBtn: {
    backgroundColor: ADMIN_COLORS.success,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ADMIN_COLORS.textInverse,
  },
  cancelBtn: {
    backgroundColor: ADMIN_COLORS.errorLight,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ADMIN_COLORS.error,
  },
});

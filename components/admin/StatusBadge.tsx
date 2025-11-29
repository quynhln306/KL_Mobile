/**
 * StatusBadge Component
 * Badge hiển thị trạng thái với màu sắc tương ứng
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from './theme';

type StatusType = 'initial' | 'confirmed' | 'done' | 'cancel' | 'active' | 'inactive' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const STATUS_MAP: Record<StatusType, { label: string; color: string; icon: string }> = {
  initial: { label: 'Khởi tạo', color: ADMIN_COLORS.warning, icon: 'time' },
  confirmed: { label: 'Đã xác nhận', color: ADMIN_COLORS.info, icon: 'checkmark-circle' },
  done: { label: 'Hoàn thành', color: ADMIN_COLORS.success, icon: 'checkmark-done-circle' },
  cancel: { label: 'Đã hủy', color: ADMIN_COLORS.error, icon: 'close-circle' },
  active: { label: 'Hoạt động', color: ADMIN_COLORS.success, icon: 'checkmark-circle' },
  inactive: { label: 'Ngừng', color: ADMIN_COLORS.textSecondary, icon: 'pause-circle' },
  pending: { label: 'Chờ duyệt', color: ADMIN_COLORS.warning, icon: 'time' },
};

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.initial;
  
  const sizeStyles = {
    sm: { paddingH: 8, paddingV: 2, fontSize: 11, iconSize: 12 },
    md: { paddingH: 10, paddingV: 4, fontSize: 12, iconSize: 14 },
    lg: { paddingH: 12, paddingV: 6, fontSize: 14, iconSize: 16 },
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.color + '20',
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={s.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: config.color, fontSize: s.fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ADMIN_RADIUS.full,
  },
  icon: {
    marginRight: ADMIN_SPACING.xs,
  },
  text: {
    fontWeight: '600',
  },
});

/**
 * StatusBadge Component
 * Hiển thị trạng thái với màu sắc
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatusBadgeProps {
  status: 'initial' | 'confirmed' | 'done' | 'cancel';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = 'medium',
  showIcon = true,
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'initial':
        return {
          label: 'Khởi tạo',
          color: '#FF9500',
          backgroundColor: '#FFF3E0',
          icon: 'time-outline',
        };
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          color: '#5AC8FA',
          backgroundColor: '#E3F2FD',
          icon: 'checkmark-circle-outline',
        };
      case 'done':
        return {
          label: 'Hoàn thành',
          color: '#34C759',
          backgroundColor: '#E8F5E8',
          icon: 'checkmark-done-outline',
        };
      case 'cancel':
        return {
          label: 'Đã hủy',
          color: '#FF3B30',
          backgroundColor: '#FFEBEE',
          icon: 'close-circle-outline',
        };
      default:
        return {
          label: 'Không xác định',
          color: '#8E8E93',
          backgroundColor: '#F2F2F7',
          icon: 'help-circle-outline',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { padding: 6, fontSize: 10, iconSize: 10 };
      case 'large':
        return { padding: 12, fontSize: 14, iconSize: 14 };
      default:
        return { padding: 8, fontSize: 12, iconSize: 12 };
    }
  };

  const config = getStatusConfig(status);
  const sizeConfig = getSizeConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding / 2,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={sizeConfig.iconSize}
          color={config.color}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: config.color, fontSize: sizeConfig.fontSize },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    gap: 4,
  },
  text: {
    fontWeight: '600',
  },
});

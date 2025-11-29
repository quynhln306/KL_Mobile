/**
 * EmptyState Component
 * Hiển thị khi không có dữ liệu
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from './theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  subtitle,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={ADMIN_COLORS.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.xxxl * 2,
    paddingHorizontal: ADMIN_SPACING.xl,
  },
  iconContainer: {
    marginBottom: ADMIN_SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: ADMIN_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: ADMIN_SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: ADMIN_SPACING.xl,
    paddingHorizontal: ADMIN_SPACING.xl,
    paddingVertical: ADMIN_SPACING.md,
    backgroundColor: ADMIN_COLORS.primary,
    borderRadius: ADMIN_RADIUS.sm,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textInverse,
  },
});

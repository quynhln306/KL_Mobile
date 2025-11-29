/**
 * SectionHeader Component
 * Tiêu đề section với optional action button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING } from './theme';

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, icon, actionText, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={ADMIN_COLORS.textPrimary}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={16} color={ADMIN_COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ADMIN_SPACING.lg,
    paddingVertical: ADMIN_SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: ADMIN_SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: ADMIN_COLORS.primary,
    fontWeight: '500',
  },
});

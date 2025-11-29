/**
 * MenuRow Component
 * Row menu với icon, title, subtitle và arrow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from './theme';

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: () => void;
  showArrow?: boolean;
  showBorder?: boolean;
}

export function MenuRow({
  icon,
  iconColor = ADMIN_COLORS.primary,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  showBorder = true,
}: MenuRowProps) {
  return (
    <TouchableOpacity
      style={[styles.container, showBorder && styles.withBorder]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {value !== undefined && <Text style={styles.value}>{value}</Text>}

      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={ADMIN_COLORS.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.md,
    paddingHorizontal: ADMIN_SPACING.lg,
    backgroundColor: ADMIN_COLORS.card,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: ADMIN_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ADMIN_SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: ADMIN_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: ADMIN_COLORS.textSecondary,
    marginTop: 2,
  },
  value: {
    fontSize: 15,
    color: ADMIN_COLORS.textSecondary,
    marginRight: ADMIN_SPACING.sm,
  },
});

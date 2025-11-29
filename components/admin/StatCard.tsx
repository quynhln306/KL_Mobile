/**
 * StatCard Component
 * Card hiển thị thống kê với icon và số liệu
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS, ADMIN_SHADOWS } from './theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  color?: string;
  subtitle?: string;
  isLarge?: boolean;
  onPress?: () => void;
}

export function StatCard({
  icon,
  title,
  value,
  color = ADMIN_COLORS.primary,
  subtitle,
  isLarge = false,
  onPress,
}: StatCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, isLarge && styles.containerLarge]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, isLarge && styles.valueLarge]} numberOfLines={1}>
        {value}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {onPress && (
        <View style={styles.arrow}>
          <Ionicons name="chevron-forward" size={16} color={ADMIN_COLORS.textTertiary} />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.lg,
    padding: ADMIN_SPACING.lg,
    width: '47%',
    ...ADMIN_SHADOWS.md,
  },
  containerLarge: {
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: ADMIN_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ADMIN_SPACING.md,
  },
  title: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
    marginBottom: ADMIN_SPACING.xs,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.textPrimary,
  },
  valueLarge: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 12,
    color: ADMIN_COLORS.textTertiary,
    marginTop: ADMIN_SPACING.xs,
  },
  arrow: {
    position: 'absolute',
    top: ADMIN_SPACING.lg,
    right: ADMIN_SPACING.lg,
  },
});

/**
 * InfoRow Component
 * Row hiển thị thông tin với icon, label và value
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING } from './theme';

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  type?: 'text' | 'phone' | 'email' | 'link';
  showBorder?: boolean;
}

export function InfoRow({
  icon,
  label,
  value,
  type = 'text',
  showBorder = true,
}: InfoRowProps) {
  const handlePress = () => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'link':
        Linking.openURL(value);
        break;
    }
  };

  const isClickable = type !== 'text';
  const Container = isClickable ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, showBorder && styles.withBorder]}
      onPress={isClickable ? handlePress : undefined}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Ionicons name={icon} size={18} color={ADMIN_COLORS.textSecondary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text
        style={[styles.value, isClickable && styles.valueClickable]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ADMIN_SPACING.md,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ADMIN_SPACING.sm,
  },
  label: {
    fontSize: 14,
    color: ADMIN_COLORS.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  valueClickable: {
    color: ADMIN_COLORS.info,
  },
});

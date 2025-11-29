/**
 * SearchBar Component
 * Thanh tìm kiếm với icon và clear button
 */

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from './theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm...',
  onSubmit,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={ADMIN_COLORS.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={ADMIN_COLORS.textTertiary}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={20} color={ADMIN_COLORS.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: ADMIN_RADIUS.md,
    paddingHorizontal: ADMIN_SPACING.md,
    marginHorizontal: ADMIN_SPACING.lg,
    marginVertical: ADMIN_SPACING.md,
    height: 44,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  icon: {
    marginRight: ADMIN_SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: ADMIN_COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: ADMIN_SPACING.xs,
  },
});

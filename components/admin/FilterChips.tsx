/**
 * FilterChips Component
 * Filter chips scroll ngang
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS } from './theme';

interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {options.map((option, index) => {
        const isSelected = selected === option.key;
        const isLast = index === options.length - 1;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              isLast && styles.chipLast,
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option.label}
              {option.count !== undefined && ` (${option.count})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: ADMIN_SPACING.lg,
    paddingVertical: ADMIN_SPACING.md,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ADMIN_COLORS.card,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    marginRight: 10,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLast: {
    marginRight: ADMIN_SPACING.lg,
  },
  chipSelected: {
    backgroundColor: ADMIN_COLORS.primary,
    borderColor: ADMIN_COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: ADMIN_COLORS.textSecondary,
  },
  chipTextSelected: {
    color: ADMIN_COLORS.textInverse,
    fontWeight: '600',
  },
});

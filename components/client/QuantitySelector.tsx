/**
 * QuantitySelector Component
 * Chọn số lượng với nút +/-
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantitySelectorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  price?: number;
  priceLabel?: string;
}

export function QuantitySelector({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  disabled = false,
  price,
  priceLabel,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const canDecrease = value > min && !disabled;
  const canIncrease = value < max && !disabled;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {/* Label and Price */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {price !== undefined && (
          <Text style={styles.price}>
            {price.toLocaleString('vi-VN')}đ{priceLabel && ` ${priceLabel}`}
          </Text>
        )}
      </View>

      {/* Quantity Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.decreaseButton,
            !canDecrease && styles.buttonDisabled,
          ]}
          onPress={handleDecrease}
          disabled={!canDecrease}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={18}
            color={canDecrease ? '#007AFF' : '#C7C7CC'}
          />
        </TouchableOpacity>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantity}>{value}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.increaseButton,
            !canIncrease && styles.buttonDisabled,
          ]}
          onPress={handleIncrease}
          disabled={!canIncrease}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={18}
            color={canIncrease ? '#007AFF' : '#C7C7CC'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    color: '#8E8E93',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  decreaseButton: {
    backgroundColor: '#FFFFFF',
  },
  increaseButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonDisabled: {
    borderColor: '#C7C7CC',
    backgroundColor: '#F2F2F7',
  },
  quantityContainer: {
    minWidth: 40,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});

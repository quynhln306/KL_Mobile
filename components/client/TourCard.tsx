/**
 * TourCard Component
 * Hiển thị tour trong danh sách
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tour } from '@/types';
import { formatCurrency } from '@/utils/format';
import { RatingDisplay } from './RatingDisplay';

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
}

export function TourCard({ tour, onPress }: TourCardProps) {
  const priceAdult = tour.priceAdult ?? 0;
  const priceNewAdult = tour.priceNewAdult ?? 0;
  const hasDiscount = priceAdult > 0 && priceNewAdult < priceAdult;
  const discountPercent = hasDiscount
    ? Math.round(((priceAdult - priceNewAdult) / priceAdult) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {tour.avatar ? (
          <Image source={{ uri: tour.avatar }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color="#C7C7CC" />
          </View>
        )}
        
        {/* Discount Badge */}
        {hasDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        ) : null}
        
        {/* Stock Badge */}
        {tour.stockAdult != null && tour.stockAdult < 5 ? (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>
              {tour.stockAdult === 0 ? 'Hết chỗ' : `Còn ${tour.stockAdult} chỗ`}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {tour.name}
        </Text>

        {/* Rating */}
        {tour.rating != null && tour.rating > 0 ? (
          <View style={styles.ratingContainer}>
            <RatingDisplay 
              rating={tour.rating} 
              totalReviews={tour.reviewCount}
              size="small"
            />
          </View>
        ) : null}

        {/* Info Row */}
        <View style={styles.infoRow}>
          {tour.time ? (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{tour.time}</Text>
            </View>
          ) : null}
          {tour.vehicle ? (
            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{tour.vehicle}</Text>
            </View>
          ) : null}
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          {hasDiscount ? (
            <Text style={styles.oldPrice}>{formatCurrency(priceAdult)}</Text>
          ) : null}
          <Text style={styles.price}>{formatCurrency(priceNewAdult)}</Text>
          <Text style={styles.priceLabel}>/người</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 22,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  oldPrice: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
  },
  priceLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

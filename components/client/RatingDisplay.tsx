/**
 * Rating Display Component
 * Hiển thị rating với sao
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingDisplayProps {
  rating: number; // 0-5
  totalReviews?: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
}

export function RatingDisplay({ 
  rating, 
  totalReviews, 
  size = 'medium',
  showNumber = true 
}: RatingDisplayProps) {
  const starSize = size === 'small' ? 12 : size === 'large' ? 20 : 16;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={starSize} color="#FFB800" />
      );
    }

    // Half star
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <Ionicons key="half" name="star-half" size={starSize} color="#FFB800" />
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={starSize} color="#FFB800" />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.stars}>{renderStars()}</View>
      {showNumber && (
        <Text style={[styles.ratingText, { fontSize }]}>
          {rating.toFixed(1)}
          {totalReviews !== undefined && ` (${totalReviews})`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontWeight: '600',
    color: '#000000',
  },
});

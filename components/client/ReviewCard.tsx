/**
 * Review Card Component
 * Hiển thị một review
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '@/services/review.service';
import { RatingDisplay } from './RatingDisplay';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const { user } = useAuth();
  const isMyReview = user?.id === review.userId;

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {review.userAvatar ? (
            <Text>👤</Text>
          ) : (
            <Ionicons name="person" size={20} color="#8E8E93" />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.userName}</Text>
          <Text style={styles.date}>{review.createdAtFormat}</Text>
        </View>
        
        {/* Edit/Delete buttons for own review */}
        {isMyReview && (onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <RatingDisplay rating={review.rating} size="small" showNumber={false} />
      </View>

      {/* Comment */}
      {review.comment && (
        <Text style={styles.comment}>{review.comment}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  ratingContainer: {
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});

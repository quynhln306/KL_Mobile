/**
 * Review Service
 * API calls cho reviews
 */

import { api } from './api';

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  createdAtFormat: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: { count: number; percentage: number };
    4: { count: number; percentage: number };
    3: { count: number; percentage: number };
    2: { count: number; percentage: number };
    1: { count: number; percentage: number };
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: ReviewStats;
  };
}

export const reviewService = {
  /**
   * Lấy danh sách reviews của tour
   */
  async getTourReviews(tourId: number, page = 1, limit = 10): Promise<ReviewsResponse> {
    const response = await api.get<ReviewsResponse>(
      `/api/client/tours/${tourId}/reviews`,
      {
        params: { page, limit },
      }
    );
    
    // Handle response structure
    if ((response as any).success) {
      return response as any;
    }
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to get reviews');
  },

  /**
   * Tạo review mới
   */
  async createReview(data: {
    tourId: number;
    orderId: number;
    rating: number;
    comment?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/api/client/reviews',
      data
    );
    
    if ((response as any).success !== undefined) {
      return response as any;
    }
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to create review');
  },

  /**
   * Lấy review của user cho tour và order cụ thể
   */
  async getMyReview(tourId: number, orderId: number): Promise<{
    success: boolean;
    data: {
      id: number;
      rating: number;
      comment: string | null;
      createdAt: string;
    } | null;
  }> {
    const response = await api.get<any>(
      `/api/client/reviews/my-review/${tourId}/${orderId}`
    );
    
    if ((response as any).success !== undefined) {
      return response as any;
    }
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to get my review');
  },

  /**
   * Cập nhật review
   */
  async updateReview(
    reviewId: number,
    data: {
      rating: number;
      comment?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      `/api/client/reviews/${reviewId}`,
      data
    );
    
    if ((response as any).success !== undefined) {
      return response as any;
    }
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update review');
  },

  /**
   * Xóa review
   */
  async deleteReview(reviewId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/api/client/reviews/${reviewId}`
    );
    
    if ((response as any).success !== undefined) {
      return response as any;
    }
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to delete review');
  },
};

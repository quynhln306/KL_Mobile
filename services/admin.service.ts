/**
 * Admin Service
 * Xử lý các API calls cho admin
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Tour, Order, Guide, Review, ApiResponse } from '@/types';

interface DashboardStats {
  totalTours: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: Order[];
}

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  }

  // ==================== TOURS MANAGEMENT ====================

  /**
   * Get all tours (admin view)
   */
  async getTours(params?: {
    page?: number;
    limit?: number;
    status?: string;
    includeDeleted?: boolean;
  }): Promise<ApiResponse> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.TOURS, { params });
    return response.data;
  }

  /**
   * Get tour detail (admin view)
   */
  async getTourDetail(tourId: number): Promise<ApiResponse<{ tour: Tour }>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.TOUR_DETAIL(tourId));
    return response.data;
  }

  /**
   * Update tour
   */
  async updateTour(tourId: number, data: Partial<Tour>): Promise<ApiResponse> {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.TOUR_UPDATE(tourId), data);
    return response.data;
  }

  /**
   * Delete tour (soft delete)
   */
  async deleteTour(tourId: number): Promise<ApiResponse> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.TOUR_DELETE(tourId));
    return response.data;
  }

  /**
   * Restore deleted tour
   */
  async restoreTour(tourId: number): Promise<ApiResponse> {
    const response = await apiClient.patch(API_ENDPOINTS.ADMIN.TOUR_DELETE(tourId) + '/restore');
    return response.data;
  }

  // ==================== ORDERS MANAGEMENT ====================

  /**
   * Get all orders (admin view)
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ORDERS, { params });
    return response.data;
  }

  /**
   * Get order detail (admin view)
   */
  async getOrderDetail(orderId: number): Promise<ApiResponse<{ order: Order }>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ORDER_DETAIL(orderId));
    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number,
    status: 'initial' | 'confirmed' | 'done' | 'cancel'
  ): Promise<ApiResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN.ORDER_UPDATE_STATUS(orderId),
      { status }
    );
    return response.data;
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: number,
    paymentStatus: 'unpaid' | 'paid' | 'refunded'
  ): Promise<ApiResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN.ORDER_UPDATE_PAYMENT(orderId),
      { paymentStatus }
    );
    return response.data;
  }

  // ==================== GUIDES MANAGEMENT ====================

  /**
   * Get all guides
   */
  async getGuides(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ guides: Guide[] }>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.GUIDES, { params });
    return response.data;
  }

  /**
   * Get guide detail
   */
  async getGuideDetail(guideId: number): Promise<ApiResponse<{ guide: Guide }>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.GUIDE_DETAIL(guideId));
    return response.data;
  }

  /**
   * Create guide schedule (assign guide to tour)
   */
  async createGuideSchedule(data: {
    guideId: number;
    tourId: number;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse> {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.SCHEDULE_CREATE, data);
    return response.data;
  }

  /**
   * Get guide schedules
   */
  async getGuideSchedules(params?: {
    guideId?: number;
    tourId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.SCHEDULES, { params });
    return response.data;
  }

  /**
   * Delete guide schedule
   */
  async deleteGuideSchedule(scheduleId: number): Promise<ApiResponse> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.SCHEDULE_DELETE(scheduleId));
    return response.data;
  }

  /**
   * Get available guides for a tour
   */
  async getAvailableGuides(tourId: number, date: string): Promise<ApiResponse<{ guides: Guide[] }>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.AVAILABLE_GUIDES, {
      params: { tourId, date },
    });
    return response.data;
  }

  // ==================== REVIEWS MANAGEMENT ====================

  /**
   * Get all reviews (admin view)
   */
  async getReviews(params?: {
    page?: number;
    limit?: number;
    tourId?: number;
    rating?: number;
  }): Promise<ApiResponse> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REVIEWS, { params });
    return response.data;
  }

  /**
   * Get review detail
   */
  async getReviewDetail(reviewId: number): Promise<ApiResponse<{ review: Review }>> {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REVIEW_DETAIL(reviewId));
    return response.data;
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: number): Promise<ApiResponse> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.REVIEW_DELETE(reviewId));
    return response.data;
  }
}

export const adminService = new AdminService();

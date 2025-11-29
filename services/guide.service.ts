/**
 * Guide Service
 * Xử lý các API calls cho hướng dẫn viên
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types';

interface GuideSchedule {
  id: number;
  guideId: number;
  tourId?: number;
  type: 'tour' | 'leave';
  startDate: string;
  endDate: string;
  startDateFormat?: string;
  endDateFormat?: string;
  leaveStatus?: 'pending' | 'approved' | 'rejected';
  leaveReason?: string;
  tour?: {
    id: number;
    name: string;
    avatar?: string;
    departureDate?: string;
    locations?: string[];
    time?: string;
  };
}

interface DashboardData {
  currentTour: GuideSchedule | null;
  upcomingTours: GuideSchedule[];
  completedTours: GuideSchedule[];
  stats: {
    totalTours: number;
    completedTours: number;
  };
}

class GuideService {
  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const response = await apiClient.get(API_ENDPOINTS.GUIDE.DASHBOARD);
    return response.data;
  }

  /**
   * Get schedule list
   */
  async getSchedule(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<{ schedules: GuideSchedule[] }>> {
    const response = await apiClient.get(API_ENDPOINTS.GUIDE.SCHEDULE, { params });
    return response.data;
  }

  /**
   * Get tour detail
   */
  async getTourDetail(tourId: number): Promise<ApiResponse<{ tour: any }>> {
    const response = await apiClient.get(API_ENDPOINTS.GUIDE.SCHEDULE_TOUR(tourId));
    return response.data;
  }

  /**
   * Check conflict with existing tours
   */
  async checkConflict(data: {
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<{
    hasConflict: boolean;
    conflictTours: Array<{
      tourId: number;
      tourName: string;
      startDate: string;
      endDate: string;
      startDateFormat: string;
      endDateFormat: string;
      locations?: string[];
    }>;
  }>> {
    const response = await apiClient.post(API_ENDPOINTS.GUIDE.CHECK_CONFLICT, data);
    return response.data;
  }

  /**
   * Create leave request
   */
  async createLeaveRequest(data: {
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<ApiResponse> {
    const response = await apiClient.post(API_ENDPOINTS.GUIDE.LEAVE_REQUEST, data);
    return response.data;
  }

  /**
   * Cancel leave request (only pending)
   */
  async cancelLeaveRequest(id: number): Promise<ApiResponse> {
    const response = await apiClient.delete(API_ENDPOINTS.GUIDE.CANCEL_LEAVE_REQUEST(id));
    return response.data;
  }
}

export const guideService = new GuideService();

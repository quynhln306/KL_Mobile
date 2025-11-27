/**
 * Home Service
 * API calls cho trang chủ
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Tour, Category } from '@/types';

export interface HomeData {
  featuredTours: Tour[];
  categories: Category[];
}

export const homeService = {
  /**
   * Lấy dữ liệu trang chủ (featured tours + categories)
   */
  async getHomeData(): Promise<{ success: boolean; data?: HomeData }> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CLIENT.HOME);

      return {
        success: response.data.success,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error getting home data:', error);
      return {
        success: false,
        data: {
          featuredTours: [],
          categories: [],
        },
      };
    }
  },
};

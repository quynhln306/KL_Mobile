/**
 * Tour Service
 * Handles tour-related API calls
 */

import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Tour, Category, ListResponse } from '@/types';

export const tourService = {
  /**
   * Get home data (featured tours, categories)
   */
  async getHomeData(): Promise<{
    featuredTours: Tour[];
    categories: Category[];
  }> {
    const response = await api.get(API_ENDPOINTS.CLIENT.HOME);
    return response.data || response;
  },

  /**
   * Get tour list
   */
  async getTours(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<ListResponse<Tour>> {
    const response = await api.get(API_ENDPOINTS.CLIENT.TOURS, { params });
    
    // Handle different response structures
    let data;
    if ((response as any).success && (response as any).data) {
      // Response structure: { success: true, data: { tours: [...], pagination: {...} } }
      data = (response as any).data;
    } else if (response.data) {
      // Response structure: { data: { tours: [...], pagination: {...} } }
      data = response.data;
    } else {
      // Direct response
      data = response;
    }

    // Transform backend response to match ListResponse type
    return {
      items: data.tours || [],
      pagination: data.pagination,
    };
  },

  /**
   * Get tour detail
   */
  async getTourDetail(tourId: number): Promise<Tour> {
    const response = await api.get(API_ENDPOINTS.CLIENT.TOUR_DETAIL(tourId));
    
    // api.get returns ApiResponse<any>
    // response.data is the actual data from backend
    if (response.data?.tour) {
      return response.data.tour;
    }
    
    throw new Error('Tour not found');
  },

  /**
   * Search tours
   */
  async searchTours(keyword: string, filters?: any): Promise<Tour[]> {
    const response = await api.get(API_ENDPOINTS.CLIENT.TOUR_SEARCH, {
      params: { keyword, ...filters },
    });
    
    return response.data?.tours || [];
  },

  /**
   * Get categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await api.get(API_ENDPOINTS.CLIENT.CATEGORIES);
    
    return response.data?.categories || [];
  },

  /**
   * Get tours by category
   */
  async getToursByCategory(slug: string): Promise<Tour[]> {
    const response = await api.get(API_ENDPOINTS.CLIENT.CATEGORY_TOURS(slug));
    
    return response.data?.tours || [];
  },
};


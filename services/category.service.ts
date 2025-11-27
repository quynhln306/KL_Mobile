/**
 * Category Service
 * Xử lý các API calls liên quan đến danh mục
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Category, Tour, ApiResponse } from '@/types';

class CategoryService {
  /**
   * Lấy danh sách categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
    const response = await apiClient.get(API_ENDPOINTS.CLIENT.CATEGORIES);
    return response.data;
  }

  /**
   * Lấy tours theo category
   */
  async getToursByCategory(categorySlug: string): Promise<ApiResponse<{
    category: Category;
    tours: Tour[];
  }>> {
    const response = await apiClient.get(
      API_ENDPOINTS.CLIENT.CATEGORY_TOURS(categorySlug)
    );
    return response.data;
  }
}

export const categoryService = new CategoryService();

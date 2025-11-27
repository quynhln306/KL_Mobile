/**
 * User Service
 * Xử lý các API calls liên quan đến user profile
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { User, ApiResponse } from '@/types';

interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class UserService {
  /**
   * Lấy thông tin profile
   */
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get(API_ENDPOINTS.CLIENT.USER_PROFILE);
    return response.data;
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put(API_ENDPOINTS.CLIENT.USER_UPDATE, data);
    return response.data;
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    const response = await apiClient.post(API_ENDPOINTS.CLIENT.USER_CHANGE_PASSWORD, data);
    return response.data;
  }

  /**
   * Upload avatar (nếu backend có API)
   */
  async uploadAvatar(file: File | Blob): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/api/client/user/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const userService = new UserService();

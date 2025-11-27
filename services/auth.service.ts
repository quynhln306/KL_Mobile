/**
 * Authentication Service
 * Handles login, register, logout, etc.
 */

import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { AuthResponse, User } from '@/types';

export const authService = {
  /**
   * Login (unified for user, admin, guide)
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    
    // api.post returns ApiResponse<AuthResponse>
    // response.data is AuthResponse
    if (response.data) {
      return response.data;
    }
    
    // Fallback for direct AuthResponse (shouldn't happen with current api.ts)
    return response as any;
  },

  /**
   * Register (only for users)
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    
    // api.post returns ApiResponse<AuthResponse>
    // response.data is AuthResponse
    if (response.data) {
      return response.data;
    }
    
    // Fallback for direct AuthResponse
    return response as any;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Get current user info
   */
  async me(): Promise<User> {
    const response = await api.get<{ success: boolean; user: User }>(API_ENDPOINTS.AUTH.ME);
    
    // Backend returns: { success: true, user: { ... } }
    if ((response as any).user) {
      return (response as any).user;
    }
    
    // Fallback: check in response.data
    if (response.data?.user) {
      return response.data.user;
    }
    
    throw new Error('Failed to get user info');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    fullName: string;
    phone?: string;
  }): Promise<{ success: boolean; message: string; data?: { user: User }; user?: User }> {
    const response = await api.put<{ success: boolean; message: string; data?: { user: User }; user?: User }>(
      API_ENDPOINTS.CLIENT.USER_UPDATE,
      data
    );
    
    console.log('📥 Update profile response:', JSON.stringify(response));
    
    // Response có thể là trực tiếp { success, message, user } hoặc wrapped
    if ((response as any).success !== undefined) {
      return response as { success: boolean; message: string; data?: { user: User }; user?: User };
    }
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update profile');
  },

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.CLIENT.USER_CHANGE_PASSWORD,
      data
    );
    
    console.log('📥 Change password response:', JSON.stringify(response));
    
    // Response có thể là trực tiếp { success, message } hoặc wrapped trong data
    // Kiểm tra nếu response trực tiếp có success
    if ((response as any).success !== undefined) {
      return response as { success: boolean; message: string };
    }
    
    // Nếu wrapped trong data
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to change password');
  },
};


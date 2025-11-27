/**
 * Cart Service
 * Xử lý các API calls liên quan đến giỏ hàng
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { CartItem, ApiResponse } from '@/types';

interface CartDetailResponse {
  cart: CartItem[];
  subTotal: number;
}

class CartService {
  /**
   * Lấy chi tiết giỏ hàng từ server
   * (Kiểm tra giá, stock, thông tin tour)
   */
  async getCartDetail(items: CartItem[]): Promise<ApiResponse<CartDetailResponse>> {
    const response = await apiClient.post(API_ENDPOINTS.CLIENT.CART_DETAIL, {
      items,
    });
    return response.data;
  }

  /**
   * Validate giỏ hàng trước khi checkout
   */
  async validateCart(items: CartItem[]): Promise<{
    valid: boolean;
    errors: string[];
    cart: CartItem[];
  }> {
    try {
      const result = await this.getCartDetail(items);
      
      if (!result.success || !result.data) {
        return {
          valid: false,
          errors: ['Không thể kiểm tra giỏ hàng'],
          cart: [],
        };
      }

      const errors: string[] = [];
      const validatedCart = result.data.cart;

      // Kiểm tra từng item
      validatedCart.forEach((item) => {
        // Kiểm tra stock
        if (item.quantityAdult > (item.stockAdult || 0)) {
          errors.push(`${item.name}: Không đủ chỗ cho người lớn`);
        }
        if (item.quantityChildren > (item.stockChildren || 0)) {
          errors.push(`${item.name}: Không đủ chỗ cho trẻ em`);
        }
        if (item.quantityBaby > (item.stockBaby || 0)) {
          errors.push(`${item.name}: Không đủ chỗ cho trẻ sơ sinh`);
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        cart: validatedCart,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message || 'Có lỗi xảy ra khi kiểm tra giỏ hàng'],
        cart: [],
      };
    }
  }
}

export const cartService = new CartService();

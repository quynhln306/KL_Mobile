/**
 * Coupon Service
 * Xử lý các API calls liên quan đến mã giảm giá
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types';

interface ValidateCouponResponse {
  valid: boolean;
  message: string;
  coupon?: {
    code: string;
    description?: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
  };
  discountAmount?: number;
  finalTotal?: number;
}

class CouponService {
  /**
   * Kiểm tra mã giảm giá
   */
  async validateCoupon(
    code: string,
    orderTotal: number
  ): Promise<ApiResponse<ValidateCouponResponse>> {
    const response = await apiClient.post(API_ENDPOINTS.CLIENT.COUPON_VALIDATE, {
      code: code.toUpperCase(),
      orderTotal,
    });
    return response.data;
  }

  /**
   * Tính toán discount từ coupon
   */
  calculateDiscount(
    orderTotal: number,
    coupon: {
      discountType: 'percent' | 'fixed';
      discountValue: number;
      maxDiscount?: number;
    }
  ): number {
    let discount = 0;

    if (coupon.discountType === 'percent') {
      discount = (orderTotal * coupon.discountValue) / 100;
      
      // Áp dụng giảm tối đa nếu có
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
      
      // Không giảm quá tổng đơn hàng
      if (discount > orderTotal) {
        discount = orderTotal;
      }
    }

    return Math.round(discount);
  }
}

export const couponService = new CouponService();

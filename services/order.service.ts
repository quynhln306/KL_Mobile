/**
 * Order Service
 * Xử lý các API calls liên quan đến đơn hàng
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Order, CartItem, ApiResponse, ListResponse } from '@/types';

interface CreateOrderData {
  fullName: string;
  phone: string;
  note?: string;
  paymentMethod: 'cash' | 'zalopay' | 'momo';
  items: CartItem[];
  coupon?: {
    code: string;
  };
}

interface OrderListParams {
  page?: number;
  limit?: number;
  status?: 'initial' | 'confirmed' | 'done' | 'cancel';
}

class OrderService {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(data: CreateOrderData): Promise<ApiResponse<{ order: Order }>> {
    const response = await apiClient.post(API_ENDPOINTS.CLIENT.ORDERS, data);
    return response.data;
  }

  /**
   * Lấy danh sách đơn hàng của user
   */
  async getMyOrders(params: OrderListParams = {}): Promise<ApiResponse<ListResponse<Order>>> {
    const { page = 1, limit = 10, status } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await apiClient.get(
      `${API_ENDPOINTS.CLIENT.ORDERS}?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  async getOrderDetail(orderId: number): Promise<ApiResponse<{ order: Order }>> {
    const response = await apiClient.get(API_ENDPOINTS.CLIENT.ORDER_DETAIL(orderId));
    return response.data;
  }

  /**
   * Hủy đơn hàng (nếu backend có API này)
   */
  async cancelOrder(orderId: number): Promise<ApiResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.CLIENT.ORDER_DETAIL(orderId),
      { status: 'cancel' }
    );
    return response.data;
  }
}

export const orderService = new OrderService();

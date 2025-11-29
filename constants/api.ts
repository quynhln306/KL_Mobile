/**
 * API Constants
 * Định nghĩa các endpoints API
 */

// Base URL từ environment variables
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REGISTER: '/api/auth/register',
  },
  
  // Client APIs
  CLIENT: {
    // Home
    HOME: '/api/client/home',
    
    // Tours
    TOURS: '/api/client/tours',
    TOUR_DETAIL: (id: number) => `/api/client/tours/${id}`,
    TOUR_SEARCH: '/api/client/tours/search',
    TOUR_REVIEWS: (tourId: number) => `/api/client/tours/${tourId}/reviews`,
    
    // Categories
    CATEGORIES: '/api/client/categories',
    CATEGORY_TOURS: (slug: string) => `/api/client/categories/${slug}/tours`,
    
    // Cart
    CART_DETAIL: '/cart/detail',
    
    // Orders
    ORDERS: '/api/client/orders',
    ORDER_DETAIL: (id: number) => `/api/client/orders/${id}`,
    ORDER_CREATE: '/order/create',
    
    // Reviews
    REVIEW_CREATE: '/review/create',
    REVIEW_EDIT: (id: number) => `/review/edit/${id}`,
    REVIEW_DELETE: (id: number) => `/review/delete/${id}`,
    
    // User
    USER_PROFILE: '/api/client/user/profile',
    USER_UPDATE: '/api/client/user/profile',
    USER_CHANGE_PASSWORD: '/api/client/user/change-password',
    
    // Coupon
    COUPON_VALIDATE: '/coupon/validate',
  },
  
  // Admin APIs
  ADMIN: {
    // Dashboard
    DASHBOARD: '/api/admin/dashboard/stats',
    
    // Tours
    TOURS: '/api/admin/tours',
    TOUR_DETAIL: (id: number) => `/api/admin/tours/${id}`,
    TOUR_CREATE: '/api/admin/tours',
    TOUR_UPDATE: (id: number) => `/api/admin/tours/${id}`,
    TOUR_DELETE: (id: number) => `/api/admin/tours/${id}`,
    
    // Orders
    ORDERS: '/api/admin/orders',
    ORDER_DETAIL: (id: number) => `/api/admin/orders/${id}`,
    ORDER_UPDATE_STATUS: (id: number) => `/api/admin/orders/${id}/status`,
    ORDER_UPDATE_PAYMENT: (id: number) => `/api/admin/orders/${id}/payment`,
    
    // Guides
    GUIDES: '/api/admin/guides',
    GUIDE_DETAIL: (id: number) => `/api/admin/guides/${id}`,
    GUIDE_CREATE: '/api/admin/guides',
    GUIDE_UPDATE: (id: number) => `/api/admin/guides/${id}`,
    GUIDE_DELETE: (id: number) => `/api/admin/guides/${id}`,
    
    // Guide Schedules
    SCHEDULES: '/api/admin/guide-schedules',
    SCHEDULE_CREATE: '/api/admin/guide-schedules',
    SCHEDULE_DELETE: (id: number) => `/api/admin/guide-schedules/${id}`,
    AVAILABLE_GUIDES: '/admin/guide-schedule/available-guides',
    
    // Reviews
    REVIEWS: '/api/admin/reviews',
    REVIEW_DETAIL: (id: number) => `/api/admin/reviews/${id}`,
    REVIEW_DELETE: (id: number) => `/api/admin/reviews/${id}`,
  },
  
  // Guide APIs
  GUIDE: {
    DASHBOARD: '/api/guide/dashboard',
    SCHEDULE: '/api/guide/schedule',
    SCHEDULE_TOUR: (tourId: number) => `/api/guide/schedule/tour/${tourId}`,
    CHECK_CONFLICT: '/api/guide/schedule/check-conflict',
    LEAVE_REQUEST: '/api/guide/schedule/leave-request',
    CANCEL_LEAVE_REQUEST: (id: number) => `/api/guide/schedule/leave-request/${id}`,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  USER: '@user_data',
  ROLE: '@user_role',
  CART: '@cart_data',
  LOGIN_TIMESTAMP: '@login_timestamp', // Thời điểm đăng nhập
};

// Session Configuration
export const SESSION_CONFIG = {
  // Session hết hạn sau 7 ngày (tính bằng milliseconds)
  EXPIRY_DAYS: 7,
  EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  SERVER_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
};


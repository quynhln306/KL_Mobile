/**
 * TypeScript types và interfaces cho toàn bộ app
 */

// User roles
export type UserRole = 'user' | 'admin' | 'guide';

// User interface
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  address?: string;
  role: UserRole;
  status?: string;
}

// Auth response
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// Tour interface
export interface Tour {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  images?: string[];
  category?: string;
  priceAdult: number;
  priceChildren: number;
  priceBaby: number;
  priceNewAdult: number;
  priceNewChildren: number;
  priceNewBaby: number;
  stockAdult: number;
  stockChildren: number;
  stockBaby: number;
  locations?: string[];
  time?: string;
  vehicle?: string;
  departureDate?: string;
  information?: string;
  schedules?: TourSchedule[];
  status?: string;
  position?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Tour schedule
export interface TourSchedule {
  day: number;
  title?: string;
  description?: string;
  activities?: string[];
}

// Category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  desc?: string;
  parent?: string;
  position?: number;
  status?: string;
}

// Cart item interface
export interface CartItem {
  tourId: number;
  locationFrom?: number;
  quantityAdult: number;
  quantityChildren: number;
  quantityBaby: number;
  // Additional fields from API response
  avatar?: string;
  name?: string;
  slug?: string;
  departureDate?: string;
  cityName?: string;
  priceNewAdult?: number;
  priceNewChildren?: number;
  priceNewBaby?: number;
  stockAdult?: number;
  stockChildren?: number;
  stockBaby?: number;
  // Fields for order items
  tourName?: string;
  tourAvatar?: string;
}

// Order interface
export interface Order {
  id: number;
  code: string;
  userId?: number;
  fullName: string;
  phone: string;
  note?: string;
  items: CartItem[];
  subTotal: number;
  couponCode?: string;
  couponDiscount?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'initial' | 'confirmed' | 'done' | 'cancel';
  createdAt?: string;
  updatedAt?: string;
}

// Review interface
export interface Review {
  id: number;
  userId: number;
  tourId: number;
  orderId?: number;
  rating: number;
  comment: string;
  status?: string;
  createdAt?: string;
  user?: {
    fullName: string;
    avatar?: string;
  };
}

// Review stats
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

// Coupon interface
export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  status?: string;
}

// Guide interface
export interface Guide {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  description?: string;
  status: 'active' | 'inactive';
  position?: number;
}

// Guide schedule interface
export interface GuideSchedule {
  id: number;
  guideId: number;
  tourId?: number;
  type: 'tour' | 'leave';
  startDate: string;
  endDate: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  tour?: Tour;
  guide?: Guide;
}

// API Response generic
export interface ApiResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
  errors?: any;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// List response with pagination
export interface ListResponse<T> {
  items: T[];
  pagination: Pagination;
}


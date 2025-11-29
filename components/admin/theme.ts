/**
 * Admin Theme Constants
 * Design system cho admin mobile
 */

export const ADMIN_COLORS = {
  // Primary
  primary: '#FF6B35',
  primaryLight: '#FF6B3520',
  primaryDark: '#E55A2B',

  // Status
  success: '#34C759',
  successLight: '#34C75920',
  warning: '#FF9500',
  warningLight: '#FF950020',
  error: '#FF3B30',
  errorLight: '#FF3B3020',
  info: '#007AFF',
  infoLight: '#007AFF20',

  // Neutral
  background: '#F2F2F7',
  card: '#FFFFFF',
  border: '#E5E5EA',
  divider: '#C6C6C8',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  textInverse: '#FFFFFF',
};

export const ADMIN_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const ADMIN_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const ADMIN_SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Status config for orders
export const ORDER_STATUS_CONFIG = {
  initial: {
    label: 'Khởi tạo',
    color: ADMIN_COLORS.warning,
    bgColor: ADMIN_COLORS.warningLight,
    icon: 'time',
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: ADMIN_COLORS.info,
    bgColor: ADMIN_COLORS.infoLight,
    icon: 'checkmark-circle',
  },
  done: {
    label: 'Hoàn thành',
    color: ADMIN_COLORS.success,
    bgColor: ADMIN_COLORS.successLight,
    icon: 'checkmark-done-circle',
  },
  cancel: {
    label: 'Đã hủy',
    color: ADMIN_COLORS.error,
    bgColor: ADMIN_COLORS.errorLight,
    icon: 'close-circle',
  },
} as const;

// Status config for guides
export const GUIDE_STATUS_CONFIG = {
  active: {
    label: 'Đang hoạt động',
    color: ADMIN_COLORS.success,
    bgColor: ADMIN_COLORS.successLight,
  },
  inactive: {
    label: 'Ngừng hoạt động',
    color: ADMIN_COLORS.textSecondary,
    bgColor: '#8E8E9320',
  },
} as const;

// Status config for tours
export const TOUR_STATUS_CONFIG = {
  active: {
    label: 'Đang mở',
    color: ADMIN_COLORS.success,
    bgColor: ADMIN_COLORS.successLight,
  },
  inactive: {
    label: 'Tạm đóng',
    color: ADMIN_COLORS.textSecondary,
    bgColor: '#8E8E9320',
  },
} as const;

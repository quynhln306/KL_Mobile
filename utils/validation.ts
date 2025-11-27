/**
 * Validation utilities
 * Functions để validate email, phone, password, etc.
 */

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Vietnam)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Vietnam phone: 10 digits, start with 0
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate password (basic - at least 6 characters)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Password strength validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Validate password với yêu cầu bảo mật cao
 * - Ít nhất 8 ký tự
 * - Ít nhất 1 chữ hoa
 * - Ít nhất 1 chữ thường
 * - Ít nhất 1 số
 * - Ít nhất 1 ký tự đặc biệt (optional cho medium)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }
  
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    strength = hasSpecialChar ? 'strong' : 'medium';
  } else if (errors.length <= 2 && password.length >= 6) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
 */
export function isPasswordDifferent(oldPassword: string, newPassword: string): boolean {
  return oldPassword !== newPassword;
}

/**
 * Kiểm tra xác nhận mật khẩu khớp
 */
export function isPasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate min length
 */
export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

/**
 * Validate max length
 */
export function maxLength(value: string, max: number): boolean {
  return value.trim().length <= max;
}

/**
 * Validate number
 */
export function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return isNumber(value) && value > 0;
}

/**
 * Get validation error message
 */
export function getValidationError(field: string, rule: string, params?: any): string {
  const messages: { [key: string]: string } = {
    required: `${field} là bắt buộc`,
    email: 'Email không hợp lệ',
    phone: 'Số điện thoại không hợp lệ',
    password: 'Mật khẩu phải có ít nhất 6 ký tự',
    minLength: `${field} phải có ít nhất ${params?.min} ký tự`,
    maxLength: `${field} không được vượt quá ${params?.max} ký tự`,
    number: `${field} phải là số`,
    positiveNumber: `${field} phải là số dương`,
  };
  
  return messages[rule] || `${field} không hợp lệ`;
}


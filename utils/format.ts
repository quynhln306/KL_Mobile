/**
 * Format utilities
 * Functions để format currency, date, number, etc.
 */

/**
 * Format số thành tiền VNĐ
 * @param amount - Số tiền
 * @returns Chuỗi tiền VNĐ (VD: 1.000.000đ)
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0đ';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numAmount);
}

/**
 * Format ngày tháng
 * @param date - Ngày cần format
 * @param format - Format mong muốn ('short' | 'long' | 'full')
 * @returns Chuỗi ngày đã format
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  switch (format) {
    case 'short':
      // DD/MM/YYYY
      return dateObj.toLocaleDateString('vi-VN');
    case 'long':
      // DD/MM/YYYY HH:mm
      return `${dateObj.toLocaleDateString('vi-VN')} ${dateObj.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    case 'full':
      // Thứ, DD/MM/YYYY HH:mm
      return dateObj.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString('vi-VN');
  }
}

/**
 * Format số lượng
 * @param count - Số lượng
 * @returns Chuỗi số lượng (VD: 1.234)
 */
export function formatNumber(count: number | string): string {
  const numCount = typeof count === 'string' ? parseFloat(count) : count;
  
  if (isNaN(numCount)) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(numCount);
}

/**
 * Format số điện thoại
 * @param phone - Số điện thoại
 * @returns Chuỗi số điện thoại đã format
 */
export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Truncate text
 * @param text - Text cần cắt
 * @param maxLength - Độ dài tối đa
 * @returns Text đã cắt
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format file size
 * @param bytes - Số bytes
 * @returns Chuỗi size (VD: 1.5 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get relative time (time ago)
 * @param date - Ngày cần tính
 * @returns Chuỗi thời gian tương đối (VD: 2 giờ trước)
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  
  return formatDate(dateObj, 'short');
}


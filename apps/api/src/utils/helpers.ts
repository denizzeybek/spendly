import { HOME_CODE_LENGTH, HOME_CODE_CHARS } from '../constants';

/**
 * Generate a random home code (6 characters)
 */
export function generateHomeCode(): string {
  let code = '';
  for (let i = 0; i < HOME_CODE_LENGTH; i++) {
    code += HOME_CODE_CHARS.charAt(Math.floor(Math.random() * HOME_CODE_CHARS.length));
  }
  return code;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * Get month name
 */
export function getMonthName(month: number, locale: string = 'tr-TR'): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate home code format
 */
export function isValidHomeCode(code: string): boolean {
  if (code.length !== HOME_CODE_LENGTH) return false;
  return code.split('').every(char => HOME_CODE_CHARS.includes(char));
}

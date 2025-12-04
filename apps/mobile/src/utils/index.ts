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
 * Format date for display
 * @param date - Date object, ISO string, or timestamp
 * @param locale - Locale for formatting (default: 'tr-TR')
 * @returns Formatted date string (e.g., "4 Aralık 2025")
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'tr-TR'
): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date as short (e.g., "04.12.2025")
 */
export function formatDateShort(
  date: Date | string | number,
  locale: string = 'tr-TR'
): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get first day of current month
 */
export function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}


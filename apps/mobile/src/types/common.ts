// Common types used across the app

export type TransactionType = 'INCOME' | 'EXPENSE';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';
export type FilterType = 'all' | 'INCOME' | 'EXPENSE';

export interface CategoryItem {
  id?: string;
  name?: string;
  icon?: string;
  color?: string;
  type?: CategoryType;
  isDefault?: boolean;
}

export interface TransactionItem {
  id?: string;
  type?: TransactionType;
  title?: string;
  amount?: number;
  date?: string;
  isShared?: boolean;
  isRecurring?: boolean;
  categoryId?: {
    _id?: string;
    name?: string;
    icon?: string;
    color?: string;
  };
  createdById?: {
    _id?: string;
    name?: string;
  };
}

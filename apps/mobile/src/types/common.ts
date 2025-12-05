// Common types used across the app

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';
export type FilterType = 'all' | 'INCOME' | 'EXPENSE' | 'TRANSFER';

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
    id?: string;
    name?: string;
  };
  // Transfer specific fields
  fromUserId?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  toUserId?: {
    _id?: string;
    id?: string;
    name?: string;
  };
}

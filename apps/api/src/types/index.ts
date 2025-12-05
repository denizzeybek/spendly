// User Types
export interface IUser {
  id: string;
  email: string;
  name: string;
  homeId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Home Types
export interface IHome {
  id: string;
  code: string;
  name: string;
  currency: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface ITransaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: Date;
  categoryId: string;
  assignedCardId?: string;
  isShared: boolean;
  isRecurring: boolean;
  recurringDay?: number;
  createdById: string;
  homeId: string;
  // Transfer specific fields
  fromUserId?: string;
  toUserId?: string;
  linkedTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Card Types
export interface ICreditCard {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}

// Category Types
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

export interface ICategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
  homeId?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  homeName?: string;
  homeCode?: string;
}

export interface AuthResponse {
  user: IUser;
  home: IHome;
  accessToken: string;
  refreshToken: string;
}

// Summary Types
export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: CategorySummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
}

export interface UserSummary {
  userId: string;
  userName: string;
  totalIncome: number;
  totalExpense: number;
  sharedExpense: number;
  personalExpense: number;
  creditCardDebt: number;
  balance: number;
}

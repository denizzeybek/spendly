import { CategoryType } from '../types';

// Default Categories
export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  // Bills
  { name: 'categories.bills.rent', icon: 'home', color: '#E57373', type: 'EXPENSE' },
  { name: 'categories.bills.dues', icon: 'building', color: '#EF5350', type: 'EXPENSE' },
  { name: 'categories.bills.electricity', icon: 'flash', color: '#F48FB1', type: 'EXPENSE' },
  { name: 'categories.bills.water', icon: 'water', color: '#42A5F5', type: 'EXPENSE' },
  { name: 'categories.bills.gas', icon: 'fire', color: '#FF7043', type: 'EXPENSE' },
  { name: 'categories.bills.internet', icon: 'wifi', color: '#7E57C2', type: 'EXPENSE' },

  // Transport
  { name: 'categories.transport.motorcycle_fuel', icon: 'motorbike', color: '#26A69A', type: 'EXPENSE' },
  { name: 'categories.transport.car_fuel', icon: 'car', color: '#66BB6A', type: 'EXPENSE' },

  // Subscriptions
  { name: 'categories.subscriptions.netflix', icon: 'television', color: '#E50914', type: 'EXPENSE' },
  { name: 'categories.subscriptions.prime', icon: 'package-variant', color: '#00A8E1', type: 'EXPENSE' },
  { name: 'categories.subscriptions.hbo', icon: 'filmstrip', color: '#8E24AA', type: 'EXPENSE' },
  { name: 'categories.subscriptions.gym', icon: 'dumbbell', color: '#FF5722', type: 'EXPENSE' },

  // Other
  { name: 'categories.groceries', icon: 'cart', color: '#8BC34A', type: 'EXPENSE' },
  { name: 'categories.health', icon: 'hospital', color: '#F44336', type: 'EXPENSE' },
  { name: 'categories.entertainment', icon: 'party-popper', color: '#9C27B0', type: 'EXPENSE' },
  { name: 'categories.other_expense', icon: 'dots-horizontal', color: '#9E9E9E', type: 'EXPENSE' },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: 'categories.salary', icon: 'cash', color: '#4CAF50', type: 'INCOME' },
  { name: 'categories.side_income', icon: 'wallet-plus', color: '#8BC34A', type: 'INCOME' },
  { name: 'categories.other_income', icon: 'dots-horizontal', color: '#9E9E9E', type: 'INCOME' },
];

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

// Currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

// Home Code Generation
export const HOME_CODE_LENGTH = 6;
export const HOME_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars (0, O, I, 1)

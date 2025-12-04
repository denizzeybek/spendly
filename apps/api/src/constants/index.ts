import { CategoryType } from '../types';

// Default Categories
export interface DefaultCategory {
  nameTr: string;
  nameEn: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  // Bills
  { nameTr: 'Kira', nameEn: 'Rent', icon: 'home', color: '#E57373', type: 'EXPENSE' },
  { nameTr: 'Aidat', nameEn: 'Dues', icon: 'building', color: '#EF5350', type: 'EXPENSE' },
  { nameTr: 'Elektrik', nameEn: 'Electricity', icon: 'flash', color: '#F48FB1', type: 'EXPENSE' },
  { nameTr: 'Su', nameEn: 'Water', icon: 'water', color: '#42A5F5', type: 'EXPENSE' },
  { nameTr: 'Doğalgaz', nameEn: 'Gas', icon: 'fire', color: '#FF7043', type: 'EXPENSE' },
  { nameTr: 'İnternet', nameEn: 'Internet', icon: 'wifi', color: '#7E57C2', type: 'EXPENSE' },

  // Transport
  { nameTr: 'Motor Yakıt', nameEn: 'Motorcycle Fuel', icon: 'motorbike', color: '#26A69A', type: 'EXPENSE' },
  { nameTr: 'Araba Yakıt', nameEn: 'Car Fuel', icon: 'car', color: '#66BB6A', type: 'EXPENSE' },

  // Subscriptions
  { nameTr: 'Netflix', nameEn: 'Netflix', icon: 'television', color: '#E50914', type: 'EXPENSE' },
  { nameTr: 'Prime Video', nameEn: 'Prime Video', icon: 'package-variant', color: '#00A8E1', type: 'EXPENSE' },
  { nameTr: 'HBO Max', nameEn: 'HBO Max', icon: 'filmstrip', color: '#8E24AA', type: 'EXPENSE' },
  { nameTr: 'Spor Salonu', nameEn: 'Gym', icon: 'dumbbell', color: '#FF5722', type: 'EXPENSE' },

  // Other
  { nameTr: 'Market', nameEn: 'Groceries', icon: 'cart', color: '#8BC34A', type: 'EXPENSE' },
  { nameTr: 'Sağlık', nameEn: 'Health', icon: 'hospital', color: '#F44336', type: 'EXPENSE' },
  { nameTr: 'Eğlence', nameEn: 'Entertainment', icon: 'party-popper', color: '#9C27B0', type: 'EXPENSE' },
  { nameTr: 'Kredi Taksiti', nameEn: 'Loan Payment', icon: 'bank-transfer', color: '#5C6BC0', type: 'EXPENSE' },
  { nameTr: 'Diğer Gider', nameEn: 'Other Expense', icon: 'dots-horizontal', color: '#9E9E9E', type: 'EXPENSE' },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { nameTr: 'Maaş', nameEn: 'Salary', icon: 'cash', color: '#4CAF50', type: 'INCOME' },
  { nameTr: 'Ek Gelir', nameEn: 'Side Income', icon: 'wallet-plus', color: '#8BC34A', type: 'INCOME' },
  { nameTr: 'Diğer Gelir', nameEn: 'Other Income', icon: 'dots-horizontal', color: '#9E9E9E', type: 'INCOME' },
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

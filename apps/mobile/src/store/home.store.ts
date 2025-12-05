import { create } from 'zustand';
import { HomeService } from '../client';
import type { MonthlySummary } from '../client';
import type { ApiError } from '../types';

export interface HomeUser {
  id: string;
  name: string;
  email: string;
  creditCard?: {
    id: string;
    name: string;
  };
}

export interface UserSummary {
  userId: string;
  userName: string;
  userEmail: string;
  totalIncome: number;
  totalExpense: number;
  personalExpense: number;
  sharedExpenseShare: number;
  creditCardDebt: number;
  transfersReceived: number;
  transfersSent: number;
  balance: number;
}

export interface UserSummariesResponse {
  month: number;
  year: number;
  users: UserSummary[];
  totalSharedExpense: number;
}

export interface CreditCard {
  id: string;
  name: string;
}

interface HomeState {
  summary: MonthlySummary | null;
  users: HomeUser[];
  userSummaries: UserSummariesResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSummary: (month?: number, year?: number) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchUserSummaries: (month?: number, year?: number) => Promise<void>;
  clearError: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  summary: null,
  users: [],
  userSummaries: null,
  isLoading: false,
  error: null,

  fetchSummary: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const response = await HomeService.getApiHomeSummary(month, year);
      set({ summary: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch summary';
      set({ error: message, isLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await HomeService.getApiHomeUsers();
      set({ users: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch users';
      set({ error: message, isLoading: false });
    }
  },

  fetchUserSummaries: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const response = await HomeService.getApiHomeUserSummaries(month, year);
      set({ userSummaries: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch user summaries';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

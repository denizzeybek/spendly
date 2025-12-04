import { create } from 'zustand';
import { HomeService } from '../client';
import type { MonthlySummary } from '../client';
import type { ApiError } from '../types';

interface HomeUser {
  id: string;
  name: string;
  email: string;
  creditCard?: {
    id: string;
    name: string;
  };
}

interface HomeState {
  summary: MonthlySummary | null;
  users: HomeUser[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSummary: (month?: number, year?: number) => Promise<void>;
  fetchUsers: () => Promise<void>;
  clearError: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  summary: null,
  users: [],
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

  clearError: () => set({ error: null }),
}));

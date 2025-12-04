import { create } from 'zustand';
import { CreditCardsService } from '../client';
import type { CreditCard } from '../client';
import type { ApiError } from '../types';

interface CreditCardsState {
  creditCards: CreditCard[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchCreditCards: () => Promise<void>;
  createCreditCard: (name: string) => Promise<void>;
  updateCreditCard: (id: string, name: string) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCreditCardsStore = create<CreditCardsState>((set, get) => ({
  creditCards: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  fetchCreditCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await CreditCardsService.getApiCreditCards();
      set({ creditCards: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch credit cards';
      set({ error: message, isLoading: false });
    }
  },

  createCreditCard: async (name: string) => {
    set({ isCreating: true, error: null });
    try {
      const response = await CreditCardsService.postApiCreditCards({ name });
      set({
        creditCards: [response.data, ...get().creditCards],
        isCreating: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to create credit card';
      set({ error: message, isCreating: false });
      throw err;
    }
  },

  updateCreditCard: async (id: string, name: string) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await CreditCardsService.patchApiCreditCards(id, { name });
      set({
        creditCards: get().creditCards.map((card) =>
          card.id === id ? response.data : card
        ),
        isUpdating: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to update credit card';
      set({ error: message, isUpdating: false });
      throw err;
    }
  },

  deleteCreditCard: async (id: string) => {
    set({ isDeleting: true, error: null });
    try {
      await CreditCardsService.deleteApiCreditCards(id);
      set({
        creditCards: get().creditCards.filter((card) => card.id !== id),
        isDeleting: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to delete credit card';
      set({ error: message, isDeleting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

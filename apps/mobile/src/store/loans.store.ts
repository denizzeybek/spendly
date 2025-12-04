import { create } from 'zustand';
import { LoansService } from '../client';
import type { Loan } from '../client';
import type { ApiError } from '../types';

interface CreateLoanInput {
  name: string;
  totalAmount: number;
  principalAmount: number;
  monthlyPayment: number;
  totalInstallments: number;
  paidInstallments?: number;
  startDate: string;
  interestRate?: number;
  notes?: string;
}

interface UpdateLoanInput {
  name?: string;
  totalAmount?: number;
  principalAmount?: number;
  monthlyPayment?: number;
  totalInstallments?: number;
  paidInstallments?: number;
  startDate?: string;
  interestRate?: number;
  notes?: string;
}

interface LoansState {
  loans: Loan[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPaying: boolean;
  error: string | null;

  // Actions
  fetchLoans: () => Promise<void>;
  createLoan: (input: CreateLoanInput) => Promise<void>;
  updateLoan: (id: string, input: UpdateLoanInput) => Promise<void>;
  payInstallment: (id: string, count?: number) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useLoansStore = create<LoansState>((set, get) => ({
  loans: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isPaying: false,
  error: null,

  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await LoansService.getApiLoans();
      set({ loans: response.data || [], isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch loans';
      set({ error: message, isLoading: false });
    }
  },

  createLoan: async (input: CreateLoanInput) => {
    set({ isCreating: true, error: null });
    try {
      const response = await LoansService.postApiLoans(input);
      set({
        loans: [response.data, ...get().loans],
        isCreating: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to create loan';
      set({ error: message, isCreating: false });
      throw err;
    }
  },

  updateLoan: async (id: string, input: UpdateLoanInput) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await LoansService.patchApiLoans(id, input);
      set({
        loans: get().loans.map((loan) =>
          loan.id === id ? response.data : loan
        ),
        isUpdating: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to update loan';
      set({ error: message, isUpdating: false });
      throw err;
    }
  },

  payInstallment: async (id: string, count: number = 1) => {
    set({ isPaying: true, error: null });
    try {
      const response = await LoansService.postApiLoansPay(id, { count });
      set({
        loans: get().loans.map((loan) =>
          loan.id === id ? response.data : loan
        ),
        isPaying: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to pay installment';
      set({ error: message, isPaying: false });
      throw err;
    }
  },

  deleteLoan: async (id: string) => {
    set({ isDeleting: true, error: null });
    try {
      await LoansService.deleteApiLoans(id);
      set({
        loans: get().loans.filter((loan) => loan.id !== id),
        isDeleting: false,
      });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to delete loan';
      set({ error: message, isDeleting: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

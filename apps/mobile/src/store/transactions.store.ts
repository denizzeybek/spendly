import { create } from 'zustand';
import { TransactionsService } from '../client';
import type { Transaction } from '../client';
import type { ApiError } from '../types';

type FilterType = 'all' | 'INCOME' | 'EXPENSE' | 'TRANSFER';

interface TransactionWithCategory extends Omit<Transaction, 'categoryId'> {
  categoryId: {
    _id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface TransactionsState {
  transactions: TransactionWithCategory[];
  filter: FilterType;
  searchQuery: string;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: {
    type: 'INCOME' | 'EXPENSE';
    title?: string;
    amount: number;
    date: string;
    categoryId: string;
    assignedCardId?: string;
    isShared?: boolean;
    isRecurring?: boolean;
  }) => Promise<void>;
  createTransfer: (data: {
    amount: number;
    date: string;
    toUserId: string;
    title?: string;
  }) => Promise<void>;
  updateTransaction: (id: string, data: {
    type?: 'INCOME' | 'EXPENSE';
    title?: string;
    amount?: number;
    date?: string;
    categoryId?: string;
    assignedCardId?: string;
    isShared?: boolean;
    isRecurring?: boolean;
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  filter: 'all',
  searchQuery: '',
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  fetchTransactions: async () => {
    const { filter } = get();
    set({ isLoading: true, error: null });
    try {
      const type = filter === 'all' ? undefined : filter;
      const response = await TransactionsService.getApiTransactions(type);
      set({ transactions: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch transactions';
      set({ error: message, isLoading: false });
    }
  },

  createTransaction: async (data) => {
    set({ isCreating: true, error: null });
    try {
      await TransactionsService.postApiTransactions(data);
      set({ isCreating: false });
      // Refresh transactions list
      get().fetchTransactions();
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to create transaction';
      set({ error: message, isCreating: false });
      throw new Error(message);
    }
  },

  createTransfer: async (data) => {
    set({ isCreating: true, error: null });
    try {
      await TransactionsService.postApiTransactionsTransfer(data);
      set({ isCreating: false });
      // Refresh transactions list
      get().fetchTransactions();
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to create transfer';
      set({ error: message, isCreating: false });
      throw new Error(message);
    }
  },

  updateTransaction: async (id, data) => {
    set({ isUpdating: true, error: null });
    try {
      await TransactionsService.patchApiTransactions(id, data as Transaction);
      set({ isUpdating: false });
      // Refresh transactions list
      get().fetchTransactions();
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to update transaction';
      set({ error: message, isUpdating: false });
      throw new Error(message);
    }
  },

  deleteTransaction: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await TransactionsService.deleteApiTransactions(id);
      set({ isDeleting: false });
      // Refresh transactions list
      get().fetchTransactions();
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to delete transaction';
      set({ error: message, isDeleting: false });
      throw new Error(message);
    }
  },

  setFilter: (filter) => {
    set({ filter });
    get().fetchTransactions();
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearError: () => set({ error: null }),
}));

// Selector for filtered transactions
export const useFilteredTransactions = () => {
  const transactions = useTransactionsStore((state) => state.transactions);
  const searchQuery = useTransactionsStore((state) => state.searchQuery);

  return transactions.filter((t) =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

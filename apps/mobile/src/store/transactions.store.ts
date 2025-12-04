import { create } from 'zustand';
import { TransactionsService } from '../client';
import type { Transaction } from '../client';

type FilterType = 'all' | 'INCOME' | 'EXPENSE';

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
  error: string | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: {
    type: 'INCOME' | 'EXPENSE';
    title: string;
    amount: number;
    date: string;
    categoryId: string;
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
  error: null,

  fetchTransactions: async () => {
    const { filter } = get();
    set({ isLoading: true, error: null });
    try {
      const type = filter === 'all' ? undefined : filter;
      const response = await TransactionsService.getApiTransactions(type);
      set({ transactions: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.body?.message || err.message || 'Failed to fetch transactions';
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
    } catch (err: any) {
      const message = err.body?.message || err.message || 'Failed to create transaction';
      set({ error: message, isCreating: false });
      throw new Error(message);
    }
  },

  deleteTransaction: async (id) => {
    try {
      await TransactionsService.deleteApiTransactions(id);
      // Refresh transactions list
      get().fetchTransactions();
    } catch (err: any) {
      const message = err.body?.message || err.message || 'Failed to delete transaction';
      set({ error: message });
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

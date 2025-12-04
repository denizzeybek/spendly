import { create } from 'zustand';
import { CategoriesService } from '../client';
import type { Category } from '../client';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (type?: 'INCOME' | 'EXPENSE' | 'BOTH') => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const response = await CategoriesService.getApiCategories(type);
      set({ categories: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.body?.message || err.message || 'Failed to fetch categories';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Selector for filtered categories by type
export const useCategoriesByType = (type: 'INCOME' | 'EXPENSE') => {
  const categories = useCategoriesStore((state) => state.categories);
  return categories.filter((cat) => cat.type === type || cat.type === 'BOTH');
};

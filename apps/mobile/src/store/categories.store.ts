import { create } from 'zustand';
import { CategoriesService } from '../client';
import type { Category } from '../client';
import type { ApiError } from '../types';

interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
}

interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  type?: 'INCOME' | 'EXPENSE' | 'BOTH';
}

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  fetchCategories: (type?: 'INCOME' | 'EXPENSE' | 'BOTH') => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<Category | undefined>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,

  fetchCategories: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const response = await CategoriesService.getApiCategories(type);
      set({ categories: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to fetch categories';
      set({ error: message, isLoading: false });
    }
  },

  createCategory: async (input) => {
    set({ isCreating: true, error: null });
    try {
      const response = await CategoriesService.postApiCategories(input);
      // Refresh categories list
      await get().fetchCategories();
      set({ isCreating: false });
      return response.data;
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to create category';
      set({ error: message, isCreating: false });
      throw err;
    }
  },

  updateCategory: async (id, input) => {
    set({ isUpdating: true, error: null });
    try {
      await CategoriesService.patchApiCategories(id, input);
      // Refresh categories list
      await get().fetchCategories();
      set({ isUpdating: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to update category';
      set({ error: message, isUpdating: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await CategoriesService.deleteApiCategories(id);
      // Remove from local state
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Failed to delete category';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

// Selector for filtered categories by type
export const useCategoriesByType = (type: 'INCOME' | 'EXPENSE') => {
  const categories = useCategoriesStore((state) => state.categories);
  return categories.filter((cat) => cat.type === type || cat.type === 'BOTH');
};

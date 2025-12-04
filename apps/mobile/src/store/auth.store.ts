import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthService, OpenAPI } from '../client';
import type { User, Home } from '../client';
import type { ApiError } from '../types';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthState {
  user: User | null;
  home: Home | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; homeName?: string; homeCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  home: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.postApiAuthLogin({ email, password });
      const { user, home, accessToken, refreshToken } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      OpenAPI.TOKEN = accessToken;

      set({ user, home, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.postApiAuthRegister(data);
      const { user, home, accessToken, refreshToken } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      OpenAPI.TOKEN = accessToken;

      set({ user, home, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const message = error.body?.message || error.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    OpenAPI.TOKEN = undefined;
    set({ user: null, home: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return false;
      }

      OpenAPI.TOKEN = token;
      const response = await AuthService.getApiAuthMe();
      const { user, home } = response.data;

      set({ user, home, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      // Try to refresh token
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const refreshResponse = await AuthService.postApiAuthRefresh({ refreshToken });
          const { user, home, accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
          OpenAPI.TOKEN = accessToken;

          set({ user, home, isAuthenticated: true, isLoading: false });
          return true;
        }
      } catch {
        // Refresh also failed, clear everything
      }

      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      OpenAPI.TOKEN = undefined;
      set({ isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

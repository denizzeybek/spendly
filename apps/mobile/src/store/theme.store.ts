import { create } from 'zustand';
import { Appearance } from 'react-native';

type ColorMode = 'light' | 'dark';

interface ThemeState {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorMode: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',

  toggleColorMode: () => {
    const current = get().colorMode;
    set({ colorMode: current === 'light' ? 'dark' : 'light' });
  },

  setColorMode: (mode) => set({ colorMode: mode }),
}));

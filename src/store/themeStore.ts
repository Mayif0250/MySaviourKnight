import { create } from 'zustand';
import { ThemeMode } from '../shared/types/settings';
import { ThemeService } from '../services/theme/ThemeService';
import { StorageService } from '../services/storage/StorageService';

interface ThemeStoreState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => () => void;
}

const initialSaved = StorageService.loadSettings();
const defaultTheme: ThemeMode = initialSaved.theme || 'system';

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  theme: defaultTheme,

  setTheme: (theme: ThemeMode) => {
    set({ theme });
    ThemeService.applyTheme(theme);
    StorageService.saveSettings({ theme });
  },

  initTheme: () => {
    const currentTheme = get().theme;
    ThemeService.applyTheme(currentTheme);

    const cleanup = ThemeService.listenToSystemThemeChanges(() => {
      if (get().theme === 'system') {
        ThemeService.applyTheme('system');
      }
    });

    return cleanup;
  },
}));

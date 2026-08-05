import { ThemeMode } from '../../shared/types/settings';

export class ThemeService {
  static applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  static listenToSystemThemeChanges(onThemeChange: () => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => onThemeChange();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older WebViews
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }
}

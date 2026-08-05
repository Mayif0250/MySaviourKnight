import { useThemeStore } from '../../store/themeStore';

export class AppBootstrap {
  static async init(): Promise<void> {
    useThemeStore.getState().initTheme();
  }
}

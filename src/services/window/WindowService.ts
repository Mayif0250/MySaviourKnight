import { getCurrentWindow } from '@tauri-apps/api/window';

export class WindowService {
  private static isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  static async minimize(): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.minimize();
      } catch (e) {
        console.warn('Tauri minimize error:', e);
      }
    }
  }

  static async toggleMaximize(): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.toggleMaximize();
      } catch (e) {
        console.warn('Tauri toggleMaximize error:', e);
      }
    }
  }

  static async close(): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.close();
      } catch (e) {
        console.warn('Tauri close error:', e);
      }
    }
  }

  static async setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.setAlwaysOnTop(alwaysOnTop);
      } catch (e) {
        console.warn('Tauri setAlwaysOnTop error:', e);
      }
    }
  }
}

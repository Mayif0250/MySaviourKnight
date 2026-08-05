import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

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

  static async enterOverlayMode(): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.setAlwaysOnTop(true);
        await appWindow.setSize(new LogicalSize(680, 440));
        await appWindow.center();
        await appWindow.show();
        await appWindow.setFocus();
      } catch (e) {
        console.warn('Tauri enterOverlayMode error:', e);
      }
    }
  }

  static async exitOverlayMode(alwaysOnTopDefault = false): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.setAlwaysOnTop(alwaysOnTopDefault);
        await appWindow.setSize(new LogicalSize(1280, 830));
        await appWindow.center();
        await appWindow.show();
        await appWindow.setFocus();
      } catch (e) {
        console.warn('Tauri exitOverlayMode error:', e);
      }
    }
  }

  static async bringToFront(): Promise<void> {
    if (this.isTauri()) {
      try {
        const appWindow = getCurrentWindow();
        await appWindow.show();
        await appWindow.unminimize();
        await appWindow.setFocus();
      } catch (e) {
        console.warn('Tauri bringToFront error:', e);
      }
    }
  }
}

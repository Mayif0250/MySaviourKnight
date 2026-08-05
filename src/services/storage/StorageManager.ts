export class StorageManager {
  public static getItem<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(`msk_${key}`);
      return value ? (JSON.parse(value) as T) : defaultValue;
    } catch (err) {
      console.warn(`StorageManager getItem error for key "${key}"`, err);
      return defaultValue;
    }
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`msk_${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn(`StorageManager setItem error for key "${key}"`, err);
    }
  }

  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(`msk_${key}`);
    } catch (err) {
      console.warn(`StorageManager removeItem error for key "${key}"`, err);
    }
  }
}

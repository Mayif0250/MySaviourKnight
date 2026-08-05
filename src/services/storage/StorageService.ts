import { Conversation } from '../../shared/types/ai';
import { SettingsState } from '../../shared/types/settings';

const CONVERSATIONS_KEY = 'msk_conversations_v1';
const SETTINGS_KEY = 'msk_settings_v1';

export class StorageService {
  static saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to local storage:', e);
    }
  }

  static loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load conversations from local storage:', e);
      return [];
    }
  }

  static saveSettings(settings: Partial<SettingsState>): void {
    try {
      const existing = this.loadSettings();
      const merged = { ...existing, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save settings to local storage:', e);
    }
  }

  static loadSettings(): Partial<SettingsState> {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load settings from local storage:', e);
      return {};
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }
}

import { create } from 'zustand';
import { SettingsState, DEFAULT_SYSTEM_PROMPT } from '../shared/types/settings';
import { StorageService } from '../services/storage/StorageService';
import { WindowService } from '../services/window/WindowService';

interface SettingsStoreActions {
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  setOpenaiApiKey: (key: string) => void;
  setActiveModel: (model: string) => void;
  setActiveProvider: (provider: string) => void;
  toggleAlwaysOnTop: () => void;
  toggleCompactOverlay: () => void;
}

const savedSettings = StorageService.loadSettings();

const initialSettings: SettingsState = {
  theme: savedSettings.theme || 'system',
  activeProvider: savedSettings.activeProvider || 'openai',
  activeModel: savedSettings.activeModel || 'gpt-4o',
  openaiApiKey: savedSettings.openaiApiKey || '',
  openaiBaseUrl: savedSettings.openaiBaseUrl || 'https://api.openai.com/v1',
  systemPrompt: savedSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT,
  temperature: savedSettings.temperature ?? 0.7,
  autoScroll: savedSettings.autoScroll ?? true,
  enterToSubmit: savedSettings.enterToSubmit ?? true,
  compactOverlay: savedSettings.compactOverlay ?? false,
  alwaysOnTop: savedSettings.alwaysOnTop ?? false,
  sidebarCollapsed: savedSettings.sidebarCollapsed ?? false,
  contextPanelOpen: savedSettings.contextPanelOpen ?? false,
  activeRightPanelTab: savedSettings.activeRightPanelTab || 'context',
};

export const useSettingsStore = create<SettingsState & SettingsStoreActions>((set, get) => ({
  ...initialSettings,

  updateSettings: (newSettings) => {
    set(newSettings);
    StorageService.saveSettings(newSettings);
  },

  setOpenaiApiKey: (key: string) => {
    get().updateSettings({ openaiApiKey: key });
  },

  setActiveModel: (model: string) => {
    get().updateSettings({ activeModel: model });
  },

  setActiveProvider: (provider: string) => {
    get().updateSettings({ activeProvider: provider });
  },

  toggleAlwaysOnTop: () => {
    const nextState = !get().alwaysOnTop;
    get().updateSettings({ alwaysOnTop: nextState });
    WindowService.setAlwaysOnTop(nextState);
  },

  toggleCompactOverlay: () => {
    const nextState = !get().compactOverlay;
    get().updateSettings({ compactOverlay: nextState });
    if (nextState) {
      WindowService.enterOverlayMode();
    } else {
      WindowService.exitOverlayMode(get().alwaysOnTop);
    }
  },
}));

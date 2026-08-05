import { create } from 'zustand';
import { StorageManager } from '../services/storage/StorageManager';
import { ProviderConfig } from '../types/ai';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SettingsState {
  theme: ThemeMode;
  primaryColor: string;
  activeProviderId: string;
  activeModelId: string;
  providers: Record<string, ProviderConfig>;
  sidebarCollapsed: boolean;
  contextPanelOpen: boolean;
  commandPaletteOpen: boolean;
  settingsModalOpen: boolean;
  aboutModalOpen: boolean;
  systemPrompt: string;

  setTheme: (theme: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  setActiveProvider: (providerId: string) => void;
  setActiveModel: (modelId: string) => void;
  setProviderConfig: (providerId: string, config: Partial<ProviderConfig>) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleContextPanel: () => void;
  setContextPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setAboutModalOpen: (open: boolean) => void;
  setSystemPrompt: (prompt: string) => void;
}

const DEFAULT_PROVIDERS: Record<string, ProviderConfig> = {
  mock: {
    enabled: true,
  },
  openai: {
    enabled: true,
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initialTheme = StorageManager.getItem<ThemeMode>('theme', 'dark');
  const initialProviders = StorageManager.getItem<Record<string, ProviderConfig>>('providers', DEFAULT_PROVIDERS);
  const initialModel = StorageManager.getItem<string>('activeModelId', 'msk-knight-1');
  const initialProvider = StorageManager.getItem<string>('activeProviderId', 'mock');
  const initialSystemPrompt = StorageManager.getItem<string>(
    'systemPrompt',
    'You are MSK (My Saviour Knight), an elite, helpful, and highly intelligent AI companion.'
  );

  return {
    theme: initialTheme,
    primaryColor: '#2563EB',
    activeProviderId: initialProvider,
    activeModelId: initialModel,
    providers: initialProviders,
    sidebarCollapsed: false,
    contextPanelOpen: false,
    commandPaletteOpen: false,
    settingsModalOpen: false,
    aboutModalOpen: false,
    systemPrompt: initialSystemPrompt,

    setTheme: (theme) => {
      StorageManager.setItem('theme', theme);
      set({ theme });

      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isSystemDark) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    },

    setPrimaryColor: (color) => {
      set({ primaryColor: color });
    },

    setActiveProvider: (providerId) => {
      StorageManager.setItem('activeProviderId', providerId);
      set({ activeProviderId: providerId });
    },

    setActiveModel: (modelId) => {
      StorageManager.setItem('activeModelId', modelId);
      set({ activeModelId: modelId });
    },

    setProviderConfig: (providerId, config) => {
      const current = get().providers;
      const updated = {
        ...current,
        [providerId]: {
          ...(current[providerId] || { enabled: true }),
          ...config,
        },
      };
      StorageManager.setItem('providers', updated);
      set({ providers: updated });
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    toggleContextPanel: () => set((state) => ({ contextPanelOpen: !state.contextPanelOpen })),
    setContextPanelOpen: (open) => set({ contextPanelOpen: open }),

    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
    setAboutModalOpen: (open) => set({ aboutModalOpen: open }),

    setSystemPrompt: (prompt) => {
      StorageManager.setItem('systemPrompt', prompt);
      set({ systemPrompt: prompt });
    },
  };
});

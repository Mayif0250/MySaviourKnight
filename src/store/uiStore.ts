import { create } from 'zustand';

interface UIStoreState {
  commandPaletteOpen: boolean;
  settingsModalOpen: boolean;
  aboutModalOpen: boolean;
  activeSettingsTab: 'general' | 'appearance' | 'providers' | 'shortcuts' | 'about';

  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setSettingsModalOpen: (open: boolean, tab?: UIStoreState['activeSettingsTab']) => void;
  setAboutModalOpen: (open: boolean) => void;
  setActiveSettingsTab: (tab: UIStoreState['activeSettingsTab']) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  commandPaletteOpen: false,
  settingsModalOpen: false,
  aboutModalOpen: false,
  activeSettingsTab: 'general',

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setSettingsModalOpen: (open, tab) =>
    set((state) => ({
      settingsModalOpen: open,
      activeSettingsTab: tab || state.activeSettingsTab,
    })),

  setAboutModalOpen: (open) => set({ aboutModalOpen: open }),
  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
}));

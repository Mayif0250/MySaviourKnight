import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OverlayStyle = 'adaptive' | 'transparent' | 'glass' | 'solid' | 'custom';
export type TextContrast = 'auto' | 'light' | 'dark' | 'high';

export interface AppearanceSettings {
  overlayStyle: OverlayStyle;
  textContrast: TextContrast;
  opacity: number;
  blur: number;
  border: boolean;
}

interface AppearanceState extends AppearanceSettings {
  setOverlayStyle: (style: OverlayStyle) => void;
  setTextContrast: (contrast: TextContrast) => void;
  setOpacity: (opacity: number) => void;
  setBlur: (blur: number) => void;
  setBorder: (border: boolean) => void;
  updateSettings: (settings: Partial<AppearanceSettings>) => void;
}

const defaultSettings: AppearanceSettings = {
  overlayStyle: 'adaptive',
  textContrast: 'auto',
  opacity: 80,
  blur: 12,
  border: true,
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setOverlayStyle: (overlayStyle) => set({ overlayStyle }),
      setTextContrast: (textContrast) => set({ textContrast }),
      setOpacity: (opacity) => set({ opacity }),
      setBlur: (blur) => set({ blur }),
      setBorder: (border) => set({ border }),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'msk-appearance-storage',
    }
  )
);

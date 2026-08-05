export type ThemeMode = 'light' | 'dark' | 'system';

export interface ShortcutConfig {
  id: string;
  label: string;
  keys: string;
  defaultKeys: string;
}

export interface SettingsState {
  theme: ThemeMode;
  activeProvider: string;
  activeModel: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  systemPrompt: string;
  temperature: number;
  autoScroll: boolean;
  enterToSubmit: boolean;
  compactOverlay: boolean;
  alwaysOnTop: boolean;
  sidebarCollapsed: boolean;
  contextPanelOpen: boolean;
  activeRightPanelTab: 'context' | 'attachments' | 'memory' | 'plugins' | 'agents';
}

export const DEFAULT_SYSTEM_PROMPT = `You are MSK (My Saviour Knight), an intelligent, reliable, and precise AI assistant designed for software developers, researchers, and technical professionals.
Provide concise, clear, and high-quality responses. When sharing code, write clean, production-ready code with minimal unnecessary explanations unless requested.`;

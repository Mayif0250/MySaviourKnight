import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { OverlayLayout } from './layouts/OverlayLayout';
import { ManagementLayout } from './layouts/ManagementLayout';
import { useThemeStore } from './store/themeStore';
import { useSettingsStore } from './store/settingsStore';
import { useConversationStore } from './store/conversationStore';
import { StorageService } from './services/storage/StorageService';

export const App: React.FC = () => {
  const { initTheme } = useThemeStore();
  const [windowLabel, setWindowLabel] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = initTheme();
    
    try {
      const appWindow = getCurrentWindow();
      setWindowLabel(appWindow.label);
    } catch (e) {
      console.warn("Not running in Tauri, falling back to 'main'");
      setWindowLabel('main');
    }

    // Sync state across windows natively
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'msk_settings_v1') {
        useSettingsStore.setState(StorageService.loadSettings());
      } else if (e.key === 'msk_conversations_v1') {
        useConversationStore.setState({ conversations: StorageService.loadConversations() });
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('storage', handleStorage);
    };
  }, [initTheme]);

  if (!windowLabel) return null; // loading state

  if (windowLabel === 'management') {
    return <ManagementLayout />;
  }

  // Default to main overlay
  return <OverlayLayout />;
};

export default App;

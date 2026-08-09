import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { OverlayLayout } from './layouts/OverlayLayout';
import { ManagementLayout } from './layouts/ManagementLayout';

export const App: React.FC = () => {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const appWindow = getCurrentWindow();
      setWindowLabel(appWindow.label);
    } catch (e) {
      console.warn("Not running in Tauri, falling back to 'main'");
      setWindowLabel('main');
    }
  }, []);

  if (!windowLabel) return null; // loading state

  if (windowLabel === 'management') {
    return <ManagementLayout />;
  }

  // Default to main overlay
  return <OverlayLayout />;
};

export default App;

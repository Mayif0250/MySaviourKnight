import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ChatPage } from './pages/ChatPage';
import { useSettingsStore } from './store/settingsStore';

export const App: React.FC = () => {
  const { setTheme, theme, toggleSidebar, toggleContextPanel, setSettingsModalOpen } = useSettingsStore();

  useEffect(() => {
    // Initialize theme
    setTheme(theme);

    // Register global desktop keyboard hotkeys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          toggleSidebar();
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          toggleContextPanel();
        } else if (e.key === ',') {
          e.preventDefault();
          setSettingsModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<ChatPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;

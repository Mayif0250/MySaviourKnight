import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { useThemeStore } from './store/themeStore';

export const App: React.FC = () => {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    const cleanup = initTheme();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

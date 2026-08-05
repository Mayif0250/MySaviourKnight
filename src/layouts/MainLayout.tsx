import React from 'react';
import { Titlebar } from '../components/common/Titlebar';
import { Sidebar } from '../features/sidebar/Sidebar';
import { ContextPanel } from '../features/chat/ContextPanel';
import { SettingsModal } from '../features/settings/SettingsModal';
import { CommandPalette } from '../components/common/CommandPalette';
import { Toaster } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-background-light dark:bg-background-dark text-text-primaryLight dark:text-text-primaryDark overflow-hidden">
      {/* Frameless Desktop Titlebar */}
      <Titlebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden relative">{children}</main>
        <ContextPanel />
      </div>

      {/* Modals & Overlay Utilities */}
      <SettingsModal />
      <CommandPalette />
      <Toaster position="bottom-right" richColors />
    </div>
  );
};

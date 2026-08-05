import React, { useEffect } from 'react';
import { Titlebar } from '../shared/components/Titlebar';
import { Sidebar } from '../features/sidebar/Sidebar';
import { ChatArea } from '../features/chat/ChatArea';
import { ContextPanel } from '../features/chat/ContextPanel';
import { CommandPalette } from '../shared/components/CommandPalette';
import { SettingsModal } from '../features/settings/SettingsModal';
import { CompactOverlayView } from '../features/chat/CompactOverlayView';
import { useSettingsStore } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';
import { useConversationStore } from '../store/conversationStore';
import { useChatStore } from '../store/chatStore';
import { Toaster } from 'sonner';

export const MainLayout: React.FC = () => {
  const { compactOverlay, toggleCompactOverlay, updateSettings, sidebarCollapsed, contextPanelOpen } =
    useSettingsStore();
  const { toggleCommandPalette, setSettingsModalOpen } = useUIStore();
  const { createConversation } = useConversationStore();
  const { setActiveConversationId } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (e.shiftKey && key === 'o') {
          e.preventDefault();
          toggleCompactOverlay();
        } else if (key === 'b') {
          e.preventDefault();
          updateSettings({ sidebarCollapsed: !sidebarCollapsed });
        } else if (key === 'i') {
          e.preventDefault();
          updateSettings({ contextPanelOpen: !contextPanelOpen });
        } else if (key === 'n') {
          e.preventDefault();
          const newConv = createConversation('openai', 'gpt-4o');
          setActiveConversationId(newConv.id);
        } else if (key === ',') {
          e.preventDefault();
          setSettingsModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    compactOverlay,
    sidebarCollapsed,
    contextPanelOpen,
    toggleCompactOverlay,
    updateSettings,
    createConversation,
    setActiveConversationId,
    setSettingsModalOpen,
  ]);

  if (compactOverlay) {
    return (
      <div className="h-screen w-screen bg-transparent overflow-hidden font-sans">
        <CompactOverlayView />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans select-none">
      {/* Top Desktop Drag Titlebar */}
      <Titlebar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <ChatArea />
        <ContextPanel />
      </div>

      {/* Global Dialogs & Toasts */}
      <CommandPalette />
      <SettingsModal />
      <Toaster position="bottom-right" theme="system" richColors />
    </div>
  );
};

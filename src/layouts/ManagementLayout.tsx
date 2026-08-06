import React, { useEffect } from 'react';
import { Titlebar } from '../shared/components/Titlebar';
import { Sidebar } from '../features/sidebar/Sidebar';
import { ChatArea } from '../features/chat/ChatArea';
import { ContextPanel } from '../features/chat/ContextPanel';
import { CommandPalette } from '../shared/components/CommandPalette';
import { SettingsModal } from '../features/settings/SettingsModal';
import { useSettingsStore } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';
import { useConversationStore } from '../store/conversationStore';
import { useChatStore } from '../store/chatStore';
import { Toaster } from 'sonner';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const ManagementLayout: React.FC = () => {
  const { updateSettings, sidebarCollapsed, contextPanelOpen } = useSettingsStore();
  const { setSettingsModalOpen } = useUIStore();
  const { createConversation } = useConversationStore();
  const { setActiveConversationId } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
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
      if (e.key === 'Escape') {
        // Optionally let escape close management window or clear focus
        // getCurrentWindow().close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, contextPanelOpen, updateSettings, createConversation, setActiveConversationId, setSettingsModalOpen]);

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-sans select-none border border-gray-700/50 rounded-xl">
      <Titlebar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <ChatArea />
        <ContextPanel />
      </div>
      <CommandPalette />
      <SettingsModal />
      <Toaster position="bottom-right" theme="system" richColors />
    </div>
  );
};

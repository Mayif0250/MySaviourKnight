import React, { useEffect, useState } from 'react';
import { Search, Plus, Settings, Sun, Moon, Trash2, Shield, Layers, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useConversationStore } from '../../store/conversationStore';
import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeStore } from '../../store/themeStore';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setSettingsModalOpen } = useUIStore();
  const { conversations, createConversation, clearAllConversations } = useConversationStore();
  const { setActiveConversationId } = useChatStore();
  const { activeProvider, activeModel, toggleCompactOverlay } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setCommandPaletteOpen(false);
  };

  const handleNewChat = () => {
    const conv = createConversation(activeProvider, activeModel);
    setActiveConversationId(conv.id);
    setCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search conversations... (Esc to cancel)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Options List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {/* Quick System Actions */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-1 mt-1">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Start New Conversation</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => {
                  setSettingsModalOpen(true);
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Open Settings</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">Ctrl+,</span>
              </button>

              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  )}
                  <span>Toggle Theme ({theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})</span>
                </div>
              </button>

              <button
                onClick={() => {
                  toggleCompactOverlay();
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-violet-500" />
                  <span>Toggle Compact Overlay Mode</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">Ctrl+Shift+O</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all chat history?')) {
                    clearAllConversations();
                    setActiveConversationId(null);
                    setCommandPaletteOpen(false);
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Clear All Chat History</span>
                </div>
              </button>
            </div>
          </div>

          {/* Conversations Section */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Recent Conversations ({filteredConversations.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredConversations.length === 0 ? (
                <div className="px-3 py-4 text-xs text-center text-gray-400">
                  No matching conversations found.
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>Navigate with mouse or keyboard</span>
          <span>MSK Command Center</span>
        </div>
      </div>
    </div>
  );
};

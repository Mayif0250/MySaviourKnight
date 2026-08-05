import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useChatStore } from '../../store/chatStore';
import { Search, Plus, Settings, Moon, Sun, MessageSquare, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setSettingsModalOpen,
    setAboutModalOpen,
    theme,
    setTheme,
  } = useSettingsStore();

  const { conversations, setActiveConversation, createNewChat } = useChatStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-white dark:bg-background-cardDark border border-border-light dark:border-border-dark rounded-2xl shadow-float overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-border-light dark:border-border-dark gap-3">
            <Search size={18} className="text-text-secondaryLight dark:text-text-secondaryDark" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-text-primaryLight dark:text-text-primaryDark placeholder-text-secondaryLight dark:placeholder-text-secondaryDark"
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="p-1 rounded-md text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* Commands & Search Results */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {/* Quick Commands */}
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase">
              Quick Actions
            </div>

            <button
              onClick={() => {
                createNewChat();
                setCommandPaletteOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} className="text-blue-600" />
              <span>New Conversation</span>
              <span className="ml-auto text-xs text-text-secondaryLight dark:text-text-secondaryDark font-mono">
                Ctrl+N
              </span>
            </button>

            <button
              onClick={() => {
                setSettingsModalOpen(true);
                setCommandPaletteOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings size={16} className="text-gray-500" />
              <span>Open Settings</span>
              <span className="ml-auto text-xs text-text-secondaryLight dark:text-text-secondaryDark font-mono">
                Ctrl+,
              </span>
            </button>

            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setCommandPaletteOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
              <span>Toggle Theme ({theme === 'dark' ? 'Light' : 'Dark'})</span>
            </button>

            <button
              onClick={() => {
                setAboutModalOpen(true);
                setCommandPaletteOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Info size={16} className="text-emerald-500" />
              <span>About MSK</span>
            </button>

            {/* Conversations */}
            {filteredConversations.length > 0 && (
              <>
                <div className="px-2 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase">
                  Recent Conversations
                </div>
                {filteredConversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConversation(c.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

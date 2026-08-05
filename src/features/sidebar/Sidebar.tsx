import React, { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Logo } from '../../components/common/Logo';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createNewChat,
    deleteConversation,
    togglePinConversation,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const {
    sidebarCollapsed,
    toggleSidebar,
    setSettingsModalOpen,
    setAboutModalOpen,
    setCommandPaletteOpen,
  } = useSettingsStore();

  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter conversations
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filtered.filter((c) => c.pinned);
  const unpinnedChats = filtered.filter((c) => !c.pinned);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-full border-r border-border-light dark:border-border-dark bg-background-sidebarLight dark:bg-background-sidebarDark flex flex-col z-30 select-none overflow-hidden"
    >
      {/* Header with Logo */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-border-light/60 dark:border-border-dark/60">
        <Logo size={28} showText={!sidebarCollapsed} />
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => createNewChat()}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft transition-all ${
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="New Conversation (Ctrl+N)"
        >
          <Plus size={16} />
          {!sidebarCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Search Bar / Quick Command Trigger */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark text-xs text-text-secondaryLight dark:text-text-secondaryDark hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            <Search size={14} />
            <span className="flex-1 text-left truncate">Search chats...</span>
            <span className="text-[10px] font-mono px-1 rounded bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark">
              Ctrl+K
            </span>
          </button>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3">
        {/* Pinned Chats */}
        {pinnedChats.length > 0 && (
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className="px-2 text-[10px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase flex items-center gap-1">
                <Pin size={10} />
                <span>Pinned</span>
              </div>
            )}
            {pinnedChats.map((c) => (
              <div
                key={c.id}
                onMouseEnter={() => setHoveredChatId(c.id)}
                onMouseLeave={() => {
                  setHoveredChatId(null);
                  setActiveMenuId(null);
                }}
                className="relative"
              >
                <button
                  onClick={() => setActiveConversation(c.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    activeConversationId === c.id
                      ? 'bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                  } ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <MessageSquare size={15} className="flex-shrink-0 text-blue-500" />
                  {!sidebarCollapsed && <span className="truncate flex-1 text-left">{c.title}</span>}
                </button>

                {!sidebarCollapsed && hoveredChatId === c.id && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-0.5 shadow-soft">
                    <button
                      onClick={() => togglePinConversation(c.id)}
                      className="p-1 hover:text-blue-500 text-text-secondaryLight dark:text-text-secondaryDark"
                      title="Unpin Chat"
                    >
                      <Pin size={12} className="fill-current" />
                    </button>
                    <button
                      onClick={() => deleteConversation(c.id)}
                      className="p-1 hover:text-red-500 text-text-secondaryLight dark:text-text-secondaryDark"
                      title="Delete Chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Regular Recent Chats */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="px-2 text-[10px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase">
              Recent Chats
            </div>
          )}
          {unpinnedChats.length === 0 ? (
            !sidebarCollapsed && (
              <div className="px-2 py-3 text-xs text-text-secondaryLight dark:text-text-secondaryDark italic">
                No recent conversations.
              </div>
            )
          ) : (
            unpinnedChats.map((c) => (
              <div
                key={c.id}
                onMouseEnter={() => setHoveredChatId(c.id)}
                onMouseLeave={() => {
                  setHoveredChatId(null);
                  setActiveMenuId(null);
                }}
                className="relative"
              >
                <button
                  onClick={() => setActiveConversation(c.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    activeConversationId === c.id
                      ? 'bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                  } ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <MessageSquare size={15} className="flex-shrink-0 opacity-70" />
                  {!sidebarCollapsed && <span className="truncate flex-1 text-left">{c.title}</span>}
                </button>

                {!sidebarCollapsed && hoveredChatId === c.id && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-0.5 shadow-soft">
                    <button
                      onClick={() => togglePinConversation(c.id)}
                      className="p-1 hover:text-blue-500 text-text-secondaryLight dark:text-text-secondaryDark"
                      title="Pin Chat"
                    >
                      <Pin size={12} />
                    </button>
                    <button
                      onClick={() => deleteConversation(c.id)}
                      className="p-1 hover:text-red-500 text-text-secondaryLight dark:text-text-secondaryDark"
                      title="Delete Chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-2 border-t border-border-light/60 dark:border-border-dark/60 space-y-1">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-xl text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <button
          onClick={() => setSettingsModalOpen(true)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors ${
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Settings (Ctrl+,)"
        >
          <Settings size={16} className="text-gray-500" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => setAboutModalOpen(true)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors ${
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="About MSK"
        >
          <Info size={16} className="text-blue-500" />
          {!sidebarCollapsed && <span>About MSK</span>}
        </button>
      </div>
    </motion.aside>
  );
};

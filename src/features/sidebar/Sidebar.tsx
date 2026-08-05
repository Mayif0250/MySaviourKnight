import React, { useState } from 'react';
import {
  Plus,
  Search,
  Settings,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '../../shared/components/Logo';
import { useConversationStore } from '../../store/conversationStore';
import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';

export const Sidebar: React.FC = () => {
  const { conversations, createConversation, deleteConversation, renameConversation, togglePinConversation } =
    useConversationStore();
  const { activeConversationId, setActiveConversationId } = useChatStore();
  const { activeProvider, activeModel, sidebarCollapsed, updateSettings } = useSettingsStore();
  const { setSettingsModalOpen, setAboutModalOpen, toggleCommandPalette } = useUIStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleNewChat = () => {
    const conv = createConversation(activeProvider, activeModel);
    setActiveConversationId(conv.id);
  };

  const handleStartEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const recentConversations = filteredConversations.filter((c) => !c.pinned);

  if (sidebarCollapsed) {
    return (
      <div className="w-14 bg-gray-50/90 dark:bg-gray-950/90 border-r border-gray-200/80 dark:border-gray-800/80 flex flex-col items-center py-3 justify-between transition-all duration-300 z-40 select-none">
        <div className="flex flex-col items-center gap-4">
          <Logo size="sm" showText={false} />
          <button
            onClick={handleNewChat}
            title="New Chat (Ctrl+N)"
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={toggleCommandPalette}
            title="Search (Ctrl+K)"
            className="w-10 h-10 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center transition-all"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setSettingsModalOpen(true)}
            title="Settings (Ctrl+,)"
            className="p-2.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateSettings({ sidebarCollapsed: false })}
            title="Expand Sidebar (Ctrl+B)"
            className="p-2 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-gray-50/90 dark:bg-gray-950/90 border-r border-gray-200/80 dark:border-gray-800/80 flex flex-col justify-between h-[calc(100vh-2.5rem)] select-none transition-all duration-300 z-40">
      {/* Top Header & Actions */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <Logo size="md" showText={true} />
          <button
            onClick={() => updateSettings({ sidebarCollapsed: true })}
            title="Collapse Sidebar (Ctrl+B)"
            className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary Action Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Chat</span>
          </div>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/20 text-white/90">
            Ctrl+N
          </span>
        </button>

        {/* Quick Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500/50 outline-none text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List Content */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {/* Pinned Section */}
        {pinnedConversations.length > 0 && (
          <div>
            <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Pin className="w-3 h-3 text-amber-500" />
              <span>Pinned</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {pinnedConversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  isEditing={editingId === conv.id}
                  editingTitle={editingTitle}
                  onSelect={() => setActiveConversationId(conv.id)}
                  onStartEdit={(e) => handleStartEditing(conv.id, conv.title, e)}
                  onSaveEdit={(e) => handleSaveRename(conv.id, e)}
                  onCancelEdit={() => setEditingId(null)}
                  onSetEditingTitle={setEditingTitle}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    togglePinConversation(conv.id);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                    if (activeConversationId === conv.id) {
                      setActiveConversationId(null);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats Section */}
        <div>
          <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Recent Chats
          </div>
          <div className="mt-1 space-y-0.5">
            {recentConversations.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-400">
                {searchFilter ? 'No matching chats' : 'No recent chats yet'}
              </div>
            ) : (
              recentConversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  isEditing={editingId === conv.id}
                  editingTitle={editingTitle}
                  onSelect={() => setActiveConversationId(conv.id)}
                  onStartEdit={(e) => handleStartEditing(conv.id, conv.title, e)}
                  onSaveEdit={(e) => handleSaveRename(conv.id, e)}
                  onCancelEdit={() => setEditingId(null)}
                  onSetEditingTitle={setEditingTitle}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    togglePinConversation(conv.id);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                    if (activeConversationId === conv.id) {
                      setActiveConversationId(null);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between bg-gray-100/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsModalOpen(true)}
            title="Settings (Ctrl+,)"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        <button
          onClick={() => setAboutModalOpen(true)}
          title="About MSK"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

interface ConversationRowProps {
  conversation: any;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onSelect: () => void;
  onStartEdit: (e: React.MouseEvent) => void;
  onSaveEdit: (e: React.MouseEvent | React.FormEvent) => void;
  onCancelEdit: () => void;
  onSetEditingTitle: (title: string) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  isActive,
  isEditing,
  editingTitle,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSetEditingTitle,
  onTogglePin,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center gap-2 truncate min-w-0 pr-12">
        <MessageSquare
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          }`}
        />

        {isEditing ? (
          <form onSubmit={onSaveEdit} className="flex items-center gap-1 w-full">
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onChange={(e) => onSetEditingTitle(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-blue-500 px-1.5 py-0.5 rounded text-xs text-gray-900 dark:text-gray-100 outline-none"
            />
            <button type="submit" className="p-0.5 text-emerald-500">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onCancelEdit} className="p-0.5 text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <span className="truncate">{conversation.title}</span>
        )}
      </div>

      {/* Action Buttons on Hover */}
      {!isEditing && (
        <div className="absolute right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-xs px-1 rounded-md">
          <button
            onClick={onStartEdit}
            title="Rename"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onTogglePin}
            title={conversation.pinned ? 'Unpin' : 'Pin to top'}
            className={`p-1 ${
              conversation.pinned ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            title="Delete chat"
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

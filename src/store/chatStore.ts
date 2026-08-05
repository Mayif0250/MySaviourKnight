import { create } from 'zustand';
import { Attachment, ChatMessage, Conversation } from '../types/ai';
import { StorageManager } from '../services/storage/StorageManager';
import { AIService } from '../services/ai/AIService';
import { useSettingsStore } from './settingsStore';
import { toast } from 'sonner';

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  searchQuery: string;
  isStreaming: boolean;
  activeAttachments: Attachment[];

  setSearchQuery: (query: string) => void;
  setActiveConversation: (id: string | null) => void;
  createNewChat: () => string;
  deleteConversation: (id: string) => void;
  togglePinConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastMessage: () => Promise<void>;
}

const DEFAULT_CONVERSATION: Conversation = {
  id: 'welcome-chat',
  title: 'Welcome to MSK',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  pinned: true,
  modelId: 'msk-knight-1',
  providerId: 'mock',
  messages: [
    {
      id: 'msg-1',
      role: 'assistant',
      content: `Hello! I am **MSK (My Saviour Knight)**, your production-ready AI companion.\n\nI feature a clean, modular architecture that supports OpenAI, local LLMs, attachments, streaming responses, and custom themes.\n\nHow can I help you today?`,
      timestamp: Date.now(),
      model: 'MSK Knight v1',
    },
  ],
};

export const useChatStore = create<ChatState>((set, get) => {
  const initialConversations = StorageManager.getItem<Conversation[]>('conversations', [DEFAULT_CONVERSATION]);
  const initialActiveId = StorageManager.getItem<string | null>('activeId', initialConversations[0]?.id || null);

  const saveConversations = (conversations: Conversation[]) => {
    StorageManager.setItem('conversations', conversations);
  };

  return {
    conversations: initialConversations,
    activeConversationId: initialActiveId,
    searchQuery: '',
    isStreaming: false,
    activeAttachments: [],

    setSearchQuery: (query) => set({ searchQuery: query }),

    setActiveConversation: (id) => {
      StorageManager.setItem('activeId', id);
      set({ activeConversationId: id });
    },

    createNewChat: () => {
      const { activeProviderId, activeModelId, systemPrompt } = useSettingsStore.getState();
      const newId = `chat_${Date.now()}`;
      const newChat: Conversation = {
        id: newId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modelId: activeModelId,
        providerId: activeProviderId,
        systemPrompt,
        messages: [],
      };

      const updated = [newChat, ...get().conversations];
      set({ conversations: updated, activeConversationId: newId });
      saveConversations(updated);
      return newId;
    },

    deleteConversation: (id) => {
      const updated = get().conversations.filter((c) => c.id !== id);
      const nextActiveId = updated[0]?.id || null;
      set({ conversations: updated, activeConversationId: nextActiveId });
      saveConversations(updated);
      StorageManager.setItem('activeId', nextActiveId);
      toast.success('Conversation deleted');
    },

    togglePinConversation: (id) => {
      const updated = get().conversations.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      set({ conversations: updated });
      saveConversations(updated);
    },

    renameConversation: (id, newTitle) => {
      const updated = get().conversations.map((c) =>
        c.id === id ? { ...c, title: newTitle } : c
      );
      set({ conversations: updated });
      saveConversations(updated);
    },

    addAttachment: (attachment) => {
      set((state) => ({ activeAttachments: [...state.activeAttachments, attachment] }));
    },

    removeAttachment: (id) => {
      set((state) => ({ activeAttachments: state.activeAttachments.filter((a) => a.id !== id) }));
    },

    clearAttachments: () => set({ activeAttachments: [] }),

    sendMessage: async (content: string) => {
      let { activeConversationId, conversations, activeAttachments } = get();
      if (!content.trim() && activeAttachments.length === 0) return;

      // Create new chat if none is active
      if (!activeConversationId) {
        activeConversationId = get().createNewChat();
        conversations = get().conversations;
      }

      const activeChat = conversations.find((c) => c.id === activeConversationId);
      if (!activeChat) return;

      const userMsgId = `msg_${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments: [...activeAttachments],
      };

      // Generate title from first user prompt if default
      let title = activeChat.title;
      if (activeChat.messages.length === 0 || title === 'New Conversation') {
        title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      }

      const updatedMessages = [...activeChat.messages, userMessage];
      const assistantMsgId = `msg_ast_${Date.now() + 1}`;
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        model: activeChat.modelId,
        providerId: activeChat.providerId,
      };

      const updatedChat: Conversation = {
        ...activeChat,
        title,
        updatedAt: Date.now(),
        messages: [...updatedMessages, assistantMessage],
      };

      const nextConversations = conversations.map((c) => (c.id === activeConversationId ? updatedChat : c));
      set({
        conversations: nextConversations,
        isStreaming: true,
        activeAttachments: [],
      });
      saveConversations(nextConversations);

      // Trigger streaming call via AIService
      const settings = useSettingsStore.getState();
      const providerId = activeChat.providerId || settings.activeProviderId;
      const providerConfig = settings.providers[providerId];
      const apiKey = providerConfig?.apiKey;
      const baseUrl = providerConfig?.baseUrl;

      const formattedHistory = updatedMessages.map((m) => ({ role: m.role, content: m.content }));

      try {
        await AIService.getInstance().stream(
          providerId,
          {
            messages: formattedHistory,
            model: activeChat.modelId || settings.activeModelId,
            systemPrompt: activeChat.systemPrompt || settings.systemPrompt,
          },
          (chunk) => {
            const currentConv = get().conversations.find((c) => c.id === activeConversationId);
            if (!currentConv) return;

            const msgs = currentConv.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
            );

            const convUpdated = { ...currentConv, messages: msgs };
            const convsUpdated = get().conversations.map((c) => (c.id === activeConversationId ? convUpdated : c));

            set({ conversations: convsUpdated });
          },
          apiKey,
          baseUrl
        );

        // Streaming finished
        const currentConv = get().conversations.find((c) => c.id === activeConversationId);
        if (currentConv) {
          const finalMsgs = currentConv.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
          );
          const finalConv = { ...currentConv, messages: finalMsgs };
          const finalConvs = get().conversations.map((c) => (c.id === activeConversationId ? finalConv : c));
          set({ conversations: finalConvs, isStreaming: false });
          saveConversations(finalConvs);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to generate response');
        const currentConv = get().conversations.find((c) => c.id === activeConversationId);
        if (currentConv) {
          const finalMsgs = currentConv.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, isStreaming: false, error: err.message || 'Error occurred during streaming' }
              : m
          );
          const finalConv = { ...currentConv, messages: finalMsgs };
          const finalConvs = get().conversations.map((c) => (c.id === activeConversationId ? finalConv : c));
          set({ conversations: finalConvs, isStreaming: false });
          saveConversations(finalConvs);
        }
      }
    },

    stopGeneration: () => {
      AIService.getInstance().stopStream();
      set({ isStreaming: false });
      toast.info('Response generation stopped');
    },

    regenerateLastMessage: async () => {
      const { activeConversationId, conversations } = get();
      if (!activeConversationId) return;

      const activeChat = conversations.find((c) => c.id === activeConversationId);
      if (!activeChat || activeChat.messages.length === 0) return;

      // Find last user prompt
      const lastUserIndex = [...activeChat.messages].reverse().findIndex((m) => m.role === 'user');
      if (lastUserIndex === -1) return;

      const actualUserIndex = activeChat.messages.length - 1 - lastUserIndex;
      const userPrompt = activeChat.messages[actualUserIndex].content;

      // Truncate messages up to that user prompt
      const truncatedMessages = activeChat.messages.slice(0, actualUserIndex);
      const updatedChat = { ...activeChat, messages: truncatedMessages };
      const updatedConvs = conversations.map((c) => (c.id === activeConversationId ? updatedChat : c));
      set({ conversations: updatedConvs });

      // Re-send user message
      await get().sendMessage(userPrompt);
    },
  };
});

import { create } from 'zustand';
import { Conversation, ChatMessage } from '../shared/types/ai';
import { StorageService } from '../services/storage/StorageService';
import { aiService } from '../services/ai/AIService';

interface ConversationStoreState {
  conversations: Conversation[];
  searchQuery: string;
  
  setSearchQuery: (query: string) => void;
  createConversation: (providerId: string, modelId: string, systemPrompt?: string) => Conversation;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  clearAllConversations: () => void;
  addMessageToConversation: (conversationId: string, role: 'user' | 'assistant', content: string, model?: string) => ChatMessage;
  updateLastAssistantMessage: (conversationId: string, content: string) => void;
  getConversationById: (id: string) => Conversation | undefined;
}

const loadedConversations = StorageService.loadConversations();

export const useConversationStore = create<ConversationStoreState>((set, get) => ({
  conversations: loadedConversations,
  searchQuery: '',

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  createConversation: (providerId, modelId, systemPrompt) => {
    const newConv = aiService.getConversationManager().createConversation(providerId, modelId, systemPrompt);
    const updated = [newConv, ...get().conversations];
    set({ conversations: updated });
    StorageService.saveConversations(updated);
    return newConv;
  },

  deleteConversation: (id) => {
    const updated = get().conversations.filter((c) => c.id !== id);
    set({ conversations: updated });
    StorageService.saveConversations(updated);
  },

  renameConversation: (id, newTitle) => {
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
    );
    set({ conversations: updated });
    StorageService.saveConversations(updated);
  },

  togglePinConversation: (id) => {
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, pinned: !c.pinned, updatedAt: Date.now() } : c
    );
    set({ conversations: updated });
    StorageService.saveConversations(updated);
  },

  clearAllConversations: () => {
    set({ conversations: [] });
    StorageService.saveConversations([]);
  },

  addMessageToConversation: (conversationId, role, content, model) => {
    const target = get().conversations.find((c) => c.id === conversationId);
    if (!target) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const { conversation: updatedConv, message } = aiService
      .getConversationManager()
      .addMessage(target, role, content, model);

    const updatedList = get().conversations.map((c) =>
      c.id === conversationId ? updatedConv : c
    );

    set({ conversations: updatedList });
    StorageService.saveConversations(updatedList);
    return message;
  },

  updateLastAssistantMessage: (conversationId, content) => {
    const conversations = get().conversations;
    const updatedList = conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const msgs = [...c.messages];
      if (msgs.length === 0) return c;

      const lastIdx = msgs.length - 1;
      if (msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          content,
          timestamp: Date.now(),
        };
      }
      return { ...c, messages: msgs, updatedAt: Date.now() };
    });

    set({ conversations: updatedList });
    StorageService.saveConversations(updatedList);
  },

  getConversationById: (id) => get().conversations.find((c) => c.id === id),
}));

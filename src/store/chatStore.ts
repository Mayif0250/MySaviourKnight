import { create } from 'zustand';

interface ChatStoreState {
  activeConversationId: string | null;
  inputPrompt: string;
  isStreaming: boolean;
  activeStreamingText: string;

  setActiveConversationId: (id: string | null) => void;
  setInputPrompt: (prompt: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setActiveStreamingText: (text: string) => void;
  appendStreamingText: (chunk: string) => void;
  resetStreaming: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  activeConversationId: null,
  inputPrompt: '',
  isStreaming: false,
  activeStreamingText: '',

  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setInputPrompt: (inputPrompt) => set({ inputPrompt }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setActiveStreamingText: (activeStreamingText) => set({ activeStreamingText }),

  appendStreamingText: (chunk) =>
    set((state) => ({ activeStreamingText: state.activeStreamingText + chunk })),

  resetStreaming: () =>
    set({ isStreaming: false, activeStreamingText: '' }),
}));

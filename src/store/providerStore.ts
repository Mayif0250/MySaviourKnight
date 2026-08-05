import { create } from 'zustand';
import { aiService } from '../services/ai/AIService';
import { AIProviderInterface } from '../shared/types/ai';

interface ProviderStoreState {
  providers: AIProviderInterface[];
  activeProviderId: string;
  setActiveProviderId: (id: string) => void;
  getActiveProvider: () => AIProviderInterface;
}

export const useProviderStore = create<ProviderStoreState>((set, get) => ({
  providers: aiService.getProviderManager().getAllProviders(),
  activeProviderId: 'openai',

  setActiveProviderId: (id: string) => {
    aiService.getProviderManager().setActiveProvider(id);
    set({ activeProviderId: id });
  },

  getActiveProvider: () => {
    return aiService.getProviderManager().getProvider(get().activeProviderId);
  },
}));

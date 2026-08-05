import { AIProviderInterface } from '../../shared/types/ai';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { ClaudeProvider } from './ClaudeProvider';
import { OllamaProvider } from './OllamaProvider';
import { LMStudioProvider, OpenRouterProvider } from './LMStudioProvider';

export class ProviderManager {
  private providers: Map<string, AIProviderInterface> = new Map();
  private activeProviderId = 'openai';

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new OllamaProvider());
    this.registerProvider(new LMStudioProvider());
    this.registerProvider(new OpenRouterProvider());
  }

  registerProvider(provider: AIProviderInterface): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId?: string): AIProviderInterface {
    const id = providerId || this.activeProviderId;
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`AI Provider '${id}' is not registered.`);
    }
    return provider;
  }

  setActiveProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Cannot set unknown AI Provider '${providerId}'.`);
    }
    this.activeProviderId = providerId;
  }

  getActiveProvider(): AIProviderInterface {
    return this.getProvider(this.activeProviderId);
  }

  getAllProviders(): AIProviderInterface[] {
    return Array.from(this.providers.values());
  }
}

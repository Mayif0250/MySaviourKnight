import { ProviderManager } from './ProviderManager';
import { StreamingManager } from './StreamingManager';
import { ConversationManager } from './ConversationManager';
import {
  ChatMessage,
  AIProviderConfig,
  StreamCallback,
  ModelInfo,
} from '../../shared/types/ai';

export class AIService {
  private providerManager: ProviderManager;
  private streamingManager: StreamingManager;
  private conversationManager: ConversationManager;

  constructor() {
    this.providerManager = new ProviderManager();
    this.streamingManager = new StreamingManager();
    this.conversationManager = new ConversationManager();
  }

  getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  getConversationManager(): ConversationManager {
    return this.conversationManager;
  }

  async streamCompletion(
    messages: ChatMessage[],
    providerId: string,
    modelId: string,
    config: AIProviderConfig,
    onChunk: StreamCallback,
    systemPrompt?: string
  ): Promise<void> {
    const provider = this.providerManager.getProvider(providerId);
    const signal = this.streamingManager.startStream();

    try {
      await provider.streamMessage(
        messages,
        modelId,
        config,
        (chunk) => {
          if (chunk.done) {
            this.streamingManager.finishStream();
          }
          onChunk(chunk);
        },
        systemPrompt,
        signal
      );
    } catch (err: any) {
      this.streamingManager.finishStream();
      onChunk({
        delta: '',
        done: true,
        error: err.message || 'Failed to stream response from provider',
      });
    }
  }

  stopStream(): void {
    this.streamingManager.stopStream();
  }

  getIsStreaming(): boolean {
    return this.streamingManager.getIsStreaming();
  }

  getAvailableModels(providerId: string): ModelInfo[] {
    const provider = this.providerManager.getProvider(providerId);
    return provider.models;
  }

  async validateKey(providerId: string, config: AIProviderConfig): Promise<boolean> {
    const provider = this.providerManager.getProvider(providerId);
    return provider.validateConfig(config);
  }
}

// Global Singleton Instance for application-wide decoupling
export const aiService = new AIService();

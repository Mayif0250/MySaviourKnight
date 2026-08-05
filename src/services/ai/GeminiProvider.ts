import {
  AIProviderInterface,
  AIProviderConfig,
  ChatMessage,
  ModelInfo,
  StreamCallback,
} from '../../shared/types/ai';

export class GeminiProvider implements AIProviderInterface {
  id = 'gemini';
  name = 'Google Gemini';
  description = 'Google Gemini 1.5 Pro & Flash models (Placeholder)';
  isAvailable = false;

  models: ModelInfo[] = [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Complex reasoning with 1M context window',
      contextWindow: 1000000,
      maxTokens: 8192,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: 'High-speed multimodal task execution',
      contextWindow: 1000000,
      maxTokens: 8192,
    },
  ];

  async validateConfig(_config: AIProviderConfig): Promise<boolean> {
    return false;
  }

  async sendMessage(
    _messages: ChatMessage[],
    _model: string,
    _config: AIProviderConfig
  ): Promise<string> {
    throw new Error('Gemini Provider is currently in placeholder mode.');
  }

  async streamMessage(
    _messages: ChatMessage[],
    _model: string,
    _config: AIProviderConfig,
    onChunk: StreamCallback
  ): Promise<void> {
    onChunk({
      delta: '',
      done: true,
      error: 'Gemini Provider module will be available in an upcoming update.',
    });
  }
}

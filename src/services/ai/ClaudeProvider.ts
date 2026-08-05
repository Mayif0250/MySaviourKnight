import {
  AIProviderInterface,
  AIProviderConfig,
  ChatMessage,
  ModelInfo,
  StreamCallback,
} from '../../shared/types/ai';

export class ClaudeProvider implements AIProviderInterface {
  id = 'claude';
  name = 'Anthropic Claude';
  description = 'Claude 3.5 Sonnet, Haiku & Opus models (Placeholder)';
  isAvailable = false;

  models: ModelInfo[] = [
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Industry-leading reasoning and code generation',
      contextWindow: 200000,
      maxTokens: 8192,
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Ultra-fast lightweight assistant',
      contextWindow: 200000,
      maxTokens: 4096,
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
    throw new Error('Claude Provider is currently in placeholder mode.');
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
      error: 'Claude Provider module will be available in an upcoming update.',
    });
  }
}

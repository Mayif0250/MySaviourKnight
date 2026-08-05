import {
  AIProviderInterface,
  AIProviderConfig,
  ChatMessage,
  ModelInfo,
  StreamCallback,
} from '../../shared/types/ai';

export class OllamaProvider implements AIProviderInterface {
  id = 'ollama';
  name = 'Ollama (Local AI)';
  description = 'Local offline models via Ollama (Llama 3, DeepSeek, Mistral)';
  isAvailable = false;

  models: ModelInfo[] = [
    {
      id: 'llama3:8b',
      name: 'Llama 3 8B',
      description: 'Meta open source 8B parameter model',
      contextWindow: 8192,
      maxTokens: 4096,
    },
    {
      id: 'deepseek-r1:8b',
      name: 'DeepSeek R1 8B',
      description: 'Local reasoning model for coding & math',
      contextWindow: 16384,
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
    throw new Error('Ollama Provider is currently in placeholder mode.');
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
      error: 'Ollama local inference integration will be enabled in an upcoming release.',
    });
  }
}

import {
  AIProviderInterface,
  AIProviderConfig,
  ChatMessage,
  ModelInfo,
  StreamCallback,
} from '../../shared/types/ai';

export class LMStudioProvider implements AIProviderInterface {
  id = 'lmstudio';
  name = 'LM Studio';
  description = 'Local inference server via LM Studio OpenAI compatible endpoint';
  isAvailable = false;

  models: ModelInfo[] = [
    {
      id: 'local-model',
      name: 'Local LM Studio Model',
      description: 'Currently loaded model in LM Studio local server',
      contextWindow: 8192,
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
    throw new Error('LM Studio Provider is currently in placeholder mode.');
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
      error: 'LM Studio integration will be enabled in an upcoming release.',
    });
  }
}

export class OpenRouterProvider implements AIProviderInterface {
  id = 'openrouter';
  name = 'OpenRouter';
  description = 'Unified API gateway for 100+ LLMs (DeepSeek, Qwen, Claude, Llama)';
  isAvailable = false;

  models: ModelInfo[] = [
    {
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1',
      description: 'Open-weights reasoning model via OpenRouter',
      contextWindow: 128000,
      maxTokens: 8192,
    },
    {
      id: 'qwen/qwen-2.5-coder-32b-instruct',
      name: 'Qwen 2.5 Coder 32B',
      description: 'Specialized code generation model',
      contextWindow: 32000,
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
    throw new Error('OpenRouter Provider is currently in placeholder mode.');
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
      error: 'OpenRouter integration will be enabled in an upcoming release.',
    });
  }
}

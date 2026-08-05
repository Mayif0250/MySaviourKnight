export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  model?: string;
  isError?: boolean;
  tokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  modelId: string;
  providerId: string;
  systemPrompt?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  maxTokens: number;
  recommended?: boolean;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
  error?: string;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export interface AIProviderInterface {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  models: ModelInfo[];

  sendMessage(
    messages: ChatMessage[],
    model: string,
    config: AIProviderConfig,
    systemPrompt?: string
  ): Promise<string>;

  streamMessage(
    messages: ChatMessage[],
    model: string,
    config: AIProviderConfig,
    onChunk: StreamCallback,
    systemPrompt?: string,
    signal?: AbortSignal
  ): Promise<void>;

  validateConfig(config: AIProviderConfig): Promise<boolean>;
}

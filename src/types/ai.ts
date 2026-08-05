export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'code' | 'document' | 'file';
  url?: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  providerId?: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
  modelId: string;
  providerId: string;
  systemPrompt?: string;
  tokenCount?: number;
}

export interface AIModel {
  id: string;
  name: string;
  providerId: string;
  description: string;
  contextWindow: number;
  isLocal?: boolean;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
}

export interface ChatRequest {
  messages: { role: Role; content: string }[];
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  attachments?: Attachment[];
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
  customModels?: string[];
}

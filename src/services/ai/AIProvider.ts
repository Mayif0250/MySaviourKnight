import { AIModel, ChatRequest, ChatResponse } from '../../types/ai';

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isLocal: boolean;

  getModels(): Promise<AIModel[]>;
  chat(request: ChatRequest, apiKey?: string, baseUrl?: string): Promise<ChatResponse>;
  stream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    apiKey?: string,
    baseUrl?: string,
    signal?: AbortSignal
  ): Promise<void>;
}

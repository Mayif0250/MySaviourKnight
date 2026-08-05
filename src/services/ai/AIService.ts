import { AIProvider } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { MockAIProvider } from './MockAIProvider';
import { AIModel, ChatRequest, ChatResponse } from '../../types/ai';

export class AIService {
  private static instance: AIService;
  private providers = new Map<string, AIProvider>();
  private activeAbortController: AbortController | null = null;

  private constructor() {
    this.registerProvider(new MockAIProvider());
    this.registerProvider(new OpenAIProvider());
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  public async getAllModels(): Promise<AIModel[]> {
    const allModels: AIModel[] = [];
    for (const provider of this.providers.values()) {
      try {
        const models = await provider.getModels();
        allModels.push(...models);
      } catch (err) {
        console.warn(`Failed to fetch models for provider ${provider.id}`, err);
      }
    }
    return allModels;
  }

  public async chat(
    providerId: string,
    request: ChatRequest,
    apiKey?: string,
    baseUrl?: string
  ): Promise<ChatResponse> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider "${providerId}" is not registered.`);
    }
    return provider.chat(request, apiKey, baseUrl);
  }

  public async stream(
    providerId: string,
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    apiKey?: string,
    baseUrl?: string
  ): Promise<void> {
    this.stopStream(); // Cancel any existing stream
    this.activeAbortController = new AbortController();

    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider "${providerId}" is not registered.`);
    }

    try {
      await provider.stream(
        request,
        onChunk,
        apiKey,
        baseUrl,
        this.activeAbortController.signal
      );
    } finally {
      this.activeAbortController = null;
    }
  }

  public stopStream(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  public isStreaming(): boolean {
    return this.activeAbortController !== null;
  }
}

import { AIProvider } from './AIProvider';
import { AIModel, ChatRequest, ChatResponse } from '../../types/ai';

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly description = 'GPT-4o, GPT-4o-mini, and custom OpenAI-compatible models.';
  readonly isLocal = false;

  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        providerId: this.id,
        description: 'Omni model for complex reasoning, code, and multimodal tasks.',
        contextWindow: 128000,
        supportsVision: true,
        supportsStreaming: true,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        providerId: this.id,
        description: 'Fast, lightweight, affordable intelligence.',
        contextWindow: 128000,
        supportsVision: true,
        supportsStreaming: true,
      },
      {
        id: 'o1-mini',
        name: 'o1-mini',
        providerId: this.id,
        description: 'Reasoning model optimized for STEM and code problems.',
        contextWindow: 128000,
        supportsStreaming: true,
      },
    ];
  }

  async chat(request: ChatRequest, apiKey?: string, baseUrl?: string): Promise<ChatResponse> {
    if (!apiKey) {
      throw new Error('OpenAI API Key is missing. Please add your key in Settings.');
    }

    const endpoint = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions';
    
    const formattedMessages = [];
    if (request.systemPrompt) {
      formattedMessages.push({ role: 'system', content: request.systemPrompt });
    }
    formattedMessages.push(...request.messages);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: formattedMessages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  async stream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    apiKey?: string,
    baseUrl?: string,
    signal?: AbortSignal
  ): Promise<void> {
    if (!apiKey) {
      throw new Error('OpenAI API Key is missing. Please configure it in Settings.');
    }

    const endpoint = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions';

    const formattedMessages = [];
    if (request.systemPrompt) {
      formattedMessages.push({ role: 'system', content: request.systemPrompt });
    }
    formattedMessages.push(...request.messages);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: formattedMessages,
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to obtain stream reader');

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') return;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              onChunk(delta);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
  }
}

import {
  AIProviderInterface,
  AIProviderConfig,
  ChatMessage,
  ModelInfo,
  StreamCallback,
} from '../../shared/types/ai';

export class OpenAIProvider implements AIProviderInterface {
  id = 'openai';
  name = 'OpenAI';
  description = 'OpenAI GPT-4o, GPT-4o-mini & reasoning models';
  isAvailable = true;

  models: ModelInfo[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Omni model for complex reasoning and coding',
      contextWindow: 128000,
      maxTokens: 4096,
      recommended: true,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast, lightweight model for daily tasks',
      contextWindow: 128000,
      maxTokens: 4096,
    },
    {
      id: 'o3-mini',
      name: 'o3-mini',
      description: 'Advanced STEM and algorithmic reasoning model',
      contextWindow: 200000,
      maxTokens: 65536,
    },
  ];

  private getBaseUrl(config: AIProviderConfig): string {
    return (config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  }

  async validateConfig(config: AIProviderConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    try {
      const response = await fetch(`${this.getBaseUrl(config)}/models`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[], systemPrompt?: string) {
    const formatted = [];
    if (systemPrompt) {
      formatted.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of messages) {
      formatted.push({
        role: msg.role,
        content: msg.content,
      });
    }
    return formatted;
  }

  async sendMessage(
    messages: ChatMessage[],
    model: string,
    config: AIProviderConfig,
    systemPrompt?: string
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('OpenAI API Key is required. Please set it in Settings.');
    }

    const payload = {
      model: model || 'gpt-4o-mini',
      messages: this.formatMessages(messages, systemPrompt),
    };

    const response = await fetch(`${this.getBaseUrl(config)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `OpenAI API error (${response.status})`
      );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async streamMessage(
    messages: ChatMessage[],
    model: string,
    config: AIProviderConfig,
    onChunk: StreamCallback,
    systemPrompt?: string,
    signal?: AbortSignal
  ): Promise<void> {
    if (!config.apiKey) {
      onChunk({
        delta: '',
        done: true,
        error: 'OpenAI API Key is missing. Please configure your key in Settings.',
      });
      return;
    }

    const payload = {
      model: model || 'gpt-4o-mini',
      messages: this.formatMessages(messages, systemPrompt),
      stream: true,
    };

    try {
      const response = await fetch(`${this.getBaseUrl(config)}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `API error ${response.status}`;
        onChunk({ delta: '', done: true, error: msg });
        return;
      }

      if (!response.body) {
        onChunk({ delta: '', done: true, error: 'Empty response body from server.' });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') {
            onChunk({ delta: '', done: true });
            return;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const jsonStr = trimmed.slice(6);
              const data = JSON.parse(jsonStr);
              const contentDelta = data.choices?.[0]?.delta?.content || '';
              if (contentDelta) {
                onChunk({ delta: contentDelta, done: false });
              }
            } catch {
              // Ignore invalid chunk JSON lines
            }
          }
        }
      }

      onChunk({ delta: '', done: true });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onChunk({ delta: '', done: true });
      } else {
        onChunk({
          delta: '',
          done: true,
          error: err.message || 'Stream processing error',
        });
      }
    }
  }
}

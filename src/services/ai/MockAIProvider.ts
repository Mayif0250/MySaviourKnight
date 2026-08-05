import { AIProvider } from './AIProvider';
import { AIModel, ChatRequest, ChatResponse } from '../../types/ai';

export class MockAIProvider implements AIProvider {
  readonly id = 'mock';
  readonly name = 'MSK Engine (Demo Mode)';
  readonly description = 'Local intelligent simulation engine with markdown & code capabilities.';
  readonly isLocal = true;

  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: 'msk-knight-1',
        name: 'MSK Knight v1',
        providerId: this.id,
        description: 'Fast, responsive companion model with structured reasoning.',
        contextWindow: 64000,
        isLocal: true,
        supportsStreaming: true,
      },
      {
        id: 'msk-pro-coder',
        name: 'MSK Code Savior',
        providerId: this.id,
        description: 'Specialized in TypeScript, Rust, React, and system architecture.',
        contextWindow: 128000,
        isLocal: true,
        supportsStreaming: true,
      },
    ];
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const lastUserMessage = request.messages[request.messages.length - 1]?.content || 'Hello';
    const content = this.generateResponse(lastUserMessage);
    return {
      content,
      usage: {
        promptTokens: lastUserMessage.length / 4,
        completionTokens: content.length / 4,
        totalTokens: (lastUserMessage.length + content.length) / 4,
      },
    };
  }

  async stream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    _apiKey?: string,
    _baseUrl?: string,
    signal?: AbortSignal
  ): Promise<void> {
    const lastUserMessage = request.messages[request.messages.length - 1]?.content || 'Hello';
    const fullText = this.generateResponse(lastUserMessage);

    const words = fullText.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) {
        throw new Error('Generation cancelled by user.');
      }

      const word = (i === 0 ? '' : ' ') + words[i];
      onChunk(word);

      // Natural typing variation
      const delay = Math.floor(Math.random() * 20) + 15;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  private generateResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('code') || lower.includes('react') || lower.includes('typescript') || lower.includes('function')) {
      return `Certainly! Here is a clean, production-ready TypeScript example tailored for your request:

\`\`\`typescript
interface UserSession {
  id: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export class SessionManager {
  private activeSessions = new Map<string, UserSession>();

  public register(user: UserSession): boolean {
    if (this.activeSessions.has(user.id)) {
      return false;
    }
    this.activeSessions.set(user.id, user);
    console.log(\`[MSK System] Session initialized for \${user.name}\`);
    return true;
  }

  public getSession(id: string): UserSession | undefined {
    return this.activeSessions.get(id);
  }
}
\`\`\`

### Key Architecture Highlights:
- **Strict Typing**: All session fields enforce runtime & compile-time safety.
- **Performance**: O(1) lookup speed using native JavaScript \`Map\`.
- **Encapsulation**: State stays private inside \`SessionManager\`.`;
    }

    if (lower.includes('table') || lower.includes('compare') || lower.includes('vs')) {
      return `Here is a structured comparison of modern AI Desktop Assistant architectures:

| Feature | ChatGPT Desktop | Cursor IDE | MSK (My Saviour Knight) |
| :--- | :--- | :--- | :--- |
| **Framework** | Tauri / Native Wrapper | Electron | **Tauri v2** |
| **AI Provider Coupling** | Single (OpenAI) | Multi / Custom | **Modular Abstraction** |
| **Local LLM Support** | Limited | Partial | **Built-in Architecture** |
| **Context Panel** | No | Codebase Context | **Flexible Attachments & Tools** |
| **UI Aesthetics** | Minimalist | Developer Dark | **Linear/Raycast Hybrid** |

MSK combines the speed of Tauri v2 with a completely provider-agnostic core architecture.`;
    }

    return `Greetings! I am **MSK (My Saviour Knight)**, your intelligent AI companion. 

How can I protect your workflow and assist you today?

Here are some things we can accomplish together:
1. **Architectural Analysis**: Review and refine system designs & codebase structures.
2. **Code Generation**: Clean TypeScript, Rust, Python, and UI components.
3. **Multi-Model Orchestration**: Connect OpenAI, Ollama, Claude, or Gemini seamlessly.
4. **Context & Document Analysis**: Process attached files, code snippets, and system instructions.

> *Tip: You can use \`Ctrl + K\` to open the command palette or click **Settings** to configure your OpenAI API keys.*`;
  }
}

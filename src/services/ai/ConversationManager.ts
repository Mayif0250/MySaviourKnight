import { ChatMessage, Conversation } from '../../shared/types/ai';

export class ConversationManager {
  createConversation(
    providerId: string,
    modelId: string,
    systemPrompt?: string
  ): Conversation {
    const now = Date.now();
    return {
      id: `conv_${now}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: now,
      updatedAt: now,
      pinned: false,
      modelId,
      providerId,
      systemPrompt,
    };
  }

  generateTitle(firstMessageContent: string): string {
    const cleaned = firstMessageContent.trim().replace(/\n+/g, ' ');
    if (cleaned.length <= 40) return cleaned;
    return cleaned.substring(0, 40) + '...';
  }

  addMessage(
    conversation: Conversation,
    role: 'user' | 'assistant' | 'system',
    content: string,
    model?: string
  ): { conversation: Conversation; message: ChatMessage } {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role,
      content,
      timestamp: Date.now(),
      model,
    };

    let title = conversation.title;
    if (conversation.messages.length === 0 && role === 'user') {
      title = this.generateTitle(content);
    }

    const updatedConversation: Conversation = {
      ...conversation,
      title,
      messages: [...conversation.messages, newMessage],
      updatedAt: Date.now(),
    };

    return { conversation: updatedConversation, message: newMessage };
  }
}

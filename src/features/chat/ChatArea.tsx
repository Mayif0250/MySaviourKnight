import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ModelSelector } from './ModelSelector';
import { MessageItem } from './MessageItem';
import { Logo } from '../../components/common/Logo';
import {
  Send,
  Square,
  Paperclip,
  PanelRight,
  Plus,
  Sparkles,
  Code,
  Compass,
  Zap,
  X,
} from 'lucide-react';
import { Attachment } from '../../types/ai';

export const ChatArea: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    sendMessage,
    isStreaming,
    stopGeneration,
    createNewChat,
    regenerateLastMessage,
    activeAttachments,
    addAttachment,
    removeAttachment,
  } = useChatStore();

  const { toggleContextPanel } = useSettingsStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = conversations.find((c) => c.id === activeConversationId);
  const messages = activeChat?.messages || [];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Handle textarea height auto adjustment
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSend = () => {
    if ((!input.trim() && activeAttachments.length === 0) || isStreaming) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newAttachment: Attachment = {
        id: `att_${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'document',
      };
      addAttachment(newAttachment);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Top Bar */}
      <div className="h-14 px-4 sm:px-6 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-white/70 dark:bg-background-cardDark/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <ModelSelector />
          <h2 className="text-xs sm:text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark truncate max-w-[200px] sm:max-w-[300px]">
            {activeChat?.title || 'New Conversation'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => createNewChat()}
            className="p-1.5 rounded-xl border border-border-light dark:border-border-dark text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="New Chat"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={toggleContextPanel}
            className="p-1.5 rounded-xl border border-border-light dark:border-border-dark text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Context Panel"
          >
            <PanelRight size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6">
            <Logo size={48} showText={false} />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
                How can MSK assist you today?
              </h1>
              <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed">
                Your high-performance AI knight for coding, architectural design, document analysis, and intelligence.
              </p>
            </div>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
              <button
                onClick={() => setInput('Architect a production React 19 + Tauri v2 state management flow.')}
                className="p-3.5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark hover:border-blue-500/50 hover:shadow-soft transition-all text-left group space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark group-hover:text-blue-600">
                  <Code size={15} className="text-blue-500" />
                  <span>Architecture Guide</span>
                </div>
                <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2">
                  Design scalable desktop UI & state patterns.
                </p>
              </button>

              <button
                onClick={() => setInput('Write a TypeScript function to parse and stream Server-Sent Events.')}
                className="p-3.5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark hover:border-blue-500/50 hover:shadow-soft transition-all text-left group space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark group-hover:text-blue-600">
                  <Sparkles size={15} className="text-emerald-500" />
                  <span>Code Generator</span>
                </div>
                <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2">
                  Generate clean code snippets & unit tests.
                </p>
              </button>

              <button
                onClick={() => setInput('Compare local Ollama LLM setup with cloud OpenAI endpoints.')}
                className="p-3.5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark hover:border-blue-500/50 hover:shadow-soft transition-all text-left group space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark group-hover:text-blue-600">
                  <Compass size={15} className="text-indigo-500" />
                  <span>LLM Comparison</span>
                </div>
                <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2">
                  Evaluate latency, privacy, and costs.
                </p>
              </button>

              <button
                onClick={() => setInput('Explain how to build custom agent tools & OCR pipelines.')}
                className="p-3.5 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark hover:border-blue-500/50 hover:shadow-soft transition-all text-left group space-y-1"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark group-hover:text-blue-600">
                  <Zap size={15} className="text-amber-500" />
                  <span>Agent Automation</span>
                </div>
                <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark line-clamp-2">
                  Explore plugins, tools & RAG workflows.
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            {messages.map((m) => (
              <MessageItem key={m.id} message={m} onRegenerate={regenerateLastMessage} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Chat Input Bar */}
      <div className="p-4 sm:px-6 bg-transparent z-10">
        <div className="max-w-3xl mx-auto bg-white dark:bg-background-cardDark border border-border-light dark:border-border-dark rounded-2xl shadow-float overflow-hidden p-3 transition-all focus-within:border-blue-500">
          {/* Active Attachments Drawer */}
          {activeAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2 mb-2 border-b border-border-light dark:border-border-dark">
              {activeAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-text-primaryLight dark:text-text-primaryDark"
                >
                  <Paperclip size={12} className="text-blue-500" />
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-text-secondaryLight dark:text-text-secondaryDark"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Auto Resizing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask MSK anything... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-text-primaryLight dark:text-text-primaryDark placeholder-text-secondaryLight dark:placeholder-text-secondaryDark max-h-44 font-sans leading-relaxed"
          />

          {/* Input Footer Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-xl border border-border-light dark:border-border-dark text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Attach files or context"
              >
                <Paperclip size={16} />
              </button>

              <span className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark font-mono hidden sm:inline">
                {activeChat?.providerId === 'mock' ? 'MSK Local Engine' : 'OpenAI Connected'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={stopGeneration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-soft"
                >
                  <Square size={13} fill="currentColor" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && activeAttachments.length === 0}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-soft ${
                    input.trim() || activeAttachments.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

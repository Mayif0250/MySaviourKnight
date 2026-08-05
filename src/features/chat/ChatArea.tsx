import React, { useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  Mic,
  Image as ImageIcon,
  ChevronDown,
  Layers,
  Trash2,
  Code2,
  Cpu,
  Terminal,
  Shield,
  Zap,
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useConversationStore } from '../../store/conversationStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProviderStore } from '../../store/providerStore';
import { MessageItem } from './MessageItem';
import { aiService } from '../../services/ai/AIService';
import { NotificationService } from '../../services/notification/NotificationService';

export const ChatArea: React.FC = () => {
  const {
    activeConversationId,
    inputPrompt,
    setInputPrompt,
    isStreaming,
    setIsStreaming,
    activeStreamingText,
    appendStreamingText,
    resetStreaming,
  } = useChatStore();

  const {
    conversations,
    createConversation,
    addMessageToConversation,
    updateLastAssistantMessage,
    getConversationById,
  } = useConversationStore();

  const {
    activeProvider,
    activeModel,
    openaiApiKey,
    systemPrompt,
    enterToSubmit,
    autoScroll,
    contextPanelOpen,
    updateSettings,
    setActiveModel,
  } = useSettingsStore();

  const { providers } = useProviderStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConv = activeConversationId ? getConversationById(activeConversationId) : null;

  const currentProviderObj = providers.find((p) => p.id === activeProvider);
  const availableModels = currentProviderObj ? currentProviderObj.models : [];

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, activeStreamingText, autoScroll]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputPrompt).trim();
    if (!promptToSend || isStreaming) return;

    if (activeProvider === 'openai' && !openaiApiKey) {
      NotificationService.error(
        'OpenAI API Key Required',
        'Please enter your OpenAI API key in Settings (Ctrl+,)'
      );
      return;
    }

    setInputPrompt('');

    let convId = activeConversationId;
    if (!convId || !activeConv) {
      const newConv = createConversation(activeProvider, activeModel, systemPrompt);
      convId = newConv.id;
      useChatStore.getState().setActiveConversationId(convId);
    }

    const userMessage = addMessageToConversation(convId, 'user', promptToSend, activeModel);
    addMessageToConversation(convId, 'assistant', '', activeModel);

    setIsStreaming(true);
    useChatStore.getState().setActiveStreamingText('');

    try {
      const updatedConv = useConversationStore.getState().getConversationById(convId);
      const conversationHistory = updatedConv ? updatedConv.messages.slice(0, -1) : [userMessage];

      await aiService.streamCompletion(
        conversationHistory,
        activeProvider,
        activeModel,
        { apiKey: openaiApiKey },
        (chunk) => {
          if (chunk.error) {
            NotificationService.error('Streaming Error', chunk.error);
            updateLastAssistantMessage(convId!, `⚠️ **Error**: ${chunk.error}`);
            resetStreaming();
          } else if (chunk.delta) {
            appendStreamingText(chunk.delta);
            const currentFull = useChatStore.getState().activeStreamingText;
            updateLastAssistantMessage(convId!, currentFull);
          } else if (chunk.done) {
            resetStreaming();
          }
        },
        systemPrompt
      );
    } catch (err: any) {
      NotificationService.error('Execution Failed', err.message || 'Network error');
      updateLastAssistantMessage(convId!, `⚠️ **Error**: ${err.message || 'Execution failed'}`);
      resetStreaming();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSubmit) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStopStreaming = () => {
    aiService.stopStream();
    resetStreaming();
    NotificationService.info('Generation stopped');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2.5rem)] bg-white dark:bg-gray-900 transition-colors select-text">
      {/* Top Main Chat Header */}
      <div className="h-12 px-6 border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-md">
            {activeConv ? activeConv.title : 'New Conversation'}
          </h2>

          {/* Model Selector Pill Dropdown */}
          <div className="relative group">
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs py-1 pl-2.5 pr-7 rounded-lg outline-none cursor-pointer transition-colors border border-transparent focus:border-blue-500"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ contextPanelOpen: !contextPanelOpen })}
            title="Toggle Inspector (Ctrl+I)"
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              contextPanelOpen
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {!activeConv || activeConv.messages.length === 0 ? (
          /* Empty State Hero Screen */
          <div className="max-w-2xl mx-auto py-12 flex flex-col items-center text-center space-y-8 animate-in fade-in duration-300 select-none">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Shield className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                My Saviour Knight
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                Your personal AI companion for rapid software architecture, code generation, technical research, and system engineering.
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
              <button
                onClick={() => handleSendMessage('Explain clean modern software architecture for Tauri + React desktop apps')}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                  <Code2 className="w-4 h-4" />
                  <span>Software Architecture</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                  Explain clean modern architecture patterns for desktop AI apps.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('Write a reusable React custom hook for global keyboard shortcuts')}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>TypeScript & React</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                  Generate a custom hook for managing keyboard shortcuts.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('How do I optimize Zustand state management in React 19?')}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5 text-violet-600 dark:text-violet-400 font-semibold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>State Optimization</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                  Optimize Zustand store performance and selectors.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('Refactor this code to follow SOLID principles and clean code practices')}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>Code Refactoring</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                  Refactor existing code to adhere to SOLID software design.
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-4xl mx-auto space-y-6">
            {activeConv.messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onRetry={() => handleSendMessage(activeConv.messages[activeConv.messages.length - 2]?.content)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="p-4 sm:px-8 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent">
        <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus-within:border-blue-500/60 rounded-2xl shadow-lg transition-all p-3 space-y-2">
          {/* Text Area */}
          <textarea
            rows={2}
            placeholder="Ask MSK anything... (Enter to send, Shift+Enter for new line)"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 leading-relaxed font-sans"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 dark:border-gray-800/50">
            {/* Left Attachments & Indicators */}
            <div className="flex items-center gap-2 text-gray-400">
              <button
                type="button"
                title="Attach Context File (Coming Soon)"
                className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Attach Image / Vision (Coming Soon)"
                className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Voice Input (Coming Soon)"
                className="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Right Submit / Stop Button */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                {activeModel}
              </span>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

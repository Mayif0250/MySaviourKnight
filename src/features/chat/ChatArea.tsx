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
  Code2,
  Cpu,
  Terminal,
  Shield,
  Zap,
  ArrowUp,
  FileText,
  Lightbulb,
  Briefcase,
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
    <div className="flex-1 flex flex-col h-[calc(100vh-2.5rem)] bg-white dark:bg-[#0c0d10] bg-grid-pattern transition-colors select-text">
      {/* Top Main Chat Header */}
      <div className="h-12 px-6 border-b border-gray-200/80 dark:border-gray-800/60 flex items-center justify-between bg-white/70 dark:bg-[#0c0d10]/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-md">
            {activeConv ? activeConv.title : 'New Conversation'}
          </h2>

          {/* Model Selector Pill Dropdown */}
          <div className="relative group">
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800/70 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs py-1 pl-2.5 pr-7 rounded-lg outline-none cursor-pointer transition-colors border border-transparent focus:border-emerald-500"
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
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
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
          /* Sleek Dark Hero Screen Inspired by User Reference */
          <div className="max-w-3xl mx-auto py-16 flex flex-col items-start text-left space-y-8 animate-in fade-in duration-300 select-none">
            
            {/* Big Hero Greeting */}
            <div className="space-y-1">
              <h1 className="text-4xl font-normal text-gray-900 dark:text-gray-100 tracking-tight">
                Hey! Developer
              </h1>
              <p className="text-4xl font-normal text-gray-900 dark:text-gray-100 tracking-tight">
                What can I help with?
              </p>
            </div>

            {/* Category Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full pt-2">
              <button
                onClick={() => handleSendMessage('Help me design a presentation and system architecture diagram for my desktop AI app.')}
                className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#13151b]/80 border border-gray-200/80 dark:border-gray-800/80 hover:border-teal-500/40 text-left transition-all group backdrop-blur-md"
              >
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-medium mb-3">
                  Content Help
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  Help me create a presentation & architecture docs
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('Give me creative ideas to optimize React 19 state and streaming performance.')}
                className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#13151b]/80 border border-gray-200/80 dark:border-gray-800/80 hover:border-pink-500/40 text-left transition-all group backdrop-blur-md"
              >
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 text-xs font-medium mb-3">
                  Suggestions
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  Help me with ideas and refactoring strategies
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('Help me write a professional job application cover letter and resume summary.')}
                className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#13151b]/80 border border-gray-200/80 dark:border-gray-800/80 hover:border-emerald-500/40 text-left transition-all group backdrop-blur-md"
              >
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium mb-3">
                  Job Application
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  Help me apply for senior software roles
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

      {/* Floating Dark Input Card Matching Screenshot */}
      <div className="p-4 sm:px-8 bg-gradient-to-t from-white via-white dark:from-[#0c0d10] dark:via-[#0c0d10] to-transparent">
        <div className="max-w-3xl mx-auto bg-gray-50/90 dark:bg-[#14171f]/90 border border-gray-200 dark:border-gray-800 focus-within:border-teal-500/60 rounded-2xl shadow-xl transition-all p-4 space-y-3 backdrop-blur-md">
          
          {/* Sparkles Icon Header */}
          <div className="flex items-center gap-2 text-gray-400">
            <Sparkles className="w-4 h-4 text-gray-300 dark:text-gray-400" />
          </div>

          {/* Text Input */}
          <textarea
            rows={2}
            placeholder="Ask me anything......"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 leading-relaxed font-sans"
          />

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/40 dark:border-gray-800/40">
            {/* Attach file Pill Badge */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200/50 dark:bg-gray-800/60 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach file</span>
              </button>
            </div>

            {/* Submit Arrow Button matching screenshot */}
            <div>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-all"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim()}
                  className="w-9 h-9 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-30 text-gray-950 font-bold flex items-center justify-center shadow-md shadow-teal-500/20 transition-all hover:scale-105"
                >
                  <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

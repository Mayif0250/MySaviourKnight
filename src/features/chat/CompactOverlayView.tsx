import React, { useState } from 'react';
import { Send, Shield, X, Maximize2, Sparkles, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useConversationStore } from '../../store/conversationStore';
import { useChatStore } from '../../store/chatStore';
import { aiService } from '../../services/ai/AIService';
import { NotificationService } from '../../services/notification/NotificationService';

export const CompactOverlayView: React.FC = () => {
  const { toggleCompactOverlay, activeProvider, activeModel, openaiApiKey, systemPrompt } =
    useSettingsStore();
  const { createConversation, addMessageToConversation, updateLastAssistantMessage } =
    useConversationStore();
  const { isStreaming, setIsStreaming, resetStreaming } = useChatStore();

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;

    if (!openaiApiKey && activeProvider === 'openai') {
      NotificationService.error('OpenAI API Key is missing', 'Set your key in Settings');
      return;
    }

    const currentQuery = query.trim();
    setQuery('');
    setResponse('Thinking...');
    setIsStreaming(true);

    try {
      const conv = createConversation(activeProvider, activeModel, systemPrompt);
      const userMsg = addMessageToConversation(conv.id, 'user', currentQuery, activeModel);
      addMessageToConversation(conv.id, 'assistant', '', activeModel);

      let accumulated = '';
      await aiService.streamCompletion(
        [userMsg],
        activeProvider,
        activeModel,
        { apiKey: openaiApiKey },
        (chunk) => {
          if (chunk.error) {
            setResponse(`Error: ${chunk.error}`);
            resetStreaming();
          } else if (chunk.delta) {
            accumulated += chunk.delta;
            setResponse(accumulated);
            updateLastAssistantMessage(conv.id, accumulated);
          } else if (chunk.done) {
            resetStreaming();
          }
        },
        systemPrompt
      );
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
      resetStreaming();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gray-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-950/80 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-bold text-xs text-gray-100">MSK Quick Overlay</span>
            <span className="text-[10px] text-gray-400 font-mono">({activeModel})</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleCompactOverlay}
              title="Standard Window"
              className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleCompactOverlay}
              title="Close Quick Overlay"
              className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800 flex items-center gap-3">
          <input
            type="text"
            autoFocus
            placeholder="Ask MSK anything... (Enter to query)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-100 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || isStreaming}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Ask</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Response Box */}
        <div className="p-4 max-h-60 overflow-y-auto text-xs text-gray-300 leading-relaxed font-sans bg-gray-950/40 min-h-[80px]">
          {response ? (
            <p className="whitespace-pre-wrap">{response}</p>
          ) : (
            <span className="text-gray-500 italic">Quick developer query ready. Type your prompt above.</span>
          )}
        </div>
      </div>
    </div>
  );
};

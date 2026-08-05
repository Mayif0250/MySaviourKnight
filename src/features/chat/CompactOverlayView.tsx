import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Maximize2,
  Sparkles,
  ArrowRight,
  Code2,
  Zap,
  Terminal,
  Copy,
  Check,
  Minimize2,
  Bot,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSettingsStore } from '../../store/settingsStore';
import { useConversationStore } from '../../store/conversationStore';
import { useChatStore } from '../../store/chatStore';
import { aiService } from '../../services/ai/AIService';
import { NotificationService } from '../../services/notification/NotificationService';
import { CodeBlock } from './CodeBlock';

export const CompactOverlayView: React.FC = () => {
  const { toggleCompactOverlay, activeProvider, activeModel, openaiApiKey, systemPrompt } =
    useSettingsStore();
  const { createConversation, addMessageToConversation, updateLastAssistantMessage } =
    useConversationStore();
  const { isStreaming, setIsStreaming, resetStreaming } = useChatStore();

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [mode, setMode] = useState<'assist' | 'code' | 'quick'>('assist');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        toggleCompactOverlay();
      } else if (e.key === 'Escape') {
        toggleCompactOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCompactOverlay]);

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    NotificationService.success('Copied overlay response');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;

    if (!openaiApiKey && activeProvider === 'openai') {
      NotificationService.error('OpenAI API Key Required', 'Set key in Settings (Ctrl+,)');
      return;
    }

    const currentQuery = query.trim();
    setQuery('');
    setResponse('');
    setIsStreaming(true);

    let modeSystemPrompt = systemPrompt;
    if (mode === 'code') {
      modeSystemPrompt = `${systemPrompt}\nFocus specifically on writing clean, optimal, and bug-free code snippets with concise explanation.`;
    } else if (mode === 'quick') {
      modeSystemPrompt = `${systemPrompt}\nProvide ultra-concise, direct 1-2 sentence answers without fluff.`;
    }

    try {
      const conv = createConversation(activeProvider, activeModel, modeSystemPrompt);
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
            setResponse(`⚠️ **Error**: ${chunk.error}`);
            resetStreaming();
          } else if (chunk.delta) {
            accumulated += chunk.delta;
            setResponse(accumulated);
            updateLastAssistantMessage(conv.id, accumulated);
          } else if (chunk.done) {
            resetStreaming();
          }
        },
        modeSystemPrompt
      );
    } catch (err: any) {
      setResponse(`⚠️ **Error**: ${err.message}`);
      resetStreaming();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-3 select-none animate-in fade-in duration-200">
      {/* Prochame-Inspired Floating Glass Card */}
      <div className="w-full max-w-2xl bg-gray-950/90 border border-blue-500/30 dark:border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        
        {/* Draggable Prochame Glass Header */}
        <div className="drag-region flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-b border-gray-800/80">
          <div className="flex items-center gap-2.5 no-drag">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-gray-100 tracking-tight">
              MSK Live Copilot
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
              {activeModel}
            </span>
          </div>

          {/* Prochame Mode Pills */}
          <div className="flex items-center gap-1 bg-gray-950/80 p-0.5 rounded-lg border border-gray-800 no-drag">
            <button
              onClick={() => setMode('assist')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                mode === 'assist'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Copilot
            </button>
            <button
              onClick={() => setMode('code')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                mode === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Code Solve
            </button>
            <button
              onClick={() => setMode('quick')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                mode === 'quick'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Quick
            </button>
          </div>

          {/* Window Buttons */}
          <div className="flex items-center gap-1 no-drag">
            <button
              onClick={toggleCompactOverlay}
              title="Expand to Full Desktop View"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleCompactOverlay}
              title="Close Overlay (Esc)"
              className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3.5 bg-gray-900/40 border-b border-gray-800/80 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={
              mode === 'code'
                ? 'Describe code to solve or generate... (Enter to submit)'
                : mode === 'quick'
                ? 'Quick developer question... (Enter to submit)'
                : 'Ask MSK copilot anything across all desktop apps...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-gray-100 placeholder-gray-500 font-sans"
          />
          <button
            type="submit"
            disabled={!query.trim() || isStreaming}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all flex-shrink-0"
          >
            <span>Run</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Streamed Output Panel */}
        <div className="p-4 max-h-64 overflow-y-auto text-xs text-gray-200 leading-relaxed font-sans bg-gray-950/60 min-h-[90px] select-text">
          {response ? (
            <div className="relative group">
              <button
                onClick={handleCopyResponse}
                title="Copy output"
                className="absolute right-0 top-0 p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <div className="prose prose-custom dark:prose-invert max-w-none text-xs text-gray-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');

                      if (!inline && (match || codeString.includes('\n'))) {
                        return <CodeBlock language={match ? match[1] : 'text'} value={codeString} />;
                      }
                      return (
                        <code className="px-1 py-0.5 rounded bg-gray-800 font-mono text-[11px] text-blue-400">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center text-gray-500 space-y-1">
              <Bot className="w-5 h-5 text-gray-600" />
              <p className="text-[11px]">
                MSK Live Desktop Copilot ready. Floating on top of all applications.
              </p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 bg-gray-950 border-t border-gray-900 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-300">Enter</kbd> to submit</span>
            <span><kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-300">Esc</kbd> to exit</span>
          </div>
          <span>Mode: {mode.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

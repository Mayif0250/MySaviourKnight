import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Maximize2,
  X,
  Settings,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSettingsStore } from '../store/settingsStore';
import { useConversationStore } from '../store/conversationStore';
import { useChatStore } from '../store/chatStore';
import { aiService } from '../services/ai/AIService';
import { NotificationService } from '../services/notification/NotificationService';
import { CodeBlock } from '../features/chat/CodeBlock';

export const OverlayLayout: React.FC = () => {
  const { activeProvider, activeModel, openaiApiKey, systemPrompt } = useSettingsStore();
  const { createConversation, addMessageToConversation, updateLastAssistantMessage } = useConversationStore();
  const { isStreaming, setIsStreaming, resetStreaming } = useChatStore();

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const appWindow = getCurrentWindow();
        appWindow.hide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openManagementWindow = async () => {
    try {
      const win = new WebviewWindow('management', {
        url: '/',
        title: 'MSK Management',
        width: 1280,
        height: 830,
        minWidth: 800,
        minHeight: 600,
        center: true,
        decorations: false,
        transparent: true,
        shadow: true
      });
      win.once('tauri://error', function (e) {
        console.warn('Management window already exists, focusing it.');
        // If it exists, we could focus it. In Tauri v2 we can get it via WebviewWindow.getByLabel
        WebviewWindow.getByLabel('management').then(w => w?.setFocus());
      });
    } catch (e) {
      console.warn('Error opening management window:', e);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isStreaming) return;

    if (!openaiApiKey && activeProvider === 'openai') {
      NotificationService.error('OpenAI API Key Required', 'Set key in Management window');
      return;
    }

    const currentQuery = query.trim();
    setQuery('');
    setResponse('');
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
        systemPrompt
      );
    } catch (err: any) {
      setResponse(`⚠️ **Error**: ${err.message}`);
      resetStreaming();
    }
  };

  return (
    <div className="h-screen w-screen bg-transparent overflow-hidden font-sans p-3 flex flex-col">
      <div className="flex-1 bg-gray-950/90 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        
        {/* Header Drag Region */}
        <div data-tauri-drag-region className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/80 cursor-move">
          <div className="flex items-center gap-2 pointer-events-none">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-sm text-gray-100">MSK</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1.5 z-10">
            <button
              onClick={openManagementWindow}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title="Settings & Management"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => getCurrentWindow().hide()}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {response ? (
            <div className="relative group flex-1">
              <button
                onClick={handleCopy}
                title="Copy output"
                className="absolute right-0 top-0 p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors z-10"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <div className="prose prose-sm prose-invert max-w-none text-gray-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      if (!inline && (match || codeString.includes('\n'))) {
                        return <CodeBlock language={match ? match[1] : 'text'} value={codeString} />;
                      }
                      return <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-300 font-mono text-sm">{children}</code>;
                    }
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-100">My Saviour Knight</h2>
                <p className="text-sm text-gray-400 mt-1">Your Personal AI Companion.</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center max-w-sm mt-4">
                {['Explain code', 'Summarize article', 'Analyze screenshot'].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setQuery(prompt)}
                    className="px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 bg-gray-900 border-t border-gray-800">
          <div className="relative flex items-center">
            <input
              type="text"
              autoFocus
              placeholder="What can I help you with?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500/50 rounded-xl px-4 py-3 pr-12 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!query.trim() || isStreaming}
              className="absolute right-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

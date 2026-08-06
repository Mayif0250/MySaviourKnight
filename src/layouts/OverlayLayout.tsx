import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowRight,
  X,
  Settings,
  Shield,
  Copy,
  Check,
  Paperclip,
  Mic,
  Pin
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
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response]);

  const togglePin = async () => {
    const appWindow = getCurrentWindow();
    const newPinnedState = !isPinned;
    await appWindow.setAlwaysOnTop(newPinnedState);
    setIsPinned(newPinnedState);
  };

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
    setSubmittedQuery(currentQuery);
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
    <div 
      className="h-screen w-screen bg-transparent overflow-hidden p-3 flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div 
        className="flex-1 flex flex-col overflow-hidden animate-overlay"
        style={{
          backgroundColor: 'rgba(20,20,22,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        
        {/* Title Bar */}
        <div 
          data-tauri-drag-region 
          className="flex items-center justify-between px-4 cursor-move"
          style={{ height: '38px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-5 h-5 rounded bg-[#4F8CFF] flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-[14px]" style={{ color: 'rgba(255,255,255,0.96)' }}>MSK</span>
            <span className="text-[13px] ml-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Your Personal AI Companion</span>
          </div>
          
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={togglePin}
              className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title={isPinned ? "Unpin window" : "Pin window to top"}
            >
              <Pin className="w-3.5 h-3.5" style={{ transform: isPinned ? 'rotate(45deg)' : 'none' }} />
            </button>
            <button
              onClick={openManagementWindow}
              className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Open Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => getCurrentWindow().hide()}
              className="p-1 rounded text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Conversation Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
          {!submittedQuery && !response ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(79, 140, 255, 0.15)' }}>
                <Shield className="w-7 h-7 text-[#4F8CFF]" />
              </div>
            </div>
          ) : (
            <>
              {submittedQuery && (
                <div className="flex justify-end">
                  <div 
                    className="px-4 py-2.5 max-w-[85%] text-[14px] leading-relaxed shadow-sm"
                    style={{
                      backgroundColor: 'rgba(79, 140, 255, 0.88)',
                      color: 'rgba(255,255,255,0.96)',
                      borderRadius: '16px 16px 2px 16px'
                    }}
                  >
                    {submittedQuery}
                  </div>
                </div>
              )}
              {response && (
                <div className="flex justify-start relative group">
                  <div 
                    className="px-4 py-3 max-w-[95%] text-[15px] leading-relaxed relative"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.96)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '16px 16px 16px 2px'
                    }}
                  >
                    <button
                      onClick={handleCopy}
                      title="Copy output"
                      className="absolute right-2 top-2 p-1.5 rounded bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/70 hover:text-white transition-all z-10"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            if (!inline && (match || codeString.includes('\n'))) {
                              return <CodeBlock language={match ? match[1] : 'text'} value={codeString} />;
                            }
                            return <code className="bg-white/10 px-1.5 py-0.5 rounded text-[#4F8CFF] font-mono text-[13px]">{children}</code>;
                          }
                        }}
                      >
                        {response}
                      </ReactMarkdown>
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-[#4F8CFF] animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 pt-0">
          <form 
            onSubmit={handleSubmit} 
            className="flex items-center gap-2 px-3 py-2 transition-all shadow-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px'
            }}
          >
            <button type="button" className="p-1.5 text-white/40 hover:text-white/80 transition-colors" title="Attach file (coming soon)">
               <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              autoFocus
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-white/40"
              style={{ color: 'rgba(255,255,255,0.96)' }}
            />
            <button type="button" className="p-1.5 text-white/40 hover:text-white/80 transition-colors" title="Voice input (coming soon)">
               <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!query.trim() || isStreaming}
              className="p-1.5 rounded-full disabled:opacity-40 transition-colors flex items-center justify-center"
              style={{ 
                backgroundColor: query.trim() ? '#4F8CFF' : 'rgba(255,255,255,0.08)',
                width: '32px',
                height: '32px'
              }}
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

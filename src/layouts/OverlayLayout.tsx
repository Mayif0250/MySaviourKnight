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
  Pin,
  Plus,
  Clock,
  Camera,
  Send
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
      data-tauri-drag-region
      onMouseDown={(e) => {
        // Only drag if clicking the transparent background directly
        if (e.target === e.currentTarget && e.button === 0) {
          getCurrentWindow().startDragging();
        }
      }}
      className="h-screen w-screen bg-transparent flex flex-col items-center justify-start p-3"
      style={{ fontFamily: "'Segoe UI', 'Inter', sans-serif" }}
    >
      <div
        className="flex flex-col animate-overlay shadow-lg"
        style={{
          width: '420px',
          maxHeight: '100%',
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >

        {/* Title Bar */}
        <div
          data-tauri-drag-region
          onMouseDown={(e) => {
            // Only drag if left mouse button is pressed and not clicking a button
            if (e.button === 0 && (e.target as HTMLElement).tagName !== 'BUTTON') {
              getCurrentWindow().startDragging();
            }
          }}
          className="flex items-center justify-between cursor-move drag-region"
          style={{ height: '32px', backgroundColor: '#232323', borderRadius: '8px 8px 0 0' }}
        >
          <div className="flex items-center pointer-events-none">
            <span className="font-semibold text-[15px] text-white ml-[12px]">MSK</span>
            <span className="text-[13px] italic text-[#bbb] ml-[16px]">Your Personal AI Companion</span>
          </div>

          <div className="flex items-center z-10 pr-[8px]">
            <button
              className="w-[28px] h-[28px] flex items-center justify-center text-white hover:bg-[#2979FF] transition-colors ml-[4px]"
              style={{ fontFamily: "'Segoe Fluent Icons'", fontSize: '16px', borderRadius: '14px' }}
              title="New Chat"
            >
              {"\uE710"}
            </button>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center text-white hover:bg-[#2979FF] transition-colors ml-[4px]"
              style={{ fontFamily: "'Segoe Fluent Icons'", fontSize: '16px', borderRadius: '14px' }}
              title="Chat History"
            >
              {"\uE823"}
            </button>
            <button
              onClick={openManagementWindow}
              className="w-[28px] h-[28px] flex items-center justify-center text-white hover:bg-[#2979FF] transition-colors ml-[4px]"
              style={{ fontFamily: "'Segoe Fluent Icons'", fontSize: '16px', borderRadius: '14px' }}
              title="Settings"
            >
              {"\uE713"}
            </button>
            <button
              onClick={togglePin}
              className="w-[24px] h-[24px] flex items-center justify-center text-white transition-colors ml-[4px] mt-[4px]"
              style={{
                fontFamily: "'Segoe Fluent Icons'",
                fontSize: '16px',
                borderRadius: '12px',
                backgroundColor: isPinned ? '#223D29' : 'transparent',
                alignSelf: 'flex-start'
              }}
              title={isPinned ? "Unpin window" : "Pin window to top"}
            >
              {"\uE718"}
            </button>
          </div>
        </div>

        {/* Conversation Area */}
        <div
          ref={scrollRef}
          className="overflow-y-auto flex flex-col mb-[4px] scroll-smooth"
          style={{
            maxHeight: '1000px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 100%)',
            flex: '1 1 auto'
          }}
        >
          {!submittedQuery && !response ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 min-h-[100px]">
              <span className="text-white/30 text-[15px]">How can I help you today?</span>
            </div>
          ) : (
            <div className="flex flex-col mt-auto justify-end min-h-full">
              {submittedQuery && (
                <div className="flex justify-end mb-[8px]">
                  <div
                    className="max-w-[85%] text-[15px] p-[8px]"
                    style={{
                      backgroundColor: '#2979FF',
                      color: 'white',
                      borderRadius: '12px',
                      wordWrap: 'break-word'
                    }}
                  >
                    {submittedQuery}
                  </div>
                </div>
              )}
              {response && (
                <div className="flex justify-start relative group mb-[8px]">
                  <div
                    className="max-w-[95%] text-[15px] p-[8px] relative"
                    style={{
                      backgroundColor: '#292929',
                      color: 'white',
                      borderRadius: '12px'
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
                            return <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[13px]">{children}</code>;
                          }
                        }}
                      >
                        {response}
                      </ReactMarkdown>
                      {isStreaming && (
                        <div className="inline-flex gap-1 ml-[8px] items-center h-[20px]">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse opacity-20" style={{ animationDuration: '0.6s' }} />
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse opacity-20" style={{ animationDuration: '0.6s', animationDelay: '0.2s' }} />
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse opacity-20" style={{ animationDuration: '0.6s', animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex justify-center w-full relative" style={{ flex: '0 0 auto' }}>
          <form
            onSubmit={handleSubmit}
            className="flex items-center w-[420px] p-[8px]"
            style={{
              backgroundColor: '#232323',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            <button
              type="button"
              className="w-[28px] h-[28px] flex items-center justify-center text-white hover:bg-[#2979FF] transition-colors ml-[4px]"
              style={{ fontFamily: "'Segoe Fluent Icons'", fontSize: '16px', borderRadius: '14px' }}
              title="Screenshot"
            >
              {"\uE114"}
            </button>
            <input
              type="text"
              autoFocus
              placeholder="Type or hold Ctrl+Space to speak..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[14px] ml-[6px] text-white"
              style={{ minHeight: '28px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!query.trim() || isStreaming}
              className="w-[28px] h-[28px] flex items-center justify-center text-white hover:bg-[#2979FF] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              style={{ fontFamily: "'Segoe Fluent Icons'", fontSize: '16px', borderRadius: '14px' }}
              title="Send"
            >
              {"\uE122"}
            </button>
            <button
              type="button"
              className="w-[28px] h-[28px] flex items-center justify-center text-white hover:bg-[#2979FF] transition-colors ml-[4px]"
              style={{ fontSize: '16px', borderRadius: '14px' }}
              title="Voice reply"
            >
              🗣️
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

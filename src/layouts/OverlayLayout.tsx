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

export const OverlayLayout: React.FC = () => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
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
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, autoScroll]);

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

    const currentQuery = query.trim();
    setSubmittedQuery(currentQuery);
    setQuery('');
    setResponse('');
    setIsStreaming(true);
    setAutoScroll(true);

    try {
      const res = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5-coder:7b',
          messages: [{ role: 'user', content: currentQuery }],
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama error: ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.message && data.message.content) {
                accumulated += data.message.content;
                setResponse(accumulated);
              }
            } catch (err) {
              console.warn('Error parsing JSON chunk from Ollama', line);
            }
          }
        }
      }
      setIsStreaming(false);
    } catch (err: any) {
      setResponse(`⚠️ **Error connecting to Ollama**: ${err.message}. \\n\\nMake sure Ollama is running locally and you have pulled the model with \`ollama run qwen2.5-coder:7b\`. \\n\\nIf you still get this error, you need to restart your Ollama server with CORS enabled. On Windows Command Prompt:\\n\\n\`set OLLAMA_ORIGINS="*" && ollama serve\``);
      setIsStreaming(false);
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
        className="flex flex-col animate-overlay shadow-lg w-full h-full"
        style={{
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
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            setAutoScroll(isAtBottom);
          }}
          className="overflow-y-auto w-full flex flex-col mb-[4px] scroll-smooth min-h-0 no-drag px-2"
          style={{
            maxHeight: '1000px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)',
            flex: '1 1 auto'
          }}
        >
          {!submittedQuery && !response ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 min-h-[100px]">
              <span className="text-white/30 text-[15px]">How can I help you today?</span>
            </div>
          ) : (
            <div className="flex flex-col mt-auto pb-4">
              {submittedQuery && (
                <div className="flex justify-end mb-[8px]">
                  <div
                    className="max-w-[85%] text-[15px] px-[16px] py-[12px] break-words"
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
                <div className="flex justify-start relative group mb-[8px] w-full">
                  <div
                    className="max-w-[95%] min-w-0 text-[15px] px-[16px] py-[12px] relative break-words"
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
                    <div className="prose prose-sm prose-invert max-w-full min-w-0 prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-pre:max-w-full prose-pre:whitespace-pre-wrap overflow-wrap-anywhere break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }: any) {
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
        <div className="flex justify-center w-full relative no-drag" style={{ flex: '0 0 auto' }}>
          <form
            onSubmit={handleSubmit}
            className="flex items-center w-full p-[8px]"
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

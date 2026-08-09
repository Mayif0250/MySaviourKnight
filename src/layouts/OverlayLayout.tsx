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
  Send,
  RefreshCw,
  ArrowDown
} from 'lucide-react';
import { MarkdownRenderer } from '../components/chat/MarkdownRenderer';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { SettingsOverlay } from '../components/SettingsOverlay';
// @ts-ignore
import watermarkSvg from '../assets/picsvg_modified.svg';

export const OverlayLayout: React.FC = () => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const openManagementWindow = () => {
    setIsSettingsOpen(true);
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
        className="flex flex-col animate-overlay shadow-lg w-full h-full relative"
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
          className="overflow-y-auto w-full flex flex-col mb-[4px] scroll-smooth min-h-0 no-drag px-2 relative z-10"
          style={{
            maxHeight: '1000px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)',
            flex: '1 1 auto'
          }}
        >
          {/* Background Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50 -z-10">
            <img 
              src={watermarkSvg} 
              alt="watermark" 
              className="w-[80%] max-w-[300px] object-contain fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,1)] drop-shadow-[0_0_20px_rgba(0,0,0,1)] drop-shadow-[0_0_40px_rgba(255,255,255,0.7)]" 
            />
          </div>
          {/* Jump to latest button */}
          {!autoScroll && response && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50">
              <button
                onClick={() => {
                  setAutoScroll(true);
                  if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#232323] hover:bg-[#2a2a2a] border border-white/10 rounded-full shadow-lg text-white/80 hover:text-white transition-all text-xs"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Jump to latest
              </button>
            </div>
          )}
          {!submittedQuery && !response ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 min-h-[100px]">
              <div className="text-white/40 mb-4 text-2xl">✦</div>
              <h2 className="text-white/80 font-medium text-[16px] mb-2">How can I help?</h2>
              <p className="text-white/40 text-[13px] max-w-[250px]">Ask a question, analyze something, or get help with your work.</p>
            </div>
          ) : (
            <div className="flex flex-col mt-auto pb-4">
              {submittedQuery && (
                <div className="flex justify-end mb-6 mt-4">
                  <div
                    className="max-w-[85%] text-[14px] px-[16px] py-[10px] break-words"
                    style={{
                      backgroundColor: '#232323',
                      border: '1px solid rgba(255,255,255,0.05)',
                      color: 'white',
                      borderRadius: '16px'
                    }}
                  >
                    {submittedQuery}
                  </div>
                </div>
              )}
              {response && (
                <div className="flex flex-col justify-start relative group mb-8 w-full px-2">
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <span className="text-white/60 text-sm">✦</span>
                    <span className="text-white/80 font-medium text-[13px]">Assistant</span>
                  </div>
                  <div className="w-full text-[15px] relative break-words text-white/90 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                    <div className="relative">
                      <MarkdownRenderer content={response + (isStreaming ? ' ▌' : '')} />
                    </div>
                  </div>
                  
                  {/* Action Bar */}
                  {!isStreaming && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs"
                        title="Copy response"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        className="flex items-center gap-1.5 p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors text-xs ml-2"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>
                    </div>
                  )}
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

        {isSettingsOpen && (
          <SettingsOverlay onClose={() => setIsSettingsOpen(false)} />
        )}
      </div>
    </div>
  );
};

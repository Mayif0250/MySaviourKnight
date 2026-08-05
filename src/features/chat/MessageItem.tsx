import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../../types/ai';
import { Logo } from '../../components/common/Logo';
import { CodeBlock } from './CodeBlock';
import { Copy, Check, RefreshCw, User, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface MessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Message copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-4 px-4 sm:px-6 w-full flex gap-3 sm:gap-4 transition-colors ${
      isUser ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-slate-900/40 border-y border-border-light/40 dark:border-border-dark/40'
    }`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-soft">
            <User size={16} />
          </div>
        ) : (
          <Logo size={32} showText={false} />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header line */}
        <div className="flex items-center gap-2 text-xs text-text-secondaryLight dark:text-text-secondaryDark">
          <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
            {isUser ? 'You' : 'MSK Knight'}
          </span>
          {message.model && !isUser && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-mono">
              {message.model}
            </span>
          )}
          <span className="text-[10px]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark"
              >
                <Paperclip size={12} className="text-blue-500" />
                <span className="font-medium truncate max-w-[150px]">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message Content */}
        {message.error ? (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
            {message.error}
          </div>
        ) : isUser ? (
          <div className="text-sm text-text-primaryLight dark:text-text-primaryDark whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="text-sm text-text-primaryLight dark:text-text-primaryDark prose-custom leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  return !isInline ? (
                    <CodeBlock
                      language={match ? match[1] : ''}
                      value={String(children).replace(/\n$/, '')}
                    />
                  ) : (
                    <code
                      className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-800 font-mono text-xs text-blue-600 dark:text-blue-400"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content || (message.isStreaming ? '▋' : '')}
            </ReactMarkdown>
            {message.isStreaming && message.content && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-600 animate-pulse rounded-sm" />
            )}
          </div>
        )}

        {/* Message Actions */}
        {!message.isStreaming && (
          <div className="flex items-center gap-1 pt-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

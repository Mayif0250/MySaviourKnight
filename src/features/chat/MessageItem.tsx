import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Copy, Check, RotateCw, Sparkles, Shield } from 'lucide-react';
import { ChatMessage } from '../../shared/types/ai';
import { CodeBlock } from './CodeBlock';
import { NotificationService } from '../../services/notification/NotificationService';

interface MessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    NotificationService.success('Message content copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-4 px-4 sm:px-6 rounded-2xl transition-colors ${
        isUser
          ? 'bg-gray-100/70 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-800/50 ml-6 sm:ml-12'
          : 'bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-xs mr-6 sm:mr-12'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isUser ? (
            <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
              <User className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
          )}

          <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'MSK Assistant'}
          </span>

          {message.model && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-gray-800/50 text-gray-500 font-mono">
              {message.model}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          <button
            onClick={handleCopyText}
            title="Copy response"
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {!isUser && onRetry && (
            <button
              onClick={onRetry}
              title="Retry response"
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      <div className="prose prose-custom dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-200 leading-relaxed overflow-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');

              if (!inline && (match || codeString.includes('\n'))) {
                return (
                  <CodeBlock
                    language={match ? match[1] : 'text'}
                    value={codeString}
                  />
                );
              }

              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-gray-800/60 font-mono text-xs text-blue-600 dark:text-blue-400"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

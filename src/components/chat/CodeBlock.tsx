import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  children: React.ReactNode;
}

const extractText = (node: any): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && React.isValidElement(node)) {
    return extractText((node.props as any).children);
  }
  return '';
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = extractText(children);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="relative my-4 rounded-md border border-chat-border bg-chat-codeSurface overflow-hidden flex flex-col w-full min-w-0">
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 text-xs text-chat-textSecondary select-none">
        <span className="font-mono lowercase">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-chat-textPrimary transition-colors p-1 -mr-1 rounded hover:bg-chat-surfaceHover"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto w-full">
        <pre className="!m-0 !p-0 !bg-transparent text-[13px] leading-relaxed font-mono">
          <code className={language ? `language-${language} hljs` : 'hljs'}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

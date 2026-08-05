import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { NotificationService } from '../../services/notification/NotificationService';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    NotificationService.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800 bg-gray-900 text-gray-100 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950/80 border-b border-gray-800/80 text-xs font-mono text-gray-400 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="capitalize font-semibold text-gray-300">{language || 'code'}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content Container */}
      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-gray-200 selection:bg-blue-500/30">
        <pre className="m-0">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};

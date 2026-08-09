import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CodeBlock } from './CodeBlock';
import { open } from '@tauri-apps/plugin-shell';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose-custom prose prose-sm prose-invert max-w-full min-w-0 prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0 overflow-wrap-anywhere break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
              return (
                <CodeBlock language={match[1]}>
                  {children}
                </CodeBlock>
              );
            }
            return (
              <code className={`${className || ''} bg-white/10 px-1.5 py-0.5 rounded font-mono text-[13px] break-words`} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          table({ children }) {
            return (
              <div className="w-full overflow-x-auto my-4 rounded border border-white/10">
                <table className="w-full text-left min-w-max border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-blue-400 hover:underline break-all"
                onClick={async (e) => {
                  e.preventDefault();
                  if (href) {
                    try {
                      await open(href);
                    } catch (err) {
                      console.error("Failed to open link:", err);
                    }
                  }
                }}
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-md border border-white/10 my-4"
              />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

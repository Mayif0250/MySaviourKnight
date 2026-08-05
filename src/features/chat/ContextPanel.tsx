import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useChatStore } from '../../store/chatStore';
import { X, FileText, Cpu, Shield, Sparkles, Terminal, Puzzle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContextPanel: React.FC = () => {
  const { contextPanelOpen, setContextPanelOpen, activeModelId, activeProviderId, systemPrompt, setSystemPrompt } =
    useSettingsStore();

  const { conversations, activeConversationId } = useChatStore();
  const activeChat = conversations.find((c) => c.id === activeConversationId);

  const [promptText, setPromptText] = useState(systemPrompt);

  if (!contextPanelOpen) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-80 h-full border-l border-border-light dark:border-border-dark bg-white dark:bg-background-cardDark flex flex-col z-20 shadow-soft"
    >
      {/* Header */}
      <div className="h-14 px-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-blue-600" />
          <span className="font-semibold text-sm text-text-primaryLight dark:text-text-primaryDark">
            Context & Tools
          </span>
        </div>
        <button
          onClick={() => setContextPanelOpen(false)}
          className="p-1 rounded-lg text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Metadata section */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase">
            Active Session Metadata
          </span>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondaryLight dark:text-text-secondaryDark">Provider</span>
              <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark uppercase">
                {activeChat?.providerId || activeProviderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondaryLight dark:text-text-secondaryDark">Model</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {activeChat?.modelId || activeModelId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondaryLight dark:text-text-secondaryDark">Messages</span>
              <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
                {activeChat?.messages.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* System Prompt Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase">
              System Instruction
            </span>
          </div>
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onBlur={() => setSystemPrompt(promptText)}
            placeholder="Define system prompt for MSK..."
            className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono"
          />
        </div>

        {/* Modular Extensible Plugin Capabilities */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold tracking-wider text-text-secondaryLight dark:text-text-secondaryDark uppercase">
            Agent Capabilities & Extensions
          </span>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between opacity-80">
              <div className="flex items-center gap-2">
                <Cpu size={15} className="text-emerald-500" />
                <span className="font-medium text-text-primaryLight dark:text-text-primaryDark">Local RAG / Knowledge</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-text-secondaryLight dark:text-text-secondaryDark">
                Ready
              </span>
            </div>

            <div className="p-3 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between opacity-80">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-indigo-500" />
                <span className="font-medium text-text-primaryLight dark:text-text-primaryDark">OCR & Vision Analysis</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-text-secondaryLight dark:text-text-secondaryDark">
                Ready
              </span>
            </div>

            <div className="p-3 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between opacity-80">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-amber-500" />
                <span className="font-medium text-text-primaryLight dark:text-text-primaryDark">Voice Assistant & STT</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-text-secondaryLight dark:text-text-secondaryDark">
                Ready
              </span>
            </div>

            <div className="p-3 rounded-xl border border-border-light dark:border-border-dark flex items-center justify-between opacity-80">
              <div className="flex items-center gap-2">
                <Puzzle size={15} className="text-purple-500" />
                <span className="font-medium text-text-primaryLight dark:text-text-primaryDark">Plugin Marketplace</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-text-secondaryLight dark:text-text-secondaryDark">
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

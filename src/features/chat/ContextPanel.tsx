import React from 'react';
import {
  FileText,
  Paperclip,
  Brain,
  Puzzle,
  Bot,
  X,
  ChevronRight,
  Shield,
  Cpu,
  Layers,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useConversationStore } from '../../store/conversationStore';
import { useChatStore } from '../../store/chatStore';

export const ContextPanel: React.FC = () => {
  const { contextPanelOpen, activeRightPanelTab, updateSettings, systemPrompt, activeModel, activeProvider } =
    useSettingsStore();
  const { activeConversationId } = useChatStore();
  const { getConversationById } = useConversationStore();

  const activeConv = activeConversationId ? getConversationById(activeConversationId) : null;

  if (!contextPanelOpen) return null;

  const tabs = [
    { id: 'context', label: 'Context', icon: FileText },
    { id: 'attachments', label: 'Files', icon: Paperclip },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'plugins', label: 'Plugins', icon: Puzzle },
    { id: 'agents', label: 'Agents', icon: Bot },
  ] as const;

  return (
    <aside className="w-80 bg-gray-50/90 dark:bg-gray-950/90 border-l border-gray-200/80 dark:border-gray-800/80 flex flex-col h-[calc(100vh-2.5rem)] select-none z-30">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-xs text-gray-800 dark:text-gray-200">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Desktop Inspector</span>
        </div>
        <button
          onClick={() => updateSettings({ contextPanelOpen: false })}
          title="Close Inspector (Ctrl+I)"
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Selector Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-100/50 dark:bg-gray-900/50 border-b border-gray-200/80 dark:border-gray-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRightPanelTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => updateSettings({ activeRightPanelTab: tab.id })}
              title={tab.label}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-gray-700 dark:text-gray-300">
        {activeRightPanelTab === 'context' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Active Model Specs</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Provider</span>
                <span className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                  {activeProvider}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Model</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {activeModel}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Messages Count</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {activeConv ? activeConv.messages.length : 0}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Active System Prompt</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                "{systemPrompt}"
              </p>
            </div>
          </div>
        )}

        {activeRightPanelTab === 'attachments' && (
          <div className="p-4 text-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <Paperclip className="w-6 h-6 text-gray-400 mx-auto" />
            <h4 className="font-medium text-xs text-gray-800 dark:text-gray-200">No Attachments</h4>
            <p className="text-[11px] text-gray-400">
              Drag code snippets, documents, or screenshots into the input area.
            </p>
          </div>
        )}

        {activeRightPanelTab === 'memory' && (
          <div className="p-4 text-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <Brain className="w-6 h-6 text-gray-400 mx-auto" />
            <h4 className="font-medium text-xs text-gray-800 dark:text-gray-200">AI Context Memory</h4>
            <p className="text-[11px] text-gray-400">
              MSK remembers user coding preferences and system instructions across sessions.
            </p>
          </div>
        )}

        {activeRightPanelTab === 'plugins' && (
          <div className="p-4 text-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <Puzzle className="w-6 h-6 text-blue-500 mx-auto" />
            <h4 className="font-medium text-xs text-gray-800 dark:text-gray-200">Plugin Marketplace</h4>
            <p className="text-[11px] text-gray-400">
              Extend MSK with custom tool integrations and API tools.
            </p>
          </div>
        )}

        {activeRightPanelTab === 'agents' && (
          <div className="p-4 text-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 space-y-2">
            <Bot className="w-6 h-6 text-indigo-500 mx-auto" />
            <h4 className="font-medium text-xs text-gray-800 dark:text-gray-200">Autonomous Sub-Agents</h4>
            <p className="text-[11px] text-gray-400">
              Spawn background coding and research agents to assist in real-time.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

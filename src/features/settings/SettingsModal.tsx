import React, { useState } from 'react';
import { useSettingsStore, ThemeMode } from '../../store/settingsStore';
import { Logo } from '../../components/common/Logo';
import {
  X,
  Sliders,
  Key,
  Keyboard,
  Info,
  Sun,
  Moon,
  Monitor,
  Check,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    theme,
    setTheme,
    providers,
    setProviderConfig,
    activeProviderId,
    setActiveProvider,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'appearance' | 'providers' | 'shortcuts' | 'about'>('appearance');

  const [openAiKey, setOpenAiKey] = useState(providers.openai?.apiKey || '');
  const [openAiUrl, setOpenAiUrl] = useState(providers.openai?.baseUrl || 'https://api.openai.com/v1');

  if (!settingsModalOpen) return null;

  const handleSaveProviders = () => {
    setProviderConfig('openai', {
      apiKey: openAiKey,
      baseUrl: openAiUrl,
    });
    toast.success('AI Provider settings saved successfully');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-white dark:bg-background-cardDark border border-border-light dark:border-border-dark rounded-2xl shadow-float overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="h-14 px-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <h3 className="font-bold text-base text-text-primaryLight dark:text-text-primaryDark">
              Settings
            </h3>
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="p-1 rounded-lg text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Settings Body with Tabs */}
          <div className="flex flex-1 min-h-[380px] overflow-hidden">
            {/* Tab Sidebar */}
            <div className="w-48 border-r border-border-light dark:border-border-dark p-2 space-y-1 bg-gray-50/50 dark:bg-slate-900/30">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                }`}
              >
                <Sliders size={15} />
                <span>Appearance</span>
              </button>

              <button
                onClick={() => setActiveTab('providers')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'providers'
                    ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                }`}
              >
                <Key size={15} />
                <span>AI Providers</span>
              </button>

              <button
                onClick={() => setActiveTab('shortcuts')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'shortcuts'
                    ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                }`}
              >
                <Keyboard size={15} />
                <span>Shortcuts</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-text-primaryLight dark:text-text-primaryDark hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                }`}
              >
                <Info size={15} />
                <span>About MSK</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">
                      Theme Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                          theme === 'light'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : 'border-border-light dark:border-border-dark text-text-secondaryLight dark:text-text-secondaryDark hover:border-gray-400'
                        }`}
                      >
                        <Sun size={18} />
                        <span>Light</span>
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                          theme === 'dark'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : 'border-border-light dark:border-border-dark text-text-secondaryLight dark:text-text-secondaryDark hover:border-gray-400'
                        }`}
                      >
                        <Moon size={18} />
                        <span>Dark</span>
                      </button>

                      <button
                        onClick={() => setTheme('system')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                          theme === 'system'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : 'border-border-light dark:border-border-dark text-text-secondaryLight dark:text-text-secondaryDark hover:border-gray-400'
                        }`}
                      >
                        <Monitor size={18} />
                        <span>System</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'providers' && (
                <div className="space-y-6">
                  {/* Provider Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">
                      Active AI Provider
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveProvider('mock')}
                        className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                          activeProviderId === 'mock'
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                            : 'border-border-light dark:border-border-dark hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">
                          <Cpu size={15} className="text-emerald-500" />
                          <span>MSK Demo Engine</span>
                        </div>
                        <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
                          No API key required. Instant streaming simulation.
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveProvider('openai')}
                        className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                          activeProviderId === 'openai'
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                            : 'border-border-light dark:border-border-dark hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark">
                          <Sparkles size={15} className="text-blue-500" />
                          <span>OpenAI API</span>
                        </div>
                        <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark">
                          GPT-4o, GPT-4o-mini & custom API endpoints.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* OpenAI Key Configuration */}
                  <div className="space-y-4 pt-2 border-t border-border-light dark:border-border-dark">
                    <h4 className="text-xs font-bold text-text-primaryLight dark:text-text-primaryDark">
                      OpenAI Credentials
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="sk-proj-..."
                        value={openAiKey}
                        onChange={(e) => setOpenAiKey(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-900 border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                        Custom Base URL (Optional for proxies/local gateways)
                      </label>
                      <input
                        type="text"
                        placeholder="https://api.openai.com/v1"
                        value={openAiUrl}
                        onChange={(e) => setOpenAiUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-900 border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleSaveProviders}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-soft"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-text-primaryLight dark:text-text-primaryDark">
                    Keyboard Shortcuts Cheatsheet
                  </h4>
                  <div className="divide-y divide-border-light dark:divide-border-dark text-xs">
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-text-primaryLight dark:text-text-primaryDark">New Conversation</span>
                      <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark font-mono text-[11px]">
                        Ctrl + N
                      </kbd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-text-primaryLight dark:text-text-primaryDark">Command Palette & Search</span>
                      <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark font-mono text-[11px]">
                        Ctrl + K
                      </kbd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-text-primaryLight dark:text-text-primaryDark">Toggle Left Sidebar</span>
                      <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark font-mono text-[11px]">
                        Ctrl + B
                      </kbd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-text-primaryLight dark:text-text-primaryDark">Toggle Context Drawer</span>
                      <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark font-mono text-[11px]">
                        Ctrl + I
                      </kbd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-text-primaryLight dark:text-text-primaryDark">Open Settings</span>
                      <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-border-light dark:border-border-dark font-mono text-[11px]">
                        Ctrl + ,
                      </kbd>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-4 text-center sm:text-left">
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <Logo size={42} showText={true} />
                    <span className="text-xs text-text-secondaryLight dark:text-text-secondaryDark">
                      Version 1.0.0 (Production Desktop Release)
                    </span>
                  </div>

                  <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed">
                    MSK (My Saviour Knight) is a modern, modular desktop AI companion built with Tauri v2, React 19, TypeScript, Vite, and Framer Motion.
                  </p>

                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark space-y-2 text-xs">
                    <div className="font-semibold text-text-primaryLight dark:text-text-primaryDark flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" />
                      <span>Architecture & Future Capabilities</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-text-secondaryLight dark:text-text-secondaryDark text-[11px]">
                      <li>Decoupled Provider Architecture (OpenAI, Ollama, Claude, Gemini)</li>
                      <li>Built-in RAG & Document Search Readiness</li>
                      <li>OCR & Image Understanding Integration</li>
                      <li>Voice Assistant (Speech-to-Text & Text-to-Speech)</li>
                      <li>Automation & System Tray Capabilities</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

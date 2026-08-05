import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Palette,
  Keyboard,
  Info,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeStore } from '../../store/themeStore';
import { useProviderStore } from '../../store/providerStore';
import { aiService } from '../../services/ai/AIService';
import { NotificationService } from '../../services/notification/NotificationService';

export const SettingsModal: React.FC = () => {
  const { settingsModalOpen, setSettingsModalOpen, activeSettingsTab, setActiveSettingsTab } =
    useUIStore();
  const {
    openaiApiKey,
    setOpenaiApiKey,
    openaiBaseUrl,
    activeModel,
    setActiveModel,
    systemPrompt,
    updateSettings,
    autoScroll,
    enterToSubmit,
    alwaysOnTop,
    toggleAlwaysOnTop,
  } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();
  const { providers, activeProviderId, setActiveProviderId } = useProviderStore();

  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);

  if (!settingsModalOpen) return null;

  const handleTestKey = async () => {
    if (!openaiApiKey) {
      NotificationService.error('API Key is empty');
      return;
    }
    setValidating(true);
    try {
      const isValid = await aiService.validateKey('openai', { apiKey: openaiApiKey, baseUrl: openaiBaseUrl });
      if (isValid) {
        NotificationService.success('API Key validated successfully!', 'Connected to OpenAI endpoint');
      } else {
        NotificationService.error('Validation failed', 'Check your API Key or network connection');
      }
    } catch (err: any) {
      NotificationService.error('Validation error', err.message);
    } finally {
      setValidating(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'providers', label: 'AI Providers & Models', icon: Key },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'about', label: 'About MSK', icon: Info },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[75vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
              MSK Preferences
            </h2>
          </div>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body with Side Navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Side Tabs */}
          <div className="w-56 bg-gray-50/80 dark:bg-gray-950/80 border-r border-gray-200/80 dark:border-gray-800/80 p-3 space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeSettingsTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveSettingsTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeSettingsTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    System Prompt
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Default system persona instructions sent to the AI engine on new conversations.
                  </p>
                  <textarea
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Send message on Enter
                      </h4>
                      <p className="text-[11px] text-gray-400">Press Enter to submit, Shift+Enter for newline</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enterToSubmit}
                      onChange={(e) => updateSettings({ enterToSubmit: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Auto-scroll on stream
                      </h4>
                      <p className="text-[11px] text-gray-400">Keep latest messages in view automatically</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => updateSettings({ autoScroll: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Always on Top Window
                      </h4>
                      <p className="text-[11px] text-gray-400">Keep MSK window pinned above other apps</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={alwaysOnTop}
                      onChange={toggleAlwaysOnTop}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Theme Preference
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Choose your desktop interface style.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span>Light Mode</span>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-500" />
                      <span>Dark Mode</span>
                    </button>

                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                        theme === 'system'
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Monitor className="w-5 h-5 text-gray-500" />
                      <span>System Sync</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'providers' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Active AI Provider
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {providers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProviderId(p.id);
                          updateSettings({ activeProvider: p.id });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          activeProviderId === p.id
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 opacity-80'
                        }`}
                      >
                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">
                          {p.isAvailable ? 'Ready' : 'Extensible'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    OpenAI API Configuration
                  </h4>

                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? 'text' : 'password'}
                          placeholder="sk-..."
                          value={openaiApiKey}
                          onChange={(e) => setOpenaiApiKey(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        onClick={handleTestKey}
                        disabled={validating}
                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1"
                      >
                        {validating ? 'Testing...' : 'Test Key'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Active Model
                    </label>
                    <select
                      value={activeModel}
                      onChange={(e) => setActiveModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none"
                    >
                      <option value="gpt-4o">GPT-4o (Recommended for coding & architecture)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Fast & lightweight)</option>
                      <option value="o3-mini">o3-mini (Advanced reasoning)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'shortcuts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-2">
                  <ShortcutRow label="Command Palette" keys="Ctrl + K" />
                  <ShortcutRow label="New Conversation" keys="Ctrl + N" />
                  <ShortcutRow label="Toggle Sidebar" keys="Ctrl + B" />
                  <ShortcutRow label="Toggle Inspector" keys="Ctrl + I" />
                  <ShortcutRow label="Open Preferences" keys="Ctrl + ," />
                  <ShortcutRow label="Toggle Compact Overlay" keys="Ctrl + Shift + O" />
                </div>
              </div>
            )}

            {activeSettingsTab === 'about' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center text-white mx-auto shadow-xl">
                  <Shield className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    My Saviour Knight (MSK)
                  </h3>
                  <p className="text-xs text-blue-500 font-semibold">Version 1.0.0 • AI Operating System</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  MSK is a high-performance desktop AI companion built with Tauri v2, React 19, and TypeScript.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShortcutRow: React.FC<{ label: string; keys: string }> = ({ label, keys }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-xs">
    <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
    <span className="font-mono bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200 text-[11px]">
      {keys}
    </span>
  </div>
);

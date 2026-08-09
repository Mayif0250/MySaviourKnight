import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { 
  Palette, 
  Bot, 
  Settings2, 
  Moon, 
  Sun,
  Layout,
  Key,
  Database
} from 'lucide-react';

type TabId = 'personalization' | 'ai_providers';

export const ManagementLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personalization');

  // Personalization State (Mock)
  const [opacity, setOpacity] = useState(80);
  const [blur, setBlur] = useState(12);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // AI Providers State (Mock)
  const [provider, setProvider] = useState('ollama');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama3');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const appWindow = getCurrentWindow();
        appWindow.close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121212] text-gray-100 overflow-hidden font-sans border border-white/10 rounded-xl">
      {/* Draggable Titlebar */}
      <div 
        data-tauri-drag-region 
        onMouseDown={(e) => {
          if (e.button === 0 && (e.target as HTMLElement).tagName !== 'BUTTON') {
            getCurrentWindow().startDragging();
          }
        }}
        className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-4 select-none"
      >
        <div className="flex items-center gap-2 text-white/80 pointer-events-none">
          <Settings2 className="w-4 h-4" />
          <span className="font-medium text-[13px]">Settings</span>
        </div>
        <button 
          onClick={() => getCurrentWindow().close()}
          className="text-white/40 hover:text-white px-3 py-1 rounded-md hover:bg-white/5 transition-colors text-[13px]"
        >
          Close
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#161616] border-r border-white/5 p-4 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('personalization')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[14px] ${
              activeTab === 'personalization' 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Personalization</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ai_providers')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[14px] ${
              activeTab === 'ai_providers' 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI APIs</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#121212]">
          <div className="max-w-2xl mx-auto">
            
            {/* Personalization Tab */}
            {activeTab === 'personalization' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 border-b border-white/5 pb-4">
                  <h1 className="text-2xl font-semibold text-white/90">Chat Overlay Personalization</h1>
                  <p className="text-white/40 text-sm mt-1">Customize the visual appearance of your AI assistant.</p>
                </div>

                <div className="space-y-8">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-white/70 uppercase tracking-wider">Appearance</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border ${theme === 'dark' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'} transition-all`}
                      >
                        <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-white/50'}`} />
                        <span className={theme === 'dark' ? 'text-blue-400 font-medium' : 'text-white/70'}>Dark Theme</span>
                      </button>
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border ${theme === 'light' ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'} transition-all`}
                      >
                        <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-blue-400' : 'text-white/50'}`} />
                        <span className={theme === 'light' ? 'text-blue-400 font-medium' : 'text-white/70'}>Light Theme</span>
                      </button>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-6 bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Layout className="w-5 h-5 text-white/50" />
                      <h3 className="font-medium text-white/90">Glassmorphism Settings</h3>
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Background Opacity</span>
                          <span className="text-white/40">{opacity}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Blur Intensity</span>
                          <span className="text-white/40">{blur}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="40" 
                          value={blur}
                          onChange={(e) => setBlur(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Providers Tab */}
            {activeTab === 'ai_providers' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 border-b border-white/5 pb-4">
                  <h1 className="text-2xl font-semibold text-white/90">AI APIs & Models</h1>
                  <p className="text-white/40 text-sm mt-1">Configure your local and cloud AI providers.</p>
                </div>

                <div className="space-y-6">
                  {/* Provider Selection */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-white/70 uppercase tracking-wider">Active Provider</label>
                    <select 
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white/90 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="ollama">Local Ollama</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="gemini">Google Gemini</option>
                    </select>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
                    {/* Model Configuration */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4 text-white/50" />
                        <label className="text-sm font-medium text-white/80">Model Name</label>
                      </div>
                      <input 
                        type="text" 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g. llama3, gpt-4o, claude-3-opus"
                        className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <p className="text-[12px] text-white/40">The specific model identifier to use with the active provider.</p>
                    </div>

                    {/* API Key (only show if not local) */}
                    {provider !== 'ollama' && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-white/50" />
                          <label className="text-sm font-medium text-white/80">API Key</label>
                        </div>
                        <input 
                          type="password" 
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        />
                        <p className="text-[12px] text-white/40">Your API key is stored securely and never shared.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                      Save API Configuration
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

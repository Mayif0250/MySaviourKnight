import React, { useState } from 'react';
import { 
  Palette, 
  Bot, 
  Moon, 
  Sun,
  Layout,
  Key,
  Database,
  X
} from 'lucide-react';

import { useAppearanceStore } from '../store/appearanceStore';

type TabId = 'personalization' | 'ai_providers';

interface SettingsOverlayProps {
  onClose: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('personalization');
  const { 
    overlayStyle, textContrast, opacity, blur, border,
    setOverlayStyle, setTextContrast, setOpacity, setBlur, setBorder 
  } = useAppearanceStore();

  // AI Providers State (Mock)
  const [provider, setProvider] = useState('ollama');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama3');

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#121212] text-gray-100 font-sans animate-in fade-in zoom-in-95 duration-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white/90">Settings</h2>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 border-b border-white/5 gap-1 bg-[#1a1a1a]/80 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-[13px] font-medium ${
            activeTab === 'personalization' 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('ai_providers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-[13px] font-medium ${
            activeTab === 'ai_providers' 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI APIs
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'personalization' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            {/* Overlay Style */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Overlay Style</label>
              <div className="flex flex-wrap gap-2">
                {['adaptive', 'transparent', 'glass', 'solid', 'custom'].map((style) => (
                  <button 
                    key={style}
                    onClick={() => setOverlayStyle(style as any)}
                    className={`px-3 py-1.5 rounded-lg border text-[13px] capitalize transition-all ${
                      overlayStyle === style 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-medium' 
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Contrast */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Text Contrast</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'auto', label: 'Auto' },
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'high', label: 'High Contrast' }
                ].map((contrast) => (
                  <button 
                    key={contrast.id}
                    onClick={() => setTextContrast(contrast.id as any)}
                    className={`px-3 py-1.5 rounded-lg border text-[13px] transition-all ${
                      textContrast === contrast.id 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-medium' 
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {contrast.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mode Sliders */}
            {overlayStyle === 'custom' && (
              <div className="space-y-5 bg-white/5 border border-white/10 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="w-4 h-4 text-white/50" />
                  <h3 className="text-sm font-medium text-white/90">Custom Appearance</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Background Opacity</span>
                      <span className="text-white/40">{opacity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Blur Intensity</span>
                      <span className="text-white/40">{blur}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="30" 
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-white/70">Border</span>
                    <button 
                      onClick={() => setBorder(!border)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${border ? 'bg-blue-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${border ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai_providers' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Active Provider</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-[13px] text-white/90 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ollama">Local Ollama</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              {/* Model Configuration */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-3.5 h-3.5 text-white/50" />
                  <label className="text-[13px] font-medium text-white/80">Model Name</label>
                </div>
                <input 
                  type="text" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. llama3"
                  className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-[13px] text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* API Key (only show if not local) */}
              {provider !== 'ollama' && (
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-3.5 h-3.5 text-white/50" />
                    <label className="text-[13px] font-medium text-white/80">API Key</label>
                  </div>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-[#121212] border border-white/10 rounded-lg p-2.5 text-[13px] text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[13px] font-medium transition-colors w-full">
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

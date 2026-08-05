import React from 'react';
import { Minus, Square, X, Layers, ShieldCheck } from 'lucide-react';
import { WindowService } from '../../services/window/WindowService';
import { useSettingsStore } from '../../store/settingsStore';

export const Titlebar: React.FC = () => {
  const { compactOverlay, toggleCompactOverlay, openaiApiKey, activeModel } = useSettingsStore();

  return (
    <div className="drag-region h-10 w-full bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between px-3 select-none z-50">
      {/* Left: Branding Badge & Status */}
      <div className="flex items-center gap-2 no-drag">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-200/50 dark:bg-gray-800/50 text-[11px] font-medium text-gray-700 dark:text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">MSK</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 dark:text-gray-400">{activeModel}</span>
        </div>

        {/* API Key Status Indicator */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 pl-1">
          <span
            className={`w-2 h-2 rounded-full ${
              openaiApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {openaiApiKey ? 'Connected' : 'Key Required'}
          </span>
        </div>
      </div>

      {/* Center Drag Title */}
      <div className="flex-1 text-center text-[12px] font-medium text-gray-400 dark:text-gray-500 pointer-events-none truncate px-4">
        My Saviour Knight • Desktop AI Assistant
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={toggleCompactOverlay}
          title={compactOverlay ? 'Standard Window Mode' : 'Compact Overlay Mode (Ctrl+Shift+O)'}
          className={`p-1.5 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors ${
            compactOverlay ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-gray-300 dark:bg-gray-700 mx-1" />

        <button
          onClick={() => WindowService.minimize()}
          title="Minimize"
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => WindowService.toggleMaximize()}
          title="Maximize"
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>

        <button
          onClick={() => WindowService.close()}
          title="Close Window"
          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

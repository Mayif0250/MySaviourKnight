import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { Logo } from './Logo';

export const Titlebar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if running inside Tauri desktop shell
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      setIsTauri(true);
    }
  }, []);

  const handleMinimize = async () => {
    if (isTauri) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().minimize();
      } catch (err) {
        console.warn('Tauri window minimize failed', err);
      }
    }
  };

  const handleMaximize = async () => {
    if (isTauri) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWindow = getCurrentWindow();
        await appWindow.toggleMaximize();
        setIsMaximized(await appWindow.isMaximized());
      } catch (err) {
        console.warn('Tauri window maximize failed', err);
      }
    }
  };

  const handleClose = async () => {
    if (isTauri) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch (err) {
        console.warn('Tauri window close failed', err);
      }
    }
  };

  return (
    <div className="drag-region h-10 w-full bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-3 select-none z-50">
      {/* Left Branding */}
      <div className="no-drag flex items-center gap-2">
        <Logo size={22} showText={false} />
        <span className="text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark tracking-wide">
          My Saviour Knight
        </span>
      </div>

      {/* Center Drag Region Area */}
      <div className="flex-1 h-full drag-region" />

      {/* Right Desktop Window Controls */}
      {isTauri && (
        <div className="no-drag flex items-center gap-0.5">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 flex items-center justify-center rounded text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Minimize"
          >
            <Minus size={14} />
          </button>

          <button
            onClick={handleMaximize}
            className="w-7 h-7 flex items-center justify-center rounded text-text-secondaryLight dark:text-text-secondaryDark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy size={13} /> : <Square size={13} />}
          </button>

          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded text-text-secondaryLight dark:text-text-secondaryDark hover:bg-red-500 hover:text-white transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

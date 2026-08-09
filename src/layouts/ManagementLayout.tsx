import React, { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const ManagementLayout: React.FC = () => {
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
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden font-sans border border-gray-700/50 rounded-xl">
      <div 
        data-tauri-drag-region 
        onMouseDown={(e) => {
          if (e.button === 0 && (e.target as HTMLElement).tagName !== 'BUTTON') {
            getCurrentWindow().startDragging();
          }
        }}
        className="h-10 bg-gray-800 flex items-center justify-between px-4"
      >
        <span className="font-semibold">MSK Management</span>
        <button 
          onClick={() => getCurrentWindow().close()}
          className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-red-500/20"
        >
          Close
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Management Settings</h1>
          <p className="text-gray-400">Clean slate. Ready for new features.</p>
        </div>
      </div>
    </div>
  );
};

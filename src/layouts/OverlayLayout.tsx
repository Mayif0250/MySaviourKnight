import React, { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export const OverlayLayout: React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const appWindow = getCurrentWindow();
        appWindow.hide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openManagementWindow = async () => {
    try {
      const win = new WebviewWindow('management', {
        url: '/',
        title: 'MSK Management',
        width: 1280,
        height: 830,
        minWidth: 800,
        minHeight: 600,
        center: true,
        decorations: false,
        transparent: true,
        shadow: true
      });
      win.once('tauri://error', function (e) {
        WebviewWindow.getByLabel('management').then(w => w?.setFocus());
      });
    } catch (e) {
      console.warn('Error opening management window:', e);
    }
  };

  return (
    <div
      data-tauri-drag-region
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && e.button === 0) {
          getCurrentWindow().startDragging();
        }
      }}
      className="h-screen w-screen bg-transparent flex flex-col items-center justify-start p-3"
      style={{ fontFamily: "'Segoe UI', 'Inter', sans-serif" }}
    >
      <div
        className="flex flex-col shadow-lg"
        style={{
          width: '420px',
          height: '200px',
          backgroundColor: '#1E1E1E',
          border: '1px solid #333',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div
          data-tauri-drag-region
          onMouseDown={(e) => {
            if (e.button === 0 && (e.target as HTMLElement).tagName !== 'BUTTON') {
              getCurrentWindow().startDragging();
            }
          }}
          className="flex items-center justify-between cursor-move drag-region"
          style={{ height: '32px', backgroundColor: '#232323', borderRadius: '8px 8px 0 0' }}
        >
          <div className="flex items-center pointer-events-none">
            <span className="font-semibold text-[15px] text-white ml-[12px]">MSK Overlay</span>
          </div>
          <div className="flex items-center z-10 pr-[8px]">
            <button
              onClick={openManagementWindow}
              className="text-white text-xs px-2 py-1 rounded hover:bg-gray-700"
            >
              Settings
            </button>
            <button
              onClick={() => getCurrentWindow().hide()}
              className="text-white text-xs px-2 py-1 rounded hover:bg-gray-700 ml-2"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
          Ready to build new features!
        </div>
      </div>
    </div>
  );
};

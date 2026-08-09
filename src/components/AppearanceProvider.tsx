import React, { useEffect } from 'react';
import { useAppearanceStore } from '../store/appearanceStore';

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { overlayStyle, textContrast, opacity, blur, border } = useAppearanceStore();

  useEffect(() => {
    const root = document.documentElement;

    // --- Compute Overlay Style Values ---
    let surfaceOpacity = 0.8;
    let surfaceBlur = 12;
    let showBorder = true;

    switch (overlayStyle) {
      case 'adaptive':
        surfaceOpacity = 0.75;
        surfaceBlur = 16;
        showBorder = true;
        break;
      case 'transparent':
        surfaceOpacity = 0.05;
        surfaceBlur = 0;
        showBorder = false;
        break;
      case 'glass':
        surfaceOpacity = 0.35;
        surfaceBlur = 24;
        showBorder = true;
        break;
      case 'solid':
        surfaceOpacity = 0.98;
        surfaceBlur = 0;
        showBorder = true;
        break;
      case 'custom':
        surfaceOpacity = opacity / 100;
        surfaceBlur = blur;
        showBorder = border;
        break;
    }

    // --- Compute Text Contrast Values ---
    // Default (Auto) aims for light text on dark overlay, as the app is dark by default
    let textPrimary = 'rgba(255, 255, 255, 0.9)';
    let textSecondary = 'rgba(255, 255, 255, 0.6)';
    let textMuted = 'rgba(255, 255, 255, 0.4)';
    let iconColor = 'rgba(255, 255, 255, 0.7)';
    let linkColor = '#60A5FA'; // blue-400

    switch (textContrast) {
      case 'light':
        textPrimary = 'rgba(255, 255, 255, 1)';
        textSecondary = 'rgba(255, 255, 255, 0.8)';
        textMuted = 'rgba(255, 255, 255, 0.5)';
        iconColor = 'rgba(255, 255, 255, 0.9)';
        break;
      case 'dark':
        textPrimary = 'rgba(17, 24, 39, 1)'; // gray-900
        textSecondary = 'rgba(55, 65, 81, 1)'; // gray-700
        textMuted = 'rgba(107, 114, 128, 1)'; // gray-500
        iconColor = 'rgba(55, 65, 81, 1)';
        linkColor = '#2563EB'; // blue-600
        break;
      case 'high':
        textPrimary = '#FFFFFF';
        textSecondary = '#FFFFFF';
        textMuted = 'rgba(255, 255, 255, 0.8)';
        iconColor = '#FFFFFF';
        linkColor = '#93C5FD'; // blue-300
        break;
      case 'auto':
      default:
        // Already set above
        break;
    }

    const isDarkText = textContrast === 'dark';

    // Border colors depend on text contrast to remain visible
    let borderColor = showBorder
      ? (isDarkText ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)')
      : 'transparent';

    let dividerColor = isDarkText ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';

    // Surface colors
    const baseRgb = isDarkText ? '240, 240, 240' : '20, 20, 20';
    const surfaceColor = `rgba(${baseRgb}, ${surfaceOpacity})`;
    const surfaceHover = `rgba(${baseRgb}, ${Math.min(1, surfaceOpacity + 0.1)})`;
    const inputSurface = `rgba(${baseRgb}, ${Math.min(1, surfaceOpacity + 0.15)})`;
    const codeSurface = isDarkText ? 'rgba(220, 220, 220, 0.8)' : 'rgba(0, 0, 0, 0.4)';

    // Base variables for other modes
    let windowBg = surfaceColor;
    let windowBlur = `${surfaceBlur}px`;
    let windowBorder = borderColor;

    let headerBg = surfaceColor;
    let aiBg = surfaceColor;
    let aiBlur = '0px';
    let userBg = surfaceHover;
    let inputBg = inputSurface;
    let buttonBg = surfaceColor;
    let buttonHoverBg = surfaceHover;

    if (overlayStyle === 'transparent') {
      // Replicate the exact old UI for transparent mode
      windowBg = 'transparent';
      windowBlur = '0px';
      windowBorder = 'transparent';

      headerBg = '#232323';
      aiBg = 'rgba(255, 255, 255, 0.05)';
      aiBlur = '24px'; // backdrop-blur-xl
      userBg = '#232323';
      inputBg = '#232323';
      buttonBg = '#232323';
      buttonHoverBg = '#2a2a2a';

      // Force text contrast for old UI aesthetic if it's auto or light
      if (textContrast === 'auto' || textContrast === 'light') {
        textPrimary = 'white';
        textSecondary = 'rgba(255, 255, 255, 0.8)';
        textMuted = 'rgba(255, 255, 255, 0.4)';
        iconColor = 'white';
        borderColor = 'rgba(255, 255, 255, 0.05)'; // for user message border
      }
    }

    // Apply variables to root
    root.style.setProperty('--chat-window-bg', windowBg);
    root.style.setProperty('--chat-window-border', windowBorder);
    root.style.setProperty('--chat-window-blur', windowBlur);

    root.style.setProperty('--chat-header-bg', headerBg);
    root.style.setProperty('--chat-ai-bg', aiBg);
    root.style.setProperty('--chat-ai-blur', aiBlur);
    root.style.setProperty('--chat-user-bg', userBg);

    root.style.setProperty('--chat-button-bg', buttonBg);
    root.style.setProperty('--chat-button-hover', buttonHoverBg);

    root.style.setProperty('--chat-surface', surfaceColor);
    root.style.setProperty('--chat-surface-opacity', surfaceOpacity.toString());
    root.style.setProperty('--chat-surface-hover', surfaceHover);
    root.style.setProperty('--chat-text-primary', textPrimary);
    root.style.setProperty('--chat-text-secondary', textSecondary);
    root.style.setProperty('--chat-text-muted', textMuted);
    root.style.setProperty('--chat-border', borderColor);
    root.style.setProperty('--chat-divider', dividerColor);
    root.style.setProperty('--chat-input-surface', inputBg);
    root.style.setProperty('--chat-code-surface', codeSurface);
    root.style.setProperty('--chat-link', linkColor);
    root.style.setProperty('--chat-icon', iconColor);
    root.style.setProperty('--chat-blur', `${surfaceBlur}px`);
    root.style.setProperty('--chat-base-rgb', baseRgb);

  }, [overlayStyle, textContrast, opacity, blur, border]);

  return <>{children}</>;
};

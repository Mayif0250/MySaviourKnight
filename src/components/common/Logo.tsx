import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 28, showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern Knight Helmet Minimalist SVG */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-soft transition-all duration-200 hover:shadow-card"
        style={{ width: size, height: size }}
      >
        <svg
          width={Math.round(size * 0.65)}
          height={Math.round(size * 0.65)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transform hover:scale-105 transition-transform"
        >
          {/* Sleek Knight Helmet Crest & Visor Geometric Paths */}
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
          <path d="M12 8v5" />
          <path d="M8 11h8" />
          <path d="M9 15h6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark text-base">
              MSK
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              Knight
            </span>
          </div>
          <span className="text-[10px] text-text-secondaryLight dark:text-text-secondaryDark tracking-wide font-medium mt-0.5">
            Your AI Companion
          </span>
        </div>
      )}
    </div>
  );
};

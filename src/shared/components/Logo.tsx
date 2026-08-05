import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const iconSize = {
    sm: 24,
    md: 32,
    lg: 40,
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern Knight Minimal Geometric Emblem */}
      <div className={`relative flex items-center justify-center ${dimensions} rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-md shadow-blue-500/20`}>
        <svg
          width={iconSize * 0.65}
          height={iconSize * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Angular Minimal Knight Helmet & Shield Geometry */}
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
          <path d="M12 7v6" />
          <path d="M9 10h6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
              MSK
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              AI OS
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 tracking-tight">
            My Saviour Knight
          </span>
        </div>
      )}
    </div>
  );
};

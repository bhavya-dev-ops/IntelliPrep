import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      {/* Minimal Icon based on your branding */}
      <div className="relative w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 active:scale-95 duration-300">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-6 h-6 text-white"
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Minimal Brain/Spark Icon */}
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-4.12 2.5 2.5 0 0 1 0-4.12A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-4.12 2.5 2.5 0 0 0 0-4.12A2.5 2.5 0 0 0 14.5 2Z" />
          <path d="M12 12h.01" />
        </svg>
        {/* Sparkle effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></div>
      </div>
      
      {showText && (
        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white select-none">
          <span className="text-primary font-extrabold">IntelliPrep</span>
        </span>
      )}
    </div>
  );
};

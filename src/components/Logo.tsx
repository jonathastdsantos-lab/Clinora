import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", variant = 'dark' }) => {
  const primary = variant === 'light' ? '#FFFFFF' : '#10B981';
  const secondary = variant === 'light' ? 'rgba(255,255,255,0.8)' : '#0EA5E9';
  const accent = variant === 'light' ? 'white' : '#FBBF24';

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        {/* Outer Circular Accents */}
        <path 
          d="M20 30C15 45 15 60 25 75M75 85C90 75 95 55 85 35" 
          stroke={primary} 
          strokeWidth="5" 
          strokeLinecap="round" 
          opacity="0.4"
        />
        
        {/* Heart Shape with integrated cross feel */}
        <path 
          d="M48 78C30 70 20 50 20 35C20 25 30 18 38 18C44 18 48 23 48 23C48 23 52 18 58 18C70 18 80 25 80 40C80 50 75 60 65 70" 
          stroke={primary} 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Thick Integrated Medical Cross inside heart area */}
        <rect x="52" y="38" width="16" height="28" rx="3" fill={primary} fillOpacity="0.2" stroke={primary} strokeWidth="2" />
        <rect x="46" y="44" width="28" height="16" rx="3" fill={primary} fillOpacity="0.2" stroke={primary} strokeWidth="2" />
        
        {/* Strong Growth Arrow - Crossing through */}
        <path 
          d="M25 82C35 72 55 60 70 48C80 40 85 30 90 20" 
          stroke={secondary} 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M78 20H90V32" 
          stroke={secondary} 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Gold Accent Sparkle */}
        <circle cx="82" cy="55" r="4" fill={accent} opacity="0.8" />
      </svg>
    </div>
  );
};

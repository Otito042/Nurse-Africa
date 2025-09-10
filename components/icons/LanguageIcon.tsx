import React from 'react';

export const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1" />
    <path d="M19 4h-1a3 3 0 0 0-3 3 3 3 0 0 0-3-3h-1" />
    <path d="M12 20l-4-8-4 8" />
    <path d="M22 20l-4-8-4 8" />
    <line x1="10" y1="16" x2="14" y2="16" />
  </svg>
);

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  // Check if a background or border class is already provided in props
  const hasBg = /\bbg-/.test(className);
  const hasBorder = /\bborder-/.test(className) || /\bborder\b/.test(className);

  return (
    <div className={`rounded-xl shadow-md overflow-hidden ${!hasBg ? 'bg-white' : ''} ${!hasBorder ? 'border border-gray-100' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 ${className}`}>
    {children}
  </div>
);

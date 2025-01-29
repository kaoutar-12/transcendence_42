'use client';
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'default',
  className = '',
  children 
}) => {
  const baseStyles = "rounded-lg p-4 mb-4 flex items-center space-x-2";
  const variantStyles = {
    default: "bg-green-600 text-white",
    destructive: "bg-red-600 text-white"
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {variant === 'destructive' ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <CheckCircle className="h-5 w-5" />
      )}
      <div>{children}</div>
    </div>
  );
};

export const AlertDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};
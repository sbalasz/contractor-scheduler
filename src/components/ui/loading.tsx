"use client";

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className = '', 
  disabled = false,
  onClick,
  variant = 'default',
  size = 'default'
}: LoadingButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${
        variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
        variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
        variant === 'outline' ? 'border border-input hover:bg-accent hover:text-accent-foreground' :
        variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
        variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' :
        'text-primary underline-offset-4 hover:underline'
      } ${
        size === 'default' ? 'h-10 py-2 px-4' :
        size === 'sm' ? 'h-9 px-3 rounded-md' :
        size === 'lg' ? 'h-11 px-8 rounded-md' :
        'h-10 w-10'
      } ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingCard({ isLoading, children, className = '' }: LoadingCardProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

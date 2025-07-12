import { memo } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner = memo(function LoadingSpinner({ 
  message = '로딩 중...', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  return (
    <div className={`min-h-screen bg-stone-50 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-emerald-800 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-stone-600">{message}</p>
      </div>
    </div>
  );
});

export default LoadingSpinner;
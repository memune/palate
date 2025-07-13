'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', show, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const bgColor = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }[type];

  const icon = {
    success: '✓',
    error: '✗',
    info: 'ℹ'
  }[type];

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300`}>
        <span className="text-lg font-bold">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
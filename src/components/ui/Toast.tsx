import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { Check, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onDismiss: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  message,
  onDismiss,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const typeConfig = {
    success: {
      border: 'border-l-4 border-l-wt-yellow border-wt-white',
      icon: <Check className="w-4 h-4 text-wt-yellow stroke-[3]" />,
      label: 'SUCCESS',
    },
    warning: {
      border: 'border-l-4 border-l-wt-yellow border-wt-yellow',
      icon: <AlertTriangle className="w-4 h-4 text-wt-yellow" />,
      label: 'WARNING',
    },
    error: {
      border: 'border-l-4 border-l-wt-red border-wt-red',
      icon: <AlertCircle className="w-4 h-4 text-wt-red" />,
      label: 'ERROR',
    },
    info: {
      border: 'border-l-4 border-l-wt-white border-wt-white',
      icon: <Check className="w-4 h-4 text-wt-white" />,
      label: 'SYSTEM',
    },
  };

  const current = typeConfig[type];

  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-3 p-4 bg-wt-black text-wt-white border-2 shadow-hardSm font-mono min-w-[320px] max-w-md',
        current.border
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5">{current.icon}</span>
        <div>
          <div className="text-[10px] text-wt-gray uppercase font-bold tracking-widest">// {current.label}</div>
          <div className="text-xs text-wt-white mt-0.5 font-bold">{message}</div>
        </div>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-wt-gray hover:text-wt-white p-0.5"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

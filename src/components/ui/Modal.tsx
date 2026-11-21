import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-wt-black/80 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={clsx('relative w-full z-10', maxWidthStyles[maxWidth])}>
        <GlassCard variant="red" hud className="bg-wt-black/95 p-6 border-3 border-wt-white shadow-hard">
          <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-wt-white">
            <h3 className="font-mono text-base uppercase font-bold tracking-wider text-wt-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-wt-yellow inline-block" />
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 border border-wt-white text-wt-white hover:bg-wt-red hover:text-wt-black hover:border-wt-red transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
          <div>{children}</div>
        </GlassCard>
      </div>
    </div>
  );
};

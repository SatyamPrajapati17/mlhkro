import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'md',
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

  const widthStyles = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-wt-black/80 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full h-full bg-wt-black border-l-4 border-wt-white p-6 z-10 flex flex-col shadow-hard',
          widthStyles[width]
        )}
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-wt-white">
          <h3 className="font-mono text-base uppercase font-bold tracking-wider text-wt-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-wt-red inline-block" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 border border-wt-white text-wt-white hover:bg-wt-red hover:text-wt-black hover:border-wt-red transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

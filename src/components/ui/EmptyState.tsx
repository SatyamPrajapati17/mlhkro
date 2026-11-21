import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <GlassCard variant="yellow" hud className={clsx('overflow-hidden p-0 border-3 border-wt-white', className)}>
      <div className="hazard-stripe h-5 w-full border-b-2 border-wt-white" />
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <h4 className="font-mono text-base uppercase font-black tracking-wider text-wt-white mb-2">
          {title}
        </h4>
        <p className="font-mono text-xs text-wt-gray max-w-md mb-6 uppercase tracking-wider">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            [ {actionLabel} ]
          </Button>
        )}
      </div>
    </GlassCard>
  );
};

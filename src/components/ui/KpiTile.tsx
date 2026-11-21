import React from 'react';
import { clsx } from 'clsx';
import { GlassCard } from './GlassCard';

export interface KpiTileProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  className?: string;
  variant?: 'red' | 'yellow' | 'white';
}

export const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  delta,
  deltaType = 'positive',
  subtext,
  className,
  variant = 'yellow',
}) => {
  return (
    <GlassCard variant={variant} hud interactive className={clsx('flex flex-col justify-between min-h-[140px]', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-wt-gray font-bold">
          {label}
        </span>
        {delta && (
          <span
            className={clsx(
              'font-mono text-xs px-1.5 py-0.5 border font-bold',
              deltaType === 'positive' && 'text-wt-yellow border-wt-yellow bg-wt-yellow/10',
              deltaType === 'negative' && 'text-wt-red border-wt-red bg-wt-red/10',
              deltaType === 'neutral' && 'text-wt-white border-wt-white'
            )}
          >
            {delta}
          </span>
        )}
      </div>

      <div className="my-2">
        <div className="font-mono text-4xl sm:text-5xl font-black text-wt-yellow tracking-tight glitch-hover">
          {value}
        </div>
      </div>

      {subtext && (
        <div className="font-mono text-[11px] text-wt-gray uppercase tracking-wider truncate">
          {subtext}
        </div>
      )}
    </GlassCard>
  );
};

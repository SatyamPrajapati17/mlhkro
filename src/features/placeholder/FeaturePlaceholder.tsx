import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { EmptyState } from '../../components/ui/EmptyState';

export interface FeaturePlaceholderProps {
  moduleName: string;
  phaseNumber: number;
  description: string;
}

export const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({
  moduleName,
  phaseNumber,
  description,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b-2 border-wt-white/20 pb-3">
        <div className="font-mono text-xs text-wt-gray uppercase">// MODULE INITIALIZED</div>
        <h2 className="font-display text-3xl font-black text-wt-white uppercase">{moduleName}</h2>
      </div>

      <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95">
        <EmptyState
          title={`${moduleName} — PHASE ${phaseNumber}`}
          description={description}
        />
      </GlassCard>
    </div>
  );
};

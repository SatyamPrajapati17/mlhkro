import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={clsx('flex items-center gap-2 border-b-2 border-wt-white/30 pb-2 overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider transition-all select-none whitespace-nowrap shrink-0 border-2',
              isActive
                ? 'bg-wt-yellow text-wt-black border-wt-yellow shadow-hardSm'
                : 'bg-wt-black text-wt-white border-wt-white/30 hover:border-wt-white hover:text-wt-white'
            )}
          >
            {isActive && <span className="w-1.5 h-1.5 bg-wt-red inline-block" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 border',
                  isActive ? 'bg-wt-black text-wt-yellow border-wt-black' : 'bg-wt-white/10 text-wt-gray border-wt-white/20'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

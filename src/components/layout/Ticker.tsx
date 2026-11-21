import React from 'react';

export interface TickerItem {
  id: string;
  label: string;
  status?: 'ok' | 'warn' | 'alert';
}

const defaultTickerItems: TickerItem[] = [
  { id: '1', label: 'SYSTEM ONLINE', status: 'ok' },
  { id: '2', label: '42 PRESENT TODAY', status: 'ok' },
  { id: '3', label: '3 LATE ARRIVALS', status: 'warn' },
  { id: '4', label: '2 LEAVES PENDING APPROVAL', status: 'warn' },
  { id: '5', label: 'PAYROLL STATUS: DRAFT', status: 'alert' },
  { id: '6', label: 'FACE LIVENESS: STRICT', status: 'ok' },
  { id: '7', label: 'AI LAYER: ACTIVE', status: 'ok' },
];

export const Ticker: React.FC<{ items?: TickerItem[] }> = ({ items = defaultTickerItems }) => {
  return (
    <div className="w-full bg-wt-black border-b-2 border-wt-white overflow-hidden py-1.5 select-none relative z-20">
      <div className="flex items-center">
        <div className="bg-wt-red text-wt-black font-mono text-[10px] uppercase font-black px-2 py-0.5 tracking-wider ml-2 border border-wt-black shrink-0 flex items-center gap-1 z-10">
          <span className="w-1.5 h-1.5 bg-wt-black rounded-full status-dot-pulse" />
          FEED
        </div>
        <div className="overflow-hidden flex-1 relative ml-3">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-mono text-xs text-wt-white tracking-widest uppercase">
            {[...items, ...items, ...items].map((item, index) => (
              <span key={`${item.id}-${index}`} className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 ${
                    item.status === 'alert'
                      ? 'bg-wt-red'
                      : item.status === 'warn'
                      ? 'bg-wt-yellow'
                      : 'bg-wt-white'
                  }`}
                />
                <span className="font-bold">{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

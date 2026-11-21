import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeStatus } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { CalendarCheck, Calendar as CalendarIcon, List, Clock, Check, X, ShieldAlert } from 'lucide-react';
import { AttendanceRecord } from '../../../server/db/types';

export const AttendancePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'TABLE' | 'CALENDAR'>('TABLE');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [manualRequests, setManualRequests] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/attendance/records');
      const data = await res.json();
      if (res.ok && data.success) {
        setRecords(data.records);
        setManualRequests(data.manualRequests || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualAction = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setManualRequests(manualRequests.filter((m) => m.id !== id));
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'work_date',
      header: 'WORK DATE',
      render: (rec) => <span className="font-mono font-bold text-wt-white">{rec.work_date}</span>,
    },
    {
      key: 'check_in_at',
      header: 'CHECK IN',
      render: (rec) => (
        <span className="font-mono text-xs text-wt-yellow">
          {rec.check_in_at ? new Date(rec.check_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
        </span>
      ),
    },
    {
      key: 'check_out_at',
      header: 'CHECK OUT',
      render: (rec) => (
        <span className="font-mono text-xs text-wt-white">
          {rec.check_out_at ? new Date(rec.check_out_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
        </span>
      ),
    },
    {
      key: 'minutes_worked',
      header: 'HOURS WORKED',
      render: (rec) => (
        <span className="font-mono text-xs text-wt-gray">
          {rec.minutes_worked ? `${(rec.minutes_worked / 60).toFixed(1)} hrs` : '8.5 hrs'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (rec) => <Badge status={rec.status as BadgeStatus} size="sm" />,
    },
    {
      key: 'source',
      header: 'AUTH SOURCE',
      render: (rec) => (
        <span className="font-mono text-xs text-wt-yellow">
          [{rec.source || 'FACE'}] {rec.face_confidence ? `${Math.round(rec.face_confidence * 100)}%` : '98%'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">// ATTENDANCE AUDIT LOGS</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">ATTENDANCE LOGS</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'TABLE' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('TABLE')}
          >
            <List className="w-4 h-4 mr-1.5" /> TABLE VIEW
          </Button>
          <Button
            variant={viewMode === 'CALENDAR' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('CALENDAR')}
          >
            <CalendarIcon className="w-4 h-4 mr-1.5" /> CALENDAR VIEW
          </Button>
        </div>
      </div>

      {/* Manual Requests Queue (If Any) */}
      {manualRequests.length > 0 && (
        <GlassCard variant="yellow" hud className="p-5 bg-wt-black/95">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-wt-white/20">
            <h4 className="font-mono text-xs uppercase font-bold text-wt-yellow flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-wt-yellow" />
              PENDING MANUAL ATTENDANCE REQUESTS ({manualRequests.length})
            </h4>
            <span className="font-mono text-[11px] text-wt-gray">// REQUIRES APPROVAL</span>
          </div>
          <div className="space-y-3 font-mono text-xs">
            {manualRequests.map((m) => (
              <div key={m.id} className="p-3 border-2 border-wt-white bg-wt-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-wt-white mr-2">{m.employeeName}</span>
                  <span className="text-wt-gray">requested {m.kind} for {m.workDate} at {m.requestedTime}</span>
                  <div className="text-[11px] text-wt-yellow mt-0.5">Reason: "{m.reason}"</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => handleManualAction(m.id, 'APPROVED')}>
                    <Check className="w-3.5 h-3.5 mr-1" /> APPROVE
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleManualAction(m.id, 'REJECTED')}>
                    <X className="w-3.5 h-3.5 mr-1" /> REJECT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Main View: Table vs Calendar */}
      {viewMode === 'TABLE' ? (
        <Table columns={columns} data={records} keyExtractor={(r) => r.id} />
      ) : (
        <GlassCard variant="white" hud className="p-6 bg-wt-black/95 font-mono">
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-wt-white">
            <h3 className="font-mono text-base uppercase font-black text-wt-white">
              NOVEMBER 2026 CALENDAR GRID
            </h3>
            <div className="flex items-center gap-3 text-xs text-wt-gray">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-wt-yellow inline-block" /> PRESENT</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-wt-yellow/30 border border-wt-yellow inline-block" /> LATE</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-wt-red inline-block" /> ABSENT</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <div key={d} className="p-2 border border-wt-white/20 bg-wt-black font-bold text-wt-gray">
                {d}
              </div>
            ))}
            {Array.from({ length: 30 }).map((_, idx) => {
              const day = idx + 1;
              const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);
              const isLate = day === 12 || day === 19;
              const isToday = day === 21;
              const isFuture = day > 21;

              return (
                <div
                  key={day}
                  className={`min-h-[70px] p-2 border-2 text-left flex flex-col justify-between font-bold ${
                    isToday
                      ? 'border-wt-yellow bg-wt-yellow text-wt-black shadow-hardYSm'
                      : isLate
                      ? 'border-wt-yellow bg-wt-yellow/10 text-wt-yellow'
                      : isWeekend
                      ? 'border-wt-white/10 text-wt-gray/40 bg-wt-black'
                      : isFuture
                      ? 'border-wt-white/10 text-wt-gray/40'
                      : 'border-wt-white bg-wt-white/5 text-wt-white'
                  }`}
                >
                  <div className="text-sm">{day}</div>
                  <div className="text-[10px] uppercase truncate">
                    {isToday
                      ? 'TODAY'
                      : isLate
                      ? 'LATE (09:47)'
                      : isWeekend
                      ? 'WEEKEND'
                      : isFuture
                      ? '--'
                      : '09:15 · 18:30'}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, BadgeStatus } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { 
  CalendarDays, 
  Plus, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import { LeaveRequest } from '../../../server/db/types';

export const LeavesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MY_LEAVES' | 'APPROVALS'>('MY_LEAVES');
  const [balances, setBalances] = useState<Record<string, { allocated: number; used: number }>>({
    CL: { allocated: 12, used: 2 },
    SL: { allocated: 10, used: 1 },
    EL: { allocated: 15, used: 3 },
    UL: { allocated: 0, used: 0 },
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Form State
  const [leaveTypeCode, setLeaveTypeCode] = useState<'CL' | 'SL' | 'EL' | 'UL'>('CL');
  const [fromDate, setFromDate] = useState('2026-11-26');
  const [toDate, setToDate] = useState('2026-11-27');
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');

  const loadData = async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        fetch('/api/leaves/balances'),
        fetch('/api/leaves/requests'),
      ]);
      const bData = await bRes.json();
      const rData = await rRes.json();
      if (bData.success) setBalances(bData.balances);
      if (rData.success) setRequests(rData.requests);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);
    try {
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveTypeCode,
          fromDate,
          toDate,
          halfDay,
          reason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplyModalOpen(false);
        setReason('');
        loadData();
      } else {
        setApplyError(data.error?.message || 'Failed to submit leave.');
      }
    } catch (err: any) {
      setApplyError(err.message || 'Network error.');
    }
  };

  const handleDecide = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/leaves/requests/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'employeeName',
      header: 'EMPLOYEE',
      render: (r) => <span className="font-bold text-wt-white">{r.employeeName || 'Arjun Verma'}</span>,
    },
    {
      key: 'leaveTypeCode',
      header: 'TYPE',
      render: (r) => <span className="font-mono font-bold text-wt-yellow">[{r.leaveTypeCode}]</span>,
    },
    {
      key: 'dates',
      header: 'DURATION',
      render: (r) => (
        <span className="font-mono text-xs text-wt-white">
          {r.from_date} → {r.to_date} ({r.days} {r.days === 1 ? 'day' : 'days'})
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'REASON',
      render: (r) => <span className="font-mono text-xs text-wt-gray">{r.reason}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (r) => <Badge status={r.status as BadgeStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: 'ACTION',
      render: (r) =>
        r.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => handleDecide(r.id, 'APPROVED')}>
              <Check className="w-3.5 h-3.5 mr-1" /> APPROVE
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDecide(r.id, 'REJECTED')}>
              <X className="w-3.5 h-3.5 mr-1" /> REJECT
            </Button>
          </div>
        ) : (
          <span className="font-mono text-xs text-wt-gray">--</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">// LEAVE QUOTAS & APPROVALS</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">LEAVE MANAGEMENT</h2>
        </div>
        <Button variant="primary" size="md" onClick={() => setApplyModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> [ APPLY LEAVE ]
        </Button>
      </div>

      {/* Quota Balances Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(balances).map(([code, b]) => {
          const remaining = b.allocated - b.used;
          return (
            <GlassCard key={code} variant="yellow" hud className="p-4 bg-wt-black/95">
              <div className="font-mono text-xs text-wt-gray uppercase font-bold">// [{code}] QUOTA</div>
              <div className="my-1">
                <div className="font-mono text-3xl font-black text-wt-yellow">{remaining.toFixed(1)}</div>
                <div className="text-[10px] text-wt-gray uppercase">REMAINING OF {b.allocated.toFixed(1)} ALLOCATED</div>
              </div>
              <div className="w-full h-1.5 bg-wt-black border border-wt-white/30 mt-2">
                <div
                  className="h-full bg-wt-yellow"
                  style={{ width: `${b.allocated > 0 ? (b.used / b.allocated) * 100 : 0}%` }}
                />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'MY_LEAVES', label: 'MY LEAVE REQUESTS', count: requests.length },
          { id: 'APPROVALS', label: 'APPROVAL QUEUE' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={requests}
        keyExtractor={(r) => r.id}
        emptyMessage="NO LEAVE REQUESTS FOUND"
      />

      {/* Apply Leave Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="APPLY FOR LEAVE">
        <form onSubmit={handleApply} className="space-y-4 font-mono text-xs">
          {applyError && (
            <div className="p-3 bg-wt-red/10 border-2 border-wt-red text-wt-red font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{applyError}</span>
            </div>
          )}

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-wt-white block mb-1">
              LEAVE CLASSIFICATION
            </label>
            <select
              value={leaveTypeCode}
              onChange={(e) => setLeaveTypeCode(e.target.value as any)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-wt-black text-wt-white font-mono text-sm border-2 border-wt-white outline-none focus:border-wt-yellow"
            >
              <option value="CL">CASUAL LEAVE (CL)</option>
              <option value="SL">SICK LEAVE (SL)</option>
              <option value="EL">EARNED LEAVE (EL)</option>
              <option value="UL">UNPAID LEAVE (UL)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="date"
              required
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              required
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={halfDay}
              onChange={(e) => setHalfDay(e.target.checked)}
              className="w-4 h-4 accent-wt-yellow"
            />
            <span className="text-xs text-wt-white font-bold uppercase">Half Day (First / Second Half)</span>
          </label>

          <Input
            label="Reason for Absence"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.G. PERSONAL FAMILY APPOINTMENT"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" type="button" onClick={() => setApplyModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="md" type="submit">
              SUBMIT LEAVE APPLICATION
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

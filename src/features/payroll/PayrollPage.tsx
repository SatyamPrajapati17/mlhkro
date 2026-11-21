import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, BadgeStatus } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  CircleDollarSign, 
  Plus, 
  Check, 
  Send, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { PayrollRun, PayrollRunItem } from '../../../server/routes/payroll';

export const PayrollPage: React.FC = () => {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [newRunMonth, setNewRunMonth] = useState('2026-11');
  const [newRunModalOpen, setNewRunModalOpen] = useState(false);

  const loadRuns = async () => {
    try {
      const res = await fetch('/api/payroll/runs');
      const data = await res.json();
      if (res.ok && data.success) {
        setRuns(data.runs);
        if (data.runs.length > 0) {
          setSelectedRun(data.runs[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleCreateRun = async () => {
    try {
      const res = await fetch('/api/payroll/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: newRunMonth }),
      });
      if (res.ok) {
        setNewRunModalOpen(false);
        loadRuns();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/runs/${id}/submit`, { method: 'POST' });
      if (res.ok) loadRuns();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/runs/${id}/approve`, { method: 'POST' });
      if (res.ok) loadRuns();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePay = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/runs/${id}/pay`, { method: 'POST' });
      if (res.ok) loadRuns();
    } catch (e) {
      console.error(e);
    }
  };

  const itemColumns: Column<PayrollRunItem>[] = [
    {
      key: 'employeeCode',
      header: 'CODE',
      render: (i) => <span className="font-mono font-bold text-wt-yellow">[{i.employeeCode}]</span>,
    },
    {
      key: 'employeeName',
      header: 'EMPLOYEE',
      render: (i) => (
        <div>
          <div className="font-bold text-wt-white">{i.employeeName}</div>
          <div className="text-[11px] text-wt-gray">{i.department}</div>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'PRESENT / LOP',
      render: (i) => (
        <span className="font-mono text-xs">
          {i.presentDays} / <span className={i.lopDays > 0 ? 'text-wt-red font-bold' : 'text-wt-gray'}>{i.lopDays} LOP</span>
        </span>
      ),
    },
    {
      key: 'gross',
      header: 'GROSS',
      render: (i) => <span className="font-mono text-xs text-wt-white">₹{i.gross.toLocaleString()}</span>,
    },
    {
      key: 'totalDeductions',
      header: 'DEDUCTIONS',
      render: (i) => <span className="font-mono text-xs text-wt-red">-₹{i.totalDeductions.toLocaleString()}</span>,
    },
    {
      key: 'net',
      header: 'NET PAYOUT',
      render: (i) => <span className="font-mono text-xs font-bold text-wt-yellow">₹{i.net.toLocaleString()}</span>,
    },
    {
      key: 'flags',
      header: 'ANOMALY FLAGS',
      render: (i) =>
        i.flags.length > 0 ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-wt-yellow text-wt-black font-mono text-[10px] font-black border border-wt-black">
            <AlertTriangle className="w-3 h-3" />
            NET Δ &gt; 25%
          </span>
        ) : (
          <span className="text-wt-gray text-[11px] font-mono">NOMINAL</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">COMPENSATION & DISBURSEMENT</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">PAYROLL RUNS</h2>
        </div>
        <Button variant="primary" size="md" onClick={() => setNewRunModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> [ CREATE PAYROLL RUN ]
        </Button>
      </div>

      {/* Runs Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {runs.map((run) => (
          <GlassCard
            key={run.id}
            variant={selectedRun?.id === run.id ? 'yellow' : 'white'}
            hud
            interactive
            onClick={() => setSelectedRun(run)}
            className="p-5 bg-wt-black/95 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-wt-white">{run.periodMonth.slice(0, 7)} RUN</span>
              <Badge status={run.status} size="sm" />
            </div>
            <div className="my-2">
              <div className="font-mono text-3xl font-black text-wt-yellow">₹{(run.totalNet / 100000).toFixed(1)}L</div>
              <div className="text-[11px] font-mono text-wt-gray uppercase">NET PAYOUT · {run.employeeCount} EMPLOYEES</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Active Run Detail View */}
      {selectedRun && (
        <GlassCard variant="yellow" hud className="p-6 bg-wt-black/95 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-wt-white">
            <div>
              <div className="font-mono text-xs text-wt-gray uppercase">ACTIVE WORKFLOW DETAILS</div>
              <h3 className="font-display text-2xl font-black text-wt-white uppercase">
                {selectedRun.periodMonth.slice(0, 7)} PAYROLL EXECUTION
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedRun.status === 'DRAFT' && (
                <Button variant="secondary" size="md" onClick={() => handleSubmitForApproval(selectedRun.id)}>
                  <Send className="w-4 h-4 mr-1.5" /> SUBMIT FOR ADMIN APPROVAL
                </Button>
              )}
              {selectedRun.status === 'SUBMITTED' && (
                <Button variant="primary" size="md" onClick={() => handleApprove(selectedRun.id)}>
                  <Check className="w-4 h-4 mr-1.5" /> APPROVE RUN & GENERATE PAYSLIPS
                </Button>
              )}
              {selectedRun.status === 'APPROVED' && (
                <Button variant="primary" size="md" onClick={() => handlePay(selectedRun.id)}>
                  <Receipt className="w-4 h-4 mr-1.5" /> DISBURSE & MARK PAID
                </Button>
              )}
            </div>
          </div>

          {/* Breakdown Items Table */}
          <Table
            columns={itemColumns}
            data={selectedRun.items}
            keyExtractor={(i) => i.id}
            emptyMessage="ALL 48 SALARY RECORDS AGGREGATED"
          />
        </GlassCard>
      )}

      {/* New Run Modal */}
      <Modal isOpen={newRunModalOpen} onClose={() => setNewRunModalOpen(false)} title="NEW PAYROLL RUN">
        <div className="space-y-4 font-mono text-xs">
          <p className="text-wt-gray uppercase">
            Initialize monthly payroll calculation. Attendance logs will be aggregated, and LOP deductions will be automatically deducted.
          </p>
          <Input
            label="Payroll Month"
            type="month"
            value={newRunMonth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRunMonth(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => setNewRunModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateRun}>
              INITIALIZE DRAFT RUN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

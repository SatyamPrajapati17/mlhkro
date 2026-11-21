import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Table, Column } from '../../components/ui/Table';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Terminal,
  Activity,
  Check
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SIGNALS' | 'AUDIT' | 'INTEGRITY'>('SIGNALS');
  const [signals, setSignals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [chainStatus, setChainStatus] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        fetch('/api/security/signals'),
        fetch('/api/security/audit'),
      ]);
      const sData = await sRes.json();
      const aData = await aRes.json();
      if (sData.success) setSignals(sData.signals);
      if (aData.success) setAuditLogs(aData.logs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/security/audit/verify');
      const data = await res.json();
      setChainStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignalAction = async (id: string, decision: 'REVIEWED' | 'DISMISSED') => {
    try {
      const res = await fetch(`/api/security/signals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const auditColumns: Column<any>[] = [
    {
      key: 'created_at',
      header: 'TIMESTAMP',
      render: (l) => <span className="font-mono text-xs text-wt-white">{new Date(l.created_at).toLocaleTimeString()}</span>,
    },
    {
      key: 'action',
      header: 'ACTION',
      render: (l) => <span className="font-mono font-bold text-wt-yellow">{l.action}</span>,
    },
    {
      key: 'actor_role',
      header: 'ACTOR',
      render: (l) => <Badge status={l.actor_role || 'SYSTEM'} size="sm" />,
    },
    {
      key: 'hash',
      header: 'SHA-256 HASH BLOCK',
      render: (l) => (
        <span className="font-mono text-[11px] text-wt-gray truncate max-w-[200px] inline-block">
          {l.hash}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">// THREAT DETECTION & CRYPTOGRAPHY</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">SECURITY & AUDIT CHAIN</h2>
        </div>
        <Button variant="primary" size="md" onClick={handleVerifyChain} disabled={isVerifying}>
          <ShieldCheck className="w-4 h-4 mr-2" />
          {isVerifying ? 'VERIFYING BLOCKS...' : '[ VERIFY INTEGRITY CHAIN ]'}
        </Button>
      </div>

      {/* Verification Result Banner */}
      {chainStatus && (
        <GlassCard
          variant={chainStatus.intact ? 'yellow' : 'red'}
          hud
          className="p-5 bg-wt-black/95 font-mono text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${chainStatus.intact ? 'bg-wt-yellow text-wt-black' : 'bg-wt-red text-wt-white'} flex items-center justify-center font-bold`}>
              {chainStatus.intact ? <Check className="w-5 h-5 stroke-[3]" /> : '✕'}
            </div>
            <div>
              <div className="font-bold uppercase text-wt-white text-sm">
                {chainStatus.intact ? 'CRYPTOGRAPHIC HASH CHAIN INTACT' : 'CHAIN COMPROMISE DETECTED'}
              </div>
              <div className="text-wt-gray text-[11px] mt-0.5">
                {chainStatus.recordsChecked} consecutive SHA-256 blocks validated back to genesis. Zero tampering detected.
              </div>
            </div>
          </div>
          <Badge status={chainStatus.intact ? 'VERIFIED' : 'REJECTED'} size="md" />
        </GlassCard>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'SIGNALS', label: 'STATISTICAL RISK SIGNALS', count: signals.filter((s) => s.status === 'OPEN').length },
          { id: 'AUDIT', label: 'IMMUTABLE AUDIT LOGS', count: auditLogs.length },
          { id: 'INTEGRITY', label: 'CRYPTOGRAPHIC SPECIFICATION' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Tab: SIGNALS */}
      {activeTab === 'SIGNALS' && (
        <div className="space-y-4">
          {signals.map((sig) => (
            <GlassCard
              key={sig.id}
              variant={sig.severity === 'HIGH' ? 'red' : 'yellow'}
              hud
              className="p-6 bg-wt-black/95 font-mono space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-wt-white/20">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-black px-2 py-0.5 border ${
                      sig.severity === 'HIGH'
                        ? 'border-wt-red bg-wt-red text-wt-black'
                        : 'border-wt-yellow bg-wt-yellow text-wt-black'
                    }`}
                  >
                    // {sig.severity} SEVERITY
                  </span>
                  <span className="font-bold text-wt-white uppercase">{sig.kind}</span>
                </div>
                <Badge status={sig.status} size="sm" />
              </div>

              <div className="text-sm font-bold text-wt-white">
                {sig.employeeName} [{sig.employeeCode}] · {sig.department}
              </div>

              <p className="text-xs text-wt-gray uppercase leading-relaxed">
                {sig.explanation}
              </p>

              {sig.status === 'OPEN' && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => handleSignalAction(sig.id, 'DISMISSED')}>
                    DISMISS SIGNAL
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleSignalAction(sig.id, 'REVIEWED')}>
                    MARK REVIEWED
                  </Button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab: AUDIT */}
      {activeTab === 'AUDIT' && (
        <Table
          columns={auditColumns}
          data={auditLogs}
          keyExtractor={(l) => String(l.id)}
          emptyMessage="AUDIT LOG EMPTY"
        />
      )}

      {/* Tab: INTEGRITY */}
      {activeTab === 'INTEGRITY' && (
        <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95 font-mono text-xs space-y-4">
          <h3 className="font-mono text-base uppercase font-bold text-wt-yellow">
            // SHA-256 HASH CHAINING MATHEMATICAL SPECIFICATION
          </h3>
          <p className="text-wt-gray uppercase leading-relaxed">
            Every critical enterprise mutation (Login, Biometric Enrollment, Attendance Check-In, Leave Approval, Payroll Disbursement, Document Verification) is committed as an immutable block.
          </p>

          <div className="p-4 border-2 border-wt-white bg-wt-black text-wt-yellow font-bold text-xs">
            hash[n] = SHA-256( hash[n-1] || company_id || actor || action || entity || entity_id || metadata || created_at )
          </div>

          <p className="text-wt-gray uppercase">
            Direct database modification by an adversary invalidates the successor hash signatures, flagging exact block-level corruption upon verification.
          </p>
        </GlassCard>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../components/layout/Sidebar';
import { KpiTile } from '../../components/ui/KpiTile';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ScanFace, 
  CalendarDays, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  FileText, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Activity,
  CornerDownRight
} from 'lucide-react';

export interface DashboardPageProps {
  currentRole: UserRole;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentRole }) => {
  const navigate = useNavigate();
  const [quickPrompt, setQuickPrompt] = useState('');

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      navigate('/app/ai', { state: { initialPrompt: quickPrompt } });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header greeting & role banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-wt-white/20">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">ACTIVE TERMINAL</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">
            CONTROL ROOM · <span className="text-wt-yellow">{currentRole}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={currentRole} size="md" />
          <div className="font-mono text-xs text-wt-gray border border-wt-white/30 px-3 py-1 bg-wt-black">
            DATE: 21 NOV 2026
          </div>
        </div>
      </div>

      {/* 2. Role-specific Dashboard Sections */}
      {currentRole === 'EMPLOYEE' && <EmployeeDashboard />}
      {currentRole === 'MANAGER' && <ManagerDashboard />}
      {currentRole === 'HR' && <HrDashboard />}
      {currentRole === 'FINANCE' && <FinanceDashboard />}
      {currentRole === 'ADMIN' && <AdminDashboard />}

      {/* 3. Docked TAK//AI Quick-Ask Bar */}
      <div className="pt-4">
        <GlassCard variant="yellow" hud className="p-4 bg-wt-black/95 border-2 border-wt-yellow shadow-hardYSm">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-wt-yellow" />
            <span className="font-mono text-xs uppercase font-bold text-wt-white">
              TAK AI QUICK-ASK (ROLE SCOPED)
            </span>
          </div>
          <form onSubmit={handleAskAI} className="flex gap-2">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder={
                currentRole === 'EMPLOYEE'
                  ? 'Ask about your leave balance, today\'s shift, or payslip...'
                  : currentRole === 'MANAGER'
                  ? 'Who in my team was late this week? How many leaves pending?'
                  : currentRole === 'FINANCE'
                  ? 'Show payroll breakdown by department for November...'
                  : currentRole === 'HR'
                  ? 'Which employee documents need verification today?'
                  : 'Company overview: headcount, attendance rate, open anomalies...'
              }
              className="flex-1 bg-wt-black border border-wt-white text-wt-white font-mono text-xs px-3 py-2 outline-none focus:border-wt-yellow"
            />
            <Button variant="primary" size="sm" type="submit">
              QUERY <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

/* ---------------- EMPLOYEE DASHBOARD ---------------- */
const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Giant Face Check-in Card */}
        <div className="md:col-span-5">
          <GlassCard variant="red" hud className="h-full flex flex-col justify-between p-6 bg-wt-black/95">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase text-wt-gray font-bold">DAILY ATTENDANCE</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-wt-black text-wt-yellow border border-wt-yellow font-bold">
                  NOT CHECKED IN
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-wt-white uppercase mb-2">
                TODAY'S SHIFT: 09:30 - 18:30
              </h3>
              <p className="font-mono text-xs text-wt-gray uppercase mb-6">
                1:1 Face verification with random liveness challenge.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/app/check-in')}
              className="text-base py-4 font-black"
            >
              <ScanFace className="w-5 h-5 mr-2" />
              START FACE SCAN
            </Button>
          </GlassCard>
        </div>

        {/* Leave Balance & Payslip Tiles */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiTile
            label="LEAVE BALANCE"
            value="19.0"
            subtext="CL: 6.0 | SL: 4.0 | EL: 9.0"
            variant="yellow"
          />
          <KpiTile
            label="LATEST PAYSLIP"
            value="₹78,420"
            subtext="OCT 2026 · GENERATED & PAID"
            variant="white"
          />
          <KpiTile
            label="MONTHLY ATTENDANCE"
            value="94.2%"
            subtext="20 PRESENT · 1 LATE · 0 LOP"
            variant="yellow"
          />
          <KpiTile
            label="MY DOCUMENTS"
            value="2 / 3"
            subtext="PAN: VERIFIED · ADDRESS: PENDING"
            variant="red"
          />
        </div>
      </div>

      {/* Mini Calendar & Onboarding Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard variant="white" hud className="p-5 bg-wt-black/90">
          <div className="font-mono text-xs uppercase font-bold text-wt-yellow mb-3">
            NOVEMBER 2026 ATTENDANCE LOG
          </div>
          <div className="grid grid-cols-7 gap-1 font-mono text-[10px] text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-wt-gray py-1">{d}</div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => {
              const isWeekend = (i % 7 === 5) || (i % 7 === 6);
              const isLate = i === 11;
              const isPresent = i < 21 && !isWeekend && !isLate;
              const isToday = i === 20;

              return (
                <div
                  key={i}
                  className={`h-8 border flex items-center justify-center font-bold ${
                    isToday
                      ? 'border-wt-yellow bg-wt-yellow text-wt-black'
                      : isLate
                      ? 'border-wt-yellow/60 bg-wt-yellow/20 text-wt-yellow'
                      : isPresent
                      ? 'border-wt-white/40 bg-wt-white/10 text-wt-white'
                      : isWeekend
                      ? 'border-transparent text-wt-gray/40'
                      : 'border-wt-white/10 text-wt-gray/30'
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 font-mono text-[10px] text-wt-gray">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-wt-white/30" /> PRESENT</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-wt-yellow" /> LATE / TODAY</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-wt-red" /> ABSENT</span>
          </div>
        </GlassCard>

        <GlassCard variant="yellow" hud className="p-5 bg-wt-black/90">
          <div className="font-mono text-xs uppercase font-bold text-wt-yellow mb-3">
            ONBOARDING & COMPLIANCE CHECKLIST
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 border border-wt-white/30 bg-wt-black">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-wt-yellow" />
                <span>1. FACE ENROLLMENT TEMPLATE</span>
              </span>
              <span className="text-wt-yellow font-bold">128-D READY</span>
            </div>

            <div className="flex items-center justify-between p-2.5 border border-wt-white/30 bg-wt-black">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-wt-yellow" />
                <span>2. PAN CARD VERIFICATION</span>
              </span>
              <span className="text-wt-yellow font-bold">VERIFIED</span>
            </div>

            <div className="flex items-center justify-between p-2.5 border border-wt-white/30 bg-wt-black">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-wt-red" />
                <span>3. ADDRESS PROOF</span>
              </span>
              <span className="text-wt-red font-bold">PENDING REVIEW</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ---------------- MANAGER DASHBOARD ---------------- */
const ManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="TEAM PRESENT" value="12 / 14" subtext="85.7% ON SITE" variant="yellow" />
        <KpiTile label="LATE ARRIVALS" value="2" subtext="EXCEEDED 10 MIN GRACE" variant="red" />
        <KpiTile label="ON LEAVE TODAY" value="1" subtext="CASUAL LEAVE" variant="white" />
        <KpiTile label="PENDING APPROVALS" value="3" subtext="2 LEAVES · 1 MANUAL TIME" variant="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Team Presence Grid */}
        <div className="md:col-span-7">
          <GlassCard variant="yellow" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4 flex items-center justify-between">
              <span>REAL-TIME TEAM PRESENCE (14 MEMBERS)</span>
              <span className="text-wt-yellow font-bold">● LIVE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              {[
                { name: 'Arjun Verma', status: 'PRESENT', time: '09:14' },
                { name: 'Priya Sharma', status: 'PRESENT', time: '09:22' },
                { name: 'Rahul Nair', status: 'LATE', time: '09:47' },
                { name: 'Sneha Patel', status: 'PRESENT', time: '09:18' },
                { name: 'Vikram Joshi', status: 'ON_LEAVE', time: 'FULL DAY' },
                { name: 'Ananya Roy', status: 'PRESENT', time: '09:25' },
              ].map((m, idx) => (
                <div key={idx} className="p-3 border-2 border-wt-white bg-wt-black flex flex-col justify-between">
                  <div className="font-bold text-wt-white truncate">{m.name}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-wt-white/10">
                    <span className="text-[10px] text-wt-gray">{m.time}</span>
                    <Badge status={m.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Approvals Action Queue */}
        <div className="md:col-span-5">
          <GlassCard variant="red" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4">
              PENDING TEAM APPROVALS (3)
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 border-2 border-wt-white bg-wt-black space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Rahul Nair</span>
                  <span className="text-wt-yellow">CASUAL LEAVE</span>
                </div>
                <div className="text-[11px] text-wt-gray">24 Nov - 25 Nov (2 days) · Balance: 4.0</div>
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" size="sm" className="flex-1 py-1 text-[11px]">APPROVE</Button>
                  <Button variant="danger" size="sm" className="flex-1 py-1 text-[11px]">REJECT</Button>
                </div>
              </div>

              <div className="p-3 border-2 border-wt-white bg-wt-black space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Priya Sharma</span>
                  <span className="text-wt-white">MANUAL TIME PENDING</span>
                </div>
                <div className="text-[11px] text-wt-gray">Yesterday 18:45 · Reason: Client meeting</div>
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" size="sm" className="flex-1 py-1 text-[11px]">ACCEPT</Button>
                  <Button variant="danger" size="sm" className="flex-1 py-1 text-[11px]">DISMISS</Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

/* ---------------- HR DASHBOARD ---------------- */
const HrDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="HEADCOUNT" value="48" subtext="ALL ACTIVE EMPLOYEES" variant="yellow" />
        <KpiTile label="PRESENT TODAY" value="42" subtext="87.5% ON-TIME RATE" variant="white" />
        <KpiTile label="PENDING LEAVES" value="4" subtext="AWAITING APPROVAL" variant="yellow" />
        <KpiTile label="DOCS TO VERIFY" value="3" subtext="AI EXTRACTED QUEUE" variant="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Verification Queue (AI Extracted) */}
        <div className="md:col-span-6">
          <GlassCard variant="yellow" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4 flex items-center justify-between">
              <span>DOCUMENT VERIFICATION QUEUE (3)</span>
              <span className="text-wt-yellow">CONFIDENCE &gt; 95%</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {[
                { name: 'Karan Mehra', doc: 'PAN CARD', num: 'XXXXXX4812', match: '98%' },
                { name: 'Siddharth Rao', doc: 'ADDRESS PROOF', num: 'XXXXXX9901', match: '94%' },
                { name: 'Meera Iyer', doc: 'OFFER LETTER', num: 'SIGNED', match: '99%' },
              ].map((doc, idx) => (
                <div key={idx} className="p-3 border-2 border-wt-white bg-wt-black flex items-center justify-between">
                  <div>
                    <div className="font-bold text-wt-white">{doc.name}</div>
                    <div className="text-[11px] text-wt-gray">{doc.doc} · {doc.num}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-wt-yellow border border-wt-yellow px-1 font-bold">{doc.match}</span>
                    <Button variant="primary" size="sm" className="text-[11px] py-1">REVIEW</Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Face Enrollment Completion Bar & New Joiners */}
        <div className="md:col-span-6">
          <GlassCard variant="red" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4">
              FACE ENROLLMENT HEALTH
            </div>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>COMPANY ADOPTION RATE</span>
                  <span className="text-wt-yellow font-bold">45 / 48 (93.7%)</span>
                </div>
                <div className="w-full h-3 bg-wt-black border-2 border-wt-white">
                  <div className="h-full bg-wt-yellow w-[93.7%]" />
                </div>
              </div>

              <div className="p-3 border-2 border-wt-white bg-wt-black space-y-1">
                <div className="font-bold text-wt-white">PENDING FACE ENROLLMENTS:</div>
                <div className="text-wt-gray text-[11px]">• Karan Mehra (Joined yesterday)</div>
                <div className="text-wt-gray text-[11px]">• Neha Kapoor (Remote engineer)</div>
                <div className="text-wt-gray text-[11px]">• Tanmay Sen (IT Specialist)</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

/* ---------------- FINANCE DASHBOARD ---------------- */
const FinanceDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="NET THIS MONTH" value="₹34.8L" subtext="NOV 2026 PROJECTED" variant="yellow" />
        <KpiTile label="TOTAL GROSS" value="₹38.2L" subtext="BEFORE TAX & LOP" variant="white" />
        <KpiTile label="RUN STATUS" value="DRAFT" subtext="FINANCE PREPARING" variant="red" />
        <KpiTile label="PAYROLL FLAGS" value="1" subtext="NET DELTA > 25%" variant="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <GlassCard variant="yellow" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4">
              PAYROLL COST BY DEPARTMENT (NOV 2026)
            </div>
            <div className="space-y-3 font-mono text-xs">
              {[
                { dept: 'ENGINEERING', cost: '₹18,40,000', pct: '52%' },
                { dept: 'PRODUCT', cost: '₹6,80,000', pct: '20%' },
                { dept: 'OPERATIONS', cost: '₹4,50,000', pct: '13%' },
                { dept: 'FINANCE & HR', cost: '₹5,10,000', pct: '15%' },
              ].map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-wt-white">{d.dept}</span>
                    <span className="text-wt-yellow">{d.cost} ({d.pct})</span>
                  </div>
                  <div className="w-full h-2 bg-wt-black border border-wt-white/30">
                    <div className="h-full bg-wt-yellow" style={{ width: d.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="md:col-span-5">
          <GlassCard variant="red" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4">
              PAYROLL ACTION REQUIRED
            </div>
            <div className="p-4 border-2 border-wt-white bg-wt-black space-y-3 font-mono text-xs">
              <div className="text-wt-yellow font-bold">WORKFLOW STAGE: DRAFT → REVIEW</div>
              <p className="text-wt-gray text-[11px]">
                Attendance records aggregated. LOP deductions computed for 3 employees. 1 anomaly detected (Rahul Nair net pay increased 28% due to bonus).
              </p>
              <Button variant="primary" size="md" fullWidth>
                SUBMIT RUN FOR ADMIN APPROVAL
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

/* ---------------- ADMIN DASHBOARD ---------------- */
const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="HEADCOUNT" value="48" subtext="TOTAL EMPLOYEES" variant="yellow" />
        <KpiTile label="PRESENT TODAY" value="42" subtext="87.5% ON TIME" variant="white" />
        <KpiTile label="PAYROLL COST" value="₹34.8L" subtext="DRAFT AWAITING APPROVAL" variant="red" />
        <KpiTile label="RISK SIGNALS" value="2" subtext="1 HIGH · 1 MEDIUM" variant="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Approvals Needing Admin */}
        <div className="md:col-span-6">
          <GlassCard variant="red" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4">
              EXECUTIVE APPROVALS NEEDED
            </div>
            <div className="p-4 border-2 border-wt-white bg-wt-black font-mono text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-wt-white">NOVEMBER 2026 PAYROLL RUN</span>
                <span className="text-wt-yellow border border-wt-yellow px-1 font-bold">DRAFT</span>
              </div>
              <div className="text-[11px] text-wt-gray">
                Total Net: ₹34,80,000 · 48 Employees · Prepared by Finance
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" className="flex-1">
                  APPROVE RUN & GENERATE PAYSLIPS
                </Button>
                <Button variant="secondary" size="sm">
                  REVIEW
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Cryptographic Audit Stream */}
        <div className="md:col-span-6">
          <GlassCard variant="yellow" hud className="p-5 bg-wt-black/95">
            <div className="font-mono text-xs uppercase font-bold text-wt-white mb-4 flex items-center justify-between">
              <span>IMMUTABLE AUDIT STREAM</span>
              <span className="text-wt-yellow font-bold">CHAIN INTACT</span>
            </div>
            <div className="space-y-2 font-mono text-[11px] text-wt-gray">
              <div className="p-2 border border-wt-white/20 bg-wt-black flex justify-between">
                <span className="text-wt-white">13:12:04 LOGIN (GOOGLE OAUTH)</span>
                <span className="text-wt-yellow font-bold">ADMIN #491</span>
              </div>
              <div className="p-2 border border-wt-white/20 bg-wt-black flex justify-between">
                <span className="text-wt-white">12:45:10 PAYROLL_DRAFT_GENERATED</span>
                <span className="text-wt-white">FINANCE #490</span>
              </div>
              <div className="p-2 border border-wt-white/20 bg-wt-black flex justify-between">
                <span className="text-wt-white">11:30:22 FACE_VERIFIED (09:14 ON_TIME)</span>
                <span className="text-wt-white">EMP #489</span>
              </div>
              <div className="p-2 border border-wt-white/20 bg-wt-black flex justify-between">
                <span className="text-wt-white">09:12:05 AI_TOOL_CALL: get_attendance</span>
                <span className="text-wt-yellow">AI #488</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

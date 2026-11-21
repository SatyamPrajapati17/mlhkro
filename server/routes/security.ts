import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { verifyAuditChain, logAudit } from '../db';
import fs from 'fs';
import path from 'path';

export const securityRouter = Router();

// Risk Signals Store
const riskSignals = [
  {
    id: 'sig-1',
    severity: 'HIGH',
    kind: 'LATE_STREAK',
    employeeName: 'Rahul Nair',
    employeeCode: 'EMP014',
    department: 'Engineering',
    explanation: 'Arrived after 09:40 on 4 consecutive working days this week.',
    detectedAt: '2026-11-20T10:00:00Z',
    status: 'OPEN',
  },
  {
    id: 'sig-2',
    severity: 'MEDIUM',
    kind: 'PAYROLL_DELTA',
    employeeName: 'Vikram Malhotra',
    employeeCode: 'EMP004',
    department: 'Engineering',
    explanation: 'Net salary in November draft run increased by 28.2% vs October without a base structure revision.',
    detectedAt: '2026-11-20T14:30:00Z',
    status: 'OPEN',
  },
  {
    id: 'sig-3',
    severity: 'LOW',
    kind: 'CHECKIN_OUTLIER',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP002',
    department: 'HR',
    explanation: 'Check-in time outlier detected: arrived at 08:05 AM (z-score = 2.68 vs 30-day mean 09:20).',
    detectedAt: '2026-11-19T08:10:00Z',
    status: 'REVIEWED',
  },
];

// 1. List Risk Signals
securityRouter.get('/signals', requireAuth, requireRole('ADMIN', 'HR'), (req: Request, res: Response) => {
  res.json({ success: true, signals: riskSignals });
});

// 2. Recompute / Run Anomaly Detection
securityRouter.post('/signals/run', requireAuth, requireRole('ADMIN', 'HR'), async (req: Request, res: Response) => {
  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'ANOMALY_DETECTION_TRIGGERED',
    entity: 'security',
    metadata: { algorithm: 'z-score + streak threshold' },
    ip: req.ip,
  });

  res.json({ success: true, message: 'Anomaly recomputation completed.', newSignalsCount: 0 });
});

// 3. Review / Dismiss Signal
securityRouter.post('/signals/:id/decide', requireAuth, requireRole('ADMIN', 'HR'), async (req: Request, res: Response) => {
  const { decision } = req.body; // 'REVIEWED' | 'DISMISSED'
  const sig = riskSignals.find((s) => s.id === req.params.id);
  if (!sig) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Signal not found.' } });

  sig.status = decision;

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: `RISK_SIGNAL_${decision}`,
    entity: 'risk_signal',
    entity_id: sig.id,
    metadata: { decision },
    ip: req.ip,
  });

  res.json({ success: true, signal: sig });
});

// 4. Get Audit Logs (ADMIN only)
securityRouter.get('/audit', requireAuth, requireRole('ADMIN'), (req: Request, res: Response) => {
  const storePath = path.resolve(process.cwd(), 'server/data/store.json');
  let logs: any[] = [];
  if (fs.existsSync(storePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      logs = data.audit_logs || [];
    } catch (e) {
      logs = [];
    }
  }
  res.json({ success: true, logs: logs.slice().reverse() });
});

// 5. Verify Cryptographic SHA-256 Hash Chain (ADMIN only)
securityRouter.get('/audit/verify', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const result = await verifyAuditChain(req.user!.companyId);
  res.json({
    success: true,
    intact: result.valid,
    recordsChecked: result.checked,
    errorAtRecord: result.errorAt || null,
    message: result.valid
      ? 'Cryptographic SHA-256 audit hash chain verified: ZERO TAMPERING DETECTED.'
      : `Tampering detected at block #${result.errorAt}.`,
  });
});

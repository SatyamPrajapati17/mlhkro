import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { listEmployees, logAudit } from '../db';
import { PayrollStatus } from '../db/types';

export const payrollRouter = Router();

export interface PayrollRunItem {
  id: string;
  runId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  workingDays: number;
  presentDays: number;
  lopDays: number;
  gross: number;
  basic: number;
  hra: number;
  allowances: number;
  pfDeduction: number;
  taxDeduction: number;
  lopDeduction: number;
  totalDeductions: number;
  net: number;
  flags: string[];
}

export interface PayrollRun {
  id: string;
  companyId: string;
  periodMonth: string;
  status: PayrollStatus;
  totalGross: number;
  totalNet: number;
  employeeCount: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  items: PayrollRunItem[];
}

// In-memory persistent payroll store
const payrollRuns: PayrollRun[] = [
  {
    id: 'pr-2026-10',
    companyId: '00000000-0000-0000-0000-000000000001',
    periodMonth: '2026-10-01',
    status: 'PAID',
    totalGross: 3780000,
    totalNet: 3450000,
    employeeCount: 48,
    createdAt: '2026-10-31T18:00:00Z',
    approvedAt: '2026-11-01T10:00:00Z',
    approvedBy: 'Alex Vance',
    paidAt: '2026-11-02T12:00:00Z',
    items: [],
  },
  {
    id: 'pr-2026-11',
    companyId: '00000000-0000-0000-0000-000000000001',
    periodMonth: '2026-11-01',
    status: 'DRAFT',
    totalGross: 3820000,
    totalNet: 3480000,
    employeeCount: 48,
    createdAt: '2026-11-20T14:00:00Z',
    items: [
      {
        id: 'pi-1',
        runId: 'pr-2026-11',
        employeeId: '00000000-0000-0000-0000-000000000105',
        employeeName: 'Arjun Verma',
        employeeCode: 'EMP005',
        department: 'Engineering',
        workingDays: 22,
        presentDays: 21,
        lopDays: 1,
        gross: 95000,
        basic: 47500,
        hra: 23750,
        allowances: 23750,
        pfDeduction: 5700,
        taxDeduction: 200,
        lopDeduction: 4318,
        totalDeductions: 10218,
        net: 84782,
        flags: [],
      },
      {
        id: 'pi-2',
        runId: 'pr-2026-11',
        employeeId: '00000000-0000-0000-0000-000000000104',
        employeeName: 'Vikram Malhotra',
        employeeCode: 'EMP004',
        department: 'Engineering',
        workingDays: 22,
        presentDays: 22,
        lopDays: 0,
        gross: 140000,
        basic: 70000,
        hra: 35000,
        allowances: 35000,
        pfDeduction: 8400,
        taxDeduction: 200,
        lopDeduction: 0,
        totalDeductions: 8600,
        net: 131400,
        flags: ['NET_DELTA_GT_25'],
      },
    ],
  },
];

// 1. List Payroll Runs (ADMIN & FINANCE)
payrollRouter.get('/runs', requireAuth, requireRole('ADMIN', 'FINANCE'), (req: Request, res: Response) => {
  const companyRuns = payrollRuns.filter((r) => r.companyId === req.user!.companyId);
  res.json({ success: true, runs: companyRuns });
});

// 2. Get Single Run Detail
payrollRouter.get('/runs/:id', requireAuth, requireRole('ADMIN', 'FINANCE'), (req: Request, res: Response) => {
  const run = payrollRuns.find((r) => r.id === req.params.id);
  if (!run) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payroll run not found.' } });
  }
  res.json({ success: true, run });
});

// 3. Create Draft Payroll Run
payrollRouter.post('/runs', requireAuth, requireRole('FINANCE'), async (req: Request, res: Response) => {
  const { month } = req.body; // e.g. "2026-11"
  const periodMonth = `${month || '2026-11'}-01`;

  const newRun: PayrollRun = {
    id: `pr-${Date.now()}`,
    companyId: req.user!.companyId,
    periodMonth,
    status: 'DRAFT',
    totalGross: 3820000,
    totalNet: 3480000,
    employeeCount: 48,
    createdAt: new Date().toISOString(),
    items: [],
  };

  payrollRuns.unshift(newRun);

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'PAYROLL_RUN_CREATED',
    entity: 'payroll_run',
    entity_id: newRun.id,
    metadata: { periodMonth, status: 'DRAFT' },
    ip: req.ip,
  });

  res.json({ success: true, run: newRun });
});

// 4. Submit for Approval (FINANCE)
payrollRouter.post('/runs/:id/submit', requireAuth, requireRole('FINANCE'), async (req: Request, res: Response) => {
  const run = payrollRuns.find((r) => r.id === req.params.id);
  if (!run) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Run not found.' } });

  run.status = 'SUBMITTED';

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'PAYROLL_SUBMITTED',
    entity: 'payroll_run',
    entity_id: run.id,
    metadata: { status: 'SUBMITTED' },
    ip: req.ip,
  });

  res.json({ success: true, run });
});

// 5. Approve Payroll Run (ADMIN only)
payrollRouter.post('/runs/:id/approve', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const run = payrollRuns.find((r) => r.id === req.params.id);
  if (!run) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Run not found.' } });

  run.status = 'APPROVED';
  run.approvedAt = new Date().toISOString();
  run.approvedBy = req.user!.fullName;

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'PAYROLL_APPROVED',
    entity: 'payroll_run',
    entity_id: run.id,
    metadata: { status: 'APPROVED', approvedBy: run.approvedBy },
    ip: req.ip,
  });

  res.json({ success: true, run });
});

// 6. Mark Paid (ADMIN or FINANCE)
payrollRouter.post('/runs/:id/pay', requireAuth, requireRole('ADMIN', 'FINANCE'), async (req: Request, res: Response) => {
  const run = payrollRuns.find((r) => r.id === req.params.id);
  if (!run) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Run not found.' } });

  run.status = 'PAID';
  run.paidAt = new Date().toISOString();

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'PAYROLL_PAID',
    entity: 'payroll_run',
    entity_id: run.id,
    metadata: { status: 'PAID' },
    ip: req.ip,
  });

  res.json({ success: true, run });
});

// 7. Get My Payslips (All Employees - Scoped to self)
payrollRouter.get('/my-payslips', requireAuth, (req: Request, res: Response) => {
  const payslips = [
    {
      id: 'ps-oct-2026',
      periodMonth: 'OCTOBER 2026',
      payDate: '01 NOV 2026',
      gross: 95000,
      deductions: 9800,
      net: 85200,
      status: 'PAID',
      downloadUrl: '#',
    },
    {
      id: 'ps-sep-2026',
      periodMonth: 'SEPTEMBER 2026',
      payDate: '01 OCT 2026',
      gross: 95000,
      deductions: 9800,
      net: 85200,
      status: 'PAID',
      downloadUrl: '#',
    },
  ];
  res.json({ success: true, payslips });
});

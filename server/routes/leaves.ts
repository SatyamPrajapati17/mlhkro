import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { logAudit } from '../db';
import { LeaveRequest, LeaveBalance, LeaveType, RequestStatus } from '../db/types';

export const leavesRouter = Router();

// In-memory / persistent leaves store
const leaveTypes: LeaveType[] = [
  { id: 'lt-1', company_id: '00000000-0000-0000-0000-000000000001', code: 'CL', name: 'Casual Leave', annual_quota: 12, is_paid: true },
  { id: 'lt-2', company_id: '00000000-0000-0000-0000-000000000001', code: 'SL', name: 'Sick Leave', annual_quota: 10, is_paid: true },
  { id: 'lt-3', company_id: '00000000-0000-0000-0000-000000000001', code: 'EL', name: 'Earned Leave', annual_quota: 15, is_paid: true },
  { id: 'lt-4', company_id: '00000000-0000-0000-0000-000000000001', code: 'UL', name: 'Unpaid Leave', annual_quota: 0, is_paid: false },
];

const leaveBalances: Map<string, Record<string, { allocated: number; used: number }>> = new Map();

// Helper to get employee balances
function getOrCreateBalances(employeeId: string) {
  if (!leaveBalances.has(employeeId)) {
    leaveBalances.set(employeeId, {
      CL: { allocated: 12, used: 2 },
      SL: { allocated: 10, used: 1 },
      EL: { allocated: 15, used: 3 },
      UL: { allocated: 0, used: 0 },
    });
  }
  return leaveBalances.get(employeeId)!;
}

const leaveRequests: Array<LeaveRequest & { employeeName: string; leaveTypeCode: string }> = [
  {
    id: 'lr-1',
    company_id: '00000000-0000-0000-0000-000000000001',
    employee_id: '00000000-0000-0000-0000-000000000105',
    employeeName: 'Arjun Verma',
    leave_type_id: 'lt-1',
    leaveTypeCode: 'CL',
    from_date: '2026-11-26',
    to_date: '2026-11-27',
    half_day: false,
    days: 2,
    reason: 'Family event out of town',
    status: 'PENDING',
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: 'lr-2',
    company_id: '00000000-0000-0000-0000-000000000001',
    employee_id: '00000000-0000-0000-0000-000000000104',
    employeeName: 'Vikram Malhotra',
    leave_type_id: 'lt-2',
    leaveTypeCode: 'SL',
    from_date: '2026-11-15',
    to_date: '2026-11-15',
    half_day: true,
    days: 0.5,
    reason: 'Medical checkup',
    status: 'APPROVED',
    decided_by: 'Alex Vance',
    decided_at: '2026-11-15T11:00:00Z',
    created_at: '2026-11-14T09:00:00Z',
  },
];

// 1. Get Leave Balances & Types
leavesRouter.get('/balances', requireAuth, (req: Request, res: Response) => {
  const employeeId = req.query.employeeId ? (req.query.employeeId as string) : req.user!.userId;
  const balances = getOrCreateBalances(employeeId);
  res.json({ success: true, balances, leaveTypes });
});

// 2. List Leave Requests (Role Scoped)
leavesRouter.get('/requests', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  let requests = leaveRequests.filter((r) => r.company_id === user.companyId);

  if (user.role === 'EMPLOYEE') {
    requests = requests.filter((r) => r.employee_id === user.userId);
  } else if (user.role === 'MANAGER') {
    // Sees own + team
    requests = requests;
  }

  res.json({ success: true, requests });
});

// 3. Apply Leave Request
const ApplyLeaveSchema = z.object({
  leaveTypeCode: z.enum(['CL', 'SL', 'EL', 'UL']),
  fromDate: z.string(),
  toDate: z.string(),
  halfDay: z.boolean().default(false),
  reason: z.string().min(3),
});

leavesRouter.post('/apply', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = ApplyLeaveSchema.parse(req.body);
    const from = new Date(body.fromDate);
    const to = new Date(body.toDate);

    if (to < from) {
      return res.status(400).json({ error: { code: 'INVALID_DATES', message: 'To date must be on or after From date.' } });
    }

    // Compute working days (excluding weekends)
    let days = 0;
    const cur = new Date(from);
    while (cur <= to) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        days += 1;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (body.halfDay) {
      days = Math.max(0.5, days * 0.5);
    }

    if (days === 0) {
      return res.status(400).json({ error: { code: 'ZERO_DAYS', message: 'Selected date range contains only weekends.' } });
    }

    // Check balance if not UNPAID
    const balances = getOrCreateBalances(req.user!.userId);
    const current = balances[body.leaveTypeCode];
    if (body.leaveTypeCode !== 'UL' && current && current.used + days > current.allocated) {
      return res.status(400).json({
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient ${body.leaveTypeCode} balance. Remaining: ${current.allocated - current.used} days, Requested: ${days} days.`,
        },
      });
    }

    const typeObj = leaveTypes.find((lt) => lt.code === body.leaveTypeCode);

    const newReq = {
      id: `lr-${Date.now()}`,
      company_id: req.user!.companyId,
      employee_id: req.user!.userId,
      employeeName: req.user!.fullName || 'Employee',
      leave_type_id: typeObj ? typeObj.id : 'lt-1',
      leaveTypeCode: body.leaveTypeCode,
      from_date: body.fromDate,
      to_date: body.toDate,
      half_day: body.halfDay,
      days,
      reason: body.reason,
      status: 'PENDING' as RequestStatus,
      created_at: new Date().toISOString(),
    };

    leaveRequests.unshift(newReq);

    await logAudit({
      company_id: req.user!.companyId,
      actor_user_id: req.user!.userId,
      actor_role: req.user!.role,
      action: 'LEAVE_APPLIED',
      entity: 'leave_request',
      entity_id: newReq.id,
      metadata: { type: body.leaveTypeCode, days, from: body.fromDate, to: body.toDate },
      ip: req.ip,
    });

    res.json({ success: true, request: newReq });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'LEAVE_APPLY_FAILED', message: err.message } });
  }
});

// 4. Decide Leave Request (Manager / HR / Admin)
leavesRouter.post('/requests/:id/decide', requireAuth, async (req: Request, res: Response) => {
  const { decision, note } = req.body; // 'APPROVED' or 'REJECTED'
  const requestId = req.params.id;

  if (req.user!.role !== 'ADMIN' && req.user!.role !== 'HR' && req.user!.role !== 'MANAGER') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized to decide leaves.' } });
  }

  const request = leaveRequests.find((r) => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Leave request not found.' } });
  }

  request.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  request.decided_by = req.user!.fullName;
  request.decided_at = new Date().toISOString();
  request.decision_note = note || undefined;

  // If approved, decrement balance
  if (decision === 'APPROVED') {
    const balances = getOrCreateBalances(request.employee_id);
    if (balances[request.leaveTypeCode]) {
      balances[request.leaveTypeCode].used += request.days;
    }
  }

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: `LEAVE_${decision}`,
    entity: 'leave_request',
    entity_id: requestId,
    metadata: { decision, note, employeeId: request.employee_id },
    ip: req.ip,
  });

  res.json({ success: true, request });
});

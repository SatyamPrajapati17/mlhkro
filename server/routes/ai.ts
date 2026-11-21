import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { logAudit, listEmployees, getCompany } from '../db';

export const aiRouter = Router();

// Whitelisted Tools Execution Engine
async function executeTool(toolName: string, args: any, user: any): Promise<any> {
  switch (toolName) {
    case 'get_headcount':
      if (user.role === 'EMPLOYEE') {
        return { error: 'Permission denied: Employees cannot view company-wide headcount.' };
      }
      return { totalHeadcount: 48, active: 47, onLeave: 1, departments: { Engineering: 24, Product: 8, HR: 4, Finance: 6, Operations: 6 } };

    case 'get_attendance_summary':
      if (user.role === 'EMPLOYEE') {
        return { employeeId: user.userId, month: 'Nov 2026', presentDays: 20, lateDays: 1, absentDays: 0, attendanceRate: '95.2%' };
      }
      return {
        month: 'Nov 2026',
        totalWorkingDays: 21,
        averageAttendanceRate: '93.8%',
        presentToday: 42,
        lateToday: 3,
        absentToday: 2,
        onLeaveToday: 1,
      };

    case 'get_late_comers':
      if (user.role === 'EMPLOYEE') {
        return { error: 'Permission denied: Employees cannot query late arrivals across the company.' };
      }
      return {
        month: 'Nov 2026',
        lateStreakEmployees: [
          { name: 'Rahul Nair', lateCount: 4, department: 'Engineering' },
          { name: 'Siddharth Rao', lateCount: 3, department: 'Product' },
        ],
      };

    case 'get_leave_balance':
      return {
        employeeName: user.fullName,
        balances: { CasualLeave: '6.0 remaining of 12.0', SickLeave: '4.0 remaining of 10.0', EarnedLeave: '9.0 remaining of 15.0', UnpaidLeave: '0 used' },
      };

    case 'get_pending_leaves':
      if (user.role === 'EMPLOYEE') {
        return { pendingLeaves: [{ from: '2026-11-26', to: '2026-11-27', type: 'Casual Leave', days: 2, status: 'PENDING' }] };
      }
      return {
        pendingCount: 2,
        requests: [
          { employeeName: 'Arjun Verma', type: 'Casual Leave', days: 2, dates: '26 Nov - 27 Nov 2026' },
          { employeeName: 'Sneha Patel', type: 'Sick Leave', days: 1, dates: '22 Nov 2026' },
        ],
      };

    case 'get_payroll_summary':
      if (user.role === 'EMPLOYEE') {
        return { error: 'Permission denied: Employees cannot access corporate payroll data.' };
      }
      if (user.role !== 'ADMIN' && user.role !== 'FINANCE') {
        return { error: 'Permission denied: Only Admin and Finance roles can view company payroll.' };
      }
      return {
        month: 'November 2026',
        status: 'DRAFT',
        grossPayout: '₹38,20,000',
        netPayout: '₹34,80,000',
        totalDeductions: '₹3,40,000',
        employeeCount: 48,
      };

    case 'get_payroll_by_department':
      if (user.role !== 'ADMIN' && user.role !== 'FINANCE') {
        return { error: 'Permission denied: Department payroll breakdown is restricted to Finance & Admin.' };
      }
      return {
        month: 'November 2026',
        Engineering: '₹18,40,000 (52%)',
        Product: '₹6,80,000 (20%)',
        Finance_and_HR: '₹5,10,000 (15%)',
        Operations: '₹4,50,000 (13%)',
      };

    case 'get_risk_signals':
      if (user.role !== 'ADMIN' && user.role !== 'HR') {
        return { error: 'Permission denied: Risk signals are restricted to Admin and HR.' };
      }
      return {
        openSignals: [
          { severity: 'HIGH', kind: 'LATE_STREAK', message: 'Rahul Nair arrived late 4 times in the past 5 work days.' },
          { severity: 'MEDIUM', kind: 'PAYROLL_DELTA', message: 'Vikram Malhotra net salary changed >25% due to incentive bonus.' },
        ],
      };

    case 'get_my_profile':
      return {
        id: user.userId,
        name: user.fullName,
        email: user.email,
        role: user.role,
        company: 'WorkTak Enterprise Demo',
        shift: 'General Shift (09:30 - 18:30)',
      };

    default:
      return { error: `Tool ${toolName} not found in whitelist.` };
  }
}

// 1. TAK//AI Chat Assistant
aiRouter.post('/chat', requireAuth, async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: { code: 'PROMPT_REQUIRED', message: 'Prompt must be provided.' } });
  }

  const user = req.user!;
  const lowerPrompt = prompt.toLowerCase();

  // Safety & Permission Guard: Check if Employee asks for company-wide secrets
  const isEmployeeAskingPayroll =
    user.role === 'EMPLOYEE' && (lowerPrompt.includes('payroll') || lowerPrompt.includes('salary of') || lowerPrompt.includes('cost'));
  const isEmployeeAskingAllLate =
    user.role === 'EMPLOYEE' && (lowerPrompt.includes('who was late') || lowerPrompt.includes('late comers'));

  if (isEmployeeAskingPayroll) {
    return res.json({
      success: true,
      role: 'assistant',
      content: `I cannot fulfill this request. As an EMPLOYEE, your permissions are restricted to your own personal records. I am happy to show your personal leave balance, today's check-in status, or your latest payslip summary.`,
      sources: ['RBAC Guard · Strict Policy'],
      toolsUsed: [],
    });
  }

  if (isEmployeeAskingAllLate) {
    return res.json({
      success: true,
      role: 'assistant',
      content: `I cannot display other employees' attendance details to an EMPLOYEE account. You may view your own attendance record and punctuality score under My Attendance.`,
      sources: ['RBAC Guard · Row-Level Security'],
      toolsUsed: [],
    });
  }

  // Determine which whitelisted tool to invoke based on prompt
  let toolToCall = 'get_my_profile';
  let sources: string[] = [];

  if (lowerPrompt.includes('headcount') || lowerPrompt.includes('how many employees')) {
    toolToCall = 'get_headcount';
    sources = ['get_headcount · Nov 2026 Directory'];
  } else if (lowerPrompt.includes('late') || lowerPrompt.includes('late 3') || lowerPrompt.includes('punctual')) {
    toolToCall = 'get_late_comers';
    sources = ['get_late_comers · Attendance Logs'];
  } else if (lowerPrompt.includes('leave') || lowerPrompt.includes('balance') || lowerPrompt.includes('vacation')) {
    toolToCall = 'get_leave_balance';
    sources = ['get_leave_balance · HR Quotas 2026'];
  } else if (lowerPrompt.includes('payroll by department') || lowerPrompt.includes('department cost')) {
    toolToCall = 'get_payroll_by_department';
    sources = ['get_payroll_by_department · Finance Ledger'];
  } else if (lowerPrompt.includes('payroll') || lowerPrompt.includes('cost') || lowerPrompt.includes('salary')) {
    toolToCall = 'get_payroll_summary';
    sources = ['get_payroll_summary · Payroll Runs'];
  } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('anomaly') || lowerPrompt.includes('signals')) {
    toolToCall = 'get_risk_signals';
    sources = ['get_risk_signals · Statistical Anomaly Service'];
  } else if (lowerPrompt.includes('attendance') || lowerPrompt.includes('present') || lowerPrompt.includes('today')) {
    toolToCall = 'get_attendance_summary';
    sources = ['get_attendance_summary · Realtime Biometric Logs'];
  }

  // Execute Tool under user permission
  const toolResult = await executeTool(toolToCall, {}, user);

  // If Gemini API key is available, generate dynamic response; otherwise format tool output deterministically
  let answer = '';
  const apiKey = process.env.LLM_API_KEY;

  if (apiKey && apiKey.length > 10) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are WorkTak AI, an enterprise management assistant in WorkTak.
Current User Role: ${user.role}
Current User Name: ${user.fullName}
Tool Called: ${toolToCall}
Tool Data Output (CRITICAL: Every number in your answer MUST strictly match this output. Do not hallucinate numbers):
${JSON.stringify(toolResult, null, 2)}

User Prompt: "${prompt}"

Answer the user concisely and directly in professional brutalist corporate tone. Cite the figures accurately from the Tool Data Output.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const geminiData = await geminiRes.json();
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
        answer = geminiData.candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.warn('Gemini API call fell back to deterministic tool formatter:', e);
    }
  }

  // Fallback deterministic response generator
  if (!answer) {
    if (toolToCall === 'get_late_comers') {
      answer = `Based on attendance records for November 2026, **2 employees** were late 3 or more times:\n\n• **Rahul Nair** (Engineering) — 4 late arrivals\n• **Siddharth Rao** (Product) — 3 late arrivals\n\nAll arrivals exceeded the 10-minute grace window past 09:30.`;
    } else if (toolToCall === 'get_payroll_summary') {
      answer = `The **November 2026 Payroll Run** is currently in **DRAFT** status:\n\n• **Total Gross:** ₹38,20,000\n• **Total Net Payout:** ₹34,80,000\n• **Deductions (PF, PT & LOP):** ₹3,40,000\n• **Covered Employees:** 48\n\nAwaiting Admin approval before payslip disbursement.`;
    } else if (toolToCall === 'get_payroll_by_department') {
      answer = `Here is the payroll cost breakdown by department for November 2026:\n\n• **Engineering:** ₹18,40,000 (52%)\n• **Product:** ₹6,80,000 (20%)\n• **Finance & HR:** ₹5,10,000 (15%)\n• **Operations:** ₹4,50,000 (13%)\n\nTotal Net: ₹34,80,000.`;
    } else if (toolToCall === 'get_leave_balance') {
      answer = `Hello ${user.fullName}, here are your remaining leave quotas for 2026:\n\n• **Casual Leave (CL):** 6.0 days remaining (of 12.0 allocated)\n• **Sick Leave (SL):** 4.0 days remaining (of 10.0 allocated)\n• **Earned Leave (EL):** 9.0 days remaining (of 15.0 allocated)\n• **Unpaid Leave (UL):** 0 days taken\n\nYou have **19.0 total paid days** available.`;
    } else if (toolToCall === 'get_headcount') {
      answer = `Current active company headcount is **48 employees** across 4 departments:\n\n• Engineering: 24\n• Product: 8\n• Finance: 6\n• Operations: 6\n• Human Resources: 4\n\n47 are active on site / remote, 1 on approved leave.`;
    } else if (toolToCall === 'get_risk_signals') {
      answer = `The statistical anomaly detector has flagged **2 active risk signals**:\n\n1. **[HIGH] Late Streak:** Rahul Nair has arrived late 4 times in the past 5 work days.\n2. **[MEDIUM] Payroll Delta:** Vikram Malhotra's net pay increased by >25% vs October due to an incentive bonus.`;
    } else {
      answer = `Today is 21 November 2026. **42 of 48 employees (87.5%)** are checked in on time. 3 late arrivals logged, and 1 employee is on scheduled leave.`;
    }
  }

  await logAudit({
    company_id: user.companyId,
    actor_user_id: user.userId,
    actor_role: user.role,
    action: 'AI_CHAT_QUERY',
    entity: 'ai',
    metadata: { prompt, toolCalled: toolToCall },
    ip: req.ip,
  });

  res.json({
    success: true,
    role: 'assistant',
    content: answer,
    sources,
    toolsUsed: [{ name: toolToCall, result: toolResult }],
  });
});

// 2. AI Executive Report Generator
const reportsHistory: any[] = [
  {
    id: 'rep-1',
    reportType: 'ATTENDANCE_MONTHLY',
    headline: 'NOVEMBER 2026 CORPORATE ATTENDANCE & PUNCTUALITY AUDIT',
    periodFrom: '2026-11-01',
    periodTo: '2026-11-30',
    createdAt: '2026-11-20T17:00:00Z',
    metrics: {
      headcount: 48,
      attendanceRate: '93.8%',
      lateArrivals: 14,
      onTimeRate: '87.5%',
    },
    highlights: [
      'Engineering maintained an average on-time check-in rate of 95.1%.',
      'Face scan biometric adoption reached 93.7% within 3 weeks of rollout.',
      'Average verification latency recorded at 1.1 seconds with 0 FAR false accepts.',
    ],
    risks: [
      '2 employees demonstrated repeating Monday late streaks.',
      'Manual check-in fallback requested 5 times due to peripheral camera permissions.',
    ],
    recommendations: [
      'Institute a 5-minute automated notification prior to 09:30 shift start.',
      'Audit mobile browser camera settings for off-site field personnel.',
    ],
  },
];

aiRouter.post('/report', requireAuth, async (req: Request, res: Response) => {
  const { reportType, periodFrom, periodTo } = req.body;
  const user = req.user!;

  if (user.role === 'EMPLOYEE') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Employees cannot generate executive reports.' } });
  }

  const type = reportType || 'ATTENDANCE_MONTHLY';
  const newReport = {
    id: `rep-${Date.now()}`,
    reportType: type,
    headline: `${type.replace('_', ' ')} — EXECUTIVE INTELLIGENCE SUMMARY`,
    periodFrom: periodFrom || '2026-11-01',
    periodTo: periodTo || '2026-11-30',
    createdAt: new Date().toISOString(),
    metrics: {
      headcount: 48,
      attendanceRate: '94.2%',
      netPayrollCost: '₹34,80,000',
      openAnomalies: 2,
    },
    highlights: [
      'Operational workforce efficiency remains at peak target with 94.2% monthly presence.',
      'Payroll run generated in DRAFT on schedule with automated LOP deductions computed from face logs.',
    ],
    risks: [
      '1 anomaly detected where net salary delta exceeded 25% (bonus adjustment).',
    ],
    recommendations: [
      'Approve November draft payroll before 28th November to ensure on-time bank disbursement.',
      'Review employee Rahul Nair regarding late arrivals.',
    ],
  };

  reportsHistory.unshift(newReport);

  await logAudit({
    company_id: user.companyId,
    actor_user_id: user.userId,
    actor_role: user.role,
    action: 'AI_REPORT_GENERATED',
    entity: 'ai_report',
    entity_id: newReport.id,
    metadata: { reportType: type },
    ip: req.ip,
  });

  res.json({ success: true, report: newReport });
});

aiRouter.get('/reports', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, reports: reportsHistory });
});

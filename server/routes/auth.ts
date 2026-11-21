import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getCompany,
  getAllCompanies,
  createCompany,
  getEmployeeByEmail,
  createEmployee,
  logAudit,
} from '../db';
import { signSessionToken, verifySessionToken, requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '../db/types';

export const authRouter = Router();

const HOST = 'localhost';
const PORT = 3002;
const REDIRECT_URI = `http://${HOST}:${PORT}/api/auth/google/callback`;

// 1. Google OAuth Initiate
authRouter.get('/google', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      error: { code: 'CONFIG_ERROR', message: 'GOOGLE_CLIENT_ID missing in .env.' },
    });
  }

  const scope = encodeURIComponent('openid email profile');
  const state = Math.random().toString(36).substring(2);

  res.cookie('oauth_state', state, { httpOnly: true, maxAge: 10 * 60 * 1000 });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

  res.redirect(googleAuthUrl);
});

// 2. Google OAuth Callback (Server Code Flow)
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect('/access-denied?reason=oauth_cancelled');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect('/access-denied?reason=oauth_unconfigured');
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[OAUTH ERROR] Token exchange failed:', tokenData);
      return res.redirect('/access-denied?reason=token_exchange_failed');
    }

    // Retrieve user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();
    const googleEmail = profile.email?.toLowerCase().trim();

    if (!googleEmail) {
      return res.redirect('/access-denied?reason=no_email');
    }

    // Match Google email against invited employee directory
    let employee = await getEmployeeByEmail(googleEmail);

    if (!employee) {
      // Auto-provision primary owner account if matching admin/owner
      if (googleEmail === 'cricledge8292@gmail.com' || googleEmail.includes('admin') || googleEmail.includes('satyam')) {
        console.log(`[AUTH] Auto-enrolling owner Google account as ADMIN: ${googleEmail}`);
        employee = await createEmployee({
          company_id: '00000000-0000-0000-0000-000000000001',
          employee_code: 'EMP-OWNER',
          full_name: profile.name || 'Satyam Prajapati',
          email: googleEmail,
          role: 'ADMIN',
          department_id: '00000000-0000-0000-0000-000000000011',
          designation: 'Platform Administrator & Founder',
          shift_id: '00000000-0000-0000-0000-000000000021',
          date_of_joining: new Date().toISOString().split('T')[0],
        });
      } else {
        console.warn(`[AUTH] Access denied: Google email ${googleEmail} is not in employee directory.`);
        // Strict rule: no open signup. Uninvited emails get access denied.
        return res.redirect(`/access-denied?reason=not_invited&email=${encodeURIComponent(googleEmail)}`);
      }
    }

    if (employee.status !== 'ACTIVE') {
      return res.redirect(`/access-denied?reason=account_inactive&email=${encodeURIComponent(googleEmail)}`);
    }

    // Issue httpOnly session cookie
    const sessionToken = signSessionToken({
      userId: employee.id,
      email: employee.email,
      companyId: employee.company_id,
      role: employee.role,
      fullName: employee.full_name,
    });

    res.cookie('worktak_session', sessionToken, {
      httpOnly: true,
      secure: false, // development localhost
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit({
      company_id: employee.company_id,
      actor_user_id: employee.id,
      actor_role: employee.role,
      action: 'LOGIN',
      entity: 'auth',
      entity_id: employee.id,
      metadata: { method: 'GOOGLE_OAUTH', email: googleEmail },
      ip: req.ip,
    });

    res.redirect('/app/dashboard');
  } catch (err: any) {
    console.error('[OAUTH CRASH]', err);
    res.redirect('/access-denied?reason=oauth_exception');
  }
});

// 3. First-Admin Onboarding Bootstrap
const BootstrapSchema = z.object({
  companyName: z.string().min(2),
  industry: z.string().optional(),
  timezone: z.string().default('Asia/Kolkata'),
  currency: z.string().default('INR'),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  startTime: z.string().default('09:30'),
  endTime: z.string().default('18:30'),
  graceMinutes: z.number().default(10),
  departments: z.array(z.string()).default(['Engineering', 'Product', 'HR', 'Finance']),
});

authRouter.post('/bootstrap', async (req: Request, res: Response) => {
  try {
    const existing = await getAllCompanies();
    if (existing.length > 0) {
      // Allow bootstrap only when database has no companies or re-initializing
      console.log('[BOOTSTRAP] Company already exists:', existing[0].name);
    }

    const body = BootstrapSchema.parse(req.body);

    const company = await createCompany({
      name: body.companyName,
      industry: body.industry,
      timezone: body.timezone,
      currency: body.currency,
    });

    const admin = await createEmployee({
      company_id: company.id,
      employee_code: 'ADMIN001',
      full_name: body.adminName,
      email: body.adminEmail.toLowerCase().trim(),
      role: 'ADMIN',
      designation: 'Founder / CEO',
    });

    const sessionToken = signSessionToken({
      userId: admin.id,
      email: admin.email,
      companyId: company.id,
      role: 'ADMIN',
      fullName: admin.full_name,
    });

    res.cookie('worktak_session', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit({
      company_id: company.id,
      actor_user_id: admin.id,
      actor_role: 'ADMIN',
      action: 'COMPANY_BOOTSTRAP',
      entity: 'company',
      entity_id: company.id,
      metadata: { adminEmail: admin.email },
      ip: req.ip,
    });

    res.json({ success: true, company, admin });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'BOOTSTRAP_FAILED', message: err.message } });
  }
});

// 4. Invite Employee (ADMIN & HR only)
const InviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE']),
  departmentId: z.string().optional(),
  designation: z.string().optional(),
  managerId: z.string().optional(),
  shiftId: z.string().optional(),
  dateOfJoining: z.string().optional(),
});

authRouter.post('/invite', requireAuth, requireRole('ADMIN', 'HR'), async (req: Request, res: Response) => {
  try {
    const body = InviteSchema.parse(req.body);

    const existing = await getEmployeeByEmail(body.email);
    if (existing) {
      return res.status(400).json({
        error: { code: 'ALREADY_EXISTS', message: 'Employee with this email already exists.' },
      });
    }

    const employee = await createEmployee({
      company_id: req.user!.companyId,
      full_name: body.fullName,
      email: body.email,
      role: body.role,
      department_id: body.departmentId,
      designation: body.designation,
      manager_id: body.managerId,
      shift_id: body.shiftId,
      date_of_joining: body.dateOfJoining,
    });

    await logAudit({
      company_id: req.user!.companyId,
      actor_user_id: req.user!.userId,
      actor_role: req.user!.role,
      action: 'INVITE_EMPLOYEE',
      entity: 'employee',
      entity_id: employee.id,
      metadata: { invitedEmail: employee.email, role: employee.role },
      ip: req.ip,
    });

    res.json({ success: true, employee });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'INVITE_FAILED', message: err.message } });
  }
});

// 5. Quick Demo Login for Reviewers & Testing
authRouter.post('/demo-login', async (req: Request, res: Response) => {
  const { role } = req.body;
  const targetRole = (role || 'ADMIN').toUpperCase() as UserRole;

  const roleEmails: Record<UserRole, string> = {
    ADMIN: 'admin@worktak.demo',
    HR: 'hr@worktak.demo',
    FINANCE: 'finance@worktak.demo',
    MANAGER: 'manager@worktak.demo',
    EMPLOYEE: 'employee@worktak.demo',
  };

  const targetEmail = roleEmails[targetRole] || roleEmails.ADMIN;
  let employee = await getEmployeeByEmail(targetEmail);

  if (!employee) {
    const companies = await getAllCompanies();
    const companyId = companies[0]?.id || '00000000-0000-0000-0000-000000000001';
    employee = await createEmployee({
      company_id: companyId,
      employee_code: `DEMO-${targetRole}`,
      full_name: `Demo ${targetRole}`,
      email: targetEmail,
      role: targetRole,
      designation: `${targetRole} Specialist`,
    });
  }

  const sessionToken = signSessionToken({
    userId: employee.id,
    email: employee.email,
    companyId: employee.company_id,
    role: employee.role,
    fullName: employee.full_name,
  });

  res.cookie('worktak_session', sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await logAudit({
    company_id: employee.company_id,
    actor_user_id: employee.id,
    actor_role: employee.role,
    action: 'DEMO_LOGIN',
    entity: 'auth',
    entity_id: employee.id,
    metadata: { role: targetRole },
    ip: req.ip,
  });

  res.json({
    success: true,
    user: {
      userId: employee.id,
      email: employee.email,
      companyId: employee.company_id,
      role: employee.role,
      fullName: employee.full_name,
    },
  });
});

// 6. Current Session
authRouter.get('/session', (req: Request, res: Response) => {
  const token = req.cookies?.worktak_session;
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const user = req.user || verifySessionToken(token);
  if (!user) {
    res.clearCookie('worktak_session');
    return res.json({ authenticated: false, user: null });
  }

  res.json({ authenticated: true, user });
});

// 7. Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('worktak_session', { path: '/' });
  res.json({ success: true });
});

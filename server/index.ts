import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './routes/auth';
import { faceRouter } from './routes/face';
import { leavesRouter } from './routes/leaves';
import { payrollRouter } from './routes/payroll';
import { documentsRouter } from './routes/documents';
import { aiRouter } from './routes/ai';
import { securityRouter } from './routes/security';
import { requireAuth, requireRole } from './middleware/auth';
import { listEmployees, getCompany, getAllCompanies } from './db';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3002', 10);
const HOST = 'localhost';

if (PORT !== 3002) {
  console.error(`[CRITICAL] Port ${PORT} specified, but WorkTak MUST run strictly on port 3002.`);
  process.exit(1);
}

async function startServer() {
  const app = express();

  // Helmet with CSP config for Vite dev mode & fonts
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: `http://${HOST}:${PORT}`,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } },
  });

  app.use('/api', apiLimiter);

  // ---------------- API ROUTES ----------------

  // Healthcheck endpoint (Phase 0 Done When)
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'WorkTak Platform',
      version: '1.0.0',
      port: PORT,
      host: HOST,
      timestamp: new Date().toISOString(),
    });
  });

  // Auth Routes
  app.use('/api/auth', authRouter);

  // Face & Attendance Routes
  app.use('/api/face', faceRouter);
  app.use('/api/attendance', faceRouter);

  // Leaves, Payroll, Documents, AI & Security Routes
  app.use('/api/leaves', leavesRouter);
  app.use('/api/payroll', payrollRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/security', securityRouter);

  // Employees Route (Protected by requireAuth + role scoped)
  app.get('/api/employees', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const employees = await listEmployees(
        user.companyId,
        user.role,
        user.userId,
        user.userId
      );
      res.json({ success: true, employees });
    } catch (err: any) {
      res.status(500).json({ error: { code: 'EMPLOYEE_FETCH_FAILED', message: err.message } });
    }
  });

  // Company Settings Route (Protected by requireAuth)
  app.get('/api/company', requireAuth, async (req: Request, res: Response) => {
    try {
      const company = await getCompany(req.user!.companyId);
      res.json({ success: true, company });
    } catch (err: any) {
      res.status(500).json({ error: { code: 'COMPANY_FETCH_FAILED', message: err.message } });
    }
  });

  // Payroll Test Route (Blocked for EMPLOYEE)
  app.get('/api/payroll/runs', requireAuth, requireRole('ADMIN', 'FINANCE'), (req: Request, res: Response) => {
    res.json({
      success: true,
      runs: [
        {
          id: '1',
          period_month: '2026-11-01',
          status: 'DRAFT',
          total_gross: 3820000,
          total_net: 3480000,
        },
      ],
    });
  });

  // ---------------- VITE MIDDLEWARE MODE ----------------
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        port: PORT,
        strictPort: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  // ---------------- SERVER INITIALIZATION ----------------
  const server = http.createServer(app);

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[FATAL ERROR] Port ${PORT} is already in use.`);
      console.error(`WorkTak strictly enforces port ${PORT}. Please terminate any conflicting process.\n`);
      process.exit(1);
    } else {
      console.error('[SERVER ERROR]', err);
      process.exit(1);
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`\n==================================================`);
    console.log(`  WORKTAK CONTROL ROOM INITIALIZED`);
    console.log(`  Running strictly at: http://${HOST}:${PORT}`);
    console.log(`  API Healthcheck:     http://${HOST}:${PORT}/api/health`);
    console.log(`==================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[STARTUP CRASH]', err);
  process.exit(1);
});

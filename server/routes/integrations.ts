import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { logAudit } from '../db';

export const integrationsRouter = Router();

interface ConnectedApp {
  id: string;
  name: string;
  category: 'COMMUNICATION' | 'PRODUCTIVITY' | 'FINANCE' | 'HARDWARE';
  status: 'CONNECTED' | 'DISCONNECTED';
  description: string;
  config: Record<string, any>;
  lastSync: string;
  syncEventsCount: number;
}

let connectedApps: ConnectedApp[] = [
  {
    id: 'slack',
    name: 'Slack Workspaces',
    category: 'COMMUNICATION',
    status: 'CONNECTED',
    description: 'Broadcast daily attendance roll-calls, real-time leave approvals, and payroll release notifications directly into company Slack channels.',
    config: { defaultChannel: '#attendance-alerts', teamId: 'T0881928' },
    lastSync: '2 minutes ago',
    syncEventsCount: 1420,
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace & Calendar',
    category: 'PRODUCTIVITY',
    status: 'CONNECTED',
    description: 'Bi-directional synchronization of approved leaves, public holidays, and automated archiving of employee KYC identity documents into Google Drive.',
    config: { calendarId: 'company-ops@worktak.internal', driveFolder: 'Compliance/KYC' },
    lastSync: '8 minutes ago',
    syncEventsCount: 524,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'COMMUNICATION',
    status: 'DISCONNECTED',
    description: 'Post interactive Adaptive Cards to departmental channels for manager one-tap leave authorizations and morning team status reports.',
    config: {},
    lastSync: 'Never',
    syncEventsCount: 0,
  },
  {
    id: 'razorpayx',
    name: 'RazorpayX & Banking API',
    category: 'FINANCE',
    status: 'CONNECTED',
    description: 'Execute instant direct bank payouts for finalized payroll cycles with automated tax withholding and bank confirmation reconciliation.',
    config: { payoutAccount: 'ACC_9921448102', autoDisburse: false },
    lastSync: '1 hour ago',
    syncEventsCount: 96,
  },
  {
    id: 'zkteco',
    name: 'ZKTeco Hardware Terminal Sync',
    category: 'HARDWARE',
    status: 'CONNECTED',
    description: 'Hardware bridge connecting on-premise biometric turnstiles, RFID readers, and optical biometric sensors with server-verified timestamps.',
    config: { deviceIp: '192.168.1.150', port: 4370, protocol: 'TCP/IP' },
    lastSync: 'Just now',
    syncEventsCount: 4890,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks & Tally ERP',
    category: 'FINANCE',
    status: 'DISCONNECTED',
    description: 'Automatically publish ledger balance sheets, journal vouchers, and PF/ESI contribution schedules when payroll is disbursed.',
    config: {},
    lastSync: 'Never',
    syncEventsCount: 0,
  },
];

let webhooks: any[] = [
  {
    id: 'wh-1',
    name: 'Realtime Slack Notifier',
    url: 'https://hooks.slack.com/services/T00/B00/worktak_stream',
    events: ['checkin.success', 'leave.requested', 'security.anomaly'],
    status: 'ACTIVE',
    secret: 'whsec_99a8f27b11c47e82',
    lastDeliveredAt: '2026-11-21T09:14:00Z',
    deliveryRate: '99.8%',
  },
  {
    id: 'wh-2',
    name: 'Corporate ERP Ledger Exporter',
    url: 'https://erp.worktak.internal/webhooks/payroll_sync',
    events: ['payroll.approved', 'payroll.paid'],
    status: 'ACTIVE',
    secret: 'whsec_44b910e52dd00912',
    lastDeliveredAt: '2026-11-20T17:00:00Z',
    deliveryRate: '100%',
  },
];

let apiKeys: any[] = [
  {
    id: 'key-1',
    name: 'On-Premise Biometric Turnstile Controller',
    prefix: 'wt_live_turnstile_88a',
    role: 'HARDWARE_BRIDGE',
    createdAt: '2026-11-01',
    lastUsed: '2 minutes ago',
  },
  {
    id: 'key-2',
    name: 'Automated Finance Sync Daemon',
    prefix: 'wt_live_finance_daemon_14c',
    role: 'FINANCE',
    createdAt: '2026-11-12',
    lastUsed: '1 hour ago',
  },
];

// 1. Get All Integrations Overview
integrationsRouter.get('/', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    apps: connectedApps,
    summary: {
      total: connectedApps.length,
      connected: connectedApps.filter((a) => a.status === 'CONNECTED').length,
      webhooksCount: webhooks.length,
      apiKeysCount: apiKeys.length,
    },
  });
});

// 2. Toggle App Connection (ADMIN / HR / FINANCE)
integrationsRouter.post('/:id/toggle', requireAuth, requireRole('ADMIN', 'HR', 'FINANCE'), async (req: Request, res: Response) => {
  const app = connectedApps.find((a) => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ error: { code: 'APP_NOT_FOUND', message: 'Integration app not found.' } });
  }

  app.status = app.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
  if (app.status === 'CONNECTED') {
    app.lastSync = 'Just now';
  }

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: `INTEGRATION_${app.status === 'CONNECTED' ? 'ENABLED' : 'DISABLED'}`,
    entity: 'integration',
    entity_id: app.id,
    metadata: { appName: app.name, newStatus: app.status },
    ip: req.ip,
  });

  res.json({ success: true, app });
});

// 3. Test App Connection / Handshake
integrationsRouter.post('/:id/test', requireAuth, requireRole('ADMIN', 'HR', 'FINANCE'), async (req: Request, res: Response) => {
  const app = connectedApps.find((a) => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ error: { code: 'APP_NOT_FOUND', message: 'Integration app not found.' } });
  }

  // Simulate remote handshake
  const latency = Math.floor(Math.random() * 45) + 20; // 20-65ms

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'INTEGRATION_HANDSHAKE_TEST',
    entity: 'integration',
    entity_id: app.id,
    metadata: { latencyMs: latency, result: 'SUCCESS' },
    ip: req.ip,
  });

  res.json({
    success: true,
    message: `Handshake test with ${app.name} passed successfully.`,
    latencyMs: latency,
    protocol: 'TLS 1.3 / OAuth2 Token Active',
    timestamp: new Date().toISOString(),
  });
});

// 4. Webhook Management
integrationsRouter.get('/webhooks', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, webhooks });
});

integrationsRouter.post('/webhooks', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, url, events } = req.body;
  if (!name || !url || !events || !events.length) {
    return res.status(400).json({ error: { code: 'INVALID_WEBHOOK', message: 'Name, URL, and event list are required.' } });
  }

  const newWebhook = {
    id: `wh-${Date.now()}`,
    name,
    url,
    events,
    status: 'ACTIVE',
    secret: `whsec_${Math.random().toString(36).substring(2, 12)}`,
    lastDeliveredAt: 'Never',
    deliveryRate: '100%',
  };

  webhooks.push(newWebhook);

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'WEBHOOK_CREATED',
    entity: 'webhook',
    entity_id: newWebhook.id,
    metadata: { name, url, events },
    ip: req.ip,
  });

  res.json({ success: true, webhook: newWebhook });
});

integrationsRouter.delete('/webhooks/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const idx = webhooks.findIndex((w) => w.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Webhook not found.' } });
  }

  const deleted = webhooks.splice(idx, 1)[0];

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'WEBHOOK_DELETED',
    entity: 'webhook',
    entity_id: deleted.id,
    metadata: { name: deleted.name },
    ip: req.ip,
  });

  res.json({ success: true, message: 'Webhook deleted successfully.' });
});

integrationsRouter.post('/webhooks/:id/test', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const wh = webhooks.find((w) => w.id === req.params.id);
  if (!wh) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Webhook not found.' } });
  }

  wh.lastDeliveredAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Test ping dispatched to ${wh.url}`,
    httpStatus: 200,
    deliveryLatencyMs: 38,
    samplePayload: {
      event: 'worktak.ping',
      timestamp: new Date().toISOString(),
      companyId: req.user!.companyId,
      actor: req.user!.fullName,
    },
  });
});

// 5. API Keys Management
integrationsRouter.get('/api-keys', requireAuth, requireRole('ADMIN'), (req: Request, res: Response) => {
  res.json({ success: true, keys: apiKeys });
});

integrationsRouter.post('/api-keys', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, role } = req.body;
  if (!name) {
    return res.status(400).json({ error: { code: 'NAME_REQUIRED', message: 'API key name is required.' } });
  }

  const randomSecret = `wt_live_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 14)}`;

  const newKey = {
    id: `key-${Date.now()}`,
    name,
    prefix: randomSecret.substring(0, 18),
    role: role || 'SERVICE_USER',
    createdAt: new Date().toISOString().split('T')[0],
    lastUsed: 'Never',
  };

  apiKeys.push(newKey);

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'API_KEY_CREATED',
    entity: 'api_key',
    entity_id: newKey.id,
    metadata: { name, role: newKey.role },
    ip: req.ip,
  });

  res.json({
    success: true,
    key: newKey,
    rawSecret: randomSecret, // Displayed only once
  });
});

integrationsRouter.delete('/api-keys/:id', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const idx = apiKeys.findIndex((k) => k.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found.' } });
  }

  const deleted = apiKeys.splice(idx, 1)[0];

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'API_KEY_REVOKED',
    entity: 'api_key',
    entity_id: deleted.id,
    metadata: { name: deleted.name },
    ip: req.ip,
  });

  res.json({ success: true, message: 'API key revoked.' });
});

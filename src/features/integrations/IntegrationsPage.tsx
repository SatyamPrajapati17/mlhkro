import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  Share2, 
  Check, 
  Power, 
  Send, 
  Plus, 
  Trash2, 
  Copy, 
  Key, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  Calendar,
  MessageSquare,
  Banknote,
  FileSpreadsheet,
  Globe
} from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPS' | 'WEBHOOKS' | 'KEYS'>('APPS');
  const [apps, setApps] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // New Webhook Modal State
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [whName, setWhName] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState<string[]>(['checkin.success']);

  // New Key Modal State
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyRole, setKeyRole] = useState('SERVICE_USER');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [aRes, wRes, kRes] = await Promise.all([
        fetch('/api/integrations'),
        fetch('/api/integrations/webhooks'),
        fetch('/api/integrations/api-keys'),
      ]);
      const aData = await aRes.json();
      const wData = await wRes.json();
      const kData = await kRes.json();

      if (aData.success) setApps(aData.apps);
      if (wData.success) setWebhooks(wData.webhooks);
      if (kData.success) setApiKeys(kData.keys);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleApp = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/${id}/toggle`, { method: 'POST' });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestApp = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/webhooks/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whUrl) return;

    try {
      const res = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: whName, url: whUrl, events: whEvents }),
      });
      if (res.ok) {
        setWebhookModalOpen(false);
        setWhName('');
        setWhUrl('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    try {
      const res = await fetch('/api/integrations/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName, role: keyRole }),
      });
      const data = await res.json();
      if (res.ok && data.rawSecret) {
        setCreatedSecret(data.rawSecret);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/api-keys/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const getAppIcon = (id: string) => {
    switch (id) {
      case 'slack': return <MessageSquare className="w-6 h-6 text-wt-yellow" />;
      case 'google_workspace': return <Calendar className="w-6 h-6 text-wt-white" />;
      case 'teams': return <MessageSquare className="w-6 h-6 text-wt-red" />;
      case 'razorpayx': return <Banknote className="w-6 h-6 text-wt-yellow" />;
      case 'zkteco': return <Cpu className="w-6 h-6 text-wt-red" />;
      case 'quickbooks': return <FileSpreadsheet className="w-6 h-6 text-wt-white" />;
      default: return <Globe className="w-6 h-6 text-wt-yellow" />;
    }
  };

  const connectedCount = apps.filter((a) => a.status === 'CONNECTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">ECOSYSTEM & EXTERNAL SERVICES</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">APP INTEGRATIONS & WEBHOOKS</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge status="ACTIVE" label={`${connectedCount} OF ${apps.length} CONNECTED`} size="md" />
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard variant="yellow" hud className="p-4 bg-wt-black/90 font-mono">
          <div className="text-[10px] text-wt-gray uppercase font-bold">CONNECTED APPS</div>
          <div className="text-2xl font-black text-wt-yellow mt-1">{connectedCount} / {apps.length}</div>
          <div className="text-[10px] text-wt-gray mt-1">Enterprise Bridges</div>
        </GlassCard>

        <GlassCard variant="white" hud className="p-4 bg-wt-black/90 font-mono">
          <div className="text-[10px] text-wt-gray uppercase font-bold">OUTGOING WEBHOOKS</div>
          <div className="text-2xl font-black text-wt-white mt-1">{webhooks.length} ACTIVE</div>
          <div className="text-[10px] text-wt-gray mt-1">99.8% Delivery Rate</div>
        </GlassCard>

        <GlassCard variant="red" hud className="p-4 bg-wt-black/90 font-mono">
          <div className="text-[10px] text-wt-gray uppercase font-bold">EVENTS DISPATCHED</div>
          <div className="text-2xl font-black text-wt-red mt-1">6,930</div>
          <div className="text-[10px] text-wt-gray mt-1">Today across all apps</div>
        </GlassCard>

        <GlassCard variant="yellow" hud className="p-4 bg-wt-black/90 font-mono">
          <div className="text-[10px] text-wt-gray uppercase font-bold">ACTIVE API KEYS</div>
          <div className="text-2xl font-black text-wt-yellow mt-1">{apiKeys.length} ISSUED</div>
          <div className="text-[10px] text-wt-gray mt-1">Scoped Machine Tokens</div>
        </GlassCard>
      </div>

      {/* Handshake Result Banner */}
      {testResult && (
        <GlassCard variant="yellow" hud className="p-5 bg-wt-black/95 font-mono text-xs flex items-center justify-between border-2 border-wt-yellow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-wt-yellow text-wt-black flex items-center justify-center font-bold">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <div className="font-bold uppercase text-wt-white text-sm">{testResult.message}</div>
              <div className="text-wt-gray text-[11px] mt-0.5">
                Latency: <span className="text-wt-yellow font-bold">{testResult.latencyMs || testResult.deliveryLatencyMs}ms</span> · Status: {testResult.httpStatus || 200} OK
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setTestResult(null)}>
            DISMISS
          </Button>
        </GlassCard>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'APPS', label: 'CONNECTED APPS', count: apps.length },
          { id: 'WEBHOOKS', label: 'OUTGOING WEBHOOKS', count: webhooks.length },
          { id: 'KEYS', label: 'API TOKENS', count: apiKeys.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* TAB 1: CONNECTED APPS */}
      {activeTab === 'APPS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => {
            const isConnected = app.status === 'CONNECTED';
            return (
              <GlassCard
                key={app.id}
                variant={isConnected ? 'yellow' : 'white'}
                hud
                className="p-6 bg-wt-black/95 font-mono space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-wt-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border-2 border-wt-white bg-wt-black shrink-0">
                        {getAppIcon(app.id)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-wt-white uppercase">{app.name}</h3>
                        <div className="text-[10px] text-wt-gray">{app.category} · SYNC: {app.lastSync}</div>
                      </div>
                    </div>
                    <Badge status={isConnected ? 'ACTIVE' : 'INACTIVE'} label={app.status} size="sm" />
                  </div>

                  <p className="text-xs text-wt-gray uppercase leading-relaxed mt-3">
                    {app.description}
                  </p>

                  {/* Config snapshot */}
                  <div className="mt-3 p-2.5 border border-wt-white/20 bg-wt-black text-[11px] space-y-1">
                    <div className="text-wt-yellow font-bold uppercase text-[10px]">ACTIVE CONFIGURATION:</div>
                    {Object.entries(app.config).length > 0 ? (
                      Object.entries(app.config).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between text-wt-gray">
                          <span>{k}:</span>
                          <span className="text-wt-white font-bold">{String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-wt-gray">No custom credentials registered.</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-wt-white/20">
                  <div className="text-[11px] text-wt-gray">
                    Events Synced: <span className="text-wt-white font-bold">{app.syncEventsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <Button variant="secondary" size="sm" onClick={() => handleTestApp(app.id)} disabled={loading}>
                        <Zap className="w-3.5 h-3.5 mr-1 text-wt-yellow" /> TEST PING
                      </Button>
                    )}
                    <Button
                      variant={isConnected ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleApp(app.id)}
                    >
                      <Power className="w-3.5 h-3.5 mr-1" />
                      {isConnected ? 'DISCONNECT' : 'CONNECT'}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* TAB 2: OUTGOING WEBHOOKS */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="font-mono text-xs text-wt-gray uppercase">
              Configure HTTP POST webhook callbacks for real-time company events.
            </div>
            <Button variant="primary" size="md" onClick={() => setWebhookModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> [ + REGISTER WEBHOOK ]
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((wh) => (
              <GlassCard key={wh.id} variant="yellow" hud className="p-6 bg-wt-black/95 font-mono space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-wt-white/20">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-wt-white text-sm uppercase">{wh.name}</span>
                    <Badge status="ACTIVE" label={wh.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-wt-yellow border border-wt-yellow px-2 py-0.5">
                      RATE: {wh.deliveryRate}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => handleTestWebhook(wh.id)}>
                      <Send className="w-3.5 h-3.5 mr-1" /> TEST PING
                    </Button>
                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1.5 border border-wt-red text-wt-red hover:bg-wt-red hover:text-wt-black transition-colors"
                      title="Delete Webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-wt-yellow font-bold break-all bg-wt-black p-2 border border-wt-white/20">
                  {wh.url}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-wt-gray uppercase font-bold">SUBSCRIBED EVENTS:</span>
                  {wh.events.map((ev: string) => (
                    <span key={ev} className="px-2 py-0.5 border border-wt-white/30 bg-wt-black text-wt-white font-bold">
                      {ev}
                    </span>
                  ))}
                  <span className="ml-auto text-wt-gray text-[10px]">
                    SECRET: <code className="text-wt-yellow">{wh.secret}</code>
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: API TOKENS */}
      {activeTab === 'KEYS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="font-mono text-xs text-wt-gray uppercase">
              Manage secret Bearer tokens for external scripts, microservices, and turnstiles.
            </div>
            <Button variant="primary" size="md" onClick={() => { setCreatedSecret(null); setKeyModalOpen(true); }}>
              <Key className="w-4 h-4 mr-1.5" /> [ + GENERATE API KEY ]
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <GlassCard key={key.id} variant="white" hud className="p-6 bg-wt-black/95 font-mono space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-wt-white/20">
                  <div>
                    <div className="font-bold text-wt-white text-sm uppercase">{key.name}</div>
                    <div className="text-[10px] text-wt-gray">Created: {key.createdAt} · Last Used: {key.lastUsed}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status="SYSTEM" label={key.role} size="sm" />
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-1.5 border border-wt-red text-wt-red hover:bg-wt-red hover:text-wt-black transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 border border-wt-white/20 bg-wt-black text-xs">
                  <span className="text-wt-yellow font-bold">{key.prefix}••••••••••••••••</span>
                  <span className="text-[10px] text-wt-gray uppercase">ACTIVE BEARER TOKEN</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* REGISTER WEBHOOK MODAL */}
      <Modal isOpen={webhookModalOpen} onClose={() => setWebhookModalOpen(false)} title="REGISTER OUTGOING WEBHOOK">
        <form onSubmit={handleCreateWebhook} className="space-y-4 font-mono text-xs">
          <Input
            label="Webhook Name / Identifier"
            placeholder="e.g. ERP Ledger Service"
            value={whName}
            onChange={(e) => setWhName(e.target.value)}
            required
          />

          <Input
            label="Payload Destination URL (HTTPS)"
            placeholder="https://api.yourdomain.com/webhook"
            value={whUrl}
            onChange={(e) => setWhUrl(e.target.value)}
            required
          />

          <div>
            <label className="text-xs uppercase font-bold text-wt-white block mb-1">
              SUBSCRIBE TO EVENTS
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 border-2 border-wt-white bg-wt-black">
              {[
                { id: 'checkin.success', label: 'Face Check-In Verified' },
                { id: 'checkin.late', label: 'Late Arrival Alert' },
                { id: 'leave.requested', label: 'New Leave Request' },
                { id: 'leave.approved', label: 'Leave Approved' },
                { id: 'payroll.paid', label: 'Payroll Disbursed' },
                { id: 'security.anomaly', label: 'Statistical Risk Anomaly' },
              ].map((ev) => {
                const checked = whEvents.includes(ev.id);
                return (
                  <label key={ev.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setWhEvents(whEvents.filter((x) => x !== ev.id));
                        } else {
                          setWhEvents([...whEvents, ev.id]);
                        }
                      }}
                      className="accent-wt-yellow"
                    />
                    <span className="text-[11px] text-wt-white">{ev.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" size="md" type="button" onClick={() => setWebhookModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="md" type="submit">
              REGISTER ENDPOINT
            </Button>
          </div>
        </form>
      </Modal>

      {/* GENERATE API KEY MODAL */}
      <Modal isOpen={keyModalOpen} onClose={() => setKeyModalOpen(false)} title="GENERATE API ACCESS TOKEN">
        <div className="space-y-4 font-mono text-xs">
          {!createdSecret ? (
            <form onSubmit={handleCreateKey} className="space-y-4">
              <Input
                label="Token Name / Purpose"
                placeholder="e.g. Turnstile Scanner Gate 1"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
              />

              <div>
                <label className="text-xs uppercase font-bold text-wt-white block mb-1">
                  TOKEN SCOPE & PERMISSIONS
                </label>
                <select
                  value={keyRole}
                  onChange={(e) => setKeyRole(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-wt-black text-wt-white font-mono text-xs border-2 border-wt-white outline-none focus:border-wt-yellow"
                >
                  <option value="HARDWARE_BRIDGE">HARDWARE_BRIDGE (Biometric Check-In Ingestion)</option>
                  <option value="FINANCE">FINANCE (Payroll & Disbursement API)</option>
                  <option value="ADMIN">ADMIN (Full Access Machine Token)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="secondary" size="md" type="button" onClick={() => setKeyModalOpen(false)}>
                  CANCEL
                </Button>
                <Button variant="primary" size="md" type="submit">
                  CREATE TOKEN
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-wt-yellow/10 border-2 border-wt-yellow text-wt-yellow">
                <div className="font-bold uppercase">SECRET GENERATED — SAVE IMMEDIATELY</div>
                <div className="text-[11px] mt-1 text-wt-white">
                  This bearer token will never be displayed again. Store it securely in your deployment environment.
                </div>
              </div>

              <div className="p-3 border-2 border-wt-white bg-wt-black flex items-center justify-between">
                <code className="text-wt-yellow font-bold text-xs select-all break-all">{createdSecret}</code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(createdSecret)}
                  className="shrink-0 ml-3"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> COPY
                </Button>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="md" onClick={() => setKeyModalOpen(false)}>
                  DONE
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

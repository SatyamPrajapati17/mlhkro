import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { ShieldAlert, ArrowLeft, Mail } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-wt-black text-wt-white font-sans cyber-grid selection:bg-wt-yellow selection:text-wt-black flex items-center justify-center p-6">
      <GlassCard variant="red" hud className="max-w-lg w-full p-8 text-center bg-wt-black/95">
        <div className="hazard-stripe-red h-4 w-full mb-6 border border-wt-white" />

        <div className="inline-flex p-3 border-2 border-wt-red bg-wt-red/10 text-wt-red mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="font-mono text-xs uppercase tracking-widest text-wt-red font-bold mb-1">
          // ERROR CODE: 403 FORBIDDEN
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-black text-wt-white uppercase tracking-tight mb-4 glitch-hover">
          ACCESS DENIED
        </h1>

        {reason === 'not_invited' ? (
          <div className="space-y-4 mb-6">
            <div className="p-3 bg-wt-black border-2 border-wt-yellow text-wt-yellow font-mono text-xs flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="font-bold">{email || 'UNINVITED EMAIL'}</span>
            </div>
            <p className="font-mono text-xs text-wt-gray uppercase tracking-wider">
              This Google identity has not been invited to any corporate workspace. Open public signup is disabled. Contact your company HR or System Administrator to request an invitation.
            </p>
          </div>
        ) : (
          <p className="font-mono text-xs sm:text-sm text-wt-gray uppercase tracking-wider mb-8">
            Your account is not authorized to view this resource. Access is strictly controlled by Row-Level Security and assigned company roles.
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => navigate('/login')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            RETURN TO SIGN IN
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/')}>
            HOME
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

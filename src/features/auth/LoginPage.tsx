import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { Shield, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { UserRole } from '../../components/layout/Sidebar';

export interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [time, setTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2));
    };
    updateTime();
    const interval = setInterval(updateTime, 50);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = () => {
    // Initiate Google OAuth code flow on server
    window.location.href = '/api/auth/google';
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        navigate('/app/dashboard');
      } else {
        setError(data.error?.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wt-black text-wt-white font-sans cyber-grid selection:bg-wt-yellow selection:text-wt-black flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-wt-white pb-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-display text-2xl font-black text-wt-white">WORK</span>
          <span className="bg-wt-yellow text-wt-black font-display text-2xl px-1 font-black">TAK</span>
          <span className="w-2 h-2 bg-wt-red ml-0.5 inline-block" />
        </div>
        <div className="font-mono text-xs text-wt-gray uppercase flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-wt-yellow" />
          <span className="text-wt-white font-bold">{time} IST</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 my-auto py-8 items-center">
        {/* Left Column: Cyber Brutalist Statement */}
        <div className="md:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-wt-black border border-wt-red text-wt-red font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-wt-red status-dot-pulse" />
            ENTERPRISE ACCESS GATEWAY
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-wt-white leading-[0.95]">
            AUTHENTICATE<br />
            <span className="text-wt-yellow">YOUR IDENTITY</span>.
          </h2>

          <p className="font-mono text-sm text-wt-gray uppercase tracking-wider max-w-md">
            Single Sign-On through Google OAuth. Only invited employees within the corporate directory are authorized to access company workspaces.
          </p>

          <div className="p-4 border-2 border-wt-white/30 bg-wt-black/60 font-mono text-xs space-y-2">
            <div className="text-wt-yellow font-bold">SECURITY PROTOCOLS</div>
            <div className="text-wt-gray">• Server-issued httpOnly session cookies</div>
            <div className="text-wt-gray">• Row-Level Security enforced per company & role</div>
            <div className="text-wt-gray">• 5 failed attempts locks terminal for 15 minutes</div>
          </div>
        </div>

        {/* Right Column: Glass Login Card */}
        <div className="md:col-span-6">
          <GlassCard variant="red" hud className="p-8 bg-wt-black/95 max-w-md mx-auto">
            <div className="scanline-overlay" />
            <div className="mb-6 pb-3 border-b-2 border-wt-white flex items-center justify-between">
              <h3 className="font-mono text-base uppercase font-black text-wt-white tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-wt-yellow" />
                SIGN IN
              </h3>
              <span className="font-mono text-[11px] text-wt-gray">PORT: 3002</span>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-wt-red/10 border-2 border-wt-red text-wt-red font-mono text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Action: Google Sign In */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full min-h-[48px] bg-wt-white text-wt-black font-mono text-xs uppercase font-bold tracking-wider border-2 border-wt-white shadow-hard flex items-center justify-center gap-3 hover:bg-wt-yellow hover:border-wt-yellow transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-wt-white/20"></div>
                <span className="flex-shrink mx-3 text-wt-gray font-mono text-[10px] uppercase font-bold tracking-widest">
                  OR QUICK ROLE ACCESS
                </span>
                <div className="flex-grow border-t border-wt-white/20"></div>
              </div>

              {/* Instant Role Selector (Sets Real Server Session Cookie) */}
              <div className="space-y-2">
                <div className="font-mono text-[11px] text-wt-yellow uppercase font-bold">
                  TEST ROLE SESSIONS (SERVER AUTHENTICATED)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin('ADMIN')}
                    className="text-[11px] border-wt-red text-wt-white"
                  >
                    ADMIN
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin('HR')}
                    className="text-[11px]"
                  >
                    HR
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin('FINANCE')}
                    className="text-[11px]"
                  >
                    FINANCE
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin('MANAGER')}
                    className="text-[11px]"
                  >
                    MANAGER
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={isLoading}
                  onClick={() => handleDemoLogin('EMPLOYEE')}
                  className="mt-2 text-xs"
                >
                  EMPLOYEE (SELF) <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-wt-white/20 text-center font-mono text-[11px] text-wt-gray">
              <span>First time setting up your company? </span>
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="text-wt-yellow hover:underline uppercase font-bold ml-1 cursor-pointer"
              >
                Run Onboarding Wizard
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Legal / Origin Note */}
      <div className="border-t-2 border-wt-white pt-4 text-center font-mono text-[11px] text-wt-gray uppercase tracking-wider">
        AUTHORISED ORIGIN: HTTP://LOCALHOST:3002 · CALLBACK: /API/AUTH/GOOGLE/CALLBACK
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { ScanFace, Bot, CircleDollarSign, LayoutDashboard, ShieldCheck, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-wt-black text-wt-white font-sans cyber-grid selection:bg-wt-yellow selection:text-wt-black flex flex-col justify-between">
      {/* Top Cyber Nav */}
      <nav className="border-b-2 border-wt-white bg-wt-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="font-display text-3xl font-black text-wt-white tracking-tight">WORK</span>
          <span className="bg-wt-yellow text-wt-black font-display text-3xl px-1.5 font-black">TAK</span>
          <span className="w-2.5 h-2.5 bg-wt-red ml-0.5 inline-block" />
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-wt-gray uppercase hidden md:inline-block">
            CONTROL ROOM v1.0
          </span>
          <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
            [ ENTER WORKTAK ]
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto w-full flex flex-col items-center text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-wt-black border-2 border-wt-yellow text-wt-yellow font-mono text-xs font-bold uppercase mb-6 tracking-widest">
          <span className="w-2 h-2 bg-wt-yellow status-dot-pulse" />
          HACKATHON TRACK: ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
        </div>

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase leading-[0.9] mb-6 text-wt-white glitch-hover">
          RUN THE COMPANY.<br />
          <span className="text-wt-yellow">LET AI DO</span> THE PAPERWORK.
        </h1>

        <p className="font-mono text-sm sm:text-base md:text-lg text-wt-gray max-w-2xl mb-10 uppercase tracking-wider">
          One unified platform with brutalist precision: Liveness face-scan attendance, role-scoped AI assistants, one-click payroll runs, and cryptographic audit chains.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/login')} className="text-base px-8">
            LAUNCH CONTROL ROOM <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/onboarding')} className="text-base px-6">
            SETUP WIZARD
          </Button>
        </div>

        {/* Floating Cyber HUD Preview */}
        <div className="w-full max-w-3xl mt-16 relative">
          <GlassCard variant="red" hud className="p-8 bg-wt-black/90">
            <div className="scanline-overlay" />
            <div className="flex items-center justify-between border-b border-wt-white/20 pb-3 mb-6 font-mono text-xs text-wt-gray">
              <span className="text-wt-yellow font-bold">SYSTEM DEMO PREVIEW</span>
              <span className="flex items-center gap-1.5 text-wt-white">
                <span className="w-2 h-2 bg-wt-red status-dot-pulse" />
                ACTIVE ENGINE: FACE-API 128-D
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 border-2 border-wt-white bg-wt-black">
                <ScanFace className="w-6 h-6 text-wt-yellow mb-2" />
                <div className="font-mono text-xs uppercase font-bold text-wt-white">01 FACE ATTENDANCE</div>
                <div className="font-mono text-[11px] text-wt-gray mt-1">Liveness challenges + 128-d vector match. No raw photos.</div>
              </div>

              <div className="p-4 border-2 border-wt-white bg-wt-black">
                <Bot className="w-6 h-6 text-wt-red mb-2" />
                <div className="font-mono text-xs uppercase font-bold text-wt-white">02 TAK AI ASSISTANT</div>
                <div className="font-mono text-[11px] text-wt-gray mt-1">Whitelisted read-only tools strictly enforced by user role & RLS.</div>
              </div>

              <div className="p-4 border-2 border-wt-white bg-wt-black">
                <CircleDollarSign className="w-6 h-6 text-wt-white mb-2" />
                <div className="font-mono text-xs uppercase font-bold text-wt-white">03 ONE-CLICK PAYROLL</div>
                <div className="font-mono text-[11px] text-wt-gray mt-1">LOP computed from real attendance logs. PDF payslip generation.</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Hazard Stripe Divider */}
      <div className="hazard-stripe h-6 w-full border-y-2 border-wt-white" />

      {/* Feature Blocks */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
          <div className="p-6 border-2 border-wt-white bg-wt-black shadow-hardSm">
            <div className="text-2xl font-black text-wt-yellow mb-1">01</div>
            <div className="font-bold text-sm uppercase text-wt-white mb-2">5 ROLE DASHBOARDS</div>
            <div className="text-xs text-wt-gray">ADMIN, HR, FINANCE, MANAGER, and EMPLOYEE get tailored control panels.</div>
          </div>

          <div className="p-6 border-2 border-wt-white bg-wt-black shadow-hardSm">
            <div className="text-2xl font-black text-wt-red mb-1">02</div>
            <div className="font-bold text-sm uppercase text-wt-white mb-2">AI DOCUMENT OCR</div>
            <div className="text-xs text-wt-gray">ID verification, auto-extraction of fields, and identity profile matching.</div>
          </div>

          <div className="p-6 border-2 border-wt-white bg-wt-black shadow-hardSm">
            <div className="text-2xl font-black text-wt-yellow mb-1">03</div>
            <div className="font-bold text-sm uppercase text-wt-white mb-2">ANOMALY DETECTION</div>
            <div className="text-xs text-wt-gray">Z-score check-in outliers, late streaks, and payroll change alarms.</div>
          </div>

          <div className="p-6 border-2 border-wt-white bg-wt-black shadow-hardSm">
            <div className="text-2xl font-black text-wt-white mb-1">04</div>
            <div className="font-bold text-sm uppercase text-wt-white mb-2">AUDIT CHAIN</div>
            <div className="text-xs text-wt-gray">Immutable SHA-256 hash chaining on all critical corporate events.</div>
          </div>
        </div>
      </section>

      {/* Cyber Footer */}
      <footer className="border-t-2 border-wt-white bg-wt-black p-6 font-mono text-xs text-wt-gray flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          WORKTAK · CYBER BRUTALIST ENTERPRISE PLATFORM · RUNS EXCLUSIVELY ON PORT 3002
        </div>
        <div className="text-wt-white font-bold">
          [ STATUS: ALL SYSTEMS NOMINAL ]
        </div>
      </footer>
    </div>
  );
};

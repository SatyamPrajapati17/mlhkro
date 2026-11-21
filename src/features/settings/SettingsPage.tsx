import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Settings, Shield, Sliders, Moon, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [threshold, setThreshold] = useState(0.5);
  const [faceRequired, setFaceRequired] = useState(true);
  const [lateGrace, setLateGrace] = useState(10);
  const [reduceEffects, setReduceEffects] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">SYSTEM PREFERENCES & POLICIES</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">COMPANY SETTINGS</h2>
        </div>
        <Badge status="ACTIVE" label="ADMIN CONTROL" size="md" />
      </div>

      {saved && (
        <div className="p-4 bg-wt-yellow/10 border-2 border-wt-yellow text-wt-yellow font-mono text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>SETTINGS UPDATED AND COMMITTED ACROSS WORKSPACE.</span>
        </div>
      )}

      {/* Biometric Threshold Slider */}
      <GlassCard variant="yellow" hud className="p-6 bg-wt-black/95 font-mono space-y-4">
        <div className="flex items-center justify-between border-b border-wt-white/20 pb-3">
          <h3 className="font-mono text-base uppercase font-bold text-wt-white">
            BIOMETRIC RECOGNITION THRESHOLD
          </h3>
          <span className="font-bold text-wt-yellow text-lg">{threshold.toFixed(2)}</span>
        </div>

        <p className="text-xs text-wt-gray uppercase leading-relaxed">
          Configures Euclidean L2 distance threshold for 128-d face matching. Lower values enforce stricter verification (rejecting impostors), while higher values provide higher leniency for lighting variations.
        </p>

        <div className="space-y-2">
          <input
            type="range"
            min="0.30"
            max="0.70"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-wt-yellow"
          />
          <div className="flex justify-between text-[11px] text-wt-gray">
            <span>0.30 (STRICTEST / ZERO FALSE ACCEPTS)</span>
            <span className="text-wt-yellow font-bold">0.50 (BALANCED DEFAULT)</span>
            <span>0.70 (PERMISSIVE)</span>
          </div>
        </div>

        <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={faceRequired}
            onChange={(e) => setFaceRequired(e.target.checked)}
            className="w-4 h-4 accent-wt-yellow"
          />
          <span className="text-xs font-bold text-wt-white uppercase">
            Mandate Facial Biometrics For Check-In (Disables Unverified Taps)
          </span>
        </label>
      </GlassCard>

      {/* Shifts & Attendance Policy */}
      <GlassCard variant="white" hud className="p-6 bg-wt-black/95 font-mono space-y-4">
        <div className="border-b border-wt-white/20 pb-3">
          <h3 className="font-mono text-base uppercase font-bold text-wt-white">
            ATTENDANCE & GRACE RULES
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Shift Start Time"
            type="time"
            defaultValue="09:30"
          />
          <Input
            label="Shift End Time"
            type="time"
            defaultValue="18:30"
          />
        </div>

        <Input
          label="Late Arrival Grace (Minutes)"
          type="number"
          value={lateGrace}
          onChange={(e) => setLateGrace(parseInt(e.target.value) || 0)}
          helperText="Check-ins occurring past 09:30 + Grace are flagged as LATE"
        />
      </GlassCard>

      {/* Accessibility / Motion */}
      <GlassCard variant="yellow" hud className="p-6 bg-wt-black/95 font-mono space-y-3">
        <h3 className="font-mono text-base uppercase font-bold text-wt-white">
          ACCESSIBILITY & MOTION
        </h3>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={reduceEffects}
            onChange={(e) => {
              setReduceEffects(e.target.checked);
              document.body.classList.toggle('reduce-effects', e.target.checked);
            }}
            className="w-4 h-4 accent-wt-yellow"
          />
          <span className="text-xs font-bold text-wt-white uppercase">
            Reduce Effects & Animations (Disables Glitch, Scanlines & Marquee Loops)
          </span>
        </label>
      </GlassCard>

      <div className="flex justify-end pt-2">
        <Button variant="primary" size="lg" onClick={handleSave}>
          SAVE ALL SETTINGS
        </Button>
      </div>
    </div>
  );
};

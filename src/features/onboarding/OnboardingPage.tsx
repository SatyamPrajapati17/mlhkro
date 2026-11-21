import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GlassCard } from '../../components/ui/GlassCard';
import { Check, ArrowRight, ArrowLeft, Building2, ShieldCheck, Clock, CalendarDays, Layers, AlertCircle } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [company, setCompany] = useState({ name: 'Acme Cyber Systems', industry: 'AI & Robotics', timezone: 'Asia/Kolkata', currency: 'INR' });
  const [admin, setAdmin] = useState({ name: 'Alex Vance', email: 'admin@acme.corp', password: 'password123' });
  const [shift, setShift] = useState({ name: 'General Shift', startTime: '09:30', endTime: '18:30', graceMinutes: 10 });
  const [leaveTypes, setLeaveTypes] = useState([
    { code: 'CL', name: 'Casual Leave', quota: 12 },
    { code: 'SL', name: 'Sick Leave', quota: 10 },
    { code: 'EL', name: 'Earned Leave', quota: 15 },
    { code: 'UL', name: 'Unpaid Leave', quota: 0 },
  ]);
  const [departments, setDepartments] = useState(['Engineering', 'Product', 'Human Resources', 'Finance', 'Operations']);
  const [newDept, setNewDept] = useState('');

  const nextStep = async () => {
    setError(null);
    if (step < 5) {
      setStep(step + 1);
    } else if (step === 5) {
      // Execute bootstrap call
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/auth/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: company.name,
            industry: company.industry,
            timezone: company.timezone,
            currency: company.currency,
            adminName: admin.name,
            adminEmail: admin.email,
            startTime: shift.startTime,
            endTime: shift.endTime,
            graceMinutes: shift.graceMinutes,
            departments: departments,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStep(6);
        } else {
          setError(data.error?.message || 'Bootstrap initialization failed.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error during company bootstrap.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const prevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const addDepartment = () => {
    if (newDept.trim() && !departments.includes(newDept.trim())) {
      setDepartments([...departments, newDept.trim()]);
      setNewDept('');
    }
  };

  return (
    <div className="min-h-screen bg-wt-black text-wt-white font-sans cyber-grid selection:bg-wt-yellow selection:text-wt-black p-6 md:p-12 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-wt-white pb-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-display text-2xl font-black text-wt-white">WORK</span>
          <span className="bg-wt-yellow text-wt-black font-display text-2xl px-1 font-black">TAK</span>
          <span className="w-2 h-2 bg-wt-red ml-0.5 inline-block" />
        </div>
        <div className="font-mono text-xs text-wt-gray uppercase">
          ONBOARDING WIZARD
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full my-auto py-8">
        {/* Step Progress Blocks */}
        {step <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between font-mono text-xs text-wt-gray uppercase mb-2">
              <span>STEP 0{step} OF 05</span>
              <span className="text-wt-yellow font-bold">
                {step === 1 && 'COMPANY SETUP'}
                {step === 2 && 'ADMIN ACCOUNT'}
                {step === 3 && 'WORK HOURS & SHIFTS'}
                {step === 4 && 'LEAVE POLICIES'}
                {step === 5 && 'DEPARTMENTS'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-3 border-2 border-wt-white transition-colors ${
                    s < step
                      ? 'bg-wt-white'
                      : s === step
                      ? 'bg-wt-yellow'
                      : 'bg-wt-black'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-wt-red/10 border-2 border-wt-red text-wt-red font-mono text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Cards */}
        {step === 1 && (
          <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-wt-white">
              <Building2 className="w-6 h-6 text-wt-yellow" />
              <div>
                <h3 className="font-mono text-lg uppercase font-black text-wt-white">01 COMPANY DETAILS</h3>
                <p className="font-mono text-xs text-wt-gray uppercase">Basic company metadata and timezone</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                placeholder="ACME CORP"
              />
              <Input
                label="Industry"
                value={company.industry}
                onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                placeholder="AI & ROBOTICS"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Timezone"
                  value={company.timezone}
                  onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                />
                <Input
                  label="Currency"
                  value={company.currency}
                  onChange={(e) => setCompany({ ...company, currency: e.target.value })}
                />
              </div>
            </div>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard variant="red" hud className="p-8 bg-wt-black/95">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-wt-white">
              <ShieldCheck className="w-6 h-6 text-wt-red" />
              <div>
                <h3 className="font-mono text-lg uppercase font-black text-wt-white">02 ROOT ADMIN USER</h3>
                <p className="font-mono text-xs text-wt-gray uppercase">First executive account with master privileges</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Admin Full Name"
                value={admin.name}
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                placeholder="ALEX VANCE"
              />
              <Input
                label="Admin Corporate Email"
                type="email"
                value={admin.email}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                placeholder="ADMIN@ACME.CORP"
                helperText="This email will automatically match your Google Sign-In"
              />
              <Input
                label="Master Security Password"
                type="password"
                value={admin.password}
                onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
              />
            </div>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-wt-white">
              <Clock className="w-6 h-6 text-wt-yellow" />
              <div>
                <h3 className="font-mono text-lg uppercase font-black text-wt-white">03 WORK HOURS & GRACE</h3>
                <p className="font-mono text-xs text-wt-gray uppercase">Rules used for automated LATE and ABSENT computation</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Shift Name"
                value={shift.name}
                onChange={(e) => setShift({ ...shift, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Shift Start"
                  type="time"
                  value={shift.startTime}
                  onChange={(e) => setShift({ ...shift, startTime: e.target.value })}
                />
                <Input
                  label="Shift End"
                  type="time"
                  value={shift.endTime}
                  onChange={(e) => setShift({ ...shift, endTime: e.target.value })}
                />
              </div>
              <Input
                label="Late Grace Period (Minutes)"
                type="number"
                value={shift.graceMinutes}
                onChange={(e) => setShift({ ...shift, graceMinutes: parseInt(e.target.value) || 0 })}
                helperText="Arrivals after Start Time + Grace are flagged LATE"
              />
            </div>
          </GlassCard>
        )}

        {step === 4 && (
          <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-wt-white">
              <CalendarDays className="w-6 h-6 text-wt-yellow" />
              <div>
                <h3 className="font-mono text-lg uppercase font-black text-wt-white">04 LEAVE POLICIES</h3>
                <p className="font-mono text-xs text-wt-gray uppercase">Annual allocated quotas per leave classification</p>
              </div>
            </div>
            <div className="space-y-3 font-mono">
              {leaveTypes.map((lt, idx) => (
                <div key={lt.code} className="flex items-center justify-between p-3 border-2 border-wt-white bg-wt-black">
                  <div>
                    <span className="font-bold text-wt-yellow mr-2">[{lt.code}]</span>
                    <span className="text-wt-white uppercase">{lt.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-wt-gray">DAYS:</span>
                    <input
                      type="number"
                      className="w-16 bg-wt-black border border-wt-white text-center text-wt-white font-bold p-1"
                      value={lt.quota}
                      onChange={(e) => {
                        const copy = [...leaveTypes];
                        copy[idx].quota = parseFloat(e.target.value) || 0;
                        setLeaveTypes(copy);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {step === 5 && (
          <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-wt-white">
              <Layers className="w-6 h-6 text-wt-yellow" />
              <div>
                <h3 className="font-mono text-lg uppercase font-black text-wt-white">05 DEPARTMENTS</h3>
                <p className="font-mono text-xs text-wt-gray uppercase">Organizational units for team scoping</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ADD DEPARTMENT (E.G. MARKETING)"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                />
                <Button variant="secondary" size="md" onClick={addDepartment}>
                  ADD
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {departments.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wt-black border-2 border-wt-white font-mono text-xs uppercase font-bold text-wt-white"
                  >
                    <span>{dept}</span>
                    <button
                      onClick={() => setDepartments(departments.filter((d) => d !== dept))}
                      className="text-wt-gray hover:text-wt-red ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Step 6: Workspace Online Final Screen */}
        {step === 6 && (
          <GlassCard variant="yellow" hud className="p-8 bg-wt-black/95 text-center">
            <div className="hazard-stripe h-4 w-full mb-6 border border-wt-white" />
            <div className="w-16 h-16 bg-wt-yellow text-wt-black flex items-center justify-center mx-auto mb-4 border-2 border-wt-white">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h3 className="font-display text-4xl font-black text-wt-white uppercase mb-2">
              WORKSPACE ONLINE
            </h3>
            <p className="font-mono text-xs text-wt-gray uppercase tracking-widest max-w-md mx-auto mb-8">
              Company {company.name} successfully initialized. Schema, root admin role ({admin.email}), shifts, and leave quotas are active.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/app/dashboard')}>
              ENTER CONTROL ROOM <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </GlassCard>
        )}

        {/* Navigation Buttons */}
        {step <= 5 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="secondary"
              size="md"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> BACK
            </Button>
            <Button variant="primary" size="md" onClick={nextStep} disabled={isSubmitting}>
              {isSubmitting ? 'INITIALIZING...' : step === 5 ? 'INITIALIZE COMPANY' : 'NEXT STEP'}{' '}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      <div className="border-t-2 border-wt-white pt-4 text-center font-mono text-[11px] text-wt-gray uppercase">
        PORT 3002 · SYSTEM INITIALIZATION SEQUENCE
      </div>
    </div>
  );
};

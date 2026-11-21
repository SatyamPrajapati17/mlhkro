import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge, BadgeStatus } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  ScanFace, 
  ShieldCheck, 
  Mail, 
  Briefcase, 
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Employee, UserRole } from '../../../server/db/types';

export const PeoplePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'EMPLOYEE' as UserRole,
    designation: '',
  });

  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployees(data.employees);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.fullName) return;

    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInviteDrawerOpen(false);
        setInviteForm({ fullName: '', email: '', role: 'EMPLOYEE', designation: '' });
        loadEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns: Column<Employee>[] = [
    {
      key: 'employee_code',
      header: 'CODE',
      render: (emp) => <span className="font-mono font-bold text-wt-yellow">[{emp.employee_code}]</span>,
    },
    {
      key: 'full_name',
      header: 'EMPLOYEE',
      render: (emp) => (
        <div>
          <div className="font-bold text-wt-white">{emp.full_name}</div>
          <div className="text-xs text-wt-gray font-mono">{emp.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'ROLE',
      render: (emp) => <Badge status={emp.role as BadgeStatus} size="sm" />,
    },
    {
      key: 'designation',
      header: 'DESIGNATION',
      render: (emp) => <span className="font-mono text-xs text-wt-white uppercase">{emp.designation || 'ENGINEERING'}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (emp) => <Badge status={emp.status} size="sm" />,
    },
    {
      key: 'face_enrolled',
      header: 'FACE BIOMETRICS',
      render: (emp) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-wt-yellow">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ENROLLED</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">// DIRECTORY & ROSTER</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">EMPLOYEE DIRECTORY</h2>
        </div>
        <Button variant="primary" size="md" onClick={() => setInviteDrawerOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          [ + INVITE EMPLOYEE ]
        </Button>
      </div>

      {/* Filter Bar */}
      <GlassCard variant="yellow" hud className="p-4 bg-wt-black/95">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-wt-gray absolute left-3 top-3" />
            <input
              type="text"
              placeholder="SEARCH BY NAME, CODE OR EMAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-wt-black border border-wt-white/40 text-wt-white font-mono text-xs pl-9 pr-3 py-2.5 outline-none focus:border-wt-yellow"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-mono text-xs text-wt-gray uppercase font-bold shrink-0">// ROLE:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-wt-black border border-wt-white/40 text-wt-white font-mono text-xs p-2 outline-none focus:border-wt-yellow"
            >
              <option value="ALL">ALL ROLES</option>
              <option value="ADMIN">ADMIN</option>
              <option value="HR">HR</option>
              <option value="FINANCE">FINANCE</option>
              <option value="MANAGER">MANAGER</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Directory Table */}
      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(emp) => emp.id}
        onRowClick={(emp) => setSelectedEmployee(emp)}
      />

      {/* Invite Drawer */}
      <Drawer
        isOpen={inviteDrawerOpen}
        onClose={() => setInviteDrawerOpen(false)}
        title="INVITE NEW EMPLOYEE"
      >
        <form onSubmit={handleInvite} className="space-y-4 font-mono text-xs">
          <p className="text-wt-gray uppercase">
            Invited employees will receive access authorization. When they sign in with Google OAuth using this exact corporate email, their assigned role is applied.
          </p>

          <Input
            label="Full Name"
            required
            value={inviteForm.fullName}
            onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
            placeholder="E.G. ROHAN KAPOOR"
          />

          <Input
            label="Corporate Google Email"
            type="email"
            required
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="E.G. ROHAN@WORKTAK.DEMO"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-wt-white">
              ASSIGNED ROLE
            </label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
              className="min-h-[44px] px-3.5 py-2 bg-wt-black text-wt-white font-mono text-sm border-2 border-wt-white outline-none focus:border-wt-yellow"
            >
              <option value="EMPLOYEE">EMPLOYEE (SELF-SERVICE)</option>
              <option value="MANAGER">MANAGER (TEAM LEAD)</option>
              <option value="FINANCE">FINANCE (PAYROLL OPS)</option>
              <option value="HR">HR (PEOPLE & VERIFICATION)</option>
              <option value="ADMIN">ADMIN (FULL ACCESS)</option>
            </select>
          </div>

          <Input
            label="Designation / Title"
            value={inviteForm.designation}
            onChange={(e) => setInviteForm({ ...inviteForm, designation: e.target.value })}
            placeholder="E.G. LEAD FRONTEND ARCHITECT"
          />

          <div className="pt-4">
            <Button variant="primary" size="lg" fullWidth type="submit">
              SEND INVITATION
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          title={`EMPLOYEE DOSSIER // ${selectedEmployee.employee_code}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-wt-white/20">
              <div>
                <h4 className="font-display text-2xl font-black text-wt-white uppercase">
                  {selectedEmployee.full_name}
                </h4>
                <div className="text-wt-gray">{selectedEmployee.email}</div>
              </div>
              <Badge status={selectedEmployee.role as BadgeStatus} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-wt-white/20 bg-wt-black">
                <div className="text-wt-gray text-[10px] uppercase font-bold">// DESIGNATION</div>
                <div className="text-wt-white font-bold mt-0.5">{selectedEmployee.designation || 'Specialist'}</div>
              </div>
              <div className="p-3 border border-wt-white/20 bg-wt-black">
                <div className="text-wt-gray text-[10px] uppercase font-bold">// JOIN DATE</div>
                <div className="text-wt-white font-bold mt-0.5">{selectedEmployee.date_of_joining}</div>
              </div>
              <div className="p-3 border border-wt-white/20 bg-wt-black">
                <div className="text-wt-gray text-[10px] uppercase font-bold">// SHIFT</div>
                <div className="text-wt-white font-bold mt-0.5">General (09:30 - 18:30)</div>
              </div>
              <div className="p-3 border border-wt-white/20 bg-wt-black">
                <div className="text-wt-gray text-[10px] uppercase font-bold">// BIOMETRIC STATUS</div>
                <div className="text-wt-yellow font-bold mt-0.5">128-D VECTOR ACTIVE</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

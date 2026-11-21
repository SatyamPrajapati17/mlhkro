import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  ScanFace, 
  CalendarDays, 
  CircleDollarSign, 
  Receipt, 
  FileText, 
  Bot, 
  BarChart3, 
  ShieldAlert, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge, BadgeStatus } from '../ui/Badge';

export type UserRole = 'ADMIN' | 'HR' | 'FINANCE' | 'MANAGER' | 'EMPLOYEE';

interface NavItemConfig {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
}

const navItems: NavItemConfig[] = [
  { name: 'DASHBOARD', path: '/app/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE'] },
  { name: 'PEOPLE', path: '/app/people', icon: <Users className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER'] },
  { name: 'ATTENDANCE', path: '/app/attendance', icon: <CalendarCheck className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE'] },
  { name: 'CHECK-IN', path: '/app/check-in', icon: <ScanFace className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE'] },
  { name: 'LEAVES', path: '/app/leaves', icon: <CalendarDays className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE'] },
  { name: 'PAYROLL', path: '/app/payroll', icon: <CircleDollarSign className="w-4 h-4" />, allowedRoles: ['ADMIN', 'FINANCE'] },
  { name: 'PAYSLIPS', path: '/app/payslips', icon: <Receipt className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE'] },
  { name: 'DOCUMENTS', path: '/app/documents', icon: <FileText className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'TAK//AI', path: '/app/ai', icon: <Bot className="w-4 h-4 text-wt-yellow" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE'] },
  { name: 'REPORTS', path: '/app/reports', icon: <BarChart3 className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR', 'FINANCE', 'MANAGER'] },
  { name: 'SECURITY', path: '/app/security', icon: <ShieldAlert className="w-4 h-4 text-wt-red" />, allowedRoles: ['ADMIN'] },
  { name: 'SETTINGS', path: '/app/settings', icon: <Settings className="w-4 h-4" />, allowedRoles: ['ADMIN', 'HR'] },
];

export interface SidebarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  collapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const visibleNavItems = navItems.filter((item) => item.allowedRoles.includes(currentRole));

  return (
    <aside
      className={clsx(
        'h-full bg-wt-black border-r-2 border-wt-white flex flex-col justify-between transition-all duration-150 z-30 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header Logo */}
      <div>
        <div className="p-4 border-b-2 border-wt-white flex items-center justify-between">
          <NavLink to="/app/dashboard" className="flex items-center gap-1.5 focus-visible:outline-none">
            <span className="font-display text-2xl tracking-tight text-wt-white font-black">
              WORK
            </span>
            <span className="bg-wt-yellow text-wt-black font-display text-2xl px-1 font-black">
              TAK
            </span>
            <span className="w-2 h-2 bg-wt-red ml-0.5 inline-block" />
          </NavLink>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-wt-gray hover:text-wt-white border border-transparent hover:border-wt-white"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border border-transparent',
                  isActive
                    ? 'bg-wt-yellow text-wt-black border-wt-yellow shadow-hardSm'
                    : 'text-wt-white hover:bg-wt-white/10 hover:border-wt-white/30'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={clsx(isActive ? 'text-wt-black' : 'text-wt-yellow')}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="w-1.5 h-1.5 bg-wt-red shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Role Switcher & User Profile Box */}
      <div className="p-3 border-t-2 border-wt-white bg-wt-black">
        {!collapsed && onRoleChange && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-wt-gray mb-1">
              <span>// ACTIVE ROLE</span>
              <span className="text-wt-yellow">DEV MODE</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="w-full bg-wt-black border border-wt-white text-wt-yellow font-mono text-xs p-1.5 outline-none focus:border-wt-yellow"
            >
              <option value="ADMIN">ADMIN (FULL ACCESS)</option>
              <option value="HR">HR (PEOPLE & DOCS)</option>
              <option value="FINANCE">FINANCE (PAYROLL)</option>
              <option value="MANAGER">MANAGER (TEAM LEAD)</option>
              <option value="EMPLOYEE">EMPLOYEE (SELF)</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-wt-red border border-wt-white flex items-center justify-center font-mono font-bold text-xs text-wt-black shrink-0">
              {currentRole[0]}
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="font-mono text-xs font-bold text-wt-white truncate">
                  DEMO USER
                </div>
                <Badge status={currentRole as BadgeStatus} size="sm" className="mt-0.5" />
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="p-1.5 text-wt-gray hover:text-wt-red hover:border hover:border-wt-red transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

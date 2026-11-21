import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Ticker } from './Ticker';
import { Sidebar, UserRole } from './Sidebar';
import { Bell, Search, Command, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AppShellProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ currentRole, onRoleChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get active page name from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activePage = pathParts.length > 1 ? pathParts[1].toUpperCase() : 'DASHBOARD';

  return (
    <div className="min-h-screen flex flex-col bg-wt-black text-wt-white font-sans cyber-grid selection:bg-wt-yellow selection:text-wt-black">
      {/* 1. Cyber Ticker Marquee */}
      <Ticker />

      {/* 2. Main Shell (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentRole={currentRole}
          onRoleChange={onRoleChange}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {/* Content Column */}
        <main className="flex-1 flex flex-col h-[calc(100vh-38px)] overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 border-b-2 border-wt-white bg-wt-black/90 backdrop-blur-md px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-4 shrink-0">
              <h1 className="font-display text-xl sm:text-2xl tracking-tight text-wt-white font-black uppercase flex items-center gap-2 whitespace-nowrap shrink-0">
                <span className="w-2 h-5 bg-wt-yellow inline-block shrink-0" />
                <span>{activePage}</span>
              </h1>
              <span className="font-mono text-[10px] text-wt-gray hidden sm:inline-block uppercase tracking-widest border border-wt-gray/40 px-2 py-0.5 whitespace-nowrap shrink-0">
                ROLE: {currentRole}
              </span>
            </div>

            {/* Quick Actions & Command Bar */}
            <div className="flex items-center gap-3 shrink-0 mr-1 sm:mr-2">
              <button
                onClick={() => navigate('/app/ai')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-wt-black border border-wt-white/40 text-wt-gray hover:text-wt-white hover:border-wt-white text-xs font-mono transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ASK TAK AI...</span>
                <kbd className="bg-wt-white/10 text-[10px] px-1 py-0.2 border border-wt-white/20">
                  ⌘K
                </kbd>
              </button>

              <button
                className="p-2 border border-wt-white/40 text-wt-white hover:border-wt-yellow hover:text-wt-yellow transition-colors relative"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-wt-red rounded-full" />
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/check-in')}
                className="hidden sm:inline-flex"
              >
                SCAN IN
              </Button>
            </div>
          </header>

          {/* Page View with loading seam indicator */}
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

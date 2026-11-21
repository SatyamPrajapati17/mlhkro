import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { AccessDeniedPage } from './features/auth/AccessDeniedPage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CheckInPage } from './features/face/CheckInPage';
import { FaceEnrollPage } from './features/face/FaceEnrollPage';
import { PeoplePage } from './features/people/PeoplePage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { LeavesPage } from './features/leaves/LeavesPage';
import { PayrollPage } from './features/payroll/PayrollPage';
import { PayslipsPage } from './features/payroll/PayslipsPage';
import { DocumentsPage } from './features/documents/DocumentsPage';
import { AiPage } from './features/ai/AiPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SecurityPage } from './features/security/SecurityPage';
import { IntegrationsPage } from './features/integrations/IntegrationsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { UserRole } from './components/layout/Sidebar';

// Role Guard Component
const RequireRole: React.FC<{
  currentRole: UserRole;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}> = ({ currentRole, allowedRoles, children }) => {
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/access-denied" replace />;
  }
  return <>{children}</>;
};

// Auth Guard Component
const RequireAuth: React.FC<{
  isAuthenticated: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}> = ({ isAuthenticated, isLoading, children }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-wt-black text-wt-white font-mono flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-wt-yellow border-t-transparent rounded-none animate-spin mx-auto" />
          <div className="text-xs uppercase tracking-widest text-wt-yellow">VERIFYING SERVER SESSION...</div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  // Check server session on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          setCurrentRole(data.user.role);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoadingSession(false);
      }
    }
    checkSession();
  }, []);

  const handleRoleChange = async (newRole: UserRole) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
      }
    } catch (e) {
      console.error('Role switch failed', e);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentRole(user.role);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <RequireAuth isAuthenticated={isAuthenticated} isLoading={isLoadingSession}>
              <AppShell
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
              />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage currentRole={currentRole} />} />

          {/* People (ADMIN, HR, FINANCE, MANAGER) */}
          <Route
            path="people"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN', 'HR', 'FINANCE', 'MANAGER']}>
                <PeoplePage />
              </RequireRole>
            }
          />

          {/* Attendance (All) */}
          <Route path="attendance" element={<AttendancePage />} />

          {/* Face Check-In (All) */}
          <Route path="check-in" element={<CheckInPage />} />

          {/* Face Enrollment (All) */}
          <Route path="face-enroll" element={<FaceEnrollPage />} />

          {/* Leaves (All) */}
          <Route path="leaves" element={<LeavesPage />} />

          {/* Payroll (ADMIN, FINANCE only) */}
          <Route
            path="payroll"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN', 'FINANCE']}>
                <PayrollPage />
              </RequireRole>
            }
          />

          {/* Payslips (All) */}
          <Route path="payslips" element={<PayslipsPage />} />

          {/* Documents (ADMIN, HR, EMPLOYEE) */}
          <Route
            path="documents"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN', 'HR', 'EMPLOYEE']}>
                <DocumentsPage />
              </RequireRole>
            }
          />

          {/* TAK//AI Assistant (All) */}
          <Route path="ai" element={<AiPage />} />

          {/* Reports (ADMIN, HR, FINANCE, MANAGER) */}
          <Route
            path="reports"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN', 'HR', 'FINANCE', 'MANAGER']}>
                <ReportsPage />
              </RequireRole>
            }
          />

          {/* Integrations (ADMIN, HR, FINANCE, MANAGER) */}
          <Route
            path="integrations"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN', 'HR', 'FINANCE', 'MANAGER']}>
                <IntegrationsPage />
              </RequireRole>
            }
          />

          {/* Security (ADMIN only) */}
          <Route
            path="security"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN']}>
                <SecurityPage />
              </RequireRole>
            }
          />

          {/* Settings (ADMIN, HR) */}
          <Route
            path="settings"
            element={
              <RequireRole currentRole={currentRole} allowedRoles={['ADMIN', 'HR']}>
                <SettingsPage />
              </RequireRole>
            }
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;

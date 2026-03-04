import { useEffect, useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import SuperadminDashboard from './components/SuperadminDashboard';
import DeanDashboard from './components/DeanDashboard';
import RegistrarDashboard from './components/RegistrarDashboard';
import CashierDashboard from './components/CashierDashboard';
import { authService } from './services/auth.service';

export type UserRole = 'student' | 'admin' | 'superadmin' | 'dean' | 'registrar' | 'cashier';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | UserRole>('login');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial load, restore session from localStorage if token exists
  useEffect(() => {
    const initAuth = () => {
      if (authService.isAuthenticated()) {
        const role = authService.getUserRole() as UserRole | null;
        if (role) {
          setUserRole(role);
          setCurrentView(role);
        } else {
          setCurrentView('login');
        }
      } else {
        setCurrentView('login');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentView(role);
  };

  const handleLogout = () => {
    authService.logout();
    setUserRole(null);
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-slate-600 text-sm">Loading application...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {currentView === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentView === 'superadmin' && <SuperadminDashboard onLogout={handleLogout} />}
      {currentView === 'dean' && <DeanDashboard onLogout={handleLogout} />}
      {currentView === 'registrar' && <RegistrarDashboard onLogout={handleLogout} />}
      {currentView === 'admin' && <AdminDashboard onLogout={handleLogout} />}
      {currentView === 'cashier' && <CashierDashboard onLogout={handleLogout} />}
      {currentView === 'student' && <StudentDashboard onLogout={handleLogout} />}
    </div>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Domains from './pages/Domains';
import Hosting from './pages/Hosting';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import Backups from './pages/Backups';
import Billing from './pages/Billing';
import AIAlerts from './pages/AIAlerts';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <p className="text-slate-400 font-mono text-sm animate-pulse">INITIALIZING NEXAERP...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-mesh" style={{ background: '#030712' }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)' }} />

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`transition-all duration-300 min-h-screen ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/hosting" element={<Hosting />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/ai-alerts" element={<AIAlerts />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginGuard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

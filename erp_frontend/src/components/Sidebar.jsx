import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Globe, Server, Ticket, Bell,
  Database, CreditCard, Brain, ChevronRight, Zap,
  Shield, Activity, LogOut, Settings
} from 'lucide-react';

const nav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'cyan' },
  { path: '/clients', label: 'Clients', icon: Users, color: 'emerald' },
  { path: '/projects', label: 'Projects', icon: Activity, color: 'violet' },
  { path: '/domains', label: 'Domains & SSL', icon: Globe, color: 'cyan' },
  { path: '/hosting', label: 'Hosting', icon: Server, color: 'amber' },
  { path: '/tickets', label: 'Support Tickets', icon: Ticket, color: 'rose' },
  { path: '/notifications', label: 'Notifications', icon: Bell, color: 'emerald' },
  { path: '/backups', label: 'Backups', icon: Database, color: 'violet' },
  { path: '/billing', label: 'AMC Billing', icon: CreditCard, color: 'amber' },
  { path: '/ai-alerts', label: 'AI Alerts', icon: Brain, color: 'rose' },
];

const colorMap = {
  cyan: 'text-cyan-400 bg-cyan-400/10',
  emerald: 'text-emerald-400 bg-emerald-400/10',
  violet: 'text-violet-400 bg-violet-400/10',
  amber: 'text-amber-400 bg-amber-400/10',
  rose: 'text-rose-400 bg-rose-400/10',
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-64'}`}
      style={{ background: 'rgba(10,15,30,0.97)', borderRight: '1px solid rgba(51,65,85,0.4)' }}>
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-base font-bold gradient-text leading-tight">NexaERP</h1>
            <p className="text-[10px] text-slate-500 font-mono">POST-DELIVERY SUITE</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-500 hover:text-cyan-400 transition-colors p-1 rounded-lg hover:bg-white/5">
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* User */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-[10px] text-emerald-400 font-mono">ONLINE</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ path, label, icon: Icon, color }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'text-white bg-gradient-to-r from-cyan-500/15 to-transparent border border-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : ''}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                ${isActive ? colorMap[color] : 'text-slate-500 bg-transparent'}
                ${!isActive ? 'group-hover:' + colorMap[color] : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-800/60 space-y-1">
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400
          hover:text-white hover:bg-white/5 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Settings' : ''}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          {!collapsed && <span>Settings</span>}
        </button>
        <button onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400
          hover:text-rose-300 hover:bg-rose-500/10 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : ''}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Version */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-slate-500 font-mono">v2.0.0 • AI-POWERED</span>
          </div>
        </div>
      )}
    </aside>
  );
}

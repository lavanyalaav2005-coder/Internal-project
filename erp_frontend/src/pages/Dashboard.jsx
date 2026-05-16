import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Header from '../components/Header';
import {
  Users, Globe, Ticket, Brain, Database, CreditCard, Server, 
  AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 border border-cyan-500/20 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/');
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const pieData = stats ? [
    { name: 'Active Clients', value: stats.active_clients },
    { name: 'Open Tickets', value: stats.open_tickets },
    { name: 'AI Alerts', value: stats.unresolved_alerts },
    { name: 'Expiring Domains', value: stats.expiring_domains },
    { name: 'Failed Backups', value: stats.failed_backups || 1 },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
        <p className="text-slate-400 text-sm font-mono animate-pulse">LOADING INTELLIGENCE...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <Header title="Command Center" subtitle="Real-time overview of all client operations" onRefresh={fetchStats} loading={loading} />

      {/* AI Insight Banner */}
      <div className="mb-6 p-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">AI System Analysis</p>
          <p className="text-xs text-slate-400 truncate">
            {stats?.unresolved_alerts > 0 
              ? `⚠️ ${stats.unresolved_alerts} active alerts detected. ${stats.expiring_domains} domains expiring soon. Immediate action recommended.`
              : '✅ All systems operating nominally. No critical issues detected.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-violet-400 text-xs font-mono px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 flex-shrink-0">
          <Zap className="w-3 h-3" /> AI ACTIVE
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Clients" value={stats?.total_clients || 0}
          subtitle={`${stats?.active_clients || 0} active`} icon={Users} color="cyan"
          glowClass="stat-glow-cyan" trend="up" trendValue="+2" />
        <StatCard title="Expiring Domains" value={stats?.expiring_domains || 0}
          subtitle={`${stats?.expired_domains || 0} already expired`} icon={Globe}
          color={stats?.expiring_domains > 0 ? 'rose' : 'emerald'}
          glowClass={stats?.expiring_domains > 0 ? 'stat-glow-rose' : 'stat-glow-emerald'} />
        <StatCard title="Open Tickets" value={stats?.open_tickets || 0}
          subtitle={`${stats?.critical_tickets || 0} critical`} icon={Ticket}
          color={stats?.critical_tickets > 0 ? 'rose' : 'amber'}
          glowClass={stats?.critical_tickets > 0 ? 'stat-glow-rose' : 'stat-glow-amber'} />
        <StatCard title="AI Alerts" value={stats?.unresolved_alerts || 0}
          subtitle="Predictive warnings" icon={Brain}
          color={stats?.unresolved_alerts > 0 ? 'violet' : 'emerald'}
          glowClass="stat-glow-violet" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="SLA Breached" value={stats?.sla_breached || 0}
          subtitle="Needs attention" icon={AlertTriangle} color="rose" glowClass="stat-glow-rose" />
        <StatCard title="Revenue Collected" value={`₹${((stats?.total_revenue || 0) / 1000).toFixed(0)}K`}
          subtitle="Total paid invoices" icon={CreditCard} color="emerald" glowClass="stat-glow-emerald" trend="up" trendValue="+12%" />
        <StatCard title="Pending Invoices" value={`₹${((stats?.pending_invoices || 0) / 1000).toFixed(0)}K`}
          subtitle="Due / overdue" icon={Clock} color="amber" glowClass="stat-glow-amber" />
        <StatCard title="Backups (7d)" value={stats?.recent_backups || 0}
          subtitle={`${stats?.failed_backups || 0} failed`} icon={Database}
          color={stats?.failed_backups > 0 ? 'rose' : 'emerald'} glowClass="stat-glow-emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Ticket Trend */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white">Ticket Activity</h3>
              <p className="text-xs text-slate-500">Last 7 days trend</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Activity className="w-3 h-3" /> LIVE
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.ticket_trend || []}>
              <defs>
                <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tickets" name="Tickets" stroke="#06b6d4" strokeWidth={2} fill="url(#ticketGrad)" dot={{ fill: '#06b6d4', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="card">
          <div className="mb-5">
            <h3 className="font-bold text-white">System Overview</h3>
            <p className="text-xs text-slate-500">Current distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}></div>
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-semibold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Client', icon: Users, color: 'cyan', path: '/clients' },
            { label: 'New Ticket', icon: Ticket, color: 'rose', path: '/tickets' },
            { label: 'Check Domains', icon: Globe, color: 'amber', path: '/domains' },
            { label: 'View AI Alerts', icon: Brain, color: 'violet', path: '/ai-alerts' },
          ].map(({ label, icon: Icon, color, path }) => {
            const cMap = { cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40', rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40', amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40', violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40' };
            return (
              <a href={path} key={label}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${cMap[color]}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium text-white">{label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

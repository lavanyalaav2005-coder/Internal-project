import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Brain, AlertTriangle, Info, Zap, CheckCircle, Plus, TrendingUp } from 'lucide-react';

const SEV = {
  critical: { cls: 'text-rose-400 bg-rose-400/10 border-rose-500/30', glow: 'border-l-4 border-l-rose-500', icon: AlertTriangle },
  warning: { cls: 'text-amber-400 bg-amber-400/10 border-amber-500/30', glow: 'border-l-4 border-l-amber-500', icon: TrendingUp },
  info: { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/30', glow: 'border-l-4 border-l-cyan-500', icon: Info },
};

const EMPTY = { client: '', title: '', description: '', severity: 'warning', prediction_confidence: 0.85, recommended_action: '' };

export default function AIAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('active');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([api.get('/ai-alerts/'), api.get('/clients/')]);
      setAlerts(a.data.results || a.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resolveAlert = async (id) => {
    try { await api.post(`/ai-alerts/${id}/resolve/`); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/ai-alerts/', form);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = alerts.filter(a => filter === 'all' ? true : filter === 'active' ? !a.is_resolved : a.is_resolved);

  return (
    <div className="animate-slide-up">
      <Header title="AI Predictive Alerts" subtitle="Machine learning powered issue detection" onRefresh={fetchAll} loading={loading} />

      {/* AI Header Card */}
      <div className="card mb-6 border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 animate-pulse-slow">
            <Brain className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Detection Engine</h3>
            <p className="text-sm text-slate-400">Analyzing patterns across {clients.length} clients • Predictive models active</p>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Total', val: alerts.length, cls: 'text-cyan-400' },
              { label: 'Active', val: alerts.filter(a => !a.is_resolved).length, cls: 'text-amber-400' },
              { label: 'Critical', val: alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length, cls: 'text-rose-400' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.cls}`}>{s.val}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {[['active', 'Active'], ['resolved', 'Resolved'], ['all', 'All']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === v
              ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white border border-violet-500/30'
              : 'glass text-slate-400 border border-slate-700/60 hover:text-white'}`}>
            {l}
          </button>
        ))}
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2 ml-auto">
          <Plus className="w-4 h-4" /> Add Alert
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(alert => {
          const s = SEV[alert.severity];
          const Icon = s.icon;
          return (
            <div key={alert.id} className={`card ${s.glow} ${alert.is_resolved ? 'opacity-60' : ''} group`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.cls}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`badge border ${s.cls}`}>{alert.severity.toUpperCase()}</div>
                        {alert.is_resolved && <div className="badge text-emerald-400 bg-emerald-400/10 border border-emerald-500/20"><CheckCircle className="w-3 h-3" />Resolved</div>}
                      </div>
                      <h3 className="font-bold text-white">{alert.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-500/10 px-2.5 py-1.5 rounded-xl border border-violet-500/20 mb-1">
                        <Zap className="w-3 h-3" />
                        <span>{(alert.prediction_confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{alert.client_name}</p>
                    </div>
                  </div>

                  {alert.recommended_action && (
                    <div className="mt-3 p-3 rounded-xl bg-white/3 border border-slate-800/60">
                      <p className="text-xs font-semibold text-slate-300 mb-1">💡 Recommended Action</p>
                      <p className="text-xs text-slate-400">{alert.recommended_action}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-slate-600">{new Date(alert.created_at).toLocaleDateString()}</span>
                    {!alert.is_resolved && (
                      <button onClick={() => resolveAlert(alert.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card text-center py-16 text-slate-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No alerts found</p>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add AI Alert">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
            <select value={form.client} onChange={f('client')} required className="select-field">
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Alert Title *</label>
            <input value={form.title} onChange={f('title')} required className="input-field" placeholder="e.g., CPU Spike Predicted" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Severity</label>
            <select value={form.severity} onChange={f('severity')} className="select-field">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Description *</label>
            <textarea value={form.description} onChange={f('description')} required rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Recommended Action</label>
            <textarea value={form.recommended_action} onChange={f('recommended_action')} rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Confidence: {(form.prediction_confidence * 100).toFixed(0)}%</label>
            <input type="range" min="0.5" max="1" step="0.01" value={form.prediction_confidence}
              onChange={f('prediction_confidence')} className="w-full accent-violet-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Add Alert'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

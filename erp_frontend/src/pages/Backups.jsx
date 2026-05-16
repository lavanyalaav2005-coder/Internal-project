import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Database, Plus, CheckCircle, XCircle, Loader, Clock, HardDrive } from 'lucide-react';

const STATUS_MAP = {
  success: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25', icon: CheckCircle },
  failed: { cls: 'text-rose-400 bg-rose-400/10 border-rose-500/25', icon: XCircle },
  in_progress: { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/25', icon: Loader },
  pending: { cls: 'text-amber-400 bg-amber-400/10 border-amber-500/25', icon: Clock },
};

const EMPTY = { client: '', backup_type: 'full', status: 'pending', size_mb: 0, location: '', retention_days: 30 };

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([api.get('/backups/'), api.get('/clients/')]);
      setBackups(b.data.results || b.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/backups/', form);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const totalSize = backups.filter(b => b.status === 'success').reduce((s, b) => s + b.size_mb, 0);

  return (
    <div className="animate-slide-up">
      <Header title="Backup & Recovery" subtitle="Monitor all backup jobs" onRefresh={fetchAll} loading={loading} />

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Backups', val: backups.length, cls: 'text-cyan-400 border-cyan-500/20' },
          { label: 'Successful', val: backups.filter(b => b.status === 'success').length, cls: 'text-emerald-400 border-emerald-500/20' },
          { label: 'Failed', val: backups.filter(b => b.status === 'failed').length, cls: 'text-rose-400 border-rose-500/20' },
          { label: 'Total Size', val: `${(totalSize/1024).toFixed(1)} GB`, cls: 'text-violet-400 border-violet-500/20' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.cls.split(' ')[1]} text-center`}>
            <p className={`text-2xl font-bold ${s.cls.split(' ')[0]}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Backup
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Client','Type','Status','Size','Location','Retention','Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map(b => {
                const s = STATUS_MAP[b.status];
                const Icon = s.icon;
                return (
                  <tr key={b.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Database className="w-4 h-4 text-violet-400" />
                        </div>
                        <span className="font-medium text-white">{b.client_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">{b.backup_type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`badge border ${s.cls}`}><Icon className={`w-3 h-3 ${b.status === 'in_progress' ? 'animate-spin' : ''}`} />{b.status.replace('_',' ')}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-300 text-xs">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        {b.size_mb > 0 ? `${b.size_mb < 1024 ? b.size_mb + ' MB' : (b.size_mb/1024).toFixed(1) + ' GB'}` : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 max-w-40 truncate">{b.location || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{b.retention_days}d</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(b.started_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {backups.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500"><Database className="w-8 h-8 mx-auto mb-2 opacity-30" />No backup records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Log Backup">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Type</label>
              <select value={form.backup_type} onChange={f('backup_type')} className="select-field">
                {['full','incremental','differential'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={f('status')} className="select-field">
                {['pending','in_progress','success','failed'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Size (MB)</label>
              <input type="number" value={form.size_mb} onChange={f('size_mb')} className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Retention (days)</label>
              <input type="number" value={form.retention_days} onChange={f('retention_days')} className="input-field" /></div>
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Storage Location</label>
              <input value={form.location} onChange={f('location')} className="input-field" placeholder="AWS S3 bucket/path" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Log Backup'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

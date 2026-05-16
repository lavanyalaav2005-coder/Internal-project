import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Server, Plus, Edit2, Cpu, HardDrive, Wifi, Activity } from 'lucide-react';

const getStatusCls = (s) => ({
  active: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25',
  expiring_soon: 'text-amber-400 bg-amber-400/10 border-amber-500/25',
  expired: 'text-rose-400 bg-rose-400/10 border-rose-500/25',
  suspended: 'text-slate-400 bg-slate-400/10 border-slate-500/25',
}[s] || 'text-slate-400 bg-slate-400/10 border-slate-500/25');

const EMPTY = { client: '', provider: '', hosting_type: 'cloud', server_ip: '', datacenter: '', expiry_date: '', monthly_cost: '', cpu_usage: 0, memory_usage: 0, disk_usage: 0 };

const UsageBar = ({ label, val, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${val > 80 ? 'text-rose-400' : val > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>{val?.toFixed(1)}%</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${val}%`, background: val > 80 ? '#f43f5e' : val > 60 ? '#f59e0b' : '#10b981' }}></div>
    </div>
  </div>
);

export default function Hosting() {
  const [hostings, setHostings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [h, c] = await Promise.all([api.get('/hostings/'), api.get('/clients/')]);
      setHostings(h.data.results || h.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (h) => { setEditing(h.id); setForm({ ...h }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.server_ip) delete payload.server_ip;
      if (editing) await api.patch(`/hostings/${editing}/`, payload);
      else await api.post('/hostings/', payload);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="animate-slide-up">
      <Header title="Hosting Management" subtitle="Server health & expiry monitoring" onRefresh={fetchAll} loading={loading} />

      <div className="flex justify-end mb-6">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Hosting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hostings.map(h => (
          <div key={h.id} className="card glass-hover group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Server className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{h.provider}</h3>
                  <p className="text-xs text-slate-400">{h.client_name} • {h.hosting_type.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`badge border ${getStatusCls(h.status)}`}>{h.status.replace('_', ' ')}</div>
                <button onClick={() => openEdit(h)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              {h.server_ip && <div><p className="text-slate-500">Server IP</p><p className="text-white font-mono">{h.server_ip}</p></div>}
              {h.datacenter && <div><p className="text-slate-500">Datacenter</p><p className="text-white">{h.datacenter}</p></div>}
              <div><p className="text-slate-500">Expiry</p><p className="text-white">{h.expiry_date}</p></div>
              <div><p className="text-slate-500">Monthly Cost</p><p className="text-emerald-400 font-semibold">₹{h.monthly_cost}</p></div>
              <div><p className="text-slate-500">Uptime</p><p className="text-emerald-400 font-semibold">{h.uptime_percentage}%</p></div>
            </div>

            <div className="space-y-2.5">
              <UsageBar label="CPU" val={h.cpu_usage} />
              <UsageBar label="Memory" val={h.memory_usage} />
              <UsageBar label="Disk" val={h.disk_usage} />
            </div>
          </div>
        ))}
        {hostings.length === 0 && !loading && (
          <div className="col-span-2 card text-center py-16 text-slate-500">
            <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />No hosting records found
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Hosting' : 'Add Hosting'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Provider *</label>
              <input value={form.provider} onChange={f('provider')} required className="input-field" placeholder="AWS, GCP, Azure..." /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Type</label>
              <select value={form.hosting_type} onChange={f('hosting_type')} className="select-field">
                {['shared','vps','dedicated','cloud','managed'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Server IP</label>
              <input value={form.server_ip} onChange={f('server_ip')} className="input-field" placeholder="192.168.1.1" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Datacenter</label>
              <input value={form.datacenter} onChange={f('datacenter')} className="input-field" placeholder="us-east-1" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Expiry Date *</label>
              <input value={form.expiry_date} onChange={f('expiry_date')} required type="date" className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Monthly Cost (₹)</label>
              <input value={form.monthly_cost} onChange={f('monthly_cost')} type="number" className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">CPU Usage %</label>
              <input value={form.cpu_usage} onChange={f('cpu_usage')} type="number" step="0.1" min="0" max="100" className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Memory Usage %</label>
              <input value={form.memory_usage} onChange={f('memory_usage')} type="number" step="0.1" min="0" max="100" className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Disk Usage %</label>
              <input value={form.disk_usage} onChange={f('disk_usage')} type="number" step="0.1" min="0" max="100" className="input-field" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

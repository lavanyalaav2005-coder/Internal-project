import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Globe, Plus, Edit2, Trash2, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Calendar, Lock } from 'lucide-react';

const getDomainStatus = (days) => {
  if (days < 0) return { label: 'Expired', cls: 'text-rose-400 bg-rose-400/10 border-rose-500/25', icon: XCircle };
  if (days <= 30) return { label: 'Expiring Soon', cls: 'text-amber-400 bg-amber-400/10 border-amber-500/25', icon: AlertTriangle };
  return { label: 'Active', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25', icon: CheckCircle };
};

const EMPTY = { client: '', domain_name: '', registrar: '', expiry_date: '', ssl_expiry: '', ssl_issuer: '', status: 'active', auto_renew: true, dns_provider: '' };

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([api.get('/domains/'), api.get('/clients/')]);
      setDomains(d.data.results || d.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = domains.filter(d => {
    if (filter === 'expiring') return d.days_until_expiry <= 30 && d.days_until_expiry >= 0;
    if (filter === 'expired') return d.days_until_expiry < 0;
    return true;
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (d) => { setEditing(d.id); setForm({ ...d, ssl_expiry: d.ssl_expiry || '', client: d.client }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.ssl_expiry) delete payload.ssl_expiry;
      if (editing) await api.patch(`/domains/${editing}/`, payload);
      else await api.post('/domains/', payload);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const expiringSoon = domains.filter(d => d.days_until_expiry >= 0 && d.days_until_expiry <= 30).length;
  const expired = domains.filter(d => d.days_until_expiry < 0).length;

  return (
    <div className="animate-slide-up">
      <Header title="Domains & SSL" subtitle="Track domain renewals and SSL certificates" onRefresh={fetchAll} loading={loading} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Domains', val: domains.length, cls: 'text-cyan-400', border: 'border-cyan-500/20' },
          { label: 'Expiring Soon', val: expiringSoon, cls: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Expired', val: expired, cls: 'text-rose-400', border: 'border-rose-500/20' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.border} text-center`}>
            <p className={`text-3xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {[['all', 'All'], ['expiring', '⚠️ Expiring'], ['expired', '❌ Expired']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === v
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-white border border-cyan-500/30'
                : 'glass text-slate-400 border border-slate-700/60 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 ml-auto">
          <Plus className="w-4 h-4" /> Add Domain
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrar</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">SSL</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(domain => {
                const st = getDomainStatus(domain.days_until_expiry);
                const StatusIcon = st.icon;
                return (
                  <tr key={domain.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                          <Globe className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{domain.domain_name}</p>
                          {domain.auto_renew && <p className="text-[10px] text-emerald-400 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> Auto-renew</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{domain.client_name}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{domain.registrar || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-slate-300 text-xs flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" />{domain.expiry_date}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${domain.days_until_expiry < 0 ? 'text-rose-400' : domain.days_until_expiry <= 30 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {domain.days_until_expiry < 0 ? `${Math.abs(domain.days_until_expiry)}d ago` : `${domain.days_until_expiry}d left`}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {domain.ssl_expiry ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <Lock className="w-3 h-3" /> {domain.ssl_expiry}
                        </div>
                      ) : <span className="text-slate-600 text-xs">No SSL</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`badge border ${st.cls}`}><StatusIcon className="w-3 h-3" />{st.label}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(domain)} className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500"><Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />No domains found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Domain' : 'Add Domain'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Domain Name *</label>
              <input value={form.domain_name} onChange={f('domain_name')} required className="input-field" placeholder="example.com" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Registrar</label>
              <input value={form.registrar} onChange={f('registrar')} className="input-field" placeholder="GoDaddy" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">DNS Provider</label>
              <input value={form.dns_provider} onChange={f('dns_provider')} className="input-field" placeholder="Cloudflare" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Expiry Date *</label>
              <input value={form.expiry_date} onChange={f('expiry_date')} required type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">SSL Expiry</label>
              <input value={form.ssl_expiry} onChange={f('ssl_expiry')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">SSL Issuer</label>
              <input value={form.ssl_issuer} onChange={f('ssl_issuer')} className="input-field" placeholder="Let's Encrypt" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="autorenew" checked={form.auto_renew} onChange={f('auto_renew')} className="w-4 h-4 rounded accent-cyan-500" />
              <label htmlFor="autorenew" className="text-sm text-slate-300">Auto Renew</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Add Domain'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Activity, Plus, Edit2, Code2, Calendar, Heart } from 'lucide-react';

const STATUS_COLORS = {
  planning: 'text-slate-400 bg-slate-400/10 border-slate-500/25',
  development: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/25',
  testing: 'text-violet-400 bg-violet-400/10 border-violet-500/25',
  delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25',
  maintenance: 'text-amber-400 bg-amber-400/10 border-amber-500/25',
};

const EMPTY = { client: '', name: '', description: '', tech_stack: '', status: 'development', start_date: '', delivery_date: '', health_score: 100 };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/projects/'), api.get('/clients/')]);
      setProjects(p.data.results || p.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p) => { setEditing(p.id); setForm({ ...p, start_date: p.start_date || '', delivery_date: p.delivery_date || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.delivery_date) delete payload.delivery_date;
      if (editing) await api.patch(`/projects/${editing}/`, payload);
      else await api.post('/projects/', payload);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="animate-slide-up">
      <Header title="Projects" subtitle="Track all client deliveries" onRefresh={fetchAll} loading={loading} />

      <div className="flex justify-end mb-6">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(proj => (
          <div key={proj.id} className="card glass-hover group">
            <div className="flex items-start justify-between mb-3">
              <div className={`badge border ${STATUS_COLORS[proj.status]}`}>{proj.status}</div>
              <button onClick={() => openEdit(proj)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="font-bold text-white mb-1">{proj.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{proj.client_name}</p>
            {proj.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{proj.description}</p>}
            {proj.tech_stack && (
              <div className="flex items-center gap-1.5 text-xs text-violet-400 mb-3 flex-wrap">
                <Code2 className="w-3 h-3" />
                {proj.tech_stack.split(',').map(t => (
                  <span key={t} className="bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">{t.trim()}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <Heart className={`w-3.5 h-3.5 ${proj.health_score >= 80 ? 'text-emerald-400' : proj.health_score >= 50 ? 'text-amber-400' : 'text-rose-400'}`} />
              <div className="flex-1 progress-bar">
                <div className="progress-fill" style={{ width: `${proj.health_score}%`, background: proj.health_score >= 80 ? '#10b981' : proj.health_score >= 50 ? '#f59e0b' : '#f43f5e' }}></div>
              </div>
              <span className="text-xs text-slate-400">{proj.health_score}%</span>
            </div>
            {(proj.start_date || proj.delivery_date) && (
              <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800/60 pt-3">
                <Calendar className="w-3 h-3" />
                {proj.start_date && <span>{proj.start_date}</span>}
                {proj.start_date && proj.delivery_date && <span>→</span>}
                {proj.delivery_date && <span>{proj.delivery_date}</span>}
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && !loading && (
          <div className="col-span-3 card text-center py-16 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />No projects yet
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select></div>
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Project Name *</label>
              <input value={form.name} onChange={f('name')} required className="input-field" placeholder="E-Commerce Platform" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={f('status')} className="select-field">
                {['planning','development','testing','delivered','maintenance'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Health Score ({form.health_score}%)</label>
              <input type="range" min="0" max="100" value={form.health_score} onChange={f('health_score')} className="w-full accent-emerald-500 mt-3" /></div>
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Tech Stack</label>
              <input value={form.tech_stack} onChange={f('tech_stack')} className="input-field" placeholder="React, Django, PostgreSQL" /></div>
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={f('description')} rows={2} className="input-field resize-none" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Start Date</label>
              <input value={form.start_date} onChange={f('start_date')} type="date" className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Delivery Date</label>
              <input value={form.delivery_date} onChange={f('delivery_date')} type="date" className="input-field" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

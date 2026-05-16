import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Ticket, Plus, Edit2, AlertTriangle, Clock, CheckCircle, ArrowUpCircle, Filter, User } from 'lucide-react';

const PRIORITY_MAP = {
  critical: { cls: 'text-rose-400 bg-rose-400/10 border-rose-500/25', dot: 'bg-rose-500' },
  high: { cls: 'text-amber-400 bg-amber-400/10 border-amber-500/25', dot: 'bg-amber-500' },
  medium: { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/25', dot: 'bg-cyan-500' },
  low: { cls: 'text-slate-400 bg-slate-400/10 border-slate-500/25', dot: 'bg-slate-500' },
};

const STATUS_MAP = {
  open: { cls: 'text-amber-400 bg-amber-400/10 border-amber-500/25', icon: Clock },
  in_progress: { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/25', icon: ArrowUpCircle },
  resolved: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25', icon: CheckCircle },
  closed: { cls: 'text-slate-400 bg-slate-400/10 border-slate-500/25', icon: CheckCircle },
  escalated: { cls: 'text-rose-400 bg-rose-400/10 border-rose-500/25', icon: AlertTriangle },
};

const EMPTY = { client: '', project: '', title: '', description: '', priority: 'medium', category: 'general', assigned_to: '', sla_response_hours: 4, sla_resolution_hours: 24 };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [selected, setSelected] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const [t, c] = await Promise.all([api.get('/tickets/', { params }), api.get('/clients/')]);
      setTickets(t.data.results || t.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filters]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.project) delete payload.project;
      if (editing) await api.patch(`/tickets/${editing}/`, payload);
      else await api.post('/tickets/', payload);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const quickAction = async (id, action) => {
    try {
      await api.post(`/tickets/${id}/${action}/`);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (t) => { setEditing(t.id); setForm({ ...t, project: t.project || '' }); setModal(true); };

  const counts = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    critical: tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length,
    sla: tickets.filter(t => t.is_sla_breached).length,
  };

  return (
    <div className="animate-slide-up">
      <Header title="Support Tickets" subtitle="Manage client issues and SLA tracking" onRefresh={fetchAll} loading={loading} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open', val: counts.open, cls: 'text-amber-400 border-amber-500/20' },
          { label: 'In Progress', val: counts.in_progress, cls: 'text-cyan-400 border-cyan-500/20' },
          { label: 'Critical', val: counts.critical, cls: 'text-rose-400 border-rose-500/20' },
          { label: 'SLA Breached', val: counts.sla, cls: 'text-rose-500 border-rose-500/30' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.cls} text-center`}>
            <p className={`text-2xl font-bold ${s.cls.split(' ')[0]}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))}
          className="select-field w-40">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({...p, priority: e.target.value}))}
          className="select-field w-40">
          <option value="">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 ml-auto">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {tickets.map(ticket => {
          const p = PRIORITY_MAP[ticket.priority];
          const s = STATUS_MAP[ticket.status] || STATUS_MAP.open;
          const StatusIcon = s.icon;
          return (
            <div key={ticket.id} className="card glass-hover group cursor-pointer" onClick={() => setSelected(selected?.id === ticket.id ? null : ticket)}>
              <div className="flex items-start gap-4">
                <div className={`w-1.5 h-full min-h-[3rem] rounded-full flex-shrink-0 ${p.dot}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">#{ticket.id}</span>
                        {ticket.is_sla_breached && (
                          <span className="badge text-rose-400 bg-rose-400/10 border border-rose-500/25">
                            <AlertTriangle className="w-2.5 h-2.5" /> SLA BREACH
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white text-sm">{ticket.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.client_name} {ticket.project_name && `• ${ticket.project_name}`}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`badge border ${p.cls}`}>{ticket.priority}</div>
                      <div className={`badge border ${s.cls}`}><StatusIcon className="w-3 h-3" />{ticket.status.replace('_', ' ')}</div>
                    </div>
                  </div>

                  {selected?.id === ticket.id && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 animate-fade-in">
                      <p className="text-sm text-slate-400 mb-3">{ticket.description}</p>
                      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                        <div><p className="text-slate-500">Category</p><p className="text-white capitalize">{ticket.category}</p></div>
                        <div><p className="text-slate-500">SLA Response</p><p className="text-white">{ticket.sla_response_hours}h</p></div>
                        <div><p className="text-slate-500">SLA Resolution</p><p className="text-white">{ticket.sla_resolution_hours}h</p></div>
                        {ticket.assigned_to && <div><p className="text-slate-500">Assigned</p><p className="text-white">{ticket.assigned_to}</p></div>}
                        <div><p className="text-slate-500">Created</p><p className="text-white">{new Date(ticket.created_at).toLocaleDateString()}</p></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {ticket.assigned_to && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="w-3 h-3" /> {ticket.assigned_to}
                      </div>
                    )}
                    <span className="text-xs text-slate-600 ml-auto">{new Date(ticket.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(ticket)} className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {ticket.status !== 'resolved' && (
                        <button onClick={() => quickAction(ticket.id, 'resolve')} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium">
                          Resolve
                        </button>
                      )}
                      {ticket.status !== 'escalated' && ticket.status !== 'resolved' && (
                        <button onClick={() => quickAction(ticket.id, 'escalate')} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-medium">
                          Escalate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {tickets.length === 0 && !loading && (
          <div className="card text-center py-16 text-slate-500">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No tickets found</p>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Ticket' : 'New Support Ticket'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Priority</label>
              <select value={form.priority} onChange={f('priority')} className="select-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Title *</label>
              <input value={form.title} onChange={f('title')} required className="input-field" placeholder="Describe the issue briefly..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Description *</label>
              <textarea value={form.description} onChange={f('description')} required rows={3} className="input-field resize-none" placeholder="Detailed description..." />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={f('category')} className="select-field">
                {['bug','feature','performance','security','billing','general'].map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Assigned To</label>
              <input value={form.assigned_to} onChange={f('assigned_to')} className="input-field" placeholder="Developer name" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">SLA Response (hrs)</label>
              <input type="number" value={form.sla_response_hours} onChange={f('sla_response_hours')} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">SLA Resolution (hrs)</label>
              <input type="number" value={form.sla_resolution_hours} onChange={f('sla_resolution_hours')} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Create Ticket'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

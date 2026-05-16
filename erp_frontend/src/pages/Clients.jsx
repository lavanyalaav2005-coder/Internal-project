import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Users, Plus, Edit2, Trash2, Phone, Mail, MapPin, Briefcase, Search, CheckCircle, XCircle, PauseCircle } from 'lucide-react';

const STATUS_MAP = {
  active: { label: 'Active', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20', icon: CheckCircle },
  inactive: { label: 'Inactive', cls: 'text-slate-400 bg-slate-400/10 border-slate-500/20', icon: PauseCircle },
  suspended: { label: 'Suspended', cls: 'text-rose-400 bg-rose-400/10 border-rose-500/20', icon: XCircle },
};

const EMPTY = { company_name: '', contact_person: '', email: '', phone: '', address: '', status: 'active', contract_start: '', contract_end: '', notes: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/clients/', { params });
      setClients(data.results || data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c, contract_start: c.contract_start || '', contract_end: c.contract_end || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.contract_start) delete payload.contract_start;
      if (!payload.contract_end) delete payload.contract_end;
      if (editing) await api.patch(`/clients/${editing}/`, payload);
      else await api.post('/clients/', payload);
      setModal(false); fetchClients();
    } catch (err) { alert(err.response?.data ? JSON.stringify(err.response.data) : 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/clients/${deleteModal}/`); setDeleteModal(null); fetchClients(); }
    catch { alert('Error deleting'); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="animate-slide-up">
      <Header title="Client Management" subtitle={`${clients.length} total clients`} onRefresh={fetchClients} loading={loading} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..." className="input-field pl-9" />
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => {
            const s = STATUS_MAP[client.status];
            const StatusIcon = s.icon;
            return (
              <div key={client.id} className="card glass-hover group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center text-lg font-bold text-cyan-400 border border-cyan-500/20">
                      {client.company_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{client.company_name}</h3>
                      <p className="text-xs text-slate-400">{client.contact_person}</p>
                    </div>
                  </div>
                  <div className={`badge border ${s.cls}`}>
                    <StatusIcon className="w-3 h-3" /> {s.label}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail className="w-3 h-3 text-slate-500" /> {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="w-3 h-3 text-slate-500" /> {client.phone}
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500" /> {client.address}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Briefcase className="w-3 h-3" />
                    <span>{client.project_count} projects</span>
                  </div>
                  {client.open_tickets > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {client.open_tickets} open tickets
                    </div>
                  )}
                  <div className="ml-auto flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(client)}
                      className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteModal(client.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {clients.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No clients found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Client' : 'Add New Client'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Company Name *</label>
              <input value={form.company_name} onChange={f('company_name')} required className="input-field" placeholder="TechCorp Solutions" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Contact Person *</label>
              <input value={form.contact_person} onChange={f('contact_person')} required className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={f('status')} className="select-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Email *</label>
              <input value={form.email} onChange={f('email')} required type="email" className="input-field" placeholder="contact@company.com" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Phone</label>
              <input value={form.phone} onChange={f('phone')} className="input-field" placeholder="+91-9876543210" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Contract Start</label>
              <input value={form.contract_start} onChange={f('contract_start')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Contract End</label>
              <input value={form.contract_end} onChange={f('contract_end')} type="date" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Address</label>
              <input value={form.address} onChange={f('address')} className="input-field" placeholder="City, State, Country" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Notes</label>
              <textarea value={form.notes} onChange={f('notes')} rows={2} className="input-field resize-none" placeholder="Any additional notes..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editing ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Client" size="sm">
        <p className="text-slate-400 mb-5">This will permanently delete the client and all associated data. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

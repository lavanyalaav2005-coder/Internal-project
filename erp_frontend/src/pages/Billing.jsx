import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { CreditCard, Plus, CheckCircle, Clock, AlertTriangle, XCircle, IndianRupee, Calendar } from 'lucide-react';

const STATUS_MAP = {
  active: { cls: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/25', icon: Clock },
  due: { cls: 'text-amber-400 bg-amber-400/10 border-amber-500/25', icon: AlertTriangle },
  overdue: { cls: 'text-rose-400 bg-rose-400/10 border-rose-500/25', icon: XCircle },
  paid: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25', icon: CheckCircle },
  cancelled: { cls: 'text-slate-400 bg-slate-400/10 border-slate-500/25', icon: XCircle },
};

const EMPTY = { client: '', invoice_number: '', amount: '', due_date: '', status: 'active', description: '', period_start: '', period_end: '' };

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([api.get('/amc-billing/'), api.get('/clients/')]);
      setBills(b.data.results || b.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    const num = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`;
    setEditing(null); setForm({ ...EMPTY, invoice_number: num }); setModal(true);
  };
  const openEdit = (b) => { setEditing(b.id); setForm({ ...b, paid_date: b.paid_date || '', period_start: b.period_start || '', period_end: b.period_end || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.paid_date) delete payload.paid_date;
      if (!payload.period_start) delete payload.period_start;
      if (!payload.period_end) delete payload.period_end;
      if (editing) await api.patch(`/amc-billing/${editing}/`, payload);
      else await api.post('/amc-billing/', payload);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = filterStatus ? bills.filter(b => b.status === filterStatus) : bills;

  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalPending = bills.filter(b => ['due','overdue'].includes(b.status)).reduce((s, b) => s + parseFloat(b.amount), 0);

  return (
    <div className="animate-slide-up">
      <Header title="AMC Billing" subtitle="Annual maintenance contract tracking" onRefresh={fetchAll} loading={loading} />

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card border border-emerald-500/20 stat-glow-emerald">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">₹{(totalPaid/1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400 mt-0.5">Revenue Collected</p>
        </div>
        <div className="card border border-rose-500/20 stat-glow-rose">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400">₹{(totalPending/1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400 mt-0.5">Pending Amount</p>
        </div>
        <div className="card border border-cyan-500/20 text-center">
          <p className="text-2xl font-bold text-cyan-400">{bills.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Invoices</p>
        </div>
        <div className="card border border-amber-500/20 text-center">
          <p className="text-2xl font-bold text-amber-400">{bills.filter(b => b.status === 'overdue').length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[['', 'All'], ['active', 'Active'], ['due', 'Due'], ['overdue', 'Overdue'], ['paid', 'Paid']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === v
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-white border border-cyan-500/30'
                : 'glass text-slate-400 border border-slate-700/60 hover:text-white'}`}>{l}</button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 ml-auto">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Invoice','Client','Amount','Due Date','Period','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(bill => {
                const s = STATUS_MAP[bill.status];
                const Icon = s.icon;
                return (
                  <tr key={bill.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-mono text-cyan-400 text-xs font-semibold">{bill.invoice_number}</p>
                          {bill.description && <p className="text-[10px] text-slate-500 truncate max-w-28">{bill.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{bill.client_name}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3 text-emerald-400" />
                        {parseFloat(bill.amount).toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-500" /> {bill.due_date}
                      </div>
                      {bill.paid_date && <p className="text-[10px] text-emerald-400 mt-0.5">Paid: {bill.paid_date}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {bill.period_start && bill.period_end
                        ? `${bill.period_start} → ${bill.period_end}` : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`badge border ${s.cls}`}><Icon className="w-3 h-3" />{bill.status}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openEdit(bill)}
                        className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />No invoices found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Invoice' : 'New Invoice'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Invoice No. *</label>
              <input value={form.invoice_number} onChange={f('invoice_number')} required className="input-field font-mono" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={f('amount')} required className="input-field" placeholder="50000" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Due Date *</label>
              <input type="date" value={form.due_date} onChange={f('due_date')} required className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={f('status')} className="select-field">
                {['active','due','overdue','paid','cancelled'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Period Start</label>
              <input type="date" value={form.period_start} onChange={f('period_start')} className="input-field" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Period End</label>
              <input type="date" value={form.period_end} onChange={f('period_end')} className="input-field" /></div>
            {form.status === 'paid' && (
              <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Paid Date</label>
                <input type="date" value={form.paid_date} onChange={f('paid_date')} className="input-field" /></div>
            )}
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={f('description')} rows={2} className="input-field resize-none" placeholder="Annual Maintenance Contract..." /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Create Invoice'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

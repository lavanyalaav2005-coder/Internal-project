import { useState, useEffect } from 'react';
import api from '../api/axios';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Bell, Plus, Send, Mail, MessageSquare, Smartphone, CheckCircle2, Clock, XCircle, Zap } from 'lucide-react';

const CHANNEL_ICONS = { email: Mail, sms: Smartphone, whatsapp: MessageSquare, app: Bell };
const CHANNEL_CLS = { email: 'text-cyan-400 bg-cyan-400/10', sms: 'text-amber-400 bg-amber-400/10', whatsapp: 'text-emerald-400 bg-emerald-400/10', app: 'text-violet-400 bg-violet-400/10' };
const STATUS_MAP = { pending: { cls: 'text-amber-400 bg-amber-400/10 border-amber-500/25', icon: Clock }, sent: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25', icon: CheckCircle2 }, failed: { cls: 'text-rose-400 bg-rose-400/10 border-rose-500/25', icon: XCircle }, read: { cls: 'text-slate-400 bg-slate-400/10 border-slate-500/25', icon: CheckCircle2 } };

const EMPTY = { client: '', notification_type: 'general', title: '', message: '', channel: 'email', priority: 'medium' };

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [n, c] = await Promise.all([api.get('/notifications/'), api.get('/clients/')]);
      setNotifs(n.data.results || n.data);
      setClients(c.data.results || c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const markSent = async (id) => {
    try { await api.post(`/notifications/${id}/mark_sent/`); fetchAll(); }
    catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/notifications/', form);
      setModal(false); fetchAll();
    } catch (err) { alert(JSON.stringify(err.response?.data || 'Error')); }
    finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="animate-slide-up">
      <Header title="Notifications" subtitle="Automated client communication hub" onRefresh={fetchAll} loading={loading} />

      <div className="grid grid-cols-4 gap-3 mb-6">
        {['pending','sent','failed','read'].map(s => {
          const st = STATUS_MAP[s];
          const Icon = st.icon;
          return (
            <div key={s} className={`card border ${st.cls} text-center`}>
              <p className={`text-2xl font-bold ${st.cls.split(' ')[0]}`}>{notifs.filter(n => n.status === s).length}</p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{s}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Notification
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Notification','Client','Channel','Status','AI Generated','Time'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifs.map(n => {
                const ChannelIcon = CHANNEL_ICONS[n.channel] || Bell;
                const st = STATUS_MAP[n.status];
                const StatusIcon = st.icon;
                return (
                  <tr key={n.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white text-sm">{n.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-48">{n.message}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{n.client_name}</td>
                    <td className="px-4 py-3.5">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium w-fit ${CHANNEL_CLS[n.channel]}`}>
                        <ChannelIcon className="w-3 h-3" />{n.channel}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`badge border ${st.cls}`}><StatusIcon className="w-3 h-3" />{n.status}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {n.is_ai_generated ? (
                        <div className="flex items-center gap-1 text-violet-400 text-xs">
                          <Zap className="w-3 h-3" /> AI Generated
                        </div>
                      ) : <span className="text-slate-600 text-xs">Manual</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      {n.status === 'pending' && (
                        <button onClick={() => markSent(n.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium ml-auto">
                          <Send className="w-3 h-3" /> Send
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {notifs.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500"><Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />No notifications</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Notification">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Client *</label>
              <select value={form.client} onChange={f('client')} required className="select-field">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Type</label>
              <select value={form.notification_type} onChange={f('notification_type')} className="select-field">
                {['domain_expiry','hosting_expiry','ssl_expiry','invoice_due','maintenance','backup','security','sla_breach','general'].map(v => <option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Channel</label>
              <select value={form.channel} onChange={f('channel')} className="select-field">
                {['email','sms','whatsapp','app'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select></div>
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Title *</label>
              <input value={form.title} onChange={f('title')} required className="input-field" /></div>
            <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Message *</label>
              <textarea value={form.message} onChange={f('message')} required rows={3} className="input-field resize-none" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">Priority</label>
              <select value={form.priority} onChange={f('priority')} className="select-field">
                {['low','medium','high','critical'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

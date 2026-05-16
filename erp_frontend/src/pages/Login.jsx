import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Zap, Lock, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      setError('Invalid credentials. Try admin / admin123');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center relative overflow-hidden"
      style={{ background: '#030712' }}>
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)', animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-6 blur-3xl animate-float"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
            bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-glow-cyan mb-5 animate-float">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">NexaERP</h1>
          <p className="text-slate-400 text-sm">Post-Delivery Intelligence Suite</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex gap-1">
              {['cyan','emerald','violet'].map(c => (
                <div key={c} className={`w-1.5 h-1.5 rounded-full bg-${c}-400`}></div>
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500">AI-POWERED PLATFORM</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-slate-700/50"
          style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.08)' }}>
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to your dashboard</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">!</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))}
                  className="input-field pl-10" placeholder="Enter username" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className="input-field pl-10 pr-10" placeholder="Enter password" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Authenticating...</>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo: <code className="font-mono text-cyan-400">admin</code> / <code className="font-mono text-cyan-400">admin123</code></span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">© 2024 NexaERP • Built with React & Django</p>
      </div>
    </div>
  );
}

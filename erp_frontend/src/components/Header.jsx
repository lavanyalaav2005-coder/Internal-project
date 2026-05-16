import { Bell, Search, RefreshCw, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Header({ title, subtitle, onRefresh, loading }) {
  const [searching, setSearching] = useState(false);

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className={`relative transition-all duration-300 ${searching ? 'w-56' : 'w-36'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            onFocus={() => setSearching(true)}
            onBlur={() => setSearching(false)}
            placeholder="Search…"
            className="w-full glass text-slate-300 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-700/60 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-slate-600"
          />
        </div>
        {onRefresh && (
          <button onClick={onRefresh}
            className="glass border border-slate-700/60 p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button className="relative glass border border-slate-700/60 p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">3</span>
        </button>
        <div className="flex items-center gap-2 glass border border-slate-700/60 px-3 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs text-slate-400 font-mono">LIVE</span>
        </div>
      </div>
    </header>
  );
}

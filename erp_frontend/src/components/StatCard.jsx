import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'cyan', trend, trendValue, glowClass }) {
  const colorMap = {
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-500/20' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-500/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-500/20' },
  };
  const c = colorMap[color];

  return (
    <div className={`card ${glowClass || ''} border ${c.border} cursor-default group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg
            ${trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold ${c.text} mb-1`}>{value}</p>
        <p className="text-sm font-medium text-white">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

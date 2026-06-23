import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: 'brand' | 'emerald' | 'amber' | 'purple' | 'rose';
  delta?: string;
  suffix?: string;
}

const COLOR_MAP = {
  brand:   { bg: 'from-brand-900/50 to-brand-800/30',   icon: 'bg-brand-500/20 text-brand-400',   border: 'border-brand-700/30' },
  emerald: { bg: 'from-emerald-900/50 to-emerald-800/30', icon: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-700/30' },
  amber:   { bg: 'from-amber-900/50 to-amber-800/30',   icon: 'bg-amber-500/20 text-amber-400',   border: 'border-amber-700/30' },
  purple:  { bg: 'from-purple-900/50 to-purple-800/30', icon: 'bg-purple-500/20 text-purple-400', border: 'border-purple-700/30' },
  rose:    { bg: 'from-rose-900/50 to-rose-800/30',     icon: 'bg-rose-500/20 text-rose-400',     border: 'border-rose-700/30' },
};

export default function MetricCard({ label, value, icon: Icon, color, delta, suffix }: MetricCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 animate-slide-up`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-extrabold text-dark-50 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg font-semibold text-dark-400 ml-1">{suffix}</span>}
          </p>
          {delta && (
            <p className="text-xs text-dark-400 mt-1.5">{delta}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon} flex-shrink-0`}>
          <Icon size={18} />
        </div>
      </div>
      {/* Decorative glow orb */}
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full ${c.icon} blur-2xl opacity-40`} />
    </div>
  );
}

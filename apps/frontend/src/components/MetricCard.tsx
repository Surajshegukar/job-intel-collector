import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: 'brand' | 'emerald' | 'amber' | 'purple' | 'rose';
  description?: string;
  delta?: string;
  suffix?: string;
}

const COLOR_MAP = {
  brand:   { bg: 'bg-split-brand', icon: 'bg-blue-50 text-blue-600 border border-blue-100/50',   border: 'border-blue-100/30', glow: 'bg-blue-500/5' },
  emerald: { bg: 'bg-split-emerald', icon: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50', border: 'border-emerald-100/30', glow: 'bg-emerald-500/5' },
  amber:   { bg: 'bg-split-amber', icon: 'bg-amber-50 text-amber-600 border border-amber-100/50',   border: 'border-amber-100/30', glow: 'bg-amber-500/5' },
  purple:  { bg: 'bg-split-purple', icon: 'bg-purple-50 text-purple-600 border border-purple-100/50', border: 'border-purple-100/30', glow: 'bg-purple-500/5' },
  rose:    { bg: 'bg-split-brand', icon: 'bg-rose-50 text-rose-600 border border-rose-100/50',     border: 'border-rose-100/30', glow: 'bg-rose-500/5' },
};

export default function MetricCard({ label, value, icon: Icon, color, delta, suffix }: MetricCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-6 shadow-sm shadow-slate-100/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/50 hover:border-slate-200 group animate-slide-up`}>
      
      {/* SVG Grid pattern background for premium texture */}
 

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-extrabold text-slate-800 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-lg font-semibold text-slate-400 ml-1">{suffix}</span>}
          </p>
          {/* {description && (
            <p className="text-[11px] text-slate-400 mt-2.5 font-light leading-normal">{description}</p>
          )} */}
          {delta && (
            <p className="text-xs text-slate-400 mt-2 font-medium">{delta}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} />
        </div>
      </div>

      {/* Decorative glow orb */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${c.glow} blur-2xl opacity-80 group-hover:scale-125 transition-transform duration-500`} />
    </div>
  );
}

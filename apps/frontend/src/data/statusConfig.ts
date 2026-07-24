import type { ApplicationStatus } from '../types';

/** All possible application pipeline stages */
export const STATUS_OPTIONS: ApplicationStatus[] = [
  'Saved',
  'Applied',
  'Interview',
  'Rejected',
  'Offer',
];

/** Tailwind classes for status badge pills */
export const STATUS_BADGE_CONFIG: Record<ApplicationStatus, { bg: string; text: string }> = {
  Saved:     { bg: 'bg-slate-100',   text: 'text-slate-600' },
  Applied:   { bg: 'bg-blue-100',    text: 'text-blue-700' },
  Interview: { bg: 'bg-amber-100',   text: 'text-amber-700' },
  Rejected:  { bg: 'bg-red-100',     text: 'text-red-700' },
  Offer:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

/** Kanban column styles used in the Tracker page */
export const KANBAN_COLUMN_STYLES: Record<
  ApplicationStatus,
  { header: string; card: string; dot: string; count: string }
> = {
  Saved:     { header: 'bg-slate-50 border-slate-200',     card: 'border-slate-100',     dot: 'bg-slate-400',              count: 'bg-slate-100 text-slate-500'   },
  Applied:   { header: 'bg-blue-50 border-blue-100',       card: 'border-blue-100/60',   dot: 'bg-blue-400',               count: 'bg-blue-100 text-blue-600'     },
  Interview: { header: 'bg-amber-50 border-amber-100',     card: 'border-amber-100/60',  dot: 'bg-amber-400 animate-pulse', count: 'bg-amber-100 text-amber-600'   },
  Rejected:  { header: 'bg-red-50 border-red-100',         card: 'border-red-100/60',    dot: 'bg-red-400',                count: 'bg-red-100 text-red-600'       },
  Offer:     { header: 'bg-emerald-50 border-emerald-100', card: 'border-emerald-100/60', dot: 'bg-emerald-400 animate-pulse', count: 'bg-emerald-100 text-emerald-600' },
};

/** Job card status pill colors used in Company drawer */
export function getStatusPillClasses(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    Applied:   'bg-blue-100 text-blue-700',
    Interview: 'bg-amber-100 text-amber-700',
    Offer:     'bg-emerald-100 text-emerald-700',
    Rejected:  'bg-red-100 text-red-700',
    Saved:     'bg-slate-100 text-slate-600',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600';
}

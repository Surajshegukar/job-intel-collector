/** Known job board sources */
export const SOURCES = ['LinkedIn', 'Indeed', 'Naukri', 'Wellfound', 'Extension'] as const;

export type Source = (typeof SOURCES)[number];

/** Tailwind classes for source badge pills */
export const SOURCE_BADGE_COLORS: Record<string, string> = {
  LinkedIn:  'bg-blue-50 text-blue-600',
  Indeed:    'bg-violet-50 text-violet-600',
  Naukri:    'bg-orange-50 text-orange-600',
  Wellfound: 'bg-emerald-50 text-emerald-700',
  Extension: 'bg-brand-50 text-brand-700',
};

/** Returns badge classes for a given source, falling back to a neutral style */
export function getSourceBadgeClasses(source: string): string {
  return SOURCE_BADGE_COLORS[source] ?? 'bg-slate-100 text-slate-500';
}

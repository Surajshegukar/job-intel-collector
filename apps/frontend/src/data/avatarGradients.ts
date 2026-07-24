/** Deterministic gradient class based on company/job name initial */
export const AVATAR_GRADIENTS: Record<string, string> = {
  A: 'from-red-400 to-orange-400',
  B: 'from-blue-400 to-indigo-400',
  C: 'from-cyan-400 to-teal-400',
  D: 'from-violet-400 to-purple-400',
  E: 'from-emerald-400 to-green-400',
  F: 'from-fuchsia-400 to-pink-400',
  G: 'from-green-400 to-lime-400',
  H: 'from-orange-400 to-yellow-400',
  I: 'from-indigo-400 to-blue-400',
  J: 'from-rose-400 to-red-400',
  K: 'from-amber-400 to-orange-400',
  L: 'from-lime-400 to-green-400',
  M: 'from-pink-400 to-rose-400',
  N: 'from-sky-400 to-blue-400',
  O: 'from-orange-400 to-amber-400',
  P: 'from-purple-400 to-violet-400',
  Q: 'from-teal-400 to-cyan-400',
  R: 'from-red-400 to-pink-400',
  S: 'from-slate-400 to-gray-500',
  T: 'from-teal-400 to-sky-400',
  U: 'from-violet-400 to-indigo-400',
  V: 'from-yellow-400 to-orange-400',
  W: 'from-blue-500 to-indigo-600',
  X: 'from-pink-400 to-fuchsia-400',
  Y: 'from-lime-400 to-teal-400',
  Z: 'from-cyan-400 to-blue-400',
};

/** Returns the Tailwind gradient class for a given entity name */
export function getGradient(name: string): string {
  const char = (name || 'A').charAt(0).toUpperCase();
  return AVATAR_GRADIENTS[char] ?? 'from-brand-500 to-indigo-500';
}

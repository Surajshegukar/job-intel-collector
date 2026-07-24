import type { ApplicationStatus } from '../types';
import { STATUS_BADGE_CONFIG } from '../data/statusConfig';

export default function StatusTag({ status }: { status: ApplicationStatus }) {
  const c = STATUS_BADGE_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}

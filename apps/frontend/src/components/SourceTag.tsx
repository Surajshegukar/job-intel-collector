import { getSourceBadgeClasses } from '../data/sourceConfig';

export default function SourceTag({ source }: { source?: string }) {
  if (!source) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getSourceBadgeClasses(source)}`}>
      {source}
    </span>
  );
}

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: React.ReactNode;
  headerClassName?: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  /** Pass <tr> elements — Table wraps them in <tfoot> automatically */
  footerRows?: React.ReactNode;
}

export default function Table<T>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  rowClassName = '',
  emptyState,
  loadingState,
  footerRows,
}: TableProps<T>) {
  const getRowClass = (item: T, index: number) => {
    const base = 'group cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100';
    const custom = typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName;
    return `${base} ${custom}`;
  };

  const defaultLoading = (
    <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3 bg-white">
      <Loader2 size={28} className="animate-spin text-brand-600" />
      <p className="text-xs font-semibold text-slate-400 font-sans">Loading data...</p>
    </div>
  );

  const defaultEmpty = (
    <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-2 bg-white">
      <p className="text-sm font-bold text-slate-700 font-sans">No records found</p>
      <p className="text-xs text-slate-400 font-sans">Try modifying your active query filters.</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-white border border-slate-100 rounded-md">
      {isLoading ? (
        loadingState || defaultLoading
      ) : data.length === 0 ? (
        emptyState || defaultEmpty
      ) : (
        <table className="w-full text-xs border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-left px-4 py-2.5 font-semibold text-slate-500 text-[11px] tracking-wide ${
                    col.headerClassName || ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={idx}
                className={getRowClass(item, idx)}
                onClick={() => onRowClick?.(item, idx)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 border-b border-slate-100 text-slate-600 ${
                      col.className || ''
                    }`}
                  >
                    {col.render ? col.render(item, idx) : (item as any)[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footerRows && (
            <tfoot>
              {footerRows}
            </tfoot>
          )}
        </table>
      )}
    </div>
  );
}

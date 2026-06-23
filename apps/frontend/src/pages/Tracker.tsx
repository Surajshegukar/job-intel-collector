import { useState } from 'react';
import { Building2, ExternalLink, Pencil, Check, Loader2, KanbanSquare } from 'lucide-react';
import { useApplications, useUpdateApplication } from '../api/hooks';
import type { Application, ApplicationStatus } from '../types';

const COLUMNS: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'];

const COLUMN_STYLES: Record<ApplicationStatus, { header: string; card: string; dot: string }> = {
  Saved:     { header: 'bg-dark-800/60 border-dark-600/40',     card: 'border-dark-700/50',     dot: 'bg-dark-400' },
  Applied:   { header: 'bg-blue-900/30 border-blue-700/30',     card: 'border-blue-800/30',     dot: 'bg-blue-400' },
  Interview: { header: 'bg-amber-900/30 border-amber-700/30',   card: 'border-amber-800/30',   dot: 'bg-amber-400' },
  Rejected:  { header: 'bg-red-900/30 border-red-700/30',       card: 'border-red-800/30',       dot: 'bg-red-400' },
  Offer:     { header: 'bg-emerald-900/30 border-emerald-700/30', card: 'border-emerald-800/30', dot: 'bg-emerald-400' },
};

function KanbanCard({ app }: { app: Application }) {
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(app.notes ?? '');
  const update = useUpdateApplication();
  const style = COLUMN_STYLES[app.status];

  const job = app.jobId;
  const company = typeof job?.companyId === 'object' ? job.companyId : null;

  function saveNotes() {
    update.mutate({ id: app._id, notes });
    setEditNotes(false);
  }

  function moveStatus(newStatus: ApplicationStatus) {
    update.mutate({ id: app._id, status: newStatus });
  }

  return (
    <div className={`glass-card border ${style.card} p-3.5 space-y-2.5 group`}>
      <div>
        <p className="text-xs font-bold text-dark-100 leading-snug line-clamp-2">{job?.title ?? 'Unknown'}</p>
        {company && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-dark-500">
            <Building2 size={10} /> {company.name}
          </div>
        )}
      </div>

      {job?.salary && (
        <p className="text-[11px] text-dark-500">{job.salary}</p>
      )}

      {/* Notes */}
      {editNotes ? (
        <div className="space-y-1.5">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="input-field text-xs resize-none"
            placeholder="Add notes…"
          />
          <button onClick={saveNotes} className="btn-primary text-xs py-1 px-2.5">
            <Check size={11} /> Save
          </button>
        </div>
      ) : (
        notes && <p className="text-[11px] text-dark-500 italic leading-relaxed line-clamp-2">{notes}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-dark-800/60">
        <div className="flex gap-1.5">
          {job?.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[11px] p-1">
              <ExternalLink size={11} />
            </a>
          )}
          <button className="btn-ghost text-[11px] p-1" onClick={() => setEditNotes(!editNotes)}>
            <Pencil size={11} />
          </button>
        </div>
        {/* Quick move select */}
        <select
          className="text-[10px] bg-dark-800 border border-dark-600 text-dark-400 rounded-lg px-1.5 py-1 focus:outline-none focus:border-brand-500"
          value={app.status}
          onChange={e => moveStatus(e.target.value as ApplicationStatus)}
        >
          {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function Tracker() {
  const { data: applications, isLoading } = useApplications();

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col] = (applications ?? []).filter(a => a.status === col);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <KanbanSquare size={20} className="text-brand-400" /> Application Tracker
          </h1>
          <p className="text-xs text-dark-400 mt-0.5">{applications?.length ?? 0} total applications</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-56">
          <Loader2 size={28} className="animate-spin text-brand-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map(col => {
            const style = COLUMN_STYLES[col];
            const cards = byStatus[col];
            return (
              <div key={col} className="rounded-2xl overflow-hidden">
                {/* Column header */}
                <div className={`flex items-center gap-2 px-3 py-2.5 border ${style.header}`}>
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-xs font-bold text-dark-200">{col}</span>
                  <span className="ml-auto text-xs font-bold text-dark-500 bg-dark-800/80 px-1.5 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="space-y-2 p-2 bg-dark-900/30 min-h-32">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-dark-600 text-xs">Empty</div>
                  ) : (
                    cards.map(app => <KanbanCard key={app._id} app={app} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

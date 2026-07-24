import { useState } from 'react';
import { Building2, ExternalLink, Pencil, Check } from 'lucide-react';
import { useApplications, useUpdateApplication } from '../api/hooks';
import type { Application, ApplicationStatus } from '../types';
import { STATUS_OPTIONS, KANBAN_COLUMN_STYLES } from '../data/statusConfig';
import PageHeader from '../components/PageHeader';
import { TrackerSkeleton } from '../components/Skeleton';

function KanbanCard({ app }: { app: Application }) {
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(app.notes ?? '');
  const update = useUpdateApplication();
  const style = KANBAN_COLUMN_STYLES[app.status];
  const job = app.jobId;
  const company = typeof job?.companyId === 'object' ? job.companyId : null;

  return (
    <div className={`bg-white border ${style.card} rounded-xl p-3.5 space-y-2.5 group shadow-sm hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200`}>
      <div>
        <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{job?.title ?? 'Unknown'}</p>
        {company && (
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
            <Building2 size={9} /> {company.name}
          </div>
        )}
      </div>

      {job?.salary && <p className="text-[11px] text-slate-500 font-medium">{job.salary}</p>}

      {editNotes ? (
        <div className="space-y-1.5">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg resize-none text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
            placeholder="Add notes…"
          />
          <button
            onClick={() => { update.mutate({ id: app._id, notes }); setEditNotes(false); }}
            className="flex items-center gap-1 text-[10px] font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-2.5 py-1 transition-colors"
          >
            <Check size={10} /> Save
          </button>
        </div>
      ) : (
        notes && <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-2">{notes}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex gap-1">
          {job?.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
              <ExternalLink size={11} />
            </a>
          )}
          <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" onClick={() => setEditNotes(!editNotes)}>
            <Pencil size={11} />
          </button>
        </div>
        <select
          className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-1.5 py-1 focus:outline-none focus:border-brand-500 transition-colors"
          value={app.status}
          onChange={e => update.mutate({ id: app._id, status: e.target.value as ApplicationStatus })}
        >
          {STATUS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function Tracker() {
  const { data: applications, isLoading } = useApplications();

  const byStatus = STATUS_OPTIONS.reduce((acc, col) => {
    acc[col] = (applications ?? []).filter(a => a.status === col);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Application Tracker"
        description={`${applications?.length ?? 0} total applications across all pipeline stages`}
        showDivider
        // meta={<KanbanSquare size={16} className="text-brand-600" />}
      />

      {isLoading ? (
        <TrackerSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {STATUS_OPTIONS.map(col => {
            const style = KANBAN_COLUMN_STYLES[col];
            const cards = byStatus[col];
            return (
              <div key={col} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm shadow-slate-100/40">
                <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${style.header}`}>
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="text-xs font-bold text-slate-700">{col}</span>
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${style.count}`}>
                    {cards.length}
                  </span>
                </div>
                <div className="space-y-2 p-2 bg-slate-50/50 min-h-32">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-slate-400 text-xs">Empty</div>
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

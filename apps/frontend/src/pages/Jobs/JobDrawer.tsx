import { MapPin, DollarSign, Clock, Building2, ExternalLink, Tag } from 'lucide-react';
import { useUpdateJob } from '../../api/hooks';
import type { Job } from '../../types';
import { STATUS_OPTIONS } from '../../data/statusConfig';
import AvatarInitials from '../../components/AvatarInitials';
import AnalysisPanel from '../../components/AnalysisPanel';
import DrawerShell, { DrawerHeader } from '../../components/DrawerShell';

export default function JobDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const updateJob = useUpdateJob(job._id);
  const companyName = (job.companyId as any)?.name ?? '';

  return (
    <DrawerShell onClose={onClose}>
      <DrawerHeader
        title={job.title}
        subtitle={(job.companyId as any)?.name ?? 'Unknown Company'}
        avatar={<AvatarInitials name={companyName || job.title} size="md" />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {job.location && (
            <MetaCell icon={<MapPin size={13} />} label="Location" value={job.location} />
          )}
          {job.salary && (
            <MetaCell icon={<DollarSign size={13} />} label="Salary" value={job.salary} />
          )}
          {job.experience && (
            <MetaCell icon={<Clock size={13} />} label="Experience" value={job.experience} />
          )}
          <MetaCell icon={<Building2 size={13} />} label="Source" value={job.source || '—'} />
        </div>

        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
        >
          <ExternalLink size={13} /> View original posting on {job.source ?? 'portal'}
        </a>

        <AnalysisPanel jobId={job._id} />

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => updateJob.mutate({ status: s })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${job.status === s
                  ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={10} /> Detected Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(s => (
                <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description</p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              {/<\/?[a-z][\s\S]*>/i.test(job.description) ? (
                <div className="text-xs text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-light">{job.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DrawerShell>
  );
}

function MetaCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

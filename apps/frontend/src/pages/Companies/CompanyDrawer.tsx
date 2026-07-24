import { Globe, MapPin, Cpu, ExternalLink, Briefcase } from 'lucide-react';
import { useCompany } from '../../api/hooks';
import type { Job } from '../../types';
import { getStatusPillClasses } from '../../data/statusConfig';
import AvatarInitials from '../../components/AvatarInitials';
import DrawerShell, { DrawerHeader } from '../../components/DrawerShell';
import { CompanyDrawerSkeleton } from '../../components/Skeleton';

export default function CompanyDrawer({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const { data, isLoading } = useCompany(companyId);

  return (
    <DrawerShell onClose={onClose} maxWidth="max-w-xl">
      <DrawerHeader title="Company Profile" onClose={onClose} />

      {isLoading ? (
        <CompanyDrawerSkeleton />
      ) : data ? (
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="flex items-start gap-4">
            <AvatarInitials name={data.company.name} size="lg" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">{data.company.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {[data.company.industry, data.company.companySize].filter(Boolean).join(' · ')}
              </p>
              <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                data.company.hiringStatus === 'Hiring'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {data.company.hiringStatus || 'Unknown Status'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {data.company.website && (
              <a href={data.company.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                <Globe size={12} /> Website
              </a>
            )}
            {data.company.linkedinUrl && (
              <a href={data.company.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
          </div>

          {data.company.locations?.length > 0 && (
            <TagSection icon={<MapPin size={10} />} label="Locations">
              {data.company.locations.map(l => (
                <span key={l} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600">{l}</span>
              ))}
            </TagSection>
          )}

          {data.company.techStack?.length > 0 && (
            <TagSection icon={<Cpu size={10} />} label="Tech Stack">
              {data.company.techStack.map(t => (
                <span key={t} className="px-2.5 py-1 bg-brand-50 border border-brand-100/30 rounded-lg text-xs font-semibold text-brand-700">{t}</span>
              ))}
            </TagSection>
          )}

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={10} /> {data.jobs.length} Open Positions
            </p>
            <div className="space-y-2">
              {data.jobs.map((job: Job) => (
                <div key={job._id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 line-clamp-1">{job.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{job.location || 'Remote'} · {job.source}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getStatusPillClasses(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {data.company.notes && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                {data.company.notes}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </DrawerShell>
  );
}

function TagSection({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {icon} {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

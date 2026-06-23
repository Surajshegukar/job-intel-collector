import { useState } from 'react';
import { Search, Globe, MapPin, Cpu, ExternalLink, X, Briefcase, Loader2 } from 'lucide-react';
import { useCompanies, useCompany } from '../api/hooks';
import type { Company, Job } from '../types';

function CompanyDrawer({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const { data, isLoading } = useCompany(companyId);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-dark-900 border-l border-dark-700 flex flex-col h-full overflow-hidden animate-slide-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
          <h2 className="font-bold text-dark-50">Company Profile</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 size={28} className="animate-spin text-brand-400" />
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-700/40 to-purple-700/40 border border-brand-600/30 flex items-center justify-center text-2xl font-extrabold text-brand-300 flex-shrink-0">
                {data.company.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-50">{data.company.name}</h3>
                <p className="text-xs text-dark-400">{data.company.industry} · {data.company.companySize}</p>
                <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  data.company.hiringStatus === 'Hiring' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-dark-700 text-dark-400'
                }`}>
                  {data.company.hiringStatus}
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-3 flex-wrap">
              {data.company.website && (
                <a href={data.company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300">
                  <Globe size={12} /> Website
                </a>
              )}
              {data.company.linkedinUrl && (
                <a href={data.company.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300">
                  <ExternalLink size={12} /> LinkedIn
                </a>
              )}
            </div>

            {/* Locations */}
            {data.company.locations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={11} /> Locations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.company.locations.map(l => (
                    <span key={l} className="px-2.5 py-1 bg-dark-800 border border-dark-600 rounded-full text-xs text-dark-300">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {data.company.techStack?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Cpu size={11} /> Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.company.techStack.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-brand-900/40 border border-brand-700/30 rounded-full text-xs text-brand-300">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs at this company */}
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Briefcase size={11} /> {data.jobs.length} Jobs Listed
              </p>
              <div className="space-y-2">
                {data.jobs.map((job: Job) => (
                  <div key={job._id} className="glass-card p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark-200 line-clamp-1">{job.title}</p>
                      <p className="text-[10px] text-dark-500 mt-0.5">{job.location || 'Remote'} · {job.source}</p>
                    </div>
                    <span className={`status-${job.status.toLowerCase()} status-badge text-[10px]`}>{job.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {data.company.notes && (
              <div>
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-xs text-dark-400 leading-relaxed">{data.company.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Companies() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout((window as any).__coSearchTimer);
    (window as any).__coSearchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  }

  const { data: companies, isLoading } = useCompanies(debouncedSearch || undefined);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="section-title">Companies</h1>
        <p className="text-xs text-dark-400 mt-0.5">{companies?.length ?? 0} companies tracked</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search companies…"
          className="input-field pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-56">
          <Loader2 size={28} className="animate-spin text-brand-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies?.map((company: Company) => (
            <div
              key={company._id}
              onClick={() => setSelectedId(company._id)}
              className="glass-card-hover p-5 cursor-pointer group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700/40 to-purple-700/40 border border-brand-600/30 flex items-center justify-center text-base font-extrabold text-brand-300 flex-shrink-0 group-hover:scale-105 transition-transform">
                  {company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark-100 text-sm group-hover:text-brand-300 transition-colors truncate">{company.name}</h3>
                  <p className="text-xs text-dark-500 truncate">{company.industry}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  company.hiringStatus === 'Hiring' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-dark-700 text-dark-500'
                }`}>
                  {company.hiringStatus}
                </span>
              </div>

              {company.locations?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-dark-500 mb-2">
                  <MapPin size={11} />
                  <span className="truncate">{company.locations.slice(0, 2).join(', ')}</span>
                </div>
              )}

              {company.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {company.techStack.slice(0, 4).map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-dark-800 rounded text-[10px] text-dark-400">{t}</span>
                  ))}
                  {company.techStack.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-dark-600">+{company.techStack.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <CompanyDrawer companyId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

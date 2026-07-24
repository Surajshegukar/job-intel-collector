import { useState } from 'react';
import { Search, Globe, MapPin, Cpu, ExternalLink, X, Briefcase, Loader2, Building2, SlidersHorizontal } from 'lucide-react';
import { useCompanies, useCompany } from '../api/hooks';
import type { Company, Job } from '../types';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Table, { Column } from '../components/Table';

const AVATAR_GRADIENTS: Record<string, string> = {
  A: 'from-red-400 to-orange-400', B: 'from-blue-400 to-indigo-400', C: 'from-cyan-400 to-teal-400',
  D: 'from-violet-400 to-purple-400', E: 'from-emerald-400 to-green-400', F: 'from-fuchsia-400 to-pink-400',
  G: 'from-green-400 to-lime-400', H: 'from-orange-400 to-yellow-400', I: 'from-indigo-400 to-blue-400',
  J: 'from-rose-400 to-red-400', K: 'from-amber-400 to-orange-400', L: 'from-lime-400 to-green-400',
  M: 'from-pink-400 to-rose-400', N: 'from-sky-400 to-blue-400', O: 'from-orange-400 to-amber-400',
  P: 'from-purple-400 to-violet-400', Q: 'from-teal-400 to-cyan-400', R: 'from-red-400 to-pink-400',
  S: 'from-slate-400 to-gray-500', T: 'from-teal-400 to-sky-400', U: 'from-violet-400 to-indigo-400',
  V: 'from-yellow-400 to-orange-400', W: 'from-blue-500 to-indigo-600', X: 'from-pink-400 to-fuchsia-400',
  Y: 'from-lime-400 to-teal-400', Z: 'from-cyan-400 to-blue-400',
};

function getGradient(name: string) {
  const char = (name || 'C').charAt(0).toUpperCase();
  return AVATAR_GRADIENTS[char] || 'from-brand-500 to-indigo-500';
}

function CompanyDrawer({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const { data, isLoading } = useCompany(companyId);

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-sm">Company Profile</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={15} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 size={28} className="animate-spin text-brand-600" />
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(data.company.name)} flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0 shadow-sm`}>
                {data.company.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{data.company.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[data.company.industry, data.company.companySize].filter(Boolean).join(' · ')}
                </p>
                <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${data.company.hiringStatus === 'Hiring'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                  {data.company.hiringStatus || 'Unknown Status'}
                </span>
              </div>
            </div>

            {/* Links */}
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

            {/* Locations */}
            {data.company.locations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={10} /> Locations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.company.locations.map(l => (
                    <span key={l} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {data.company.techStack?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu size={10} /> Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.company.techStack.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-brand-50 border border-brand-100/30 rounded-lg text-xs font-semibold text-brand-700">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs at this company */}
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${job.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                      job.status === 'Interview' ? 'bg-amber-100 text-amber-700' :
                        job.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                          job.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-600'
                      }`}>{job.status}</span>
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

  const columns: Column<Company>[] = [
    {
      key: 'index',
      label: 'No.',
      headerClassName: 'w-10',
      render: (_, idx) => <span className="text-slate-400 text-[11px]">{idx + 1}</span>,
    },
    {
      key: 'name',
      label: `Company (${companies?.length ?? 0})`,
      headerClassName: 'w-[220px]',
      render: (company) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getGradient(company.name)} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}>
            {company.name.charAt(0)}
          </div>
          <span className="font-medium text-slate-800 group-hover:text-brand-600 transition-colors text-[12px] truncate max-w-[170px]">
            {company.name}
          </span>
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      headerClassName: 'hidden md:table-cell w-[150px]',
      className: 'hidden md:table-cell text-[11px] text-slate-500',
      render: (company) => company.industry || <span className="text-slate-300">—</span>,
    },
    {
      key: 'locations',
      label: 'Locations',
      headerClassName: 'hidden lg:table-cell w-[180px]',
      className: 'hidden lg:table-cell text-[11px]',
      render: (company) =>
        company.locations?.length > 0 ? (
          <div className="flex items-center gap-1 text-brand-600 font-medium">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate max-w-[150px]">{company.locations.slice(0, 2).join(', ')}</span>
            {company.locations.length > 2 && (
              <span className="text-slate-400 ml-1">+{company.locations.length - 2}</span>
            )}
          </div>
        ) : <span className="text-slate-300">—</span>,
    },
    {
      key: 'techStack',
      label: 'Tech Stack',
      headerClassName: 'hidden xl:table-cell',
      className: 'hidden xl:table-cell',
      render: (company) =>
        company.techStack?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {company.techStack.slice(0, 3).map(t => (
              <span key={t} className="px-1.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-semibold rounded">
                {t}
              </span>
            ))}
            {company.techStack.length > 3 && (
              <span className="text-[10px] text-slate-400">+{company.techStack.length - 3}</span>
            )}
          </div>
        ) : <span className="text-slate-300">—</span>,
    },
    {
      key: 'hiringStatus',
      label: 'Hiring',
      headerClassName: 'hidden sm:table-cell w-[110px]',
      className: 'hidden sm:table-cell',
      render: (company) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${company.hiringStatus === 'Hiring'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-500'
          }`}>
          {company.hiringStatus || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'companySize',
      label: 'Size',
      headerClassName: 'hidden lg:table-cell w-[100px]',
      className: 'hidden lg:table-cell text-[11px] text-slate-500',
      render: (company) => company.companySize || <span className="text-slate-300">—</span>,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in">
      <PageHeader
        title="Companies"
        description={`${companies?.length ?? 0} organizations tracked in your intelligence graph`}
        showDivider={false}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search companies..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 w-48 transition-all"
              />
            </div>
            <Button variant="secondary" size="sm" icon={<SlidersHorizontal size={12} />}>
              Filter
            </Button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={companies ?? []}
        isLoading={isLoading}
        onRowClick={(company) => setSelectedId(company._id)}
        emptyState={
          <div className="flex flex-col items-center justify-center h-60 gap-3">
            <Building2 size={36} className="opacity-20 stroke-[1.5] text-slate-400" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">No companies yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Companies appear as you track jobs from different organizations.
              </p>
            </div>
          </div>
        }
        footerRows={
          <tr className="border-t border-slate-100">
            <td className="px-4 py-2.5" />
            <td className="px-4 py-2.5 text-[11px] text-slate-400 font-medium" colSpan={6}>
              Total: {companies?.length ?? 0}
            </td>
          </tr>
        }
      />

      {selectedId && (
        <CompanyDrawer companyId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

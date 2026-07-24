import { useState } from 'react';
import {
  Search, ExternalLink, Trash2, ChevronLeft,
  ChevronRight, X, MapPin, Building2,
  DollarSign, Clock, Tag, Loader2, Compass,
  SlidersHorizontal, ArrowUpDown, MoreHorizontal
} from 'lucide-react';
import { useJobs, useDeleteJob, useUpdateJob } from '../api/hooks';
import type { Job, ApplicationStatus } from '../types';
import AnalysisPanel from '../components/AnalysisPanel';
import PageHeader from '../components/PageHeader';
import FilterTabs from '../components/FilterTabs';
import Table, { Column } from '../components/Table';
import Button from '../components/Button';

const STATUS_OPTIONS: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'];
const SOURCES = ['LinkedIn', 'Indeed', 'Naukri', 'Wellfound', 'Extension'];

// Deterministic avatar gradient based on first letter
const AVATAR_GRADIENTS: Record<string, string> = {
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

function getGradient(name: string) {
  const char = (name || 'J').charAt(0).toUpperCase();
  return AVATAR_GRADIENTS[char] || 'from-brand-500 to-indigo-500';
}

function StatusTag({ status }: { status: ApplicationStatus }) {
  const cfg: Record<ApplicationStatus, { bg: string; text: string }> = {
    Saved: { bg: 'bg-slate-100', text: 'text-slate-600' },
    Applied: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Interview: { bg: 'bg-amber-100', text: 'text-amber-700' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-700' },
    Offer: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}

function SourceTag({ source }: { source?: string }) {
  if (!source) return null;
  const colors: Record<string, string> = {
    LinkedIn: 'bg-blue-50 text-blue-600',
    Indeed: 'bg-violet-50 text-violet-600',
    Naukri: 'bg-orange-50 text-orange-600',
    Wellfound: 'bg-emerald-50 text-emerald-700',
    Extension: 'bg-brand-50 text-brand-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${colors[source] || 'bg-slate-100 text-slate-500'}`}>
      {source}
    </span>
  );
}

function JobDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const updateJob = useUpdateJob(job._id);

  function handleStatusChange(status: ApplicationStatus) {
    updateJob.mutate({ status });
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient((job.companyId as any)?.name || job.title)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {((job.companyId as any)?.name || job.title || 'J').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-snug">{job.title}</h2>
              <p className="text-[10px] text-slate-400">{(job.companyId as any)?.name ?? 'Unknown Company'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {job.location && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{job.location}</p>
                </div>
              </div>
            )}
            {job.salary && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                <DollarSign size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Salary</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{job.salary}</p>
                </div>
              </div>
            )}
            {job.experience && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                <Clock size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{job.experience}</p>
                </div>
              </div>
            )}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
              <Building2 size={13} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Source</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{job.source || '—'}</p>
              </div>
            </div>
          </div>

          <a href={job.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
          >
            <ExternalLink size={13} /> View original posting on {job.source ?? 'portal'}
          </a>

          {/* AI Panel */}
          <AnalysisPanel jobId={job._id} />

          {/* Pipeline stage */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Stage</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${job.status === s
                    ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={10} /> Detected Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
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
      </div>
    </div>
  );
}

export default function Jobs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const deleteJob = useDeleteJob();

  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout((window as any).__jobSearchTimer);
    (window as any).__jobSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }

  const { data, isLoading } = useJobs({
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  const jobs = data?.jobs ?? [];

  // Table Column Definitions
  const columns: Column<Job>[] = [
    {
      key: 'index',
      label: 'No.',
      headerClassName: 'w-8',
      render: (_, idx) => <span>{idx + 1}</span>,
    },
    {
      key: 'title',
      label: `Job Title (${data?.total ?? 0})`,
      headerClassName: 'w-[260px]',
      render: (job) => {
        const companyName = (job.companyId as any)?.name || '';
        const gradient = getGradient(companyName || job.title);
        const initials = (companyName || job.title || 'J').charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}>
              {initials}
            </div>
            <span className="font-medium text-slate-800 group-hover:text-brand-600 transition-colors text-[12px] truncate max-w-[200px]">
              {job.title}
            </span>
            <button className="opacity-0 group-hover:opacity-60 text-slate-400 hover:text-slate-600 transition-all p-0.5 ml-auto">
              <MoreHorizontal size={13} />
            </button>
          </div>
        );
      },
    },
    {
      key: 'company',
      label: 'Company',
      headerClassName: 'hidden md:table-cell w-[140px]',
      className: 'hidden md:table-cell text-slate-500 text-[11px]',
      render: (job) => {
        const name = (job.companyId as any)?.name;
        return name ? <span>{name}</span> : <span className="text-slate-300">—</span>;
      },
    },
    {
      key: 'location',
      label: 'Location',
      headerClassName: 'hidden lg:table-cell w-[130px]',
      className: 'hidden lg:table-cell text-[11px]',
      render: (job) => job.location ? (
        <span className="text-brand-600 font-medium">{job.location}</span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
    },
    {
      key: 'salary',
      label: 'Salary',
      headerClassName: 'hidden lg:table-cell w-[130px]',
      className: 'hidden lg:table-cell text-slate-500 text-[11px]',
      render: (job) => job.salary || <span className="text-slate-300">—</span>,
    },
    {
      key: 'createdAt',
      label: 'Added',
      headerClassName: 'hidden sm:table-cell w-[110px]',
      className: 'hidden sm:table-cell text-slate-400 text-[11px]',
      render: (job) => (
        <span>
          {new Date(job.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (job) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusTag status={job.status} />
          <SourceTag source={job.source} />
          {job.skills && job.skills.slice(0, 2).map(skill => (
            <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-600">
              {skill}
            </span>
          ))}
          {job.skills && job.skills.length > 2 && (
            <span className="text-[10px] text-slate-400">+{job.skills.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      headerClassName: 'w-8',
      render: (job) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteJob.mutate(job._id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-all"
        >
          <Trash2 size={12} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in">
      {/* Top Page Header */}
      <PageHeader
        title="Job Applications"
        description={'Track all your job applications and find new opportunities across the web.'}
        showDivider={false}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ArrowUpDown size={12} />}>
              Sort
            </Button>
            <Button variant="secondary" size="sm" icon={<SlidersHorizontal size={12} />}>
              Filter
            </Button>
            <Button variant="ghost" size="sm" icon={<Search size={13} />} />
          </div>
        }
      />

      {/* Filter tabs row (Notion-style) */}
      <FilterTabs
        tabs={STATUS_OPTIONS}
        selectedTab={statusFilter}
        onTabChange={(tab) => { setStatusFilter(tab); setPage(1); }}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:bg-white w-44 transition-all"
              />
            </div>
            <select
              value={sourceFilter}
              onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:outline-none focus:border-brand-400 focus:bg-white transition-all"
            >
              <option value="">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />

      {/* Database-style Table */}
      <Table
        columns={columns}
        data={jobs}
        isLoading={isLoading}
        onRowClick={(job) => setSelectedJob(job)}
        loadingState={
          <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3 bg-white">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-xs font-semibold text-slate-400">Loading opportunities...</p>
          </div>
        }
        emptyState={
          <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-3 bg-white">
            <Compass size={36} className="opacity-30 stroke-[1.5]" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">No jobs found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try a different filter or search term.</p>
            </div>
          </div>
        }
        footerRows={
          <tr className="border-t border-slate-100">
            <td className="px-4 py-2.5" />
            <td className="px-4 py-2.5 text-[11px] text-slate-400 font-medium" colSpan={7}>
              Total: {data?.total ?? 0}
            </td>
          </tr>
        }
      />

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Page {data.page} of {data.pages} · {data.total} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              variant="secondary"
              size="sm"
            >
              <ChevronLeft size={12} />
            </Button>
            <Button
              disabled={page === data.pages}
              onClick={() => setPage(p => p + 1)}
              variant="secondary"
              size="sm"
            >
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {selectedJob && <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

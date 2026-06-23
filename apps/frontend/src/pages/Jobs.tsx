import { useState } from 'react';
import {
  Search, ExternalLink, Trash2, ChevronLeft,
  ChevronRight, X, MapPin, Building2, Briefcase,
  DollarSign, Clock, Tag, Loader2
} from 'lucide-react';
import { useJobs, useDeleteJob, useUpdateJob } from '../api/hooks';
import type { Job, ApplicationStatus } from '../types';
import AnalysisPanel from '../components/AnalysisPanel';

const STATUS_OPTIONS: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'];
const SOURCES = ['LinkedIn', 'Indeed', 'Naukri', 'Wellfound', 'Extension'];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cls: Record<ApplicationStatus, string> = {
    Saved:     'status-saved',
    Applied:   'status-applied',
    Interview: 'status-interview',
    Rejected:  'status-rejected',
    Offer:     'status-offer',
  };
  return <span className={cls[status]}>{status}</span>;
}

function JobDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const updateJob = useUpdateJob(job._id);

  function handleStatusChange(status: ApplicationStatus) {
    updateJob.mutate({ status });
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-lg bg-dark-900 border-l border-dark-700 flex flex-col h-full overflow-hidden animate-slide-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
          <h2 className="font-bold text-dark-50 text-base leading-snug line-clamp-1">{job.title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Company & meta */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-dark-300">
              <Building2 size={14} className="text-brand-400" />
              <span className="font-semibold">{(job.companyId as any)?.name ?? 'Unknown'}</span>
            </div>
            {job.location && (
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <MapPin size={12} /> {job.location}
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <DollarSign size={12} /> {job.salary}
              </div>
            )}
            {job.experience && (
              <div className="flex items-center gap-2 text-xs text-dark-400">
                <Clock size={12} /> {job.experience}
              </div>
            )}
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-1"
            >
              <ExternalLink size={12} /> View on {job.source ?? 'Portal'}
            </a>
          </div>

          {/* AI Intelligence Panel */}
          <AnalysisPanel jobId={job._id} />

          {/* Status changer */}
          <div>
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                    job.status === s
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'border-dark-600 text-dark-400 hover:border-brand-600/60 hover:text-dark-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={11} /> Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-dark-800 border border-dark-600 rounded-full text-xs text-dark-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Description</p>
              {/<\/?[a-z][\s\S]*>/i.test(job.description) ? (
                <div 
                  className="text-xs text-dark-400 leading-relaxed html-description"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <p className="text-xs text-dark-400 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              )}
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

  // Debounce search
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
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  const jobs = data?.jobs ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-title">Jobs</h1>
          <p className="text-xs text-dark-400 mt-0.5">
            {data?.total ?? 0} total jobs tracked
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search jobs, descriptions…"
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-36"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sourceFilter}
          onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
          className="input-field w-36"
        >
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-56">
            <Loader2 size={28} className="animate-spin text-brand-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-dark-500 gap-2">
            <Briefcase size={36} className="opacity-30" />
            <p className="text-sm">No jobs found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-800 bg-dark-900/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Job</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider hidden sm:table-cell">Source</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/60">
              {jobs.map(job => (
                <tr
                  key={job._id}
                  className="hover:bg-dark-800/40 cursor-pointer transition-colors group"
                  onClick={() => setSelectedJob(job)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-dark-100 leading-snug line-clamp-1 group-hover:text-brand-300 transition-colors">{job.title}</p>
                    {job.salary && <p className="text-xs text-dark-500 mt-0.5">{job.salary}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-dark-300 text-xs">{(job.companyId as any)?.name}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-dark-400 text-xs">{job.location || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-dark-500 text-xs">{job.source}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => deleteJob.mutate(job._id)}
                      className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-500">
            Page {data.page} of {data.pages} · {data.total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page === data.pages}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedJob && <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

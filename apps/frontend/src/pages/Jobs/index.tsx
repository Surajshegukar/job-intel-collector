import { useState } from 'react';
import {
  Search, Trash2, ChevronLeft, ChevronRight,
  Loader2, Compass, SlidersHorizontal, ArrowUpDown, MoreHorizontal
} from 'lucide-react';
import { useJobs, useDeleteJob } from '../../api/hooks';
import type { Job } from '../../types';
import { STATUS_OPTIONS } from '../../data/statusConfig';
import { SOURCES } from '../../data/sourceConfig';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/PageHeader';
import FilterTabs from '../../components/FilterTabs';
import Table, { Column } from '../../components/Table';
import Button from '../../components/Button';
import StatusTag from '../../components/StatusTag';
import SourceTag from '../../components/SourceTag';
import AvatarInitials from '../../components/AvatarInitials';
import JobDrawer from './JobDrawer';

export default function Jobs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const deleteJob = useDeleteJob();

  const { data, isLoading } = useJobs({
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  const jobs = data?.jobs ?? [];

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
        return (
          <div className="flex items-center gap-2.5">
            <AvatarInitials name={companyName || job.title} size="sm" />
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
      render: (job) => job.location
        ? <span className="text-brand-600 font-medium">{job.location}</span>
        : <span className="text-slate-300">—</span>,
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
        <span>{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (job) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusTag status={job.status} />
          <SourceTag source={job.source} />
          {job.skills?.slice(0, 2).map(skill => (
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
          onClick={(e) => { e.stopPropagation(); deleteJob.mutate(job._id); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-all"
        >
          <Trash2 size={12} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in">
      <PageHeader
        title="Job Applications"
        description="Track all your job applications and find new opportunities across the web."
        showDivider={false}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ArrowUpDown size={12} />}>Sort</Button>
            <Button variant="secondary" size="sm" icon={<SlidersHorizontal size={12} />}>Filter</Button>
            <Button variant="ghost" size="sm" icon={<Search size={13} />} />
          </div>
        }
      />

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
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 w-44 transition-all"
              />
            </div>
            <select
              value={sourceFilter}
              onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:outline-none focus:border-brand-400 transition-all"
            >
              <option value="">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />

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

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Page {data.page} of {data.pages} · {data.total} results
          </p>
          <div className="flex items-center gap-1">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="secondary" size="sm">
              <ChevronLeft size={12} />
            </Button>
            <Button disabled={page === data.pages} onClick={() => setPage(p => p + 1)} variant="secondary" size="sm">
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {selectedJob && <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

import { useState } from 'react';
import { Search, MapPin, Building2, SlidersHorizontal } from 'lucide-react';
import { useCompanies } from '../../api/hooks';
import type { Company } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table, { Column } from '../../components/Table';
import AvatarInitials from '../../components/AvatarInitials';
import CompanyDrawer from './CompanyDrawer';

export default function Companies() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);
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
          <AvatarInitials name={company.name} size="sm" />
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
            {company.locations.length > 2 && <span className="text-slate-400 ml-1">+{company.locations.length - 2}</span>}
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
              <span key={t} className="px-1.5 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-semibold rounded">{t}</span>
            ))}
            {company.techStack.length > 3 && <span className="text-[10px] text-slate-400">+{company.techStack.length - 3}</span>}
          </div>
        ) : <span className="text-slate-300">—</span>,
    },
    {
      key: 'hiringStatus',
      label: 'Hiring',
      headerClassName: 'hidden sm:table-cell w-[110px]',
      className: 'hidden sm:table-cell',
      render: (company) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
          company.hiringStatus === 'Hiring' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
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
                onChange={e => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 w-48 transition-all"
              />
            </div>
            <Button variant="secondary" size="sm" icon={<SlidersHorizontal size={12} />}>Filter</Button>
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
              <p className="text-xs text-slate-400 mt-0.5">Companies appear as you track jobs from different organizations.</p>
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

      {selectedId && <CompanyDrawer companyId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

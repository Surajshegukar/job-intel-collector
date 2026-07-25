import { Briefcase, Building2, Zap, KanbanSquare, TrendingUp, MapPin, DollarSign, Clock, ChevronRight, Compass } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useOverviewStats, useTopSkills, useTopCompanies, useLocationStats, useSalaryRanges, useJobs } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/PageHeader';

const STATUS_COLORS: Record<string, string> = {
  Saved: '#64748b',
  Applied: '#0061da',
  Interview: '#f59e0b',
  Rejected: '#ef4444',
  Offer: '#10b981',
};

const CHART_COLORS = ['#0061da', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-48 bg-slate-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-slate-100 rounded-2xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-28 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 h-[280px]" />
        <div className="bg-white border border-slate-100 rounded-2xl p-5 h-[280px]" />
        <div className="bg-white border border-slate-100 rounded-2xl p-5 h-[280px]" />
      </div>

      {/* Charts Row 2 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 h-[280px]" />
        <div className="bg-white border border-slate-100 rounded-2xl p-5 h-[280px]" />
      </div>
    </div>
  );
}

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: topSkills } = useTopSkills(8);
  const { data: topCompanies } = useTopCompanies(6);
  const { data: locations } = useLocationStats();
  const { data: salaries } = useSalaryRanges();
  const { data: recentJobsData } = useJobs({ limit: 5 });

  const recentJobs = recentJobsData?.jobs || [];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (statsLoading) {
    return <OverviewSkeleton />;
  }

  // Filter out 'Not Specified' for a cleaner salary bands area chart
  const salaryBands = (salaries || []).filter((s: any) => s.range !== 'Not Specified');

  return (
    <div className="relative space-y-6 animate-fade-in min-h-[90vh]">
      {/* Background Geometries and Orbs */}
      <div className="absolute inset-0 -mx-6 -my-7 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse duration-[9000ms]" />

        {/* Subtle geometric pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015] text-slate-900" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Header Wrapper */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Suraj'}`}
        description="Here's a detailed breakdown of your job search pipeline today."
        meta={
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest py-1">
            {currentDate}
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-semibold text-slate-600 shadow-slate-100/50">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            AI Sync Status: Connected
          </div>
        }
        showDivider={false}
      />

      {/* Metric Cards Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Jobs" value={stats?.totalJobs ?? 0} icon={Briefcase} color="brand" description="Total opportunities in pipeline." />
        <MetricCard label="Companies" value={stats?.totalCompanies ?? 0} icon={Building2} color="purple" description="Distinct targeted organizations." />
        <MetricCard label="Skills Tracked" value={stats?.totalSkills ?? 0} icon={Zap} color="amber" description="Technical skills parsed." />
        <MetricCard label="Applications" value={stats?.totalApplications ?? 0} icon={KanbanSquare} color="emerald" description="Submissions sent to recruiters." />
      </div>

      {/* Charts Row 1: Pipeline, Salaries, Locations */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Application Status Pie */}
        <div className="glass-card p-5 flex flex-col justify-between min-h-[300px]">
          <div>
            <h2 className="text-sm font-bold text-slate-700">Application Pipeline</h2>
            <p className="text-[11px] text-secondary mt-0.5">Active candidates split across recruiter workflow stages</p>
          </div>
          {stats?.statusDistribution && stats.statusDistribution.length > 0 ? (
            <>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {stats.statusDistribution.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: 12, color: '#323232' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">
                {stats.statusDistribution.map(item => (
                  <div key={item.status} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[item.status] }} />
                    {item.status} ({item.count})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Salary Bands Area Chart */}
        <div className="glass-card p-5 min-h-[300px] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <DollarSign size={15} className="text-emerald-500" /> Salary Ranges
            </h2>
            <p className="text-[11px] text-secondary mt-0.5">Distribution of salaries across tracked roles</p>
          </div>
          <div className="flex-1 flex items-end">
            {salaryBands && salaryBands.length > 0 ? (
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={salaryBands} margin={{ left: -25, right: 5, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: 11, color: '#323232' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSalary)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 w-full text-slate-400 text-xs">No salary data available</div>
            )}
          </div>
        </div>

        {/* Locations Bar Chart */}
        <div className="glass-card p-5 min-h-[300px] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin size={15} className="text-brand-600" /> Geography Distribution
            </h2>
            <p className="text-[11px] text-secondary mt-0.5">Geographic density of job openings</p>
          </div>
          <div className="flex-1 flex items-end">
            {locations && locations.length > 0 ? (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={locations.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="location" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: 11, color: '#323232' }} />
                  <Bar dataKey="count" fill="#0061da" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 w-full text-slate-400 text-xs">No location stats yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: In-Demand Skills & Target Companies */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Skills Bar Chart */}
        <div className="glass-card p-5 lg:col-span-2 min-h-[300px] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp size={15} className="text-brand-600" /> Skill Frequency Analysis
            </h2>
            <p className="text-[11px] text-secondary mt-0.5">Technologies requested most frequently in imports</p>
          </div>
          <div className="flex-1 mt-4">
            {topSkills && topSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topSkills} layout="vertical" margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <YAxis dataKey="name" type="category" width={85} tick={{ fill: '#475569', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: 11, color: '#323232' }}
                  />
                  <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                    {topSkills.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No skills tracked yet</div>
            )}
          </div>
        </div>

        {/* Key Target Companies */}
        <div className="glass-card p-5 min-h-[300px] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 size={15} className="text-purple-600" /> Pipeline Target Entities
            </h2>
            <p className="text-[11px] text-secondary mt-0.5">Organizations where roles are being pursued</p>
          </div>
          <div className="flex-1 mt-4 flex flex-col justify-center">
            {topCompanies && topCompanies.length > 0 ? (
              <div className="space-y-2">
                {topCompanies.slice(0, 4).map((c: any) => (
                  <div key={c.company} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-700 text-xs">{c.company}</h3>
                      <p className="text-[9px] text-slate-400 mt-0.5">{c.jobsCount} tracked positions</p>
                    </div>
                    <div className="text-[9px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-md font-semibold border border-brand-100/30">
                      Active
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No companies active yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Actionable Insights */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Job Additions List */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Clock size={15} className="text-slate-500" /> Recent Job Additions
              </h2>
              <p className="text-[11px] text-secondary mt-0.5">Latest opportunities parsed and tracked in system</p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-0.5 text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate('/tracker')}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {job.companyId?.name?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors">{job.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-secondary mt-0.5">
                        <span className="font-semibold text-slate-500">{job.companyId?.name}</span>
                        {job.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><MapPin size={9} /> {job.location}</span>
                          </>
                        )}
                        {job.salary && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><DollarSign size={9} /> {job.salary}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border ${job.status === 'Applied' ? 'bg-blue-50 text-blue-600 border-blue-100/50' :
                    job.status === 'Interview' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                      job.status === 'Offer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                        job.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100/50' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Applied' ? 'bg-blue-500' :
                      job.status === 'Interview' ? 'bg-amber-500 animate-pulse' :
                        job.status === 'Offer' ? 'bg-emerald-500 animate-pulse' :
                          job.status === 'Rejected' ? 'bg-red-500' :
                            'bg-slate-400'
                      }`} />
                    {job.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs gap-2">
                <Compass size={24} className="stroke-[1.5]" />
                No jobs tracked yet. Head to Tracker or Jobs to add your first post!
              </div>
            )}
          </div>
        </div>

        {/* Job Search Completion Status Card */}
         
      </div>
    </div>
  );
}

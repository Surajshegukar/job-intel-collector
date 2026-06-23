import { Briefcase, Building2, Zap, KanbanSquare, TrendingUp, MapPin } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useOverviewStats, useTopSkills, useTopCompanies, useLocationStats } from '../api/hooks';
import { Loader2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Saved: '#64748b',
  Applied: '#3b82f6',
  Interview: '#f59e0b',
  Rejected: '#ef4444',
  Offer: '#10b981',
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Overview() {
  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: topSkills } = useTopSkills(8);
  const { data: topCompanies } = useTopCompanies(6);
  const { data: locations } = useLocationStats();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Dashboard Overview</h1>
        <p className="text-sm text-dark-400 mt-1">Your complete job search intelligence at a glance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Jobs"         value={stats?.totalJobs         ?? 0} icon={Briefcase}    color="brand" />
        <MetricCard label="Companies"          value={stats?.totalCompanies    ?? 0} icon={Building2}    color="purple" />
        <MetricCard label="Skills Tracked"     value={stats?.totalSkills       ?? 0} icon={Zap}          color="amber" />
        <MetricCard label="Applications"       value={stats?.totalApplications ?? 0} icon={KanbanSquare} color="emerald" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Application Status Pie */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-dark-200 mb-4">Application Status</h2>
          {stats?.statusDistribution && stats.statusDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {stats.statusDistribution.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {stats.statusDistribution.map(item => (
                  <div key={item.status} className="flex items-center gap-1.5 text-xs text-dark-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[item.status] }} />
                    {item.status} ({item.count})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-dark-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Top Skills Bar */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-brand-400" /> Top In-Demand Skills
          </h2>
          {topSkills && topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSkills} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: 12 }}
                />
                <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                  {topSkills.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-dark-500 text-sm">No skills data yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Companies */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <Building2 size={14} className="text-purple-400" /> Top Hiring Companies
          </h2>
          {topCompanies && topCompanies.length > 0 ? (
            <div className="space-y-2.5">
              {topCompanies.map((co: any, i: number) => (
                <div key={co._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-dark-500 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-dark-200">{co.name}</span>
                      <span className="text-xs text-dark-500">{co.jobCount} jobs</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(co.jobCount / topCompanies[0].jobCount) * 100}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-dark-500 text-sm">No companies data yet</div>
          )}
        </div>

        {/* Locations */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-emerald-400" /> Job Locations
          </h2>
          {locations && locations.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={locations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="location" tick={{ fill: '#64748b', fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-dark-500 text-sm">No location data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

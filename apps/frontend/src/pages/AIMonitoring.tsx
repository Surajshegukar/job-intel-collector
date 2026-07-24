import { useAIMetrics } from '../api/hooks';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  Bot, Clock, DollarSign, Cpu, FileJson, 
  RefreshCw, CheckCircle2, XCircle, Loader2, BarChart3,
  Activity, TrendingUp, Zap
} from 'lucide-react';
import api from '../api/client';

import { AIMonitoringSkeleton } from '../components/Skeleton';

export default function AIMonitoring() {
  const { data: metrics, isLoading, isError, refetch } = useAIMetrics();

  const handleDownloadDataset = () => {
    const token = localStorage.getItem('auth-token');
    window.open(`${api.defaults.baseURL}/ai/export?token=${token}`, '_blank');
  };

  if (isLoading) return <AIMonitoringSkeleton />;

  if (isError || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <XCircle size={24} className="text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Failed to load telemetry data</p>
          <p className="text-xs text-slate-400 mt-1">There was an error connecting to the AI metrics service.</p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  const accuracyData = metrics.accuracy || [];
  const providerData = metrics.providers || [];
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  const queuePieData = [
    { name: 'Completed', value: metrics.queues?.completed || 0, color: '#10b981' },
    { name: 'Failed', value: metrics.queues?.failed || 0, color: '#f43f5e' },
    { name: 'Processing', value: metrics.queues?.processing || 0, color: '#6366f1' },
    { name: 'Pending', value: metrics.queues?.pending || 0, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">AI Performance & Telemetry</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor API latencies, costs, accuracy, and fine-tuning datasets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button 
            onClick={handleDownloadDataset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/20 transition-all"
          >
            <FileJson size={14} />
            Export Training Data
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <TrendingUp size={10} className="text-emerald-600" />
              <span className="text-[10px] font-semibold text-emerald-700">Active</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total AI Spend</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              ${metrics.telemetry?.totalCostUSD ? metrics.telemetry.totalCostUSD.toFixed(4) : '0.0000'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Aggregated LLM token costs</p>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={18} className="text-blue-500" />
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full">
              <Zap size={10} className="text-blue-600" />
              <span className="text-[10px] font-semibold text-blue-700">Fast</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Average Latency</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {metrics.telemetry?.avgLatencyMs ? (metrics.telemetry.avgLatencyMs / 1000).toFixed(2) : '0.00'}s
            </p>
            <p className="text-xs text-slate-400 mt-1">Processing response time</p>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Cpu size={18} className="text-violet-500" />
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 border border-violet-100 rounded-full">
              <Activity size={10} className="text-violet-600" />
              <span className="text-[10px] font-semibold text-violet-700">Usage</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Tokens</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {(metrics.telemetry?.totalTokensUsed || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">Input + output tokens</p>
          </div>
        </div>

        {/* Queue Health */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/60">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Bot size={18} className="text-amber-500" />
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <CheckCircle2 size={10} className="text-emerald-600" />
              <span className="text-[10px] font-semibold text-emerald-700">Healthy</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Queue Success Rate</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {metrics.queues?.completed + metrics.queues?.failed > 0
                ? ((metrics.queues.completed / (metrics.queues.completed + metrics.queues.failed)) * 100).toFixed(0)
                : '100'}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Analysis completion rate</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Score Accuracy Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                  <BarChart3 size={14} className="text-brand-500" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Score Accuracy vs Outcome</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 ml-9">
                Correlation between match scores and actual application pipeline results.
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <XAxis 
                    dataKey="outcome" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#f1f5f9' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}
                    itemStyle={{ color: '#0061da' }}
                  />
                  <Bar dataKey="avgMatchScore" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {accuracyData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <BarChart3 size={18} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">No data yet</p>
                  <p className="text-xs text-slate-400 mt-1">Apply to jobs to generate accuracy correlations.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Queue Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Activity size={14} className="text-violet-500" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Queue Distribution</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 ml-9">Background analysis job breakdown.</p>
          </div>

          <div className="flex-1 flex items-center justify-center h-44">
            {queuePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={queuePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {queuePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Activity size={18} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">No jobs queued</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-[10px] font-medium text-emerald-600">Completed</p>
                <p className="text-sm font-bold text-emerald-700">{metrics.queues?.completed || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <XCircle size={13} className="text-red-400 shrink-0" />
              <div>
                <p className="text-[10px] font-medium text-red-500">Failed</p>
                <p className="text-sm font-bold text-red-600">{metrics.queues?.failed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Telemetry Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap size={14} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Provider Execution Telemetry</h2>
              <p className="text-xs text-slate-500 mt-0.5">Average roundtrip latencies per LLM provider.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {providerData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Bot size={18} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">No provider data yet</p>
                <p className="text-xs text-slate-400 mt-1">Provider metrics will appear as AI features are used.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providerData.map((provider: any, i: number) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <Bot size={16} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{provider.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{provider.count} requests executed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-600">
                      {(provider.avgLatencyMs / 1000).toFixed(2)}s
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">avg latency</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

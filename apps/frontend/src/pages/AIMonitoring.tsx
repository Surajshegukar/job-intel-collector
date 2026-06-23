import { useAIMetrics } from '../api/hooks';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  Bot, Clock, DollarSign, Cpu, FileJson, 
  RefreshCw, CheckCircle2, XCircle, Loader2, BarChart3,
  Activity, HelpCircle
} from 'lucide-react';
import api from '../api/client';

export default function AIMonitoring() {
  const { data: metrics, isLoading, isError, refetch } = useAIMetrics();

  const handleDownloadDataset = () => {
    // Navigate directly to download endpoint
    const token = localStorage.getItem('auth-token');
    window.open(`${api.defaults.baseURL}/ai/export?token=${token}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="animate-spin text-brand-400" size={32} />
        <p className="text-sm font-semibold text-dark-200">Loading Telemetry Dashboards...</p>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-dark-500 gap-2">
        <XCircle size={36} className="text-rose-500" />
        <p className="text-sm font-semibold text-dark-200">Failed to load telemetry stats</p>
        <button onClick={() => refetch()} className="btn-secondary px-3 py-1.5 mt-2">
          Retry Connection
        </button>
      </div>
    );
  }

  // Formatting metrics data for charts
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
      {/* Header and Download */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="section-title">AI Performance & Telemetry</h1>
          <p className="text-xs text-dark-400 mt-0.5">
            Monitor API latencies, costs, matching error rates, and fine-tuning datasets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-xs font-semibold text-dark-300 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={12} /> Refetch
          </button>
          <button 
            onClick={handleDownloadDataset}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <FileJson size={12} /> Export Training JSONL
          </button>
        </div>
      </div>

      {/* Numerical Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-700/30 bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Total AI API Spend</p>
              <p className="text-2xl font-extrabold text-dark-50 leading-none">
                ${metrics.telemetry?.totalCostUSD ? metrics.telemetry.totalCostUSD.toFixed(4) : '0.0000'}
              </p>
              <p className="text-[10px] text-dark-400 mt-2">Aggregated cost of LLM tokens</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400 flex-shrink-0">
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        {/* Latency card */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-700/30 bg-gradient-to-br from-brand-900/50 to-brand-800/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Average Latency</p>
              <p className="text-2xl font-extrabold text-dark-50 leading-none">
                {metrics.telemetry?.avgLatencyMs ? (metrics.telemetry.avgLatencyMs / 1000).toFixed(2) : '0.00'}s
              </p>
              <p className="text-[10px] text-dark-400 mt-2">Overall processing response time</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/20 text-brand-400 flex-shrink-0">
              <Clock size={18} />
            </div>
          </div>
        </div>

        {/* Tokens card */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Total Tokens Logged</p>
              <p className="text-2xl font-extrabold text-dark-50 leading-none">
                {(metrics.telemetry?.totalTokensUsed || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-dark-400 mt-2">Tokens read and generated</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-400 flex-shrink-0">
              <Cpu size={18} />
            </div>
          </div>
        </div>

        {/* Queue card */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-700/30 bg-gradient-to-br from-amber-900/50 to-amber-800/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Queue Health</p>
              <p className="text-2xl font-extrabold text-dark-50 leading-none">
                {metrics.queues?.completed + metrics.queues?.failed > 0
                  ? ((metrics.queues.completed / (metrics.queues.completed + metrics.queues.failed)) * 100).toFixed(0)
                  : '100'}%
              </p>
              <p className="text-[10px] text-dark-400 mt-2">Analysis completion success rate</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 flex-shrink-0">
              <Bot size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Match accuracy vs outcome (Recharts) */}
        <div className="lg:col-span-8 glass-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-dark-100 flex items-center gap-1.5">
              <BarChart3 size={15} className="text-brand-400" /> Score Accuracy vs Real Outcome
            </h2>
            <p className="text-[10px] text-dark-400 mt-0.5">Verifying correlation between deterministic match scores and actual application pipeline progress</p>
          </div>
          <div className="h-64 w-full text-xs">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="outcome" stroke="#4b5563" fontSize={10} />
                  <YAxis stroke="#4b5563" fontSize={10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="avgMatchScore" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {accuracyData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-dark-500">
                No matching outcomes logged in feature store yet. Apply to jobs to generate correlations.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Queue status distribution (Pie) */}
        <div className="lg:col-span-4 glass-card p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-dark-100 flex items-center gap-1.5">
              <Activity size={14} className="text-purple-400" /> Analysis Queue Jobs
            </h2>
            <p className="text-[10px] text-dark-400">Total jobs queued for background processing</p>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center">
            {queuePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={queuePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {queuePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-dark-500">No jobs currently queued.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 border border-dark-800/60 bg-dark-900/10 rounded-xl flex items-center gap-1.5 justify-center">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span className="text-dark-300">Completed: {metrics.queues?.completed || 0}</span>
            </div>
            <div className="p-2 border border-dark-800/60 bg-dark-900/10 rounded-xl flex items-center gap-1.5 justify-center">
              <XCircle size={11} className="text-rose-400" />
              <span className="text-dark-300">Failed: {metrics.queues?.failed || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Details Section */}
      <div className="glass-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-dark-100 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-amber-400" /> Provider Execution Telemetry
          </h2>
          <p className="text-[10px] text-dark-400 mt-0.5">Average roundtrip execution latencies across LLM providers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providerData.map((provider, i) => (
            <div key={i} className="p-4 border border-dark-800 rounded-xl bg-dark-900/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-dark-100 capitalize">{provider.name} Provider</p>
                <p className="text-[10px] text-dark-500 mt-1">{provider.count} requests executed successfully</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-brand-400">{(provider.avgLatencyMs / 1000).toFixed(2)}s</p>
                <p className="text-[9px] text-dark-500 font-semibold uppercase tracking-wider">Avg Latency</p>
              </div>
            </div>
          ))}
          {providerData.length === 0 && (
            <div className="col-span-2 text-center text-xs text-dark-500 py-6">
              No provider execution metrics available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

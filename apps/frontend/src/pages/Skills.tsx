import { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Zap, Loader2, LayoutGrid, BarChart2 } from 'lucide-react';
import { useSkills, useTopSkills } from '../api/hooks';
import type { Skill } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  'Programming Languages': '#6366f1',
  'Frontend':              '#8b5cf6',
  'Backend':               '#06b6d4',
  'Databases':             '#10b981',
  'Cloud & DevOps':        '#f59e0b',
  'Mobile':                '#ec4899',
  'AI & Data Science':     '#ef4444',
  'General':               '#64748b',
};

export default function Skills() {
  const [view, setView] = useState<'grid' | 'chart'>('chart');
  const { data: allSkills, isLoading } = useSkills();
  const { data: topSkills } = useTopSkills(12);

  // Group by category
  const grouped = (allSkills ?? []).reduce((acc: Record<string, Skill[]>, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Skills Analytics</h1>
          <p className="text-xs text-dark-400 mt-0.5">
            {allSkills?.length ?? 0} unique skills extracted from job descriptions
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-dark-800 rounded-xl">
          <button
            onClick={() => setView('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              view === 'chart' ? 'bg-brand-600 text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <BarChart2 size={13} /> Charts
          </button>
          <button
            onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              view === 'grid' ? 'bg-brand-600 text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <LayoutGrid size={13} /> Grid
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-56">
          <Loader2 size={28} className="animate-spin text-brand-400" />
        </div>
      ) : view === 'chart' ? (
        <div className="space-y-4">
          {/* Top skills bar + radar side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 12 bar chart */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-dark-200 mb-4">Top Skills by Frequency</h2>
              {topSkills && topSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topSkills} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: 12 }}
                      formatter={(val, _name, props) => [`${val} jobs`, props.payload.category]}
                    />
                    <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                      {topSkills.map((skill) => (
                        <Cell key={skill._id} fill={CATEGORY_COLORS[skill.category] ?? '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-dark-500 text-sm">No data yet</div>
              )}
            </div>

            {/* Radar chart — top 7 */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-dark-200 mb-4">Skill Spread (Top 7)</h2>
              {topSkills && topSkills.length >= 3 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={topSkills.slice(0, 7)}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar dataKey="frequency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', fontSize: 12 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-dark-500 text-sm">Need more data for radar</div>
              )}
            </div>
          </div>

          {/* Category legend */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Categories</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5 text-xs text-dark-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Grid view grouped by category */
        <div className="space-y-6">
          {Object.entries(grouped).sort(([,a],[,b]) => b.length - a.length).map(([category, skills]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[category] ?? '#64748b' }} />
                <p className="text-xs font-bold text-dark-300 uppercase tracking-wider">{category}</p>
                <span className="text-xs text-dark-600">({skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.sort((a, b) => b.frequency - a.frequency).map(skill => (
                  <div
                    key={skill._id}
                    className="flex items-center gap-2 px-3 py-1.5 glass-card border-dark-700/40 rounded-full"
                  >
                    <Zap size={10} style={{ color: CATEGORY_COLORS[skill.category] ?? '#64748b' }} />
                    <span className="text-xs font-semibold text-dark-200">{skill.name}</span>
                    <span className="text-[10px] text-dark-500 bg-dark-700/60 px-1.5 py-0.5 rounded-full">{skill.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

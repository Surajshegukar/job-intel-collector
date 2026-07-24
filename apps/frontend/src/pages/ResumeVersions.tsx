import { useState } from 'react';
import {
  History, AlertCircle, FileText, Loader2, ArrowRightLeft,
  Check, X, Calendar, Briefcase, FileCheck, Printer,
  ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useResumeVersions, useUpdateResumeOutcome, useCompareResumes } from '../api/hooks';

const OUTCOME_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Offer:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  Interview: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100',    dot: 'bg-blue-500' },
  Applied:   { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-100',  dot: 'bg-violet-500' },
  Rejected:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-100',     dot: 'bg-red-400' },
  Saved:     { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400' },
};

function OutcomeBadge({ outcome }: { outcome: string }) {
  const s = OUTCOME_STYLES[outcome] || OUTCOME_STYLES.Saved;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text} border ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {outcome}
    </span>
  );
}

function ScorePill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-bold ${color}`}>{value}%</div>
      <div className="text-[10px] text-slate-400 font-medium">{label}</div>
    </div>
  );
}

function buildResumeHtml(v: any): string {
  if (!v?.templateId) return '';
  const c = v.generatedResume;
  let html = v.templateId.htmlTemplate;
  html = html.replace('{{name}}', c.name || '').replace('{{email}}', c.email || '')
    .replace('{{phone}}', c.phone || '').replace('{{location}}', c.location || '')
    .replace('{{linkedinUrl}}', c.linkedinUrl || '').replace('{{githubUrl}}', c.githubUrl || '')
    .replace('{{portfolioUrl}}', c.portfolioUrl || '').replace('{{summary}}', c.summary || '');
  html = html.replace('{{skills}}', (c.skills || []).map((s: string) => `<span class="skill-tag">${s}</span>`).join(' '));
  html = html.replace('{{experiences}}', (c.experiences || []).map((e: any) =>
    `<div class="experience-item" style="margin-bottom:12px"><div class="item-header"><span>${e.role}</span><span>${e.startDate} - ${e.endDate || 'Present'}</span></div><div class="item-sub"><span>${e.company}</span></div><p>${e.description || ''}</p><ul>${(e.achievements || []).map((a: string) => `<li>${a}</li>`).join('')}</ul></div>`).join(''));
  html = html.replace('{{projects}}', (c.projects || []).map((p: any) =>
    `<div class="project-item" style="margin-bottom:12px"><div class="item-header"><span>${p.title}</span></div><p>${p.description || ''}</p></div>`).join(''));
  html = html.replace('{{education}}', (c.education || []).map((e: any) =>
    `<div class="education-item"><div class="item-header"><span>${e.school}</span><span>${e.startDate}-${e.endDate || ''}</span></div><div>${e.degree}</div></div>`).join(''));
  html = html.replace('{{certifications}}', (c.certifications || []).map((x: string) => `<div>• ${x}</div>`).join(''));
  html = html.replace('{{achievements}}', (c.achievements || []).map((x: string) => `<div>• ${x}</div>`).join(''));
  return html;
}

export default function ResumeVersions() {
  const { data: versions, isLoading, isError } = useResumeVersions();
  const updateOutcome = useUpdateResumeOutcome();

  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [compareIds, setCompareIds]         = useState<string[]>([]);
  const [isComparing, setIsComparing]       = useState(false);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [outcomeForm, setOutcomeForm]       = useState({ outcome: 'Saved', notes: '' });

  const shouldCompare = isComparing && compareIds.length === 2;
  const { data: diff, isLoading: isDiffLoading } = useCompareResumes(
    shouldCompare ? compareIds[0] : '',
    shouldCompare ? compareIds[1] : ''
  );

  function toggleCompare(id: string) {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id]
    );
  }

  async function handleSaveOutcome(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await updateOutcome.mutateAsync({ id: editingId, outcome: outcomeForm.outcome, notes: outcomeForm.notes });
    setEditingId(null);
  }

  function handlePrint(v: any) {
    if (!v?.templateId) return;
    const html = buildResumeHtml(v);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<html><head><title>${v.versionName}</title>
        <style>${v.templateId.cssTemplate}
        @media print{body{margin:0;background:#fff} .skill-tag{display:inline-block;padding:2px 6px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;font-size:8pt;margin:2px}}
        </style></head><body>${html}<script>window.onload=()=>window.print()</script></body></html>`);
      w.document.close();
    }
  }

  const inputCls = 'w-full h-[42px] px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Resume Versions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track every resume variant, compare versions, and log application outcomes.</p>
        </div>
        {compareIds.length === 2 && !isComparing && (
          <button
            onClick={() => setIsComparing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all animate-pulse"
          >
            <ArrowRightLeft size={15} /> Compare {compareIds.length} Selected
          </button>
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle size={16} /> Failed to load resume history. Please refresh.
        </div>
      )}

      {/* Main table card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <History size={15} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">All Versions</p>
              <p className="text-xs text-slate-400">{versions?.length ?? 0} total resumes generated</p>
            </div>
          </div>
          {compareIds.length > 0 && (
            <button onClick={() => setCompareIds([])} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <X size={12} /> Clear selection
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-4 bg-slate-200 rounded" />
                <div className="h-4 flex-1 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : !versions || versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileText size={24} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">No resume versions yet</p>
              <p className="text-xs text-slate-400 mt-1">Generate your first tailored resume from the Resume Builder.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left w-10">
                    <span className="sr-only">Compare</span>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Version</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Job</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Template</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Match</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">ATS</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Outcome</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Generated</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {versions.map((v: any) => {
                  const isExpanded = expandedId === v._id;
                  const isChecked  = compareIds.includes(v._id);
                  const job        = v.jobId;
                  const company    = job?.companyId?.name || job?.company || '—';
                  const date       = new Date(v.generatedAt || v.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <>
                      <tr
                        key={v._id}
                        className={`group transition-colors ${isExpanded ? 'bg-brand-50/30' : 'hover:bg-slate-50'}`}
                      >
                        {/* Compare checkbox */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleCompare(v._id)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              isChecked ? 'bg-brand-600 border-brand-600' : 'border-slate-300 hover:border-brand-400'
                            }`}
                          >
                            {isChecked && <Check size={10} className="text-white" />}
                          </button>
                        </td>

                        {/* Version name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                              <FileText size={14} className="text-brand-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-xs leading-1">{v.versionName}</p>
                              {v.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">"{v.notes}"</p>}
                            </div>
                          </div>
                        </td>

                        {/* Target job */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-medium text-slate-700 leading-none">{job?.title || 'General'}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                            <Briefcase size={10} /> {company}
                          </div>
                        </td>

                        {/* Template */}
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {v.templateId?.name || 'Default'}
                          </span>
                        </td>

                        {/* Match score */}
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-bold text-brand-600">{v.matchScore ?? '—'}%</span>
                        </td>

                        {/* ATS score */}
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-bold text-violet-600">{v.atsScore ?? '—'}%</span>
                        </td>

                        {/* Outcome */}
                        <td className="px-5 py-4">
                          <OutcomeBadge outcome={v.outcome || 'Saved'} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar size={12} className="text-slate-400" />
                            {date}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handlePrint(v)}
                              title="Print / Download"
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Printer size={15} />
                            </button>
                            <button
                              onClick={() => { setEditingId(v._id); setOutcomeForm({ outcome: v.outcome || 'Saved', notes: v.notes || '' }); setExpandedId(null); }}
                              title="Update outcome"
                              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                            >
                              <FileCheck size={15} />
                            </button>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : v._id)}
                              title="View details"
                              className={`p-2 rounded-lg transition-all ${isExpanded ? 'text-brand-500 bg-brand-50' : 'text-slate-400 hover:text-brand-500 hover:bg-brand-50'}`}
                            >
                              {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row — inline resume content preview */}
                      {isExpanded && (
                        <tr key={`${v._id}-expanded`} className="bg-slate-50/80">
                          <td colSpan={9} className="px-8 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {[
                                { label: 'Skills included', value: v.generatedResume?.skills?.length ?? 0 },
                                { label: 'Experiences',     value: v.generatedResume?.experiences?.length ?? 0 },
                                { label: 'Projects',        value: v.generatedResume?.projects?.length ?? 0 },
                                { label: 'Certifications',  value: v.generatedResume?.certifications?.length ?? 0 },
                              ].map(item => (
                                <div key={item.label} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                                  <p className="text-xl font-bold text-slate-800">{item.value}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                                </div>
                              ))}
                            </div>
                            {v.generatedResume?.summary && (
                              <div className="bg-white border border-slate-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Summary</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{v.generatedResume.summary}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Outcome panel */}
      {editingId && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <FileCheck size={15} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Update Application Outcome</p>
                <p className="text-xs text-slate-500">Log what happened after sending this resume.</p>
              </div>
            </div>
            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSaveOutcome} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Application Status</label>
                <select value={outcomeForm.outcome} onChange={e => setOutcomeForm(p => ({ ...p, outcome: e.target.value }))} className={inputCls}>
                  {['Saved','Applied','Interview','Offer','Rejected'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Notes</label>
                <input type="text" value={outcomeForm.notes} onChange={e => setOutcomeForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Recruiter called back..." className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" disabled={updateOutcome.isPending} className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 transition-all disabled:opacity-50">
                {updateOutcome.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Save Outcome
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compare panel */}
      {isComparing && compareIds.length === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <ArrowRightLeft size={15} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Version Comparison</p>
                <p className="text-xs text-slate-500">AI-powered diff of skills, projects, and scoring.</p>
              </div>
            </div>
            <button onClick={() => { setIsComparing(false); setCompareIds([]); }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <X size={16} />
            </button>
          </div>

          {isDiffLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          ) : !diff ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500">Could not load comparison data.</div>
          ) : (
            <div className="px-6 py-5 space-y-6">
              {/* Score cards */}
              <div className="grid grid-cols-2 gap-4">
                {[{ label: 'Version 1', data: diff.v1 }, { label: 'Version 2', data: diff.v2 }].map(({ label, data }) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{data.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{data.jobTitle}</p>
                    </div>
                    <div className="flex gap-5">
                      <ScorePill value={data.atsScore} label="ATS" color="text-violet-600" />
                      <ScorePill value={data.matchScore} label="Match" color="text-brand-600" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Deltas */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'ATS Delta', value: diff.differences.scoreDelta },
                  { label: 'Match Delta', value: diff.differences.matchDelta },
                ].map(({ label, value }) => {
                  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
                  const color = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-slate-500';
                  const bg    = value > 0 ? 'bg-emerald-50 border-emerald-100' : value < 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200';
                  return (
                    <div key={label} className={`flex items-center gap-3 p-4 border rounded-xl ${bg}`}>
                      <Icon size={20} className={color} />
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className={`text-xl font-bold ${color}`}>{value > 0 ? '+' : ''}{value}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Skills diff */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Skills Added in V2',   items: diff.differences.addedSkills,    plus: true },
                  { label: 'Skills Removed in V2', items: diff.differences.removedSkills,  plus: false },
                ].map(({ label, items, plus }) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${plus ? 'text-emerald-600' : 'text-red-500'}`}>{label}</p>
                    {items?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((s: string) => (
                          <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-medium ${plus ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700 line-through'}`}>
                            {plus ? '+ ' : '− '}{s}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-400 italic">None</p>}
                  </div>
                ))}
              </div>

              {/* Summary diff */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'V1 Summary', text: diff.v1.summary, accent: false },
                  { label: 'V2 Summary', text: diff.v2.summary, accent: true  },
                ].map(({ label, text, accent }) => (
                  <div key={label} className={`p-4 rounded-xl border ${accent ? 'bg-brand-50 border-brand-100' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accent ? 'text-brand-600' : 'text-slate-500'}`}>{label}</p>
                    <p className="text-sm text-slate-700 leading-relaxed italic">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

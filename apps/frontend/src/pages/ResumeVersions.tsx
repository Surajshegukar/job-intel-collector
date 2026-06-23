import { useState } from 'react';
import {
  History, AlertCircle, FileText,
  Loader2, ArrowRightLeft, Check,
  ChevronRight, Calendar, Briefcase, X,
  FileCheck, Printer
} from 'lucide-react';
import {
  useResumeVersions, useUpdateResumeOutcome, useCompareResumes
} from '../api/hooks';

export default function ResumeVersions() {
  const { data: versions, isLoading: isVersionsLoading, isError } = useResumeVersions();
  const updateOutcome = useUpdateResumeOutcome();

  // Selection states
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);

  // Form states for outcome updates
  const [outcomeForm, setOutcomeForm] = useState<{ outcome: string; notes: string }>({
    outcome: 'Saved',
    notes: ''
  });

  // Get active version if one is selected
  const activeVersion = versions?.find(v => v._id === selectedVersionId);

  // Call the comparison hook (only runs if comparing and we have exactly 2 IDs)
  const shouldCompare = isComparing && compareIds.length === 2;
  const { data: comparisonData, isLoading: isComparingLoading } = useCompareResumes(
    shouldCompare ? compareIds[0] : '',
    shouldCompare ? compareIds[1] : ''
  );

  const toggleCompareSelect = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(prev => prev.filter(item => item !== id));
    } else {
      if (compareIds.length >= 2) {
        // Replace the second one or show message. Let's just limit to 2
        setCompareIds(prev => [prev[1], id]);
      } else {
        setCompareIds(prev => [...prev, id]);
      }
    }
  };

  const handleStartCompare = () => {
    if (compareIds.length === 2) {
      setIsComparing(true);
      setSelectedVersionId(null);
      setEditingOutcomeId(null);
    }
  };

  const handleCloseCompare = () => {
    setIsComparing(false);
    setCompareIds([]);
  };

  const handleOpenOutcomeEdit = (version: any) => {
    setEditingOutcomeId(version._id);
    setOutcomeForm({
      outcome: version.outcome || 'Saved',
      notes: version.notes || ''
    });
    setSelectedVersionId(null);
    setIsComparing(false);
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutcomeId) return;

    try {
      await updateOutcome.mutateAsync({
        id: editingOutcomeId,
        outcome: outcomeForm.outcome,
        notes: outcomeForm.notes
      });
      setEditingOutcomeId(null);
    } catch (err) {
      console.error('Failed to update outcome:', err);
    }
  };

  // Helper to compile placeholders into HTML template
  const compileTemplate = (version: any) => {
    if (!version || !version.templateId) return '';

    const content = version.generatedResume;
    const template = version.templateId;
    let html = template.htmlTemplate;

    // Replace scalar fields
    html = html.replace('{{name}}', content.name || 'Suraj Shegukar');
    html = html.replace('{{email}}', content.email || '');
    html = html.replace('{{phone}}', content.phone || '+91 9021434751');
    html = html.replace('{{location}}', content.location || 'Pune, India');
    html = html.replace('{{linkedinUrl}}', content.linkedinUrl || '');
    html = html.replace('{{githubUrl}}', content.githubUrl || '');
    html = html.replace('{{portfolioUrl}}', content.portfolioUrl || '');
    html = html.replace('{{summary}}', content.summary || '');

    // Compile skills
    const skillsHtml = (content.skills || [])
      .map((s: string) => `<span class="skill-tag">${s}</span>`)
      .join(' ');
    html = html.replace('{{skills}}', skillsHtml);

    // Compile experiences
    const experiencesHtml = (content.experiences || [])
      .map((exp: any) => `
        <div class="experience-item" style="margin-bottom: 12px;">
          <div class="item-header">
            <span>${exp.role}</span>
            <span>${exp.startDate} - ${exp.endDate || 'Present'}</span>
          </div>
          <div class="item-sub">
            <span>${exp.company}</span>
            <span>${exp.employmentType || 'Full-Time'}</span>
          </div>
          <p style="margin: 3px 0; font-size: 9pt;">${exp.description || ''}</p>
          <ul style="margin: 3px 0 0 16px; padding: 0;">
            ${(exp.achievements || []).map((a: string) => `<li style="margin-bottom: 2px;">${a}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    html = html.replace('{{experiences}}', experiencesHtml);

    // Compile projects
    const projectsHtml = (content.projects || [])
      .map((p: any) => `
        <div class="project-item" style="margin-bottom: 12px;">
          <div class="item-header">
            <span>${p.title}</span>
            <span>${p.category || 'Web Project'}</span>
          </div>
          <div class="item-sub">
            <span>${p.technologies?.join(', ')}</span>
            <span>${p.githubUrl ? 'GitHub' : ''}</span>
          </div>
          <p style="margin: 3px 0; font-size: 9pt;">${p.description || ''}</p>
          <ul style="margin: 3px 0 0 16px; padding: 0;">
            ${(p.achievements || []).map((a: string) => `<li style="margin-bottom: 1px;">${a}</li>`).join('')}
            ${(p.impactMetrics || []).map((m: string) => `<li style="margin-bottom: 1px; font-weight: 600; color: #10b981;">${m}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    html = html.replace('{{projects}}', projectsHtml);

    // Compile education
    const educationHtml = (content.education || [])
      .map((edu: any) => `
        <div class="education-item" style="margin-bottom: 8px;">
          <div class="item-header">
            <span>${edu.school}</span>
            <span>${edu.startDate} - ${edu.endDate || ''}</span>
          </div>
          <div class="item-sub">
            <span>${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
          </div>
        </div>
      `).join('');
    html = html.replace('{{education}}', educationHtml);

    // Compile certifications
    const certsHtml = (content.certifications || [])
      .map((c: string) => `<div class="cert-item" style="font-size: 9pt;">• ${c}</div>`)
      .join('');
    html = html.replace('{{certifications}}', certsHtml);

    // Compile achievements
    const achsHtml = (content.achievements || [])
      .map((a: string) => `<div class="ach-item" style="font-size: 9pt;">• ${a}</div>`)
      .join('');
    html = html.replace('{{achievements}}', achsHtml);

    return html;
  };

  // Triggers print view via new browser window
  const handlePrint = (version: any) => {
    if (!version || !version.templateId) return;

    const compiled = compileTemplate(version);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${version.versionName}</title>
            <style>
              ${version.templateId.cssTemplate}
              @media print {
                body { padding: 0; margin: 0; background: #ffffff; }
                .ats-resume, .modern-resume, .minimal-resume, .faang-resume {
                  box-shadow: none;
                  margin: 0;
                  padding: 0;
                  max-width: 100%;
                }
              }
              .skill-tag {
                display: inline-block;
                padding: 2px 6px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                font-size: 8pt;
                margin: 2px;
                color: #374151;
              }
            </style>
          </head>
          <body style="background: #ffffff; padding: 20px;">
            ${compiled}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getOutcomeStyles = (outcome: string) => {
    switch (outcome) {
      case 'Offer':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50';
      case 'Interview':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-800/50';
      case 'Applied':
        return 'bg-sky-950/40 text-sky-400 border-sky-800/50';
      case 'Rejected':
        return 'bg-rose-950/40 text-rose-400 border-rose-800/50';
      default:
        return 'bg-dark-800 text-dark-300 border-dark-700/60';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="section-title">Resume Versions & Tracking</h1>
          <p className="text-xs text-dark-400 mt-0.5">Manage generated resume variants, track job application outcomes, and analyze improvements.</p>
        </div>

        {compareIds.length === 2 && !isComparing && (
          <button
            onClick={handleStartCompare}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-900/20 animate-pulse"
          >
            <ArrowRightLeft size={13} />
            Compare Selected Versions
          </button>
        )}
      </div>

      {isError && (
        <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          <span>Error loading resume history. Please refresh the page.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left column: Resume list */}
        <div className="lg:col-span-5 space-y-3">
          {isVersionsLoading ? (
            <div className="flex flex-col items-center justify-center p-20 glass-card text-dark-400 gap-3">
              <Loader2 className="animate-spin text-brand-400" size={24} />
              <span className="text-xs">Loading resume catalog...</span>
            </div>
          ) : !versions || versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-card text-dark-500 space-y-3">
              <History size={40} className="opacity-20 text-brand-400" />
              <div>
                <h4 className="font-bold text-dark-300 text-xs">No Resumes Found</h4>
                <p className="text-[10px] text-dark-400 mt-1 max-w-xs leading-relaxed">
                  You haven't generated any tailored resumes yet. Use the Dynamic Resume Builder to get started!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {versions.map((v: any) => {
                const isSelected = selectedVersionId === v._id;
                const isItemComparing = compareIds.includes(v._id);
                const targetJob = v.jobId;
                const companyName = targetJob?.companyId?.name || targetJob?.company || 'General Application';

                return (
                  <div
                    key={v._id}
                    className={`glass-card p-4 transition-all duration-300 cursor-pointer border relative overflow-hidden group ${
                      isSelected 
                        ? 'border-brand-500/80 bg-brand-950/10 shadow-lg shadow-brand-950/30' 
                        : isItemComparing
                          ? 'border-indigo-500/60 bg-indigo-950/5'
                          : 'border-dark-800/80 hover:border-dark-700 hover:bg-dark-900/20'
                    }`}
                    onClick={() => {
                      if (!isComparing) {
                        setSelectedVersionId(v._id);
                        setEditingOutcomeId(null);
                      }
                    }}
                  >
                    {/* Glowing highlight indicator */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-dark-100 truncate group-hover:text-brand-300 transition-colors">
                            {v.versionName}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getOutcomeStyles(v.outcome)}`}>
                            {v.outcome}
                          </span>
                        </div>

                        <p className="text-[10px] text-dark-400 font-semibold flex items-center gap-1">
                          <Briefcase size={10} className="text-dark-500" />
                          <span>{targetJob?.title || 'General'} · {companyName}</span>
                        </p>

                        <div className="flex items-center gap-3 pt-2 text-[9px] text-dark-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={9} />
                            {new Date(v.generatedAt || v.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {v.templateId?.name && (
                            <span className="px-1.5 py-0.5 bg-dark-800 border border-dark-700/60 rounded text-[9px]">
                              {v.templateId.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scores & Comparison checkbox */}
                      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                        {/* Scores */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-dark-500 uppercase">Match</p>
                            <p className="text-xs font-extrabold text-brand-400">{v.matchScore}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-dark-500 uppercase">ATS</p>
                            <p className="text-xs font-extrabold text-indigo-400">{v.atsScore}%</p>
                          </div>
                        </div>

                        {/* Compare Selection */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompareSelect(v._id);
                          }}
                          className={`p-1 border rounded-lg transition-all flex items-center justify-center ${
                            isItemComparing
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                              : 'border-dark-700 text-dark-500 hover:border-dark-600 hover:text-dark-300'
                          }`}
                          title="Select for comparison"
                        >
                          <ArrowRightLeft size={11} className={isItemComparing ? 'animate-pulse' : ''} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Outcome Edit Button */}
                    <div className="mt-3 pt-2 border-t border-dark-800/40 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] text-dark-500 italic truncate max-w-[200px]">
                        {v.notes ? `"${v.notes}"` : 'No outcome notes added.'}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOutcomeEdit(v);
                        }}
                        className="px-2 py-1 bg-dark-800 hover:bg-dark-700 text-dark-300 font-semibold text-[9px] rounded border border-dark-700/60 transition-all flex items-center gap-1"
                      >
                        <FileCheck size={9} />
                        Update Outcome
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Action Details Panel */}
        <div className="lg:col-span-7">
          
          {/* COMPARISON VIEW */}
          {isComparing && compareIds.length === 2 && (
            <div className="glass-card p-5 space-y-5 relative animate-fade-in border-indigo-500/30">
              <button
                onClick={handleCloseCompare}
                className="absolute top-4 right-4 p-1 hover:bg-dark-800 text-dark-400 hover:text-dark-200 rounded-lg transition-all"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-2 border-b border-dark-800 pb-3">
                <ArrowRightLeft className="text-indigo-400" size={16} />
                <div>
                  <h3 className="text-xs font-bold text-dark-100 uppercase tracking-wider">Resume Variant Comparison</h3>
                  <p className="text-[10px] text-dark-400">Comparing differences in ATS optimization scores and tailored content</p>
                </div>
              </div>

              {isComparingLoading ? (
                <div className="flex flex-col items-center justify-center p-20 text-dark-400 gap-3">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs">Analyzing differences via AI parser...</span>
                </div>
              ) : !comparisonData ? (
                <div className="p-4 text-center text-xs text-dark-400">
                  Could not load comparison data.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Scores Comparison Card */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Version 1 info */}
                    <div className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl space-y-1">
                      <p className="text-[8px] font-bold text-dark-500 uppercase">Version 1</p>
                      <h4 className="text-[11px] font-bold text-dark-200 truncate">{comparisonData.v1.name}</h4>
                      <p className="text-[9px] text-dark-400 truncate">{comparisonData.v1.jobTitle}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <div>
                          <p className="text-[8px] text-dark-500 font-bold uppercase">ATS</p>
                          <p className="text-sm font-black text-dark-300">{comparisonData.v1.atsScore}%</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-dark-500 font-bold uppercase">Match</p>
                          <p className="text-sm font-black text-dark-300">{comparisonData.v1.matchScore}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Version 2 info */}
                    <div className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl space-y-1">
                      <p className="text-[8px] font-bold text-dark-500 uppercase">Version 2</p>
                      <h4 className="text-[11px] font-bold text-dark-200 truncate">{comparisonData.v2.name}</h4>
                      <p className="text-[9px] text-dark-400 truncate">{comparisonData.v2.jobTitle}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <div>
                          <p className="text-[8px] text-dark-500 font-bold uppercase">ATS</p>
                          <p className="text-sm font-black text-dark-300">{comparisonData.v2.atsScore}%</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-dark-500 font-bold uppercase">Match</p>
                          <p className="text-sm font-black text-dark-300">{comparisonData.v2.matchScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Deltas */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-800/30 rounded-xl flex items-center justify-around text-center">
                    <div>
                      <p className="text-[9px] font-bold text-indigo-400 uppercase">ATS Score Delta</p>
                      <p className={`text-xl font-extrabold mt-0.5 ${
                        comparisonData.differences.scoreDelta > 0 
                          ? 'text-emerald-400' 
                          : comparisonData.differences.scoreDelta < 0 
                            ? 'text-rose-400' 
                            : 'text-dark-300'
                      }`}>
                        {comparisonData.differences.scoreDelta > 0 ? '+' : ''}{comparisonData.differences.scoreDelta}%
                      </p>
                    </div>
                    <div className="w-px h-8 bg-indigo-900/60" />
                    <div>
                      <p className="text-[9px] font-bold text-indigo-400 uppercase">Match Score Delta</p>
                      <p className={`text-xl font-extrabold mt-0.5 ${
                        comparisonData.differences.matchDelta > 0 
                          ? 'text-emerald-400' 
                          : comparisonData.differences.matchDelta < 0 
                            ? 'text-rose-400' 
                            : 'text-dark-300'
                      }`}>
                        {comparisonData.differences.matchDelta > 0 ? '+' : ''}{comparisonData.differences.matchDelta}%
                      </p>
                    </div>
                  </div>

                  {/* Skills Delta */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Skills Taxonomy Delta</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-dark-900/30 border border-dark-800 rounded-xl space-y-2">
                        <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Check size={11} /> Skills Added in V2
                        </p>
                        {comparisonData.differences.addedSkills?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {comparisonData.differences.addedSkills.map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-800/40 rounded text-[9px] text-emerald-300 font-semibold">
                                + {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-dark-500 italic">No new skills added.</p>
                        )}
                      </div>

                      <div className="p-3 bg-dark-900/30 border border-dark-800 rounded-xl space-y-2">
                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                          <X size={11} /> Skills Removed in V2
                        </p>
                        {comparisonData.differences.removedSkills?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {comparisonData.differences.removedSkills.map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 bg-rose-950/40 border border-rose-800/40 rounded text-[9px] text-rose-300 line-through font-semibold">
                                - {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-dark-500 italic">No skills removed.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Projects Delta */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Tailored Projects Delta</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-dark-900/30 border border-dark-800 rounded-xl space-y-2">
                        <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Check size={11} /> Projects Featured in V2
                        </p>
                        {comparisonData.differences.addedProjects?.length > 0 ? (
                          <ul className="text-[10px] text-dark-300 space-y-1 pl-3 list-disc">
                            {comparisonData.differences.addedProjects.map((t: string) => (
                              <li key={t} className="font-semibold text-emerald-300">{t}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-dark-500 italic">No new projects compiled.</p>
                        )}
                      </div>

                      <div className="p-3 bg-dark-900/30 border border-dark-800 rounded-xl space-y-2">
                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                          <X size={11} /> Projects Omitted in V2
                        </p>
                        {comparisonData.differences.removedProjects?.length > 0 ? (
                          <ul className="text-[10px] text-dark-300 space-y-1 pl-3 list-disc">
                            {comparisonData.differences.removedProjects.map((t: string) => (
                              <li key={t} className="line-through text-rose-400">{t}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-dark-500 italic">No projects omitted.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Comparison */}
                  <div className="space-y-2 border-t border-dark-800 pt-3">
                    <h4 className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Profile Summaries Compare</h4>
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-dark-900/40 border border-dark-800 rounded-lg">
                        <p className="text-[8px] font-bold text-dark-500 uppercase mb-1">V1 Profile Summary</p>
                        <p className="text-[10px] text-dark-300 leading-relaxed italic">{comparisonData.v1.summary}</p>
                      </div>
                      <div className="p-2.5 bg-brand-950/15 border border-brand-900/30 rounded-lg">
                        <p className="text-[8px] font-bold text-brand-400 uppercase mb-1">V2 Profile Summary</p>
                        <p className="text-[10px] text-brand-300 leading-relaxed italic">{comparisonData.v2.summary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OUTCOME UPDATE FORM */}
          {editingOutcomeId && (
            <div className="glass-card p-5 space-y-4 animate-fade-in border-brand-500/30">
              <div className="flex items-center justify-between border-b border-dark-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="text-brand-400" size={16} />
                  <div>
                    <h3 className="text-xs font-bold text-dark-100 uppercase tracking-wider">Update Application Outcome</h3>
                    <p className="text-[10px] text-dark-400">Log response outcomes and track success stats</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingOutcomeId(null)}
                  className="p-1 hover:bg-dark-800 text-dark-400 hover:text-dark-200 rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveOutcome} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1.5">Application State</label>
                  <select
                    value={outcomeForm.outcome}
                    onChange={e => setOutcomeForm(prev => ({ ...prev, outcome: e.target.value }))}
                    className="input-field text-xs"
                    required
                  >
                    <option value="Saved">Saved (Draft)</option>
                    <option value="Applied">Applied (Pending Review)</option>
                    <option value="Interview">Interview Scheduling</option>
                    <option value="Offer">Received Offer</option>
                    <option value="Rejected">Rejected / Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1.5">Response Notes & Details</label>
                  <textarea
                    value={outcomeForm.notes}
                    onChange={e => setOutcomeForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. HR contacted me via email. Scheduled Technical Round for next Thursday. Or salary offer package parameters."
                    rows={4}
                    className="input-field text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingOutcomeId(null)}
                    className="px-3.5 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 font-semibold text-xs rounded-xl border border-dark-700/60 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateOutcome.isPending}
                    className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    {updateOutcome.isPending && <Loader2 size={12} className="animate-spin" />}
                    Save Outcome State
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW DETAILS PANEL */}
          {activeVersion && !isComparing && !editingOutcomeId && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-card p-4 flex items-center justify-between border-dark-800">
                <div className="flex items-center gap-2">
                  <FileText className="text-brand-400" size={15} />
                  <div>
                    <h3 className="text-xs font-bold text-dark-100">{activeVersion.versionName}</h3>
                    <p className="text-[10px] text-dark-500">
                      Template: {activeVersion.templateId?.name || 'Standard Layout'}
                    </p>
                  </div>
                </div>

                {activeVersion.templateId && (
                  <button
                    onClick={() => handlePrint(activeVersion)}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Printer size={11} /> Print / Export PDF
                  </button>
                )}
              </div>

              {/* Suggestions / Keyword checks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl text-center">
                  <p className="text-[8px] font-bold text-dark-500 uppercase">Match Score</p>
                  <p className="text-lg font-black text-brand-400 mt-0.5">{activeVersion.matchScore}%</p>
                </div>
                <div className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl text-center">
                  <p className="text-[8px] font-bold text-dark-500 uppercase">ATS Score</p>
                  <p className="text-lg font-black text-indigo-400 mt-0.5">{activeVersion.atsScore}%</p>
                </div>
                <div className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl text-center">
                  <p className="text-[8px] font-bold text-dark-500 uppercase">Keyword Coverage</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">{activeVersion.keywordCoverage}%</p>
                </div>
              </div>

              {/* Suggestions */}
              {activeVersion.improvementSuggestions?.length > 0 && (
                <div className="glass-card p-4 space-y-2">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle size={10} /> ATS Improvement Suggestions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeVersion.improvementSuggestions.map((s: string, i: number) => (
                      <div key={i} className="p-2 bg-dark-900/30 border border-dark-800 rounded-lg text-[9px] text-dark-400 leading-relaxed flex items-start gap-1">
                        <ChevronRight size={10} className="text-brand-400 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compiled Preview */}
              <div className="glass-card p-5 min-h-[400px] bg-dark-950/40 relative overflow-hidden">
                {activeVersion.templateId ? (
                  <div className="bg-white text-dark-900 rounded-xl shadow-lg border border-dark-700/10 overflow-x-auto p-2">
                    <style dangerouslySetInnerHTML={{ __html: `
                      ${activeVersion.templateId.cssTemplate}
                      .ats-resume, .modern-resume, .minimal-resume, .faang-resume {
                        color: #111827 !important;
                      }
                      .skill-tag {
                        display: inline-block;
                        padding: 2px 6px;
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        border-radius: 4px;
                        font-size: 8pt;
                        margin: 2px;
                        color: #374151;
                      }
                    ` }} />
                    <div 
                      className="resume-preview-root"
                      dangerouslySetInnerHTML={{ __html: compileTemplate(activeVersion) }}
                    />
                  </div>
                ) : (
                  // No template layout structure fallback
                  <div className="space-y-4 text-xs text-dark-300 leading-relaxed">
                    <div className="border-b border-dark-800 pb-2">
                      <h4 className="font-bold text-dark-100 text-sm">{activeVersion.generatedResume?.name || 'Suraj Shegukar'}</h4>
                      <p className="text-dark-500 font-semibold">{activeVersion.generatedResume?.email} · {activeVersion.generatedResume?.phone}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-dark-200 uppercase tracking-wider text-[10px]">Summary</h5>
                      <p className="text-[11px] text-dark-400 italic mt-1">{activeVersion.generatedResume?.summary}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-dark-200 uppercase tracking-wider text-[10px] mb-1.5">Skills Selected</h5>
                      <div className="flex flex-wrap gap-1">
                        {activeVersion.generatedResume?.skills?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-dark-800 border border-dark-700/60 rounded-md text-[10px] text-dark-300 font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-dark-200 uppercase tracking-wider text-[10px]">Tailored Experience</h5>
                      {activeVersion.generatedResume?.experiences?.map((exp: any, idx: number) => (
                        <div key={idx} className="p-3 bg-dark-900/30 border border-dark-800 rounded-xl space-y-1">
                          <div className="flex justify-between font-bold text-dark-100">
                            <span>{exp.role}</span>
                            <span className="text-[10px] text-dark-500 font-semibold">{exp.startDate} - {exp.endDate || 'Present'}</span>
                          </div>
                          <p className="text-[10px] text-dark-400 font-semibold">{exp.company} · {exp.employmentType}</p>
                          <p className="text-[10px] text-dark-400 mt-1">{exp.description}</p>
                          {exp.achievements?.length > 0 && (
                            <ul className="list-disc pl-4 text-[10px] text-dark-500 mt-1 space-y-0.5">
                              {exp.achievements.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!activeVersion && !isComparing && !editingOutcomeId && (
            <div className="glass-card p-12 min-h-[450px] flex flex-col items-center justify-center text-center text-dark-500 space-y-3 border-dashed border-dark-800">
              <div className="w-12 h-12 rounded-2xl bg-brand-950/30 border border-brand-900/20 flex items-center justify-center text-brand-400">
                <History size={20} />
              </div>
              <div>
                <h4 className="font-bold text-dark-200 text-xs">No Details Loaded</h4>
                <p className="text-[10px] text-dark-400 mt-1 max-w-xs leading-relaxed">
                  Select a resume version from the history timeline on the left to see its preview, keyword scoring metrics, or update its job outcome.
                </p>
              </div>

              <div className="text-[10px] text-dark-400 bg-indigo-950/20 border border-indigo-800/30 px-4 py-2 rounded-xl mt-4 max-w-xs">
                💡 <span className="font-bold">Pro-tip:</span> Select two variants using the compare icon (<ArrowRightLeft className="inline-block mx-0.5" size={10} />) to analyze specific AI enhancements side-by-side!
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

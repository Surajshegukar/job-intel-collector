import { useState } from 'react';
import { 
  Sparkles, AlertCircle, FileText, Download, Play, 
  Loader2, BarChart, ChevronRight 
} from 'lucide-react';
import { 
  useJobs, useResumeTemplates, useGenerateResume 
} from '../api/hooks';

export default function ResumeBuilder() {
  const { data: jobsData, isLoading: isJobsLoading } = useJobs({ limit: 100 });
  const { data: templates, isLoading: isTemplatesLoading } = useResumeTemplates();
  const generateResume = useGenerateResume();

  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [versionName, setVersionName] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'suggestions'>('preview');

  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const jobs = jobsData?.jobs || [];
  const activeJob = jobs.find(j => j._id === selectedJobId);
  const activeTemplate = templates?.find(t => t._id === selectedTemplateId);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJobId) return;

    try {
      const res = await generateResume.mutateAsync({
        jobId: selectedJobId,
        templateId: selectedTemplateId || undefined,
        versionName: versionName || undefined
      });
      setGeneratedResult(res);
    } catch (err) {
      console.error(err);
    }
  }

  // Helper to compile placeholders into HTML template
  const compileTemplate = () => {
    if (!generatedResult || !activeTemplate) return '';

    const content = generatedResult.generatedResume;
    let html = activeTemplate.htmlTemplate;

    // Replace scalar fields
    html = html.replace('{{name}}', profileValue(content.name || profileDataName()));
    html = html.replace('{{email}}', profileValue(content.email));
    html = html.replace('{{phone}}', profileValue(content.phone || '+91 9021434751'));
    html = html.replace('{{location}}', profileValue(content.location || 'Pune, India'));
    html = html.replace('{{linkedinUrl}}', profileValue(content.linkedinUrl || ''));
    html = html.replace('{{githubUrl}}', profileValue(content.githubUrl || ''));
    html = html.replace('{{portfolioUrl}}', profileValue(content.portfolioUrl || ''));
    html = html.replace('{{summary}}', profileValue(content.summary));

    // Compile skills (grid list)
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

  const profileValue = (val: any) => val || '';
  const profileDataName = () => 'Suraj Shegukar';

  // Triggers print view via new browser window
  const handlePrint = () => {
    const compiled = compileTemplate();
    const printWindow = window.open('', '_blank');
    if (printWindow && activeTemplate) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${versionName || 'Tailored Resume'}</title>
            <style>
              ${activeTemplate.cssTemplate}
              /* Print-specific layout styling */
              @media print {
                body { padding: 0; margin: 0; background: #ffffff; }
                .ats-resume, .modern-resume, .minimal-resume, .faang-resume {
                  box-shadow: none;
                  margin: 0;
                  padding: 0;
                  max-width: 100%;
                }
              }
              /* Inline skill-tag definitions if styling overrides are not present */
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

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="section-title">AI Dynamic Resume Builder</h1>
        <p className="text-xs text-dark-400 mt-0.5">Generate highly-tailored resume copies matching specific job listing keywords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left configurations column */}
        <div className="lg:col-span-5 space-y-4">
          
          <form onSubmit={handleGenerate} className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider pb-1 border-b border-dark-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-400" /> Tailoring Configs
            </h3>

            {/* Target Job Selector */}
            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1.5">Select Target Job Position</label>
              {isJobsLoading ? (
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <Loader2 size={12} className="animate-spin text-brand-400" /> Loading jobs...
                </div>
              ) : (
                <select 
                  value={selectedJobId} 
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="input-field text-xs"
                  required
                >
                  <option value="">-- Choose Job --</option>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title} ({(j.companyId as any)?.name})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1.5">Select Layout Template</label>
              {isTemplatesLoading ? (
                <div className="text-xs text-dark-400 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" /> Loading templates...
                </div>
              ) : (
                <select 
                  value={selectedTemplateId} 
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  className="input-field text-xs"
                  required
                >
                  <option value="">-- Choose Template --</option>
                  {templates?.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Version Name */}
            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1.5">Resume Version Name</label>
              <input 
                type="text" 
                value={versionName} 
                onChange={e => setVersionName(e.target.value)}
                placeholder="e.g. Google Frontend Tailored" 
                className="input-field text-xs"
              />
            </div>

            <button 
              type="submit" 
              disabled={generateResume.isPending || !selectedJobId || !selectedTemplateId}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              {generateResume.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={12} />}
              {generateResume.isPending ? 'Generating Tailored Resume...' : 'Generate Tailored Resume'}
            </button>
          </form>

          {/* Job description details card */}
          {activeJob && (
            <div className="glass-card p-5 space-y-2">
              <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Target Job Details</p>
              <h4 className="text-xs font-bold text-dark-100">{activeJob.title}</h4>
              <p className="text-[10px] text-dark-500 font-semibold">{(activeJob.companyId as any)?.name} · {activeJob.location}</p>
              <div className="p-3 bg-dark-800/30 border border-dark-800 rounded-lg text-[10px] text-dark-400 max-h-36 overflow-y-auto leading-relaxed">
                {activeJob.description}
              </div>
            </div>
          )}

          {/* ATS Scoring details */}
          {generatedResult && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider pb-1 border-b border-dark-800 flex items-center gap-1.5">
                <BarChart size={13} className="text-brand-400" /> ATS Compatibility Report
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-xl">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase">ATS Score</p>
                  <p className="text-2xl font-extrabold text-indigo-300 mt-1">{generatedResult.atsScore}%</p>
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase">Keyword Coverage</p>
                  <p className="text-2xl font-extrabold text-emerald-300 mt-1">{generatedResult.keywordCoverage}%</p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle size={10} /> Improvement Advice
                </p>
                <div className="space-y-1.5">
                  {generatedResult.improvementSuggestions?.map((s: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-dark-800/30 border border-dark-800 rounded-lg text-[10px] text-dark-400 leading-relaxed flex items-start gap-1.5">
                      <ChevronRight size={10} className="text-brand-400 mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="glass-card p-4 flex items-center justify-between border-dark-800">
            <div className="flex border-b border-dark-800">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`pb-2 px-4 text-xs font-semibold border-b-2 capitalize transition-all ${
                  activeTab === 'preview' ? 'border-brand-500 text-brand-300' : 'border-transparent text-dark-400 hover:text-dark-200'
                }`}
              >
                Tailored Preview
              </button>
              {generatedResult && (
                <button 
                  onClick={() => setActiveTab('suggestions')}
                  className={`pb-2 px-4 text-xs font-semibold border-b-2 capitalize transition-all ${
                    activeTab === 'suggestions' ? 'border-brand-500 text-brand-300' : 'border-transparent text-dark-400 hover:text-dark-200'
                  }`}
                >
                  Matching Factors
                </button>
              )}
            </div>

            {generatedResult && activeTemplate && (
              <button 
                onClick={handlePrint}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-brand-900/20"
              >
                <Download size={11} /> Print / Export PDF
              </button>
            )}
          </div>

          <div className="glass-card p-5 min-h-[500px] bg-dark-950/40 relative overflow-hidden">
            {generatedResult && activeTemplate ? (
              activeTab === 'preview' ? (
                <div className="bg-white text-dark-900 rounded-xl shadow-lg border border-dark-700/10 overflow-x-auto p-1.5">
                  <style dangerouslySetInnerHTML={{ __html: `
                    ${activeTemplate.cssTemplate}
                    /* Inline styling overrides to force resume fonts within sandbox preview */
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
                    dangerouslySetInnerHTML={{ __html: compileTemplate() }}
                  />
                </div>
              ) : (
                <div className="space-y-4 text-xs text-dark-300 leading-relaxed p-2 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-dark-100 text-sm mb-1.5">Skills Analyzed & Tailored</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedResult.generatedResume.skills?.map((s: string) => (
                        <span key={s} className="px-2.5 py-1 bg-brand-900/30 border border-brand-700/20 rounded-full text-brand-300 font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dark-800">
                    <h3 className="font-bold text-dark-100 text-sm mb-2">Projects Tailored to Job Context</h3>
                    <div className="space-y-2">
                      {generatedResult.generatedResume.projects?.map((p: any, idx: number) => (
                        <div key={idx} className="p-3 bg-dark-800/30 border border-dark-800 rounded-xl">
                          <p className="font-bold text-dark-100 mb-1">{p.title}</p>
                          <p className="text-[11px] text-dark-400">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-dark-500 p-8 space-y-2.5">
                <FileText size={48} className="opacity-20 text-brand-400" />
                <div>
                  <h4 className="font-bold text-dark-200">No Tailored Resume Generated</h4>
                  <p className="text-xs text-dark-400 mt-1 max-w-xs">Select a target job and a resume template, then click "Generate Tailored Resume" to preview the optimized version.</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

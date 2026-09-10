import { useState, useEffect } from 'react';
import {
  Sparkles, AlertCircle, FileText, Download, Play,
  Loader2, Check, Briefcase,
  Layers, CheckCircle2, Plus, FileCheck2, TrendingUp,
  Eye, Activity, Sparkle
} from 'lucide-react';
import {
  useJobs, useResumeTemplates, useGenerateResume
} from '../api/hooks';
import PageHeader from '../components/PageHeader';

const DEFAULT_FALLBACK_TEMPLATES = [
  {
    _id: 'default-minimal',
    name: 'Minimal Clean',
    type: 'minimal',
    htmlTemplate: `<div class="minimal-resume">
  <div class="header">
    <h1>{{name}}</h1>
    <p class="contacts">{{email}} · {{phone}} · {{location}}</p>
    <p class="links">{{linkedinUrl}} · {{githubUrl}} · {{portfolioUrl}}</p>
  </div>
  <hr class="divider"/>
  <div class="section">
    <h2>Summary</h2>
    <p class="summary-text">{{summary}}</p>
  </div>
  <div class="section">
    <h2>Experience</h2>
    {{experiences}}
  </div>
  <div class="section">
    <h2>Projects</h2>
    {{projects}}
  </div>
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-block">{{skills}}</div>
  </div>
  <div class="section">
    <h2>Education</h2>
    {{education}}
  </div>
  <div class="section">
    <h2>Certifications & Achievements</h2>
    {{certifications}} {{achievements}}
  </div>
</div>`,
    cssTemplate: `.minimal-resume { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.5; padding: 32px; max-width: 800px; margin: 0 auto; background: #ffffff; }
.minimal-resume h1 { text-align: center; font-size: 20pt; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; color: #0f172a; margin: 0 0 6px 0; }
.minimal-resume .contacts, .minimal-resume .links { text-align: center; font-size: 8.5pt; color: #64748b; margin: 2px 0; }
.minimal-resume .divider { border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0; }
.minimal-resume .section { margin-bottom: 16px; }
.minimal-resume h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; margin: 0 0 8px 0; color: #334155; }
.minimal-resume .summary-text { font-size: 9pt; color: #475569; text-align: justify; }
.minimal-resume .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 9pt; color: #0f172a; margin-top: 4px; }
.minimal-resume .item-sub { display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748b; font-style: italic; margin-bottom: 2px; }
.minimal-resume ul { margin: 2px 0 6px 14px; padding: 0; }
.minimal-resume li { font-size: 8.5pt; color: #334155; margin-bottom: 2px; }
.minimal-resume .skill-tag { display: inline-block; padding: 2px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 8pt; margin: 2px; color: #334155; }`
  },
  {
    _id: 'default-ats',
    name: 'ATS Standard',
    type: 'ats',
    htmlTemplate: `<div class="ats-resume">
  <div class="header">
    <h1>{{name}}</h1>
    <div class="contact-info">
      {{email}} | {{phone}} | {{location}} <br/>
      {{linkedinUrl}} | {{githubUrl}} | {{portfolioUrl}}
    </div>
  </div>
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="section-content">{{summary}}</div>
  </div>
  <div class="section">
    <div class="section-title">Core Skills</div>
    <div class="section-content skills-list">{{skills}}</div>
  </div>
  <div class="section">
    <div class="section-title">Professional Experience</div>
    <div class="section-content">{{experiences}}</div>
  </div>
  <div class="section">
    <div class="section-title">Personal Projects</div>
    <div class="section-content">{{projects}}</div>
  </div>
  <div class="section">
    <div class="section-title">Education</div>
    <div class="section-content">{{education}}</div>
  </div>
  <div class="section">
    <div class="section-title">Certifications & Achievements</div>
    <div class="section-content">{{certifications}} {{achievements}}</div>
  </div>
</div>`,
    cssTemplate: `.ats-resume { font-family: "Times New Roman", Times, serif; color: #000000; line-height: 1.35; padding: 25px; max-width: 800px; margin: 0 auto; background: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
.ats-resume h1 { text-align: center; font-size: 16pt; margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase; }
.ats-resume .contact-info { text-align: center; font-size: 9.5pt; margin-bottom: 12px; color: #333333; }
.ats-resume .section { margin-bottom: 14px; }
.ats-resume .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000000; margin-bottom: 4px; padding-bottom: 1px; }
.ats-resume .section-content { font-size: 10pt; text-align: justify; }
.ats-resume .skills-list { font-weight: 500; }
.ats-resume .item-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; margin-top: 6px; }
.ats-resume .item-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 9.5pt; margin-bottom: 3px; }
.ats-resume ul { margin: 2px 0 6px 18px; padding: 0; }
.ats-resume li { font-size: 9.5pt; margin-bottom: 2px; }`
  },
  {
    _id: 'default-modern',
    name: 'Modern Accent',
    type: 'modern',
    htmlTemplate: `<div class="modern-resume">
  <div class="header">
    <div class="name-title">
      <h1>{{name}}</h1>
      <p class="summary-highlight">{{summary}}</p>
    </div>
    <div class="contact-sidebar">
      <div>{{email}}</div>
      <div>{{phone}}</div>
      <div>{{location}}</div>
      <div>{{linkedinUrl}}</div>
      <div>{{githubUrl}}</div>
    </div>
  </div>
  <div class="main-layout">
    <div class="left-col">
      <div class="section">
        <h2 class="title">Skills</h2>
        <div class="skills-grid">{{skills}}</div>
      </div>
      <div class="section">
        <h2 class="title">Education</h2>
        {{education}}
      </div>
      <div class="section">
        <h2 class="title">Certifications</h2>
        {{certifications}}
      </div>
    </div>
    <div class="right-col">
      <div class="section">
        <h2 class="title">Experience</h2>
        {{experiences}}
      </div>
      <div class="section">
        <h2 class="title">Projects</h2>
        {{projects}}
      </div>
    </div>
  </div>
</div>`,
    cssTemplate: `.modern-resume { font-family: "Inter", sans-serif; color: #1f2937; line-height: 1.4; padding: 30px; background: #ffffff; max-width: 800px; margin: 0 auto; }
.modern-resume .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
.modern-resume h1 { font-size: 22pt; font-weight: 800; color: #111827; margin: 0; }
.modern-resume .summary-highlight { font-size: 9.5pt; color: #4b5563; margin-top: 5px; max-width: 500px; }
.modern-resume .contact-sidebar { text-align: right; font-size: 8.5pt; color: #4b5563; display: flex; flex-direction: column; justify-content: center; }
.modern-resume .main-layout { display: grid; grid-template-columns: 4fr 8fr; gap: 20px; }
.modern-resume .title { font-size: 11pt; font-weight: 700; text-transform: uppercase; color: #4f46e5; border-left: 3px solid #6366f1; padding-left: 8px; margin: 0 0 10px 0; }
.modern-resume .section { margin-bottom: 18px; }
.modern-resume .skills-grid { font-size: 8.5pt; font-weight: 600; display: flex; flex-wrap: wrap; gap: 4px; }
.modern-resume .item-header { font-weight: 700; font-size: 9.5pt; color: #111827; display: flex; justify-content: space-between; margin-top: 6px; }
.modern-resume .item-sub { font-size: 8.5pt; color: #4b5563; font-weight: 500; display: flex; justify-content: space-between; }
.modern-resume ul { margin: 4px 0 8px 14px; padding: 0; }
.modern-resume li { font-size: 8.5pt; color: #374151; margin-bottom: 3px; }`
  }
];

export default function ResumeBuilder() {
  const { data: templates, isLoading: isTemplatesLoading } = useResumeTemplates();
  const { data: jobsData, isLoading: isJobsLoading } = useJobs({ limit: 100 });
  const generateResume = useGenerateResume();

  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [versionName, setVersionName] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'suggestions'>('preview');
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  // Custom states for redesign
  const [loadingStage, setLoadingStage] = useState(0);
  const [isJobDetailsExpanded, setIsJobDetailsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const jobs = jobsData?.jobs || [];
  const activeJob = jobs.find(j => j._id === selectedJobId);
  const activeTemplates = (templates && templates.length > 0) ? templates : DEFAULT_FALLBACK_TEMPLATES;
  const activeTemplate = activeTemplates.find(t => t._id === selectedTemplateId) || activeTemplates.find(t => t.type === 'minimal') || activeTemplates[0];

  // Auto-select initial template (prefer Minimal Clean as used in onboarding)
  useEffect(() => {
    if (activeTemplates.length > 0 && (!selectedTemplateId || !activeTemplates.some(t => t._id === selectedTemplateId))) {
      const minimalTemplate = activeTemplates.find(t => t.type === 'minimal');
      setSelectedTemplateId(minimalTemplate ? minimalTemplate._id : activeTemplates[0]._id);
    }
  }, [activeTemplates, selectedTemplateId]);

  // Auto-generate version name when job changes
  useEffect(() => {
    if (activeJob) {
      const companyName = (activeJob.companyId as any)?.name || 'Target';
      setVersionName(`${companyName} - ${activeJob.title} Tailored`);
    } else {
      setVersionName('');
    }
  }, [selectedJobId]);

  // Handle stage increments during AI generation
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage(prev => (prev < 4 ? prev + 1 : prev));
      }, 1800);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJobId) return;

    setIsGenerating(true);
    try {
      const res = await generateResume.mutateAsync({
        jobId: selectedJobId,
        templateId: selectedTemplateId || undefined,
        versionName: versionName || undefined
      });
      setGeneratedResult(res);
      setActiveTab('preview');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  // Compile placeholders into HTML template
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

  // Redesign Helpers
  const extractKeywords = (description: string) => {
    const techKeywords = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js', 'Tailwind',
      'HTML', 'CSS', 'Redux', 'REST', 'GraphQL', 'AWS', 'Docker', 'Kubernetes',
      'Python', 'Go', 'SQL', 'PostgreSQL', 'MongoDB', 'Git', 'Agile', 'CI/CD',
      'Frontend', 'Backend', 'Full Stack', 'DevOps', 'System Design', 'Microservices'
    ];
    if (!description) return [];
    return techKeywords.filter(keyword =>
      new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i').test(description.toLowerCase())
    );
  };

  const categorizeSuggestions = (suggestions: string[]) => {
    const critical: string[] = [];
    const keywords: string[] = [];
    const style: string[] = [];

    (suggestions || []).forEach(s => {
      const sl = s.toLowerCase();
      if (sl.includes('keyword') || sl.includes('skill') || sl.includes('add') || sl.includes('include')) {
        keywords.push(s);
      } else if (sl.includes('metric') || sl.includes('quantify') || sl.includes('number') || sl.includes('measure') || sl.includes('score')) {
        critical.push(s);
      } else {
        style.push(s);
      }
    });

    return { critical, keywords, style };
  };

  const renderTemplateThumbnail = (type: string) => {
    if (type === 'ats') {
      return (
        <div className="w-full h-24 bg-slate-100/50 border border-slate-200/50 rounded-xl p-2 flex flex-col gap-1.5 overflow-hidden transition-all group-hover:bg-slate-100">
          <div className="h-1 bg-slate-400 rounded mx-auto w-12" />
          <div className="h-1 bg-slate-300 rounded mx-auto w-20" />
          <div className="h-[1px] w-full bg-slate-200 my-1" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-slate-300 rounded" />
            <div className="h-1 w-11/12 bg-slate-200 rounded" />
            <div className="h-1 w-10/12 bg-slate-200 rounded" />
          </div>
        </div>
      );
    }
    if (type === 'modern') {
      return (
        <div className="w-full h-24 bg-slate-100/50 border border-slate-200/50 rounded-xl p-2 flex gap-2 overflow-hidden transition-all group-hover:bg-slate-100">
          <div className="w-1/3 bg-slate-200/80 rounded p-1 flex flex-col gap-1 shrink-0">
            <div className="w-3.5 h-3.5 bg-brand-500 rounded-full shrink-0" />
            <div className="h-1 w-full bg-slate-400 rounded" />
            <div className="h-1 w-4/5 bg-slate-300 rounded" />
            <div className="h-1 w-full bg-slate-300 rounded" />
          </div>
          <div className="w-2/3 flex flex-col gap-1.5">
            <div className="h-1 bg-slate-400 rounded w-12" />
            <div className="h-1 w-full bg-slate-300 rounded" />
            <div className="h-1 w-11/12 bg-slate-200 rounded" />
            <div className="h-[1px] w-full bg-slate-200 my-0.5" />
            <div className="h-1 w-full bg-slate-300 rounded" />
          </div>
        </div>
      );
    }
    // minimal/default
    return (
      <div className="w-full h-24 bg-slate-100/50 border border-slate-200/50 rounded-xl p-2 flex flex-col gap-1.5 overflow-hidden transition-all group-hover:bg-slate-100">
        <div className="h-1 bg-slate-400 rounded w-10" />
        <div className="h-1 bg-slate-300 rounded w-16" />
        <div className="space-y-1 mt-2">
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-11/12 bg-slate-200 rounded" />
          <div className="h-1 w-full bg-slate-200 rounded" />
        </div>
      </div>
    );
  };

  const renderGaugeCircle = (score: number, label: string, colorClass: string) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl flex-1 min-w-[140px] hover:bg-slate-50 transition-colors duration-200">
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              className={`stroke-current ${colorClass}`}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold text-slate-800">{score}%</span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-none">{label}</p>
          <p className="text-xs font-semibold text-slate-700 mt-1">Excellent Match</p>
        </div>
      </div>
    );
  };

  // AI Tailoring Stages Loader UI
  const LOADING_STAGES = [
    { id: 0, text: "Scanning job listings for ATS keywords" },
    { id: 1, text: "Analyzing experience bullet points" },
    { id: 2, text: "Re-writing project descriptions to showcase metrics" },
    { id: 3, text: "Formatting layout configurations" },
    { id: 4, text: "Finalizing optimization check and template compile" }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Top Page Header - Redesigned to use consistent project component */}
      <PageHeader
        title="Resume Builder"
        description="Optimize layout formatting, match target job requirements, and boost your ATS scorecard."
        meta={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100/50">
            <Sparkle size={10} className="fill-brand-600 text-brand-600 animate-pulse" /> AI Optimization
          </span>
        }
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'preview'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Eye size={13} /> Preview
              </button>
              {generatedResult && (
                <button
                  type="button"
                  onClick={() => setActiveTab('suggestions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'suggestions'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <FileCheck2 size={13} /> Keyword Matrix
                </button>
              )}
            </div>

            {generatedResult && activeTemplate && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-medium rounded-xl transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95 shadow-sm shadow-brand-500/10"
              >
                <Download size={13} /> Print / Export PDF
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left Control Column (Step Onboarding) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleGenerate} className="glass-card p-5 space-y-5 shadow-slate-100/50">

            {/* Step 1: Target Job Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-50">
                <span className="w-5 h-5 bg-brand-50 rounded-full flex items-center justify-center text-xs font-black text-brand-600 border border-brand-100/40">1</span>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Target Job</h3>
              </div>

              {isJobsLoading ? (
                <div className="flex items-center gap-2 py-1 text-sm text-slate-400">
                  <Loader2 size={13} className="animate-spin text-brand-500" /> Loading jobs...
                </div>
              ) : (
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">-- Choose Job --</option>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title} ({(j.companyId as any)?.name})</option>
                  ))}
                </select>
              )}

              {/* Active Job Summary Card */}
              {activeJob && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2.5 animate-fade-in text-sm">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Briefcase size={12} className="text-slate-400" /> {activeJob.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {(activeJob.companyId as any)?.name} · {activeJob.location}
                    </p>
                  </div>

                  {/* Extracted Keywords Preview */}
                  {activeJob.description && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-secondary uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={8} className="text-brand-500" /> Target Competencies
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {extractKeywords(activeJob.description).slice(0, 5).map(kw => (
                          <span key={kw} className="px-2 py-0.5 bg-white border border-slate-100 text-xs font-bold text-slate-500 rounded-md">
                            {kw}
                          </span>
                        ))}
                        {extractKeywords(activeJob.description).length > 5 && (
                          <span className="text-xs text-slate-400 font-semibold self-center pl-1">
                            +{extractKeywords(activeJob.description).length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Toggle description snippet */}
                  <div className="border-t border-slate-100 pt-2 flex items-center">
                    <button
                      type="button"
                      onClick={() => setIsJobDetailsExpanded(!isJobDetailsExpanded)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-0.5 transition-colors"
                    >
                      {isJobDetailsExpanded ? "Hide Job Description" : "Show Job Description"}
                    </button>
                    {isJobDetailsExpanded && (
                      <div className="mt-2 w-full text-xs text-slate-500 leading-relaxed bg-white border border-slate-100 rounded-xl p-3 max-h-40 overflow-y-auto scrollbar-none animate-slide-up">
                        {activeJob.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Templates Picker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-50">
                <span className="w-5 h-5 bg-brand-50 rounded-full flex items-center justify-center text-xs font-black text-brand-600 border border-brand-100/40">2</span>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Choose Style / Template</h3>
              </div>

              {isTemplatesLoading ? (
                <div className="text-sm text-slate-400 flex items-center gap-2 py-1">
                  <Loader2 size={13} className="animate-spin text-brand-500" /> Loading templates...
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Select Option Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Resume Template Option
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                      className="input-field text-sm font-medium"
                      required
                    >
                      {activeTemplates.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.type?.toUpperCase() || 'ATS'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Interactive Template Visual Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeTemplates.map(t => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTemplateId(t._id)}
                        className={`group border rounded-2xl p-3 cursor-pointer transition-all duration-200 ${selectedTemplateId === t._id
                          ? 'border-brand-500 bg-white ring-2 ring-brand-500/5 shadow-sm'
                          : 'bg-slate-50/30 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-700 text-xs">{t.name}</span>
                          {selectedTemplateId === t._id ? (
                            <span className="w-3.5 h-3.5 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs">
                              <Check size={9} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-200 group-hover:border-slate-300" />
                          )}
                        </div>

                        {renderTemplateThumbnail(t.type || 'ats')}

                        <p className="text-xs text-slate-400 leading-normal mt-2">
                          {t.type === 'ats'
                            ? 'Times New Roman design optimal for corporate systems.'
                            : t.type === 'modern'
                              ? 'Clean dual-column style with highlighted profile information.'
                              : 'Classic layout focused on clean visual whitespace.'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Name & Action Button */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-50">
                <span className="w-5 h-5 bg-brand-50 rounded-full flex items-center justify-center text-xs font-black text-brand-600 border border-brand-100/40">3</span>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Version Name</h3>
              </div>

              <div>
                <input
                  type="text"
                  value={versionName}
                  onChange={e => setVersionName(e.target.value)}
                  placeholder="e.g. Meta - Software Engineer Tailored"
                  className="input-field text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !selectedJobId || !selectedTemplateId}
                className="btn-primary w-full justify-center text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing & Tailoring...</span>
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-current text-white" />
                    <span>Generate Tailored Resume</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ATS Report Section */}


        </div>

        {/* Right Preview Workspace Column */}
        <div className="lg:col-span-7 space-y-4">

          {/* Editor Workspace Canvas (Sleek light workspace matching project theme) */}
          <div className="bg-slate-100/60 border border-slate-200/50 rounded-2xl p-6 relative min-h-[640px] flex items-center justify-center overflow-hidden">

            {/* Grid layout decoration */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

            {/* AI Generation Loading Mask Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="bg-white border border-slate-100 rounded-2xl p-7 max-w-md w-full text-center space-y-6 shadow-xl shadow-slate-200/40">

                  {/* Glowing AI Spinner */}
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin" />
                    <Sparkles className="text-brand-500 animate-pulse" size={20} />
                  </div>

                  {/* Stage Details */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">AI Tailoring System</h4>
                    <p className="text-xs text-brand-600 font-semibold h-4">
                      {LOADING_STAGES[loadingStage]?.text || "Optimizing layout parameters..."}
                    </p>
                  </div>

                  {/* Visual Step Tracker */}
                  <div className="space-y-2.5 pt-1 text-left max-w-[270px] mx-auto border-t border-slate-50 pt-4">
                    {LOADING_STAGES.map(stage => {
                      const isCompleted = loadingStage > stage.id;
                      const isActive = loadingStage === stage.id;
                      return (
                        <div key={stage.id} className="flex items-center gap-2.5 text-xs">
                          {isCompleted ? (
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          ) : isActive ? (
                            <Loader2 size={12} className="text-brand-500 animate-spin shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-slate-200 shrink-0" />
                          )}
                          <span className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : isActive ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                            {stage.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Generated Resume Canvas */}
            {generatedResult && activeTemplate ? (
              activeTab === 'preview' ? (
                <div className="w-full flex justify-center animate-fade-in relative z-10 overflow-x-auto py-2">

                  {/* Real page simulator sheet */}
                  <div className="bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200/50 p-8 w-full max-w-[700px] min-h-[840px] transition-transform hover:scale-[1.002] duration-300">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                      ${activeTemplate.cssTemplate}
                      /* Inject overrides to display correctly inside preview sandbox */
                      .ats-resume, .modern-resume, .minimal-resume, .faang-resume {
                        color: #111827 !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
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
                </div>
              ) : (
                /* Matching Keywords / Match Matrix View (Light-themed matching design) */
                <div className="w-full max-w-2xl bg-white border border-slate-200/50 p-6 space-y-6 rounded-2xl animate-fade-in overflow-y-auto max-h-[600px] scrollbar-none shadow-sm">

                  {/* Keyword analysis checklist */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <h3 className="font-medium text-secondary text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={12} className="text-brand-500" /> Target Competencies Checklist
                      </h3>
                      <span className="text-xs text-slate-400 font-semibold">
                        Matched in Resume
                      </span>
                    </div>

                    {activeJob && (
                      <div className="space-y-2.5">
                        <p className="text-xs text-slate-500 leading-normal">
                          Below are the key technical keywords detected in the job listing and whether they have been successfully tailored into your customized resume version.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {(() => {
                            const jobKeywords = extractKeywords(activeJob.description || '');
                            const resumeSkills = (generatedResult.generatedResume.skills || []).map((s: string) => s.toLowerCase());
                            const resumeSummary = (generatedResult.generatedResume.summary || '').toLowerCase();
                            const resumeExperiencesStr = (generatedResult.generatedResume.experiences || [])
                              .map((e: any) => `${e.role} ${e.company} ${e.description} ${(e.achievements || []).join(' ')}`)
                              .join(' ')
                              .toLowerCase();
                            const resumeProjectsStr = (generatedResult.generatedResume.projects || [])
                              .map((p: any) => `${p.title} ${p.description} ${(p.achievements || []).join(' ')}`)
                              .join(' ')
                              .toLowerCase();

                            const fullResumeText = `${resumeSkills.join(' ')} ${resumeSummary} ${resumeExperiencesStr} ${resumeProjectsStr}`;

                            return jobKeywords.map(kw => {
                              const isMatched = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i').test(fullResumeText);
                              return (
                                <span
                                  key={kw}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 ${isMatched
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/80'
                                    : 'bg-slate-50 text-slate-400 border-slate-200 border-dashed'
                                    }`}
                                >
                                  {isMatched ? <Check size={8} strokeWidth={3} /> : <Plus size={8} />}
                                  {kw}
                                </span>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tailored Section Summaries */}
                  <div className="space-y-4 border-t border-slate-100 pt-5">
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2.5">
                      <Briefcase size={12} className="text-brand-500" /> AI-Tailored Project Highlights
                    </h3>
                    <div className="space-y-3">
                      {generatedResult.generatedResume.projects?.map((p: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-slate-705 text-slate-700 text-sm">{p.title}</p>
                            <span className="text-xs font-bold text-brand-650 text-brand-600 bg-brand-50 border border-brand-100/30 px-2 py-0.5 rounded-md">
                              Tailored Context
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Pre-generation Placeholder State (Light Theme design) */
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3.5 max-w-sm relative z-10 animate-fade-in">
                <div className="w-12 h-12 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-brand-500 shadow-sm shadow-slate-100/50">
                  <FileText size={20} className="opacity-90 text-brand-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">No Resume Generated</h4>
                  <p className="text-xs text-slate-500 leading-normal font-semibold">
                    Select a target job and design template on the left, then click "Generate Tailored Resume" to preview the optimized version.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className='col-span-12'>
          {generatedResult && (
            <div className="glass-card p-5 space-y-4 shadow-slate-100/50 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={13} className="text-brand-500" /> ATS Compatibility Report
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                  Passed Analysis
                </span>
              </div>

              <div className="flex gap-3 justify-between">
                {renderGaugeCircle(
                  generatedResult.atsScore || 0,
                  "ATS Score",
                  (generatedResult.atsScore || 0) >= 80 ? 'text-emerald-500' : (generatedResult.atsScore || 0) >= 60 ? 'text-brand-500' : 'text-rose-500'
                )}
                {renderGaugeCircle(
                  generatedResult.keywordCoverage || 0,
                  "Keywords Match",
                  (generatedResult.keywordCoverage || 0) >= 80 ? 'text-emerald-500' : (generatedResult.keywordCoverage || 0) >= 60 ? 'text-brand-500' : 'text-rose-500'
                )}
              </div>

              {/* Categorized suggestions list */}
              {generatedResult.improvementSuggestions && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-indigo-500" /> Improvement Advice
                  </p>

                  <div className="space-y-2">
                    {(() => {
                      const { critical, keywords, style } = categorizeSuggestions(generatedResult.improvementSuggestions);
                      return (
                        <>
                          {critical.length > 0 && (
                            <div className="bg-red-50/30 border border-red-100/30 rounded-xl p-3 space-y-1.5">
                              <h4 className="text-xs font-bold text-red-705 text-red-700 uppercase flex items-center gap-1">
                                <AlertCircle size={10} className="text-red-500" /> Impact Metrics Adjustments
                              </h4>
                              <div className="space-y-1 pl-3.5">
                                {critical.map((s, i) => (
                                  <p key={i} className="text-xs text-red-600 leading-relaxed list-item list-disc">
                                    {s}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {keywords.length > 0 && (
                            <div className="bg-indigo-50/30 border border-indigo-100/30 rounded-xl p-3 space-y-1.5">
                              <h4 className="text-xs font-bold text-indigo-705 text-indigo-700 uppercase flex items-center gap-1">
                                <Sparkles size={10} className="text-indigo-500" /> Required Skill keywords
                              </h4>
                              <div className="space-y-1 pl-3.5">
                                {keywords.map((s, i) => (
                                  <p key={i} className="text-xs text-indigo-650 text-indigo-600 leading-relaxed list-item list-disc">
                                    {s}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {style.length > 0 && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                              <h4 className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
                                <Layers size={10} className="text-slate-400" /> Typography & Structure
                              </h4>
                              <div className="space-y-1 pl-3.5">
                                {style.map((s, i) => (
                                  <p key={i} className="text-xs text-slate-500 leading-relaxed list-item list-disc">
                                    {s}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

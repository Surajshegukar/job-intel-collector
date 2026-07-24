import { Plus, Edit2, Trash2, FolderOpen, Github, Zap, ExternalLink } from 'lucide-react';

interface ProjectsSectionProps {
  projects: any[];
  openProjModal: (proj?: any) => void;
  deleteProject: any;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'E-commerce':  { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-100' },
  'Extension':   { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-100' },
  'AI/ML':       { bg: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-100' },
  'Mobile':      { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-100' },
  'SaaS':        { bg: 'bg-brand-50',    text: 'text-brand-700',   border: 'border-brand-100' },
  'API':         { bg: 'bg-rose-50',     text: 'text-rose-700',    border: 'border-rose-100' },
  'General':     { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200' },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS['General'];
}

function getProjectIcon(_category: string) {
  return FolderOpen;
}

export default function ProjectsSection({
  projects,
  openProjModal,
  deleteProject,
}: ProjectsSectionProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Projects</h2>
            <p className="text-sm text-slate-500 mt-0.5">Personal and professional projects that showcase your expertise.</p>
          </div>
          <button
            onClick={() => openProjModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 hover:shadow-md hover:shadow-brand-500/20 active:scale-95"
          >
            <Plus size={13} />
            Add Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-7">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FolderOpen size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">No projects added yet</p>
              <p className="text-xs text-slate-400 mt-1">Showcase your work by adding personal and professional projects.</p>
            </div>
            <button
              onClick={() => openProjModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 text-xs font-semibold rounded-xl border border-brand-100 transition-all duration-200 hover:bg-brand-100"
            >
              <Plus size={12} /> Add your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj: any) => {
              const catStyle = getCategoryStyle(proj.category || 'General');
              const ProjectIcon = getProjectIcon(proj.category);

              return (
                <div
                  key={proj._id}
                  className="group relative bg-slate-50/60 border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/60"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Project icon */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/10 to-indigo-500/10 border border-brand-100/60 flex items-center justify-center shrink-0">
                        <ProjectIcon size={16} className="text-brand-500" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{proj.title}</h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 ${catStyle.bg} ${catStyle.text} border ${catStyle.border} rounded-full text-[10px] font-semibold uppercase tracking-wider`}>
                          {proj.category || 'General'}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                      <button
                        onClick={() => openProjModal(proj)}
                        className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all duration-150"
                        aria-label="Edit project"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteProject.mutate(proj._id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                        aria-label="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {proj.description && (
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{proj.description}</p>
                  )}

                  {/* Complexity score */}
                  {proj.complexityScore && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-400 to-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${proj.complexityScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">Complexity {proj.complexityScore}/100</span>
                    </div>
                  )}

                  {/* Impact metrics */}
                  {proj.impactMetrics?.length > 0 && (
                    <div className="space-y-1.5">
                      {proj.impactMetrics.slice(0, 2).map((m: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-emerald-700 leading-relaxed">
                          <Zap size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-200">
                    {/* Technology tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.technologies || []).slice(0, 4).map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                      {(proj.technologies?.length || 0) > 4 && (
                        <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-medium text-slate-500">
                          +{proj.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* External links */}
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-150"
                          aria-label="View on GitHub"
                        >
                          <Github size={14} />
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all duration-150"
                          aria-label="Open live site"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Calendar, ChevronRight, Building2 } from 'lucide-react';

interface ExperienceSectionProps {
  experiences: any[];
  openExpModal: (exp?: any) => void;
  deleteExperience: any;
}

const EMPLOYMENT_TYPES: Record<string, { bg: string; text: string; border: string }> = {
  'Full-Time':   { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100' },
  'Part-Time':   { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100' },
  'Contract':    { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
  'Internship':  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  'Freelance':   { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return dateStr;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[parseInt(parts[1], 10) - 1] || '';
  return `${month} ${parts[0]}`;
}

export default function ExperienceSection({
  experiences,
  openExpModal,
  deleteExperience,
}: ExperienceSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Experience</h2>
            <p className="text-sm text-slate-500 mt-0.5">Your professional work history and accomplishments.</p>
          </div>
          <button
            onClick={() => openExpModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 hover:shadow-md hover:shadow-brand-500/20 active:scale-95"
          >
            <Plus size={13} />
            Add Experience
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-7">
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Briefcase size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">No work experience added yet</p>
              <p className="text-xs text-slate-400 mt-1">Add your work history to build a complete profile.</p>
            </div>
            <button
              onClick={() => openExpModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 text-xs font-semibold rounded-xl border border-brand-100 transition-all duration-200 hover:bg-brand-100"
            >
              <Plus size={12} /> Add your first experience
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

            <div className="space-y-0">
              {experiences.map((exp: any) => {
                const isExpanded = expandedId === exp._id;
                const employmentStyle = EMPLOYMENT_TYPES[exp.employmentType] || EMPLOYMENT_TYPES['Full-Time'];

                return (
                  <div key={exp._id} className="relative pl-16 pb-8 group">
                    {/* Timeline dot */}
                    <div className="absolute left-3.5 top-4 w-5 h-5 rounded-full bg-white border-2 border-brand-400 shadow-sm z-10" />

                    {/* Card */}
                    <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:bg-white hover:border-slate-300 hover:shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Role & company */}
                          <div>
                            <h3 className="text-base font-semibold text-slate-800">{exp.role}</h3>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Building2 size={13} className="text-slate-400 shrink-0" />
                                {exp.company}
                              </div>
                              <span className="text-slate-300">·</span>
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${employmentStyle.bg} ${employmentStyle.text} border ${employmentStyle.border} rounded-full text-[11px] font-semibold`}>
                                {exp.employmentType}
                              </div>
                            </div>
                          </div>

                          {/* Date range */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar size={12} className="text-slate-400 shrink-0" />
                            {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : <span className="text-brand-600 font-medium">Present</span>}
                          </div>

                          {/* Description */}
                          {exp.description && (
                            <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                          )}

                          {/* Achievements */}
                          {exp.achievements?.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key achievements</span>
                              <ul className="space-y-1.5">
                                {exp.achievements.slice(0, isExpanded ? undefined : 3).map((ach: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                                    <div className="w-1 h-1 rounded-full bg-brand-400 mt-2 shrink-0" />
                                    <span>{ach}</span>
                                  </li>
                                ))}
                              </ul>
                              {exp.achievements.length > 3 && !isExpanded && (
                                <button
                                  onClick={() => setExpandedId(exp._id)}
                                  className="inline-flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700 mt-1"
                                >
                                  Show {exp.achievements.length - 3} more achievements
                                  <ChevronRight size={11} />
                                </button>
                              )}
                              {isExpanded && exp.achievements.length > 3 && (
                                <button
                                  onClick={() => setExpandedId(null)}
                                  className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium hover:text-slate-700 mt-1"
                                >
                                  Show less
                                </button>
                              )}
                            </div>
                          )}

                          {/* Technologies */}
                          {exp.technologies?.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Technologies</span>
                              <div className="flex flex-wrap gap-2">
                                {exp.technologies.map((tech: string) => (
                                  <span
                                    key={tech}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            onClick={() => openExpModal(exp)}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all duration-150"
                            aria-label="Edit experience"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this experience?')) {
                                deleteExperience.mutate(exp._id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                            aria-label="Delete experience"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

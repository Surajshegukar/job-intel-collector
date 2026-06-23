import { useState, useEffect } from 'react';
import { UserCircle, Briefcase, GraduationCap, FolderOpen, Award, Code, FileText, Save, Loader2, Bot, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type Tab = 'info' | 'skills' | 'experience' | 'education' | 'projects' | 'resume';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'info',       label: 'Info',       icon: UserCircle },
  { id: 'skills',     label: 'Skills',     icon: Code },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education',  label: 'Education',  icon: GraduationCap },
  { id: 'projects',   label: 'Projects',   icon: FolderOpen },
  { id: 'resume',     label: 'Resume',     icon: FileText },
];

export default function Profile() {
  const { user, updateUser, isLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('info');
  const [saved, setSaved] = useState(false);

  // Local form state
  const [name, setName] = useState(user?.name ?? '');
  const [skills, setSkills] = useState((user?.skills ?? []).join(', '));
  const [resumeText, setResumeText] = useState(user?.resumeText ?? '');

  useEffect(() => {
    setName(user?.name ?? '');
    setSkills((user?.skills ?? []).join(', '));
    setResumeText(user?.resumeText ?? '');
  }, [user]);

  async function handleSave() {
    const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
    await updateUser({ name, skills: skillsList, resumeText });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="section-title">Profile</h1>
        <p className="text-xs text-dark-400 mt-0.5">Manage your details and configure the AI intelligence layer</p>
      </div>

      {/* Profile header card */}
      <div className="glass-card p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl shadow-brand-900/40 flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div>
          <p className="text-lg font-bold text-dark-50">{user?.name}</p>
          <p className="text-sm text-dark-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2 py-0.5 bg-brand-900/50 border border-brand-700/30 rounded-full text-[10px] font-semibold text-brand-300 flex items-center gap-1">
              <Bot size={9} /> AI Ready
            </span>
            {user?.resumeText && (
              <span className="px-2 py-0.5 bg-emerald-900/40 border border-emerald-700/30 rounded-full text-[10px] font-semibold text-emerald-400">
                Resume Uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800/60 rounded-xl overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              tab === id ? 'bg-brand-600 text-white shadow' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card p-5 space-y-4">
        {tab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Email</label>
              <input type="email" value={user?.email ?? ''} disabled className="input-field opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Certifications</label>
              <div className="flex flex-wrap gap-1.5">
                {user?.certifications?.map(c => (
                  <span key={c} className="px-2.5 py-1 bg-dark-800 border border-dark-600 rounded-full text-xs text-dark-300 flex items-center gap-1.5">
                    <Award size={10} /> {c}
                  </span>
                ))}
                {(!user?.certifications || user.certifications.length === 0) && (
                  <p className="text-xs text-dark-600">No certifications added yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-1.5">Your Skills (comma-separated)</label>
              <textarea
                rows={4}
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, Python…"
                className="input-field resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 bg-dark-800/40 rounded-xl min-h-16">
              {skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="px-2.5 py-1 bg-brand-900/50 border border-brand-700/30 rounded-full text-xs text-brand-300">{s}</span>
              ))}
            </div>
          </div>
        )}

        {tab === 'experience' && (
          <div className="space-y-3">
            {user?.experience?.length ? user.experience.map((exp, i) => (
              <div key={i} className="p-3 bg-dark-800/50 border border-dark-700/50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-dark-100">{exp.title}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{exp.company} · {exp.location}</p>
                    <p className="text-xs text-dark-600">{exp.startDate} – {exp.endDate}</p>
                  </div>
                </div>
                {exp.description && <p className="text-xs text-dark-400 mt-2 leading-relaxed">{exp.description}</p>}
              </div>
            )) : (
              <p className="text-xs text-dark-600 text-center py-8">No experience entries yet. Update via API or profile data.</p>
            )}
          </div>
        )}

        {tab === 'education' && (
          <div className="space-y-3">
            {user?.education?.length ? user.education.map((edu, i) => (
              <div key={i} className="p-3 bg-dark-800/50 border border-dark-700/50 rounded-xl">
                <p className="text-sm font-bold text-dark-100">{edu.school}</p>
                <p className="text-xs text-dark-400 mt-0.5">{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</p>
                <p className="text-xs text-dark-600">{edu.startDate} – {edu.endDate}</p>
                {edu.description && <p className="text-xs text-dark-400 mt-2">{edu.description}</p>}
              </div>
            )) : (
              <p className="text-xs text-dark-600 text-center py-8">No education entries.</p>
            )}
          </div>
        )}

        {tab === 'projects' && (
          <div className="space-y-3">
            {user?.projects?.length ? user.projects.map((proj, i) => (
              <div key={i} className="p-3 bg-dark-800/50 border border-dark-700/50 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-dark-100">{proj.name}</p>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:text-brand-300">Link</a>
                  )}
                </div>
                {proj.description && <p className="text-xs text-dark-400 mt-1 leading-relaxed">{proj.description}</p>}
                {proj.techStack && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.techStack.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-dark-400">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <p className="text-xs text-dark-600 text-center py-8">No projects added.</p>
            )}
          </div>
        )}

        {tab === 'resume' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-brand-900/20 border border-brand-700/30 rounded-xl">
              <Sparkles size={14} className="text-brand-400 flex-shrink-0" />
              <p className="text-xs text-brand-300">
                Paste your resume text below. The system will generate semantic embeddings for AI-powered job matching, skill gap analysis, and cover letter generation.
              </p>
            </div>
            <textarea
              rows={12}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume / CV text here…"
              className="input-field resize-none font-mono text-xs leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="btn-primary px-6 py-2.5"
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}

function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

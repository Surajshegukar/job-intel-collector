import { useState, useRef } from 'react';
import { 
  UserCircle, Briefcase, GraduationCap, FolderOpen, Award, Code, 
  Save, Loader2, Sparkles, Plus, Trash2, Edit2, 
  Link, Calendar, UploadCloud, CheckCircle2, 
  X, AlertCircle 
} from 'lucide-react';
import { 
  useProfileData, useUpdateProfileData, useImportResume,
  useAddSkill, useDeleteSkill,
  useAddProject, useUpdateProject, useDeleteProject,
  useAddExperience, useUpdateExperience, useDeleteExperience,
  useAddEducation, useUpdateEducation, useDeleteEducation,
  useAddCertification, useDeleteCertification,
  useAddAchievement, useDeleteAchievement
} from '../api/hooks';

type Tab = 'info' | 'skills' | 'experience' | 'education' | 'projects' | 'credentials';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'info',       label: 'Personal Info',       icon: UserCircle },
  { id: 'skills',     label: 'Skills Taxonomy',     icon: Code },
  { id: 'experience', label: 'Work Experience',     icon: Briefcase },
  { id: 'education',  label: 'Education',           icon: GraduationCap },
  { id: 'projects',   label: 'Projects',            icon: FolderOpen },
  { id: 'credentials',label: 'Certs & Awards',      icon: Award },
];

export default function Profile() {
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useProfileData();
  const updateProfile = useUpdateProfileData();
  const importResume = useImportResume();
  
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();
  
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const addExperience = useAddExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();

  const addEducation = useAddEducation();
  const updateEducation = useUpdateEducation();
  const deleteEducation = useDeleteEducation();

  const addCertification = useAddCertification();
  const deleteCertification = useDeleteCertification();

  const addAchievement = useAddAchievement();
  const deleteAchievement = useDeleteAchievement();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals / Adding states
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [expForm, setExpForm] = useState({
    company: '', role: '', startDate: '', endDate: '', description: '',
    employmentType: 'Full-Time', technologies: '', achievements: ''
  });

  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<any>(null);
  const [projForm, setProjForm] = useState({
    title: '', description: '', technologies: '', category: '',
    githubUrl: '', liveUrl: '', achievements: '', impactMetrics: ''
  });

  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<any>(null);
  const [eduForm, setEduForm] = useState({
    school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: ''
  });

  const [newSkill, setNewSkill] = useState({ skillName: '', proficiency: 'intermediate', yearsOfExperience: 1, category: '' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issueDate: '', credentialUrl: '' });
  const [newAch, setNewAch] = useState({ title: '', description: '', category: '' });

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="animate-spin text-brand-400" size={32} />
        <p className="text-sm font-semibold text-dark-200">Loading Resume Knowledge Base...</p>
      </div>
    );
  }

  if (isProfileError || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-dark-500 gap-2">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="text-sm font-semibold text-dark-200">Failed to load Profile data</p>
      </div>
    );
  }

  const { profile, skills, projects, experiences, certifications, achievements, education, completeness } = profileData;

  // Handles resume file import parsing
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setFileError('Supported formats: PDF, DOCX, TXT only.');
      return;
    }

    setFileError(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await importResume.mutateAsync(formData);
    } catch (err: any) {
      setFileError(err.response?.data?.message || 'Error occurred while parsing the resume.');
    }
  }

  // Personal Info Form Submission
  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    const target = e.target as any;
    const body = {
      name: target.name.value,
      phone: target.phone.value,
      location: target.location.value,
      linkedinUrl: target.linkedinUrl.value,
      githubUrl: target.githubUrl.value,
      portfolioUrl: target.portfolioUrl.value,
      summary: target.summary.value,
      preferredRoles: target.preferredRoles.value.split(',').map((r: string) => r.trim()).filter(Boolean),
      preferredLocations: target.preferredLocations.value.split(',').map((l: string) => l.trim()).filter(Boolean),
      salaryExpectation: {
        min: Number(target.salaryMin.value) || undefined,
        max: Number(target.salaryMax.value) || undefined,
        currency: target.salaryCurrency.value || 'USD'
      }
    };

    try {
      await updateProfile.mutateAsync(body);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  // Skills CRUD actions
  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!newSkill.skillName) return;
    await addSkill.mutateAsync(newSkill);
    setNewSkill({ skillName: '', proficiency: 'intermediate', yearsOfExperience: 1, category: '' });
  }

  // Experiences CRUD actions
  function openExpModal(exp: any = null) {
    if (exp) {
      setEditingExp(exp);
      setExpForm({
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate || '',
        description: exp.description || '',
        employmentType: exp.employmentType || 'Full-Time',
        technologies: (exp.technologies || []).join(', '),
        achievements: (exp.achievements || []).join('\n')
      });
    } else {
      setEditingExp(null);
      setExpForm({
        company: '', role: '', startDate: '', endDate: '', description: '',
        employmentType: 'Full-Time', technologies: '', achievements: ''
      });
    }
    setIsExpModalOpen(true);
  }

  async function handleSaveExperience(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...expForm,
      technologies: expForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
      achievements: expForm.achievements.split('\n').map(a => a.trim()).filter(Boolean)
    };

    if (editingExp) {
      await updateExperience.mutateAsync({ id: editingExp._id, body: payload });
    } else {
      await addExperience.mutateAsync(payload);
    }
    setIsExpModalOpen(false);
  }

  // Projects CRUD actions
  function openProjModal(proj: any = null) {
    if (proj) {
      setEditingProj(proj);
      setProjForm({
        title: proj.title,
        description: proj.description || '',
        technologies: (proj.technologies || []).join(', '),
        category: proj.category || '',
        githubUrl: proj.githubUrl || '',
        liveUrl: proj.liveUrl || '',
        achievements: (proj.achievements || []).join('\n'),
        impactMetrics: (proj.impactMetrics || []).join('\n')
      });
    } else {
      setEditingProj(null);
      setProjForm({
        title: '', description: '', technologies: '', category: '',
        githubUrl: '', liveUrl: '', achievements: '', impactMetrics: ''
      });
    }
    setIsProjModalOpen(true);
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...projForm,
      technologies: projForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
      achievements: projForm.achievements.split('\n').map(a => a.trim()).filter(Boolean),
      impactMetrics: projForm.impactMetrics.split('\n').map(m => m.trim()).filter(Boolean)
    };

    if (editingProj) {
      await updateProject.mutateAsync({ id: editingProj._id, body: payload });
    } else {
      await addProject.mutateAsync(payload);
    }
    setIsProjModalOpen(false);
  }

  // Education CRUD actions
  function openEduModal(edu: any = null) {
    if (edu) {
      setEditingEdu(edu);
      setEduForm({
        school: edu.school,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        description: edu.description || ''
      });
    } else {
      setEditingEdu(null);
      setEduForm({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' });
    }
    setIsEduModalOpen(true);
  }

  async function handleSaveEducation(e: React.FormEvent) {
    e.preventDefault();
    if (editingEdu) {
      await updateEducation.mutateAsync({ id: editingEdu._id, body: eduForm });
    } else {
      await addEducation.mutateAsync(eduForm);
    }
    setIsEduModalOpen(false);
  }

  // Certifications & Achievements CRUD
  async function handleAddCert(e: React.FormEvent) {
    e.preventDefault();
    if (!newCert.name || !newCert.issuer) return;
    await addCertification.mutateAsync(newCert);
    setNewCert({ name: '', issuer: '', issueDate: '', credentialUrl: '' });
  }

  async function handleAddAch(e: React.FormEvent) {
    e.preventDefault();
    if (!newAch.title) return;
    await addAchievement.mutateAsync(newAch);
    setNewAch({ title: '', description: '', category: '' });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Import Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <h1 className="section-title">Resume Knowledge Base</h1>
          <p className="text-xs text-dark-400 mt-0.5">Store normalized career components and sync profile attributes via AI ingestion.</p>
        </div>
        
        {/* Upload box */}
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={importResume.isPending}
            className="px-4 py-2 bg-brand-500/10 border border-brand-700/30 text-brand-300 text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-brand-500/20 transition-all disabled:opacity-50"
          >
            {importResume.isPending ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
            {importResume.isPending ? 'Ingesting PDF/DOCX...' : 'Import Resume File'}
          </button>
        </div>
      </div>

      {fileError && (
        <div className="p-3 border border-rose-900 bg-rose-950/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={14} /> {fileError}
        </div>
      )}

      {/* Completeness & Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Completeness Bar */}
        <div className="md:col-span-8 glass-card p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-dark-200 uppercase tracking-wider">Profile Completeness</h3>
            <span className="text-sm font-extrabold text-brand-400">{completeness}%</span>
          </div>
          <div className="h-2.5 w-full bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-1000" 
              style={{ width: `${completeness}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-dark-400 pt-1">
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} className={experiences.length > 0 ? 'text-brand-400' : 'text-dark-600'} /> Experience (+25%)
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} className={projects.length > 0 ? 'text-brand-400' : 'text-dark-600'} /> Projects (+25%)
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} className={skills.length > 0 ? 'text-brand-400' : 'text-dark-600'} /> Skills (+20%)
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={10} className={education.length > 0 ? 'text-brand-400' : 'text-dark-600'} /> Education (+10%)
            </div>
          </div>
        </div>

        {/* Quick stat */}
        <div className="md:col-span-4 glass-card p-5 flex flex-col justify-center text-center space-y-1">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Total Stored Records</p>
          <p className="text-3xl font-extrabold text-dark-50">{experiences.length + projects.length + skills.length}</p>
          <p className="text-[10px] text-dark-400">reusable resume assets active</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800/60 rounded-xl overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === id ? 'bg-brand-600 text-white shadow' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider pb-1 border-b border-dark-800">Candidate Bio & Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Full Name</label>
                <input type="text" name="name" defaultValue={profile.name || ''} className="input-field text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Contact Phone</label>
                <input type="text" name="phone" defaultValue={profile.phone || ''} className="input-field text-xs" placeholder="+91 9000000000" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Location</label>
                <input type="text" name="location" defaultValue={profile.location || ''} className="input-field text-xs" placeholder="Pune, India" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Portfolio URL</label>
                <input type="url" name="portfolioUrl" defaultValue={profile.portfolioUrl || ''} className="input-field text-xs" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">LinkedIn Profile</label>
                <input type="url" name="linkedinUrl" defaultValue={profile.linkedinUrl || ''} className="input-field text-xs" placeholder="https://linkedin.com/in/username" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">GitHub Profile</label>
                <input type="url" name="githubUrl" defaultValue={profile.githubUrl || ''} className="input-field text-xs" placeholder="https://github.com/username" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Professional Summary</label>
              <textarea name="summary" rows={3} defaultValue={profile.summary || ''} className="input-field text-xs leading-relaxed" placeholder="Short bio describing expertise..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Preferred Roles (comma-separated)</label>
                <input type="text" name="preferredRoles" defaultValue={(profile.preferredRoles || []).join(', ')} className="input-field text-xs" placeholder="Full-Stack Developer, Frontend Engineer" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Preferred Locations (comma-separated)</label>
                <input type="text" name="preferredLocations" defaultValue={(profile.preferredLocations || []).join(', ')} className="input-field text-xs" placeholder="Pune, Remote" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Min Salary expectation</label>
                <input type="number" name="salaryMin" defaultValue={profile.salaryExpectation?.min || ''} className="input-field text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Max Salary expectation</label>
                <input type="number" name="salaryMax" defaultValue={profile.salaryExpectation?.max || ''} className="input-field text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Currency</label>
                <input type="text" name="salaryCurrency" defaultValue={profile.salaryExpectation?.currency || 'USD'} className="input-field text-xs" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary px-5 py-2 text-xs">
                {updateProfile.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : <Save size={12} className="mr-1" />}
                {saveSuccess ? 'Saved successfully!' : 'Save Profile Bio'}
              </button>
            </div>
          </form>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="glass-card p-4 grid grid-cols-1 sm:grid-cols-4 items-end gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Skill Name</label>
                <input 
                  type="text" 
                  value={newSkill.skillName} 
                  onChange={e => setNewSkill(prev => ({ ...prev, skillName: e.target.value }))}
                  className="input-field text-xs" 
                  placeholder="e.g. React" 
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Proficiency</label>
                <select 
                  value={newSkill.proficiency} 
                  onChange={e => setNewSkill(prev => ({ ...prev, proficiency: e.target.value as any }))}
                  className="input-field text-xs"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Years of Exp</label>
                <input 
                  type="number" 
                  value={newSkill.yearsOfExperience} 
                  onChange={e => setNewSkill(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
                  className="input-field text-xs" 
                  min={1}
                />
              </div>
              <button type="submit" disabled={addSkill.isPending} className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1">
                <Plus size={12} /> Add Skill
              </button>
            </form>

            {/* List Skills by Category */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider pb-1 border-b border-dark-800">Skill Taxonomy Groups</h3>
              {skills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Testing', 'Mobile', 'AI/ML', 'General'].map(cat => {
                    const filtered = skills.filter((s: any) => s.category === cat);
                    if (filtered.length === 0) return null;
                    return (
                      <div key={cat} className="p-3 bg-dark-800/20 border border-dark-800 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{cat}</span>
                        <div className="space-y-1.5">
                          {filtered.map((sk: any) => (
                            <div key={sk._id} className="flex items-center justify-between text-xs text-dark-200">
                              <div>
                                <span className="font-semibold">{sk.name || sk.skillName}</span>
                                <span className="text-[9px] text-dark-500 ml-1.5">({sk.yearsOfExperience}y · {sk.proficiency})</span>
                              </div>
                              <button 
                                onClick={() => deleteSkill.mutate(sk._id)}
                                className="text-dark-500 hover:text-red-400 p-0.5"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-dark-600 text-center py-6">No skills in profile. Upload a resume to ingest automatically.</p>
              )}
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">Career Timeline</h3>
              <button onClick={() => openExpModal()} className="btn-primary py-1.5 px-3 text-[11px] flex items-center gap-1">
                <Plus size={11} /> Add Experience
              </button>
            </div>

            <div className="space-y-3">
              {experiences.length > 0 ? (
                experiences.map((exp: any) => (
                  <div key={exp._id} className="glass-card p-5 relative group border-dark-800 hover:border-brand-500/30 transition-all">
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                      <button onClick={() => openExpModal(exp)} className="p-1 text-dark-400 hover:text-brand-400">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => deleteExperience.mutate(exp._id)} className="p-1 text-dark-400 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-300 flex-shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-dark-100">{exp.role}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-dark-400 font-medium">
                          <span>{exp.company}</span>
                          <span className="text-dark-600">•</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-dark-800 border border-dark-700/50 rounded-full text-dark-400 uppercase">{exp.employmentType}</span>
                          <span className="text-dark-600">•</span>
                          <span className="text-[10px] flex items-center gap-1"><Calendar size={10} /> {exp.startDate} to {exp.endDate || 'Present'}</span>
                        </div>
                        {exp.description && <p className="text-xs text-dark-400 leading-relaxed mt-2 text-justify">{exp.description}</p>}
                        
                        {exp.achievements?.length > 0 && (
                          <ul className="list-disc list-outside pl-4 space-y-0.5 mt-2.5">
                            {exp.achievements.map((ach: string, idx: number) => (
                              <li key={idx} className="text-xs text-dark-400 leading-relaxed">{ach}</li>
                            ))}
                          </ul>
                        )}

                        {exp.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {exp.technologies.map((t: string) => (
                              <span key={t} className="px-2 py-0.5 bg-dark-800/80 border border-dark-700/40 rounded text-[9px] text-dark-400 font-semibold">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-dark-600 text-center py-10 glass-card">No career experiences entered. Add a job record above.</p>
              )}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">Independent Projects</h3>
              <button onClick={() => openProjModal()} className="btn-primary py-1.5 px-3 text-[11px] flex items-center gap-1">
                <Plus size={11} /> Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length > 0 ? (
                projects.map((proj: any) => (
                  <div key={proj._id} className="glass-card p-5 relative group border-dark-800 hover:border-brand-500/30 flex flex-col justify-between transition-all">
                    {/* Floating controls */}
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                      <button onClick={() => openProjModal(proj)} className="p-1 text-dark-400 hover:text-brand-400">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => deleteProject.mutate(proj._id)} className="p-1 text-dark-400 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-purple-950 text-purple-400 border border-purple-800/30 rounded text-[8px] font-bold uppercase tracking-wider">
                          {proj.category || 'General'}
                        </span>
                        {proj.complexityScore && (
                          <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/30 rounded text-[8px] font-bold">
                            Comp: {proj.complexityScore}/100
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-dark-100">{proj.title}</h4>
                      {proj.description && <p className="text-xs text-dark-400 leading-relaxed text-justify">{proj.description}</p>}
                      
                      {proj.impactMetrics?.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Metrics & Performance</p>
                          {proj.impactMetrics.map((m: string, idx: number) => (
                            <p key={idx} className="text-xs text-emerald-500/80 leading-relaxed flex items-center gap-1 font-medium">
                              <Sparkles size={9} /> {m}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4">
                      {proj.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((t: string) => (
                            <span key={t} className="px-2 py-0.5 bg-dark-800 border border-dark-700/50 rounded text-[9px] text-dark-400">{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2 border-t border-dark-800/40 text-xs">
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-dark-400 hover:text-brand-400">
                            <Link size={10} /> GitHub
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-dark-400 hover:text-brand-400">
                            <Link size={10} /> Live Deployment
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-10 glass-card text-dark-600 text-xs">No projects registered yet. Click Add above.</div>
              )}
            </div>
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">Academic Timeline</h3>
              <button onClick={() => openEduModal()} className="btn-primary py-1.5 px-3 text-[11px] flex items-center gap-1">
                <Plus size={11} /> Add Education
              </button>
            </div>

            <div className="space-y-3">
              {education.length > 0 ? (
                education.map((edu: any) => (
                  <div key={edu._id} className="glass-card p-5 relative group border-dark-800 hover:border-brand-500/30 transition-all flex items-start gap-3">
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-all">
                      <button onClick={() => openEduModal(edu)} className="p-1 text-dark-400 hover:text-brand-400">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => deleteEducation.mutate(edu._id)} className="p-1 text-dark-400 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-300 flex-shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-100">{edu.school}</p>
                      <p className="text-xs text-dark-400 mt-0.5">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                      <p className="text-[10px] text-dark-500 flex items-center gap-1 mt-1"><Calendar size={10} /> {edu.startDate} – {edu.endDate}</p>
                      {edu.description && <p className="text-xs text-dark-400 leading-relaxed mt-2 text-justify">{edu.description}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-dark-600 text-center py-10 glass-card">No education details recorded. Click Add to log a record.</p>
              )}
            </div>
          </div>
        )}

        {/* CREDENTIALS TAB (Certifications & Achievements) */}
        {activeTab === 'credentials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Certifications */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">Professional Certifications</h3>
              <form onSubmit={handleAddCert} className="glass-card p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Cert Name</label>
                    <input type="text" value={newCert.name} onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))} className="input-field text-xs" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Issuer</label>
                    <input type="text" value={newCert.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))} className="input-field text-xs" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Date</label>
                    <input type="text" value={newCert.issueDate} onChange={e => setNewCert(p => ({ ...p, issueDate: e.target.value }))} className="input-field text-xs" placeholder="e.g. 2025" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Verification URL</label>
                    <input type="url" value={newCert.credentialUrl} onChange={e => setNewCert(p => ({ ...p, credentialUrl: e.target.value }))} className="input-field text-xs" placeholder="https://" />
                  </div>
                </div>
                <button type="submit" disabled={addCertification.isPending} className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1">
                  <Plus size={11} /> Add Certification
                </button>
              </form>

              <div className="space-y-2">
                {certifications.length > 0 ? (
                  certifications.map((c: any) => (
                    <div key={c._id} className="glass-card p-3.5 flex items-center justify-between text-xs hover:border-dark-700 transition-all">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-brand-400 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-dark-100">{c.name}</p>
                          <p className="text-[10px] text-dark-400">{c.issuer} · {c.issueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.credentialUrl && (
                          <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-brand-400">
                            <Link size={11} />
                          </a>
                        )}
                        <button onClick={() => deleteCertification.mutate(c._id)} className="text-dark-500 hover:text-red-400 p-1">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-dark-600 text-center py-4">No certifications logged.</p>
                )}
              </div>
            </div>

            {/* Right: Achievements */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">Achievements & Honors</h3>
              <form onSubmit={handleAddAch} className="glass-card p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Achievement Title</label>
                    <input type="text" value={newAch.title} onChange={e => setNewAch(p => ({ ...p, title: e.target.value }))} className="input-field text-xs" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Category</label>
                    <input type="text" value={newAch.category} onChange={e => setNewAch(p => ({ ...p, category: e.target.value }))} className="input-field text-xs" placeholder="e.g. Hackathon, Award" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-dark-400 uppercase mb-1">Description</label>
                    <input type="text" value={newAch.description} onChange={e => setNewAch(p => ({ ...p, description: e.target.value }))} className="input-field text-xs" />
                  </div>
                </div>
                <button type="submit" disabled={addAchievement.isPending} className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1">
                  <Plus size={11} /> Add Achievement
                </button>
              </form>

              <div className="space-y-2">
                {achievements.length > 0 ? (
                  achievements.map((a: any) => (
                    <div key={a._id} className="glass-card p-3.5 flex items-center justify-between text-xs hover:border-dark-700 transition-all">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 bg-amber-950 text-amber-400 border border-amber-800/30 rounded text-[8px] font-bold uppercase">{a.category || 'Achievement'}</span>
                          <p className="font-bold text-dark-100">{a.title}</p>
                        </div>
                        {a.description && <p className="text-[10px] text-dark-400 leading-normal">{a.description}</p>}
                      </div>
                      <button onClick={() => deleteAchievement.mutate(a._id)} className="text-dark-500 hover:text-red-400 p-1">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-dark-600 text-center py-4">No awards or achievements logged.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- WORK EXPERIENCE MODAL --- */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm" onClick={() => setIsExpModalOpen(false)} />
          <form onSubmit={handleSaveExperience} className="relative w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-dark-50">{editingExp ? 'Edit Work Experience' : 'Add Work Experience'}</h4>
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="text-dark-400 hover:text-dark-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Company</label>
                <input type="text" value={expForm.company} onChange={e => setExpForm(prev => ({ ...prev, company: e.target.value }))} className="input-field text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Role Title</label>
                <input type="text" value={expForm.role} onChange={e => setExpForm(prev => ({ ...prev, role: e.target.value }))} className="input-field text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Employment Type</label>
                <select value={expForm.employmentType} onChange={e => setExpForm(prev => ({ ...prev, employmentType: e.target.value }))} className="input-field text-xs">
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Start Date</label>
                  <input type="text" value={expForm.startDate} onChange={e => setExpForm(prev => ({ ...prev, startDate: e.target.value }))} className="input-field text-xs" placeholder="YYYY-MM" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">End Date</label>
                  <input type="text" value={expForm.endDate} onChange={e => setExpForm(prev => ({ ...prev, endDate: e.target.value }))} className="input-field text-xs" placeholder="Present or YYYY-MM" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Role Description Summary</label>
              <textarea value={expForm.description} onChange={e => setExpForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="input-field text-xs leading-relaxed" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Bullet Achievements (One per line)</label>
              <textarea value={expForm.achievements} onChange={e => setExpForm(prev => ({ ...prev, achievements: e.target.value }))} rows={4} className="input-field text-xs leading-relaxed" placeholder="Improved loading latency by 35%...&#10;Scaled REST APIs on AWS Lambda..." />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Technologies Utilized (comma-separated)</label>
              <input type="text" value={expForm.technologies} onChange={e => setExpForm(prev => ({ ...prev, technologies: e.target.value }))} className="input-field text-xs" placeholder="React, Node.js, Express" />
            </div>

            <div className="flex items-center gap-2 pt-2 justify-end">
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-5 py-2 text-xs">Save Experience</button>
            </div>
          </form>
        </div>
      )}

      {/* --- PROJECT MODAL --- */}
      {isProjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm" onClick={() => setIsProjModalOpen(false)} />
          <form onSubmit={handleSaveProject} className="relative w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-dark-50">{editingProj ? 'Edit Project' : 'Add Project'}</h4>
              <button type="button" onClick={() => setIsProjModalOpen(false)} className="text-dark-400 hover:text-dark-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Project Title</label>
                <input type="text" value={projForm.title} onChange={e => setProjForm(prev => ({ ...prev, title: e.target.value }))} className="input-field text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Category</label>
                <input type="text" value={projForm.category} onChange={e => setProjForm(prev => ({ ...prev, category: e.target.value }))} className="input-field text-xs" placeholder="e.g. E-commerce, Extension" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Technologies (comma-separated)</label>
                <input type="text" value={projForm.technologies} onChange={e => setProjForm(prev => ({ ...prev, technologies: e.target.value }))} className="input-field text-xs" placeholder="React, Node.js" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">GitHub URL</label>
                <input type="url" value={projForm.githubUrl} onChange={e => setProjForm(prev => ({ ...prev, githubUrl: e.target.value }))} className="input-field text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Live URL</label>
                <input type="url" value={projForm.liveUrl} onChange={e => setProjForm(prev => ({ ...prev, liveUrl: e.target.value }))} className="input-field text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Description Summary</label>
              <textarea value={projForm.description} onChange={e => setProjForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="input-field text-xs leading-relaxed" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Achievements (One per line)</label>
              <textarea value={projForm.achievements} onChange={e => setProjForm(prev => ({ ...prev, achievements: e.target.value }))} rows={3} className="input-field text-xs leading-relaxed" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Key Impact Metrics (One per line)</label>
              <textarea value={projForm.impactMetrics} onChange={e => setProjForm(prev => ({ ...prev, impactMetrics: e.target.value }))} rows={2} className="input-field text-xs leading-relaxed" placeholder="Processed $5000+ transactions...&#10;Reduced load times by 25%" />
            </div>

            <div className="flex items-center gap-2 pt-2 justify-end">
              <button type="button" onClick={() => setIsProjModalOpen(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-5 py-2 text-xs">Save Project</button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDUCATION MODAL --- */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm" onClick={() => setIsEduModalOpen(false)} />
          <form onSubmit={handleSaveEducation} className="relative w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-dark-50">{editingEdu ? 'Edit Education' : 'Add Education'}</h4>
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="text-dark-400 hover:text-dark-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">School Name</label>
                <input type="text" value={eduForm.school} onChange={e => setEduForm(prev => ({ ...prev, school: e.target.value }))} className="input-field text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Degree</label>
                <input type="text" value={eduForm.degree} onChange={e => setEduForm(prev => ({ ...prev, degree: e.target.value }))} className="input-field text-xs" placeholder="e.g. Master of Science" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Field of Study</label>
                <input type="text" value={eduForm.fieldOfStudy} onChange={e => setEduForm(prev => ({ ...prev, fieldOfStudy: e.target.value }))} className="input-field text-xs" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Start Date</label>
                <input type="text" value={eduForm.startDate} onChange={e => setEduForm(prev => ({ ...prev, startDate: e.target.value }))} className="input-field text-xs" placeholder="e.g. 2022" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">End Date</label>
                <input type="text" value={eduForm.endDate} onChange={e => setEduForm(prev => ({ ...prev, endDate: e.target.value }))} className="input-field text-xs" placeholder="e.g. 2024" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Description</label>
              <textarea value={eduForm.description} onChange={e => setEduForm(prev => ({ ...prev, description: e.target.value }))} rows={2} className="input-field text-xs leading-relaxed" />
            </div>

            <div className="flex items-center gap-2 pt-2 justify-end">
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button type="submit" className="btn-primary px-5 py-2 text-xs">Save Education</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

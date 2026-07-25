import { useState, useRef } from 'react';
import {
  UserCircle, Briefcase, GraduationCap, FolderOpen, Award, Code,
  X, AlertCircle, UploadCloud, Loader2, Target
} from 'lucide-react';
import ProfileHero from '../components/ProfileHero';
import ProfileStats from '../components/ProfileStats';
import PersonalInfoSection from '../components/profile/PersonalInfoSection';
import CareerTargetsSection from '../components/profile/CareerTargetsSection';
import SkillsSection from '../components/profile/SkillsSection';
import ExperienceSection from '../components/profile/ExperienceSection';
import ProjectsSection from '../components/profile/ProjectsSection';
import EducationSection from '../components/profile/EducationSection';
import CredentialsSection from '../components/profile/CredentialsSection';
import { ProfileSkeleton } from '../components/Skeleton';
import {
  useProfileData, useUpdateProfileData, useImportResume,
  useAddSkill, useDeleteSkill,
  useAddProject, useUpdateProject, useDeleteProject,
  useAddExperience, useUpdateExperience, useDeleteExperience,
  useAddEducation, useUpdateEducation, useDeleteEducation,
  useAddCertification, useDeleteCertification,
  useAddAchievement, useDeleteAchievement
} from '../api/hooks';

type Tab = 'info' | 'targets' | 'skills' | 'experience' | 'education' | 'projects' | 'credentials';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'info',        label: 'Personal Info',  icon: UserCircle },
  { id: 'targets',     label: 'Career Targets', icon: Target },
  { id: 'experience',  label: 'Experience',     icon: Briefcase },
  { id: 'projects',    label: 'Projects',       icon: FolderOpen },
  { id: 'skills',      label: 'Skills',         icon: Code },
  { id: 'education',   label: 'Education',      icon: GraduationCap },
  { id: 'credentials', label: 'Certificates',   icon: Award },
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

  // Modal state
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

  const [newSkill, setNewSkill] = useState({ skillName: '', category: '' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issueDate: '', credentialUrl: '' });
  const [newAch, setNewAch] = useState({ title: '', description: '', category: '' });

  if (isProfileLoading) return <ProfileSkeleton />;

  if (isProfileError || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="text-sm font-semibold text-slate-600">Failed to load profile data</p>
      </div>
    );
  }

  const { profile, skills, projects, experiences, certifications, achievements, education, completeness } = profileData;

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

  function openExpModal(exp: any = null) {
    if (exp) {
      setEditingExp(exp);
      setExpForm({
        company: exp.company, role: exp.role, startDate: exp.startDate,
        endDate: exp.endDate || '', description: exp.description || '',
        employmentType: exp.employmentType || 'Full-Time',
        technologies: (exp.technologies || []).join(', '),
        achievements: (exp.achievements || []).join('\n')
      });
    } else {
      setEditingExp(null);
      setExpForm({ company: '', role: '', startDate: '', endDate: '', description: '', employmentType: 'Full-Time', technologies: '', achievements: '' });
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
    if (editingExp) await updateExperience.mutateAsync({ id: editingExp._id, body: payload });
    else await addExperience.mutateAsync(payload);
    setIsExpModalOpen(false);
  }

  function openProjModal(proj: any = null) {
    if (proj) {
      setEditingProj(proj);
      setProjForm({
        title: proj.title, description: proj.description || '',
        technologies: (proj.technologies || []).join(', '), category: proj.category || '',
        githubUrl: proj.githubUrl || '', liveUrl: proj.liveUrl || '',
        achievements: (proj.achievements || []).join('\n'),
        impactMetrics: (proj.impactMetrics || []).join('\n')
      });
    } else {
      setEditingProj(null);
      setProjForm({ title: '', description: '', technologies: '', category: '', githubUrl: '', liveUrl: '', achievements: '', impactMetrics: '' });
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
    if (editingProj) await updateProject.mutateAsync({ id: editingProj._id, body: payload });
    else await addProject.mutateAsync(payload);
    setIsProjModalOpen(false);
  }

  function openEduModal(edu: any = null) {
    if (edu) {
      setEditingEdu(edu);
      setEduForm({
        school: edu.school, degree: edu.degree, fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '', endDate: edu.endDate || '', description: edu.description || ''
      });
    } else {
      setEditingEdu(null);
      setEduForm({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' });
    }
    setIsEduModalOpen(true);
  }

  async function handleSaveEducation(e: React.FormEvent) {
    e.preventDefault();
    if (editingEdu) await updateEducation.mutateAsync({ id: editingEdu._id, body: eduForm });
    else await addEducation.mutateAsync(eduForm);
    setIsEduModalOpen(false);
  }

  const inputCls = 'w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 hover:border-slate-355';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your career data synced across resumes and applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importResume.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm disabled:opacity-50"
          >
            {importResume.isPending ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {importResume.isPending ? 'Importing...' : 'Import Resume'}
          </button>
        </div>
      </div>

      {fileError && (
        <div className="p-3.5 border border-red-100 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={15} /> {fileError}
        </div>
      )}

      <ProfileHero
        profile={profile} completeness={completeness} experiences={experiences}
        projects={projects} skills={skills} education={education}
        onEditClick={() => setActiveTab('info')}
      />

      <ProfileStats experiences={experiences} projects={projects} skills={skills} certifications={certifications} />

      {/* Tab bar */}
      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${
              activeTab === id
                ? 'bg-white text-brand-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4 pb-8">
        {activeTab === 'info' && (
          <PersonalInfoSection profile={profile} updateProfile={updateProfile} saveSuccess={saveSuccess} setSaveSuccess={setSaveSuccess} />
        )}
        {activeTab === 'targets' && (
          <CareerTargetsSection profile={profile} updateProfile={updateProfile} saveSuccess={saveSuccess} setSaveSuccess={setSaveSuccess} />
        )}
        {activeTab === 'skills' && (
          <SkillsSection skills={skills} addSkill={addSkill} deleteSkill={deleteSkill} newSkill={newSkill} setNewSkill={setNewSkill} />
        )}
        {activeTab === 'experience' && (
          <ExperienceSection experiences={experiences} openExpModal={openExpModal} deleteExperience={deleteExperience} />
        )}
        {activeTab === 'projects' && (
          <ProjectsSection projects={projects} openProjModal={openProjModal} deleteProject={deleteProject} />
        )}
        {activeTab === 'education' && (
          <EducationSection education={education} openEduModal={openEduModal} deleteEducation={deleteEducation} />
        )}
        {activeTab === 'credentials' && (
          <CredentialsSection
            certifications={certifications} achievements={achievements}
            newCert={newCert} setNewCert={setNewCert} newAch={newAch} setNewAch={setNewAch}
            addCertification={addCertification} deleteCertification={deleteCertification}
            addAchievement={addAchievement} deleteAchievement={deleteAchievement}
          />
        )}
      </div>

      {/* Experience Drawer */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end mt-0-imp">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsExpModalOpen(false)} />
          
          {/* Drawer Body */}
          <form onSubmit={handleSaveExperience} className="relative w-full max-w-md h-full bg-white border-l border-slate-100 shadow-2xl flex flex-col animate-slide-left z-10">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-slate-800">{editingExp ? 'Edit Experience' : 'Add Experience'}</h4>
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-750">Company *</label>
                <input type="text" value={expForm.company} onChange={e => setExpForm(p => ({ ...p, company: e.target.value }))} className={inputCls} placeholder="e.g. Stripe Inc." required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Role Title *</label>
                <input type="text" value={expForm.role} onChange={e => setExpForm(p => ({ ...p, role: e.target.value }))} className={inputCls} placeholder="e.g. Senior Software Engineer" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Employment Type</label>
                <select value={expForm.employmentType} onChange={e => setExpForm(p => ({ ...p, employmentType: e.target.value }))} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 hover:border-slate-355 !py-1">
                  <option>Full-Time</option><option>Part-Time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Start Date *</label>
                  <input type="text" value={expForm.startDate} onChange={e => setExpForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} placeholder="YYYY-MM" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">End Date</label>
                  <input type="text" value={expForm.endDate} onChange={e => setExpForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} placeholder="Present" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Description</label>
                <textarea value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 resize-none transition-all hover:border-slate-355" placeholder="Describe your duties..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Achievements (one per line)</label>
                <textarea value={expForm.achievements} onChange={e => setExpForm(p => ({ ...p, achievements: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 resize-none transition-all hover:border-slate-355" placeholder="e.g. Led migration to Next.js..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Technologies (comma-separated)</label>
                <input type="text" value={expForm.technologies} onChange={e => setExpForm(p => ({ ...p, technologies: e.target.value }))} className={inputCls} placeholder="React, Node.js, AWS" />
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-all bg-white">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-500 transition-all">Save Experience</button>
            </div>
          </form>
        </div>
      )}

      {/* Project Drawer */}
      {isProjModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end mt-0-imp">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsProjModalOpen(false)} />
          
          {/* Drawer Body */}
          <form onSubmit={handleSaveProject} className="relative w-full max-w-md h-full bg-white border-l border-slate-100 shadow-2xl flex flex-col animate-slide-left z-10">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-slate-800">{editingProj ? 'Edit Project' : 'Add Project'}</h4>
              <button type="button" onClick={() => setIsProjModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Project Title *</label>
                <input type="text" value={projForm.title} onChange={e => setProjForm(p => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="e.g. AI Portfolio Analyzer" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Category</label>
                  <input type="text" value={projForm.category} onChange={e => setProjForm(p => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="SaaS, Mobile, Web CLI" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Technologies</label>
                  <input type="text" value={projForm.technologies} onChange={e => setProjForm(p => ({ ...p, technologies: e.target.value }))} className={inputCls} placeholder="TypeScript, Tailwind" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">GitHub URL</label>
                  <input type="url" value={projForm.githubUrl} onChange={e => setProjForm(p => ({ ...p, githubUrl: e.target.value }))} className={inputCls} placeholder="https://github.com/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Live URL</label>
                  <input type="url" value={projForm.liveUrl} onChange={e => setProjForm(p => ({ ...p, liveUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Description</label>
                <textarea value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 resize-none transition-all hover:border-slate-355" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Achievements (one per line)</label>
                <textarea value={projForm.achievements} onChange={e => setProjForm(p => ({ ...p, achievements: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 resize-none transition-all hover:border-slate-355" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Impact Metrics (one per line)</label>
                <textarea value={projForm.impactMetrics} onChange={e => setProjForm(p => ({ ...p, impactMetrics: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 resize-none transition-all hover:border-slate-355" placeholder="Processed $5000+ transactions..." />
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button type="button" onClick={() => setIsProjModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-all bg-white">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-500 transition-all">Save Project</button>
            </div>
          </form>
        </div>
      )}

      {/* Education Drawer */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end mt-0-imp">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsEduModalOpen(false)} />
          
          {/* Drawer Body */}
          <form onSubmit={handleSaveEducation} className="relative w-full max-w-md h-full bg-white border-l border-slate-100 shadow-2xl flex flex-col animate-slide-left z-10">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h4 className="text-sm font-bold text-slate-800">{editingEdu ? 'Edit Education' : 'Add Education'}</h4>
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">School / University *</label>
                <input type="text" value={eduForm.school} onChange={e => setEduForm(p => ({ ...p, school: e.target.value }))} className={inputCls} placeholder="e.g. Stanford University" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Degree *</label>
                  <input type="text" value={eduForm.degree} onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))} className={inputCls} placeholder="Bachelor of Science" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Field of Study</label>
                  <input type="text" value={eduForm.fieldOfStudy} onChange={e => setEduForm(p => ({ ...p, fieldOfStudy: e.target.value }))} className={inputCls} placeholder="Computer Science" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">Start Year</label>
                  <input type="text" value={eduForm.startDate} onChange={e => setEduForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} placeholder="2020" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-755">End Year</label>
                  <input type="text" value={eduForm.endDate} onChange={e => setEduForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} placeholder="2024" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-755">Description</label>
                <textarea value={eduForm.description} onChange={e => setEduForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 resize-none transition-all hover:border-slate-355" />
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-all bg-white">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-500 transition-all">Save Education</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

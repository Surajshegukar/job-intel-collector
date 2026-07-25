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

  const inputCls = 'w-full h-[42px] px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 hover:border-slate-300';

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

      {/* Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsExpModalOpen(false)} />
          <form onSubmit={handleSaveExperience} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-800">{editingExp ? 'Edit Experience' : 'Add Experience'}</h4>
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Company</label>
                <input type="text" value={expForm.company} onChange={e => setExpForm(p => ({ ...p, company: e.target.value }))} className={inputCls} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Role Title</label>
                <input type="text" value={expForm.role} onChange={e => setExpForm(p => ({ ...p, role: e.target.value }))} className={inputCls} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Employment Type</label>
                <select value={expForm.employmentType} onChange={e => setExpForm(p => ({ ...p, employmentType: e.target.value }))} className={inputCls}>
                  <option>Full-Time</option><option>Part-Time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Start</label>
                  <input type="text" value={expForm.startDate} onChange={e => setExpForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} placeholder="YYYY-MM" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">End</label>
                  <input type="text" value={expForm.endDate} onChange={e => setExpForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} placeholder="Present" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Description</label>
              <textarea value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Achievements (one per line)</label>
              <textarea value={expForm.achievements} onChange={e => setExpForm(p => ({ ...p, achievements: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all" placeholder="Improved load time by 40%..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Technologies (comma-separated)</label>
              <input type="text" value={expForm.technologies} onChange={e => setExpForm(p => ({ ...p, technologies: e.target.value }))} className={inputCls} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsExpModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 transition-all">Save Experience</button>
            </div>
          </form>
        </div>
      )}

      {/* Project Modal */}
      {isProjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProjModalOpen(false)} />
          <form onSubmit={handleSaveProject} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-800">{editingProj ? 'Edit Project' : 'Add Project'}</h4>
              <button type="button" onClick={() => setIsProjModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Project Title</label>
              <input type="text" value={projForm.title} onChange={e => setProjForm(p => ({ ...p, title: e.target.value }))} className={inputCls} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Category</label>
                <input type="text" value={projForm.category} onChange={e => setProjForm(p => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="SaaS, API, Mobile..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Technologies</label>
                <input type="text" value={projForm.technologies} onChange={e => setProjForm(p => ({ ...p, technologies: e.target.value }))} className={inputCls} placeholder="React, Node.js" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">GitHub URL</label>
                <input type="url" value={projForm.githubUrl} onChange={e => setProjForm(p => ({ ...p, githubUrl: e.target.value }))} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Live URL</label>
                <input type="url" value={projForm.liveUrl} onChange={e => setProjForm(p => ({ ...p, liveUrl: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Description</label>
              <textarea value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Achievements (one per line)</label>
              <textarea value={projForm.achievements} onChange={e => setProjForm(p => ({ ...p, achievements: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Impact Metrics (one per line)</label>
              <textarea value={projForm.impactMetrics} onChange={e => setProjForm(p => ({ ...p, impactMetrics: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all" placeholder="Processed $5000+ transactions..." />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsProjModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 transition-all">Save Project</button>
            </div>
          </form>
        </div>
      )}

      {/* Education Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEduModalOpen(false)} />
          <form onSubmit={handleSaveEducation} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-800">{editingEdu ? 'Edit Education' : 'Add Education'}</h4>
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">School / University</label>
              <input type="text" value={eduForm.school} onChange={e => setEduForm(p => ({ ...p, school: e.target.value }))} className={inputCls} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Degree</label>
                <input type="text" value={eduForm.degree} onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))} className={inputCls} placeholder="Bachelor of Science" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Field of Study</label>
                <input type="text" value={eduForm.fieldOfStudy} onChange={e => setEduForm(p => ({ ...p, fieldOfStudy: e.target.value }))} className={inputCls} placeholder="Computer Science" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Start Year</label>
                <input type="text" value={eduForm.startDate} onChange={e => setEduForm(p => ({ ...p, startDate: e.target.value }))} className={inputCls} placeholder="2020" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">End Year</label>
                <input type="text" value={eduForm.endDate} onChange={e => setEduForm(p => ({ ...p, endDate: e.target.value }))} className={inputCls} placeholder="2024" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Description</label>
              <textarea value={eduForm.description} onChange={e => setEduForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsEduModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 transition-all">Save Education</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

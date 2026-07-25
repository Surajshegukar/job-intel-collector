import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Upload, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Check,
  GraduationCap,
  Award
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';

// Slide interface
interface Slide {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  // Onboarding parts: 'showcase' | 'setup' | 'manual-form'
  const [part, setPart] = useState<'showcase' | 'setup' | 'manual-form'>('showcase');
  
  // Showcase Slide Index (0 to 2)
  const [slideIdx, setSlideIdx] = useState(0);

  // Resume upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Manual onboarding sub-steps (0 to 5)
  const [formStep, setFormStep] = useState(0);

  // ─── FORM STATES ───

  // Step 1: Personal Info
  const [manualName, setManualName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [summary, setSummary] = useState('');

  // Step 2: Target Roles & Locations
  const [targetRole, setTargetRole] = useState('');
  const [preferredRoles, setPreferredRoles] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');

  // Step 3: Core Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const quickSkills = [
    "React", "TypeScript", "Node.js", "Python", "Go", "AWS", "Docker", "Next.js", 
    "Kubernetes", "System Design", "PostgreSQL", "Tailwind CSS", "Git", "Machine Learning"
  ];
  const targetRoles = [
    "Frontend Engineer", "Backend Engineer", "Full Stack Developer", 
    "Data Scientist", "Product Manager", "DevOps Engineer"
  ];

  // Step 4: Work Experience
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [empType, setEmpType] = useState('Full-Time');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expTech, setExpTech] = useState('');
  const [expAch, setExpAch] = useState('');

  // Step 5: Projects
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGit, setProjGit] = useState('');
  const [projLive, setProjLive] = useState('');
  const [projAch, setProjAch] = useState('');
  const [projMetrics, setProjMetrics] = useState('');

  // Step 6: Education & Credentials
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduDesc, setEduDesc] = useState('');

  // Certification info
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');

  // Achievement info
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achCategory, setAchCategory] = useState('Professional');
  const [customSkillsInput, setCustomSkillsInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const slides: Slide[] = [
    {
      title: "Audit your resume using AI",
      subtitle: "Understand your compatibility before you apply.",
      description: "IntelJet parses your resume to analyze technical skill alignment, key responsibilities, and keyword matches against live jobs. Spot critical gaps and optimize your documents in one click.",
      badge: "Resume Intelligence"
    },
    {
      title: "Tailor applications instantly",
      subtitle: "Never send a generic cover letter again.",
      description: "Generate personalized cover letters matching the company culture and job requirements. Get AI-curated interview practice questions specialized for your role to boost confidence.",
      badge: "Smart Applications"
    },
    {
      title: "Centralized search command center",
      subtitle: "Organize and track your job application lifecycle.",
      description: "Track all job openings, interview rounds, response logs, and job offers in one central interactive dashboard. Monitor analytics of your search pipeline dynamically.",
      badge: "Application Tracking"
    }
  ];

  const currentStepIdx = part === 'showcase' ? slideIdx : part === 'setup' ? 3 : 4 + formStep;

  // Toggle skills tags
  function toggleSkill(skill: string) {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  }

  // Next triggers
  function handleNext() {
    if (part === 'showcase') {
      if (slideIdx < slides.length - 1) {
        setSlideIdx(slideIdx + 1);
      } else {
        setPart('setup');
      }
    } else if (part === 'manual-form') {
      if (formStep < 5) {
        // Validate required fields per step
        if (formStep === 0 && !manualName.trim()) {
          setFormError("Full Name is required.");
          return;
        }
        if (formStep === 1 && !targetRole.trim()) {
          setFormError("Target Role is required.");
          return;
        }
        setFormError(null);
        setFormStep(formStep + 1);
      }
    }
  }

  // Back triggers
  function handleBack() {
    if (part === 'showcase') {
      if (slideIdx > 0) {
        setSlideIdx(slideIdx - 1);
      }
    } else if (part === 'setup') {
      setPart('showcase');
      setSlideIdx(2);
    } else if (part === 'manual-form') {
      if (formStep > 0) {
        setFormStep(formStep - 1);
      } else {
        setPart('setup');
      }
    }
  }

  function handleSkipShowcase() {
    setPart('setup');
  }

  // Resume Upload Handlers
  async function processResumeUpload(file: File) {
    if (!file) return;
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      setUploadError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await api.post('/resume/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Fetch the parsed and synced profile data
      const { data } = await api.get('/profile');
      if (data) {
        // Step 1: Personal Info
        if (data.profile) {
          setManualName(data.profile.name || '');
          setPhone(data.profile.phone || '');
          setLocation(data.profile.location || '');
          setPortfolioUrl(data.profile.portfolioUrl || '');
          setLinkedinUrl(data.profile.linkedinUrl || '');
          setGithubUrl(data.profile.githubUrl || '');
          setNoticePeriod(data.profile.noticePeriod || 'Immediate');
          setSummary(data.profile.summary || '');
          setSalaryMin(data.profile.salaryExpectation?.min ? String(data.profile.salaryExpectation.min) : '');
          setSalaryMax(data.profile.salaryExpectation?.max ? String(data.profile.salaryExpectation.max) : '');
          setSalaryCurrency(data.profile.salaryExpectation?.currency || 'USD');

          // Step 2: Target Roles & Locations
          setTargetRole(data.profile.preferredRoles?.[0] || '');
          setPreferredRoles(data.profile.preferredRoles?.join(', ') || '');
          setPreferredLocations(data.profile.preferredLocations?.join(', ') || '');
        }

        // Step 3: Core Skills
        if (data.skills) {
          setSelectedSkills(data.skills.map((s: any) => s.skillName || s.name) || []);
        }

        // Step 4: Work Experience
        if (data.experiences && data.experiences.length > 0) {
          const exp = data.experiences[0];
          setCompany(exp.company || '');
          setRoleTitle(exp.role || '');
          setEmpType(exp.employmentType || 'Full-Time');
          setExpStart(exp.startDate || '');
          setExpEnd(exp.endDate || '');
          setExpDesc(exp.description || '');
          setExpTech(exp.technologies?.join(', ') || '');
          setExpAch(exp.achievements?.join('\n') || '');
        }

        // Step 5: Projects
        if (data.projects && data.projects.length > 0) {
          const proj = data.projects[0];
          setProjTitle(proj.title || '');
          setProjCategory(proj.category || '');
          setProjDesc(proj.description || '');
          setProjTech(proj.technologies?.join(', ') || '');
          setProjGit(proj.githubUrl || '');
          setProjLive(proj.liveUrl || '');
          setProjAch(proj.achievements?.join('\n') || '');
          setProjMetrics(proj.impactMetrics?.join('\n') || '');
        }

        // Step 6: Education & Credentials
        if (data.education && data.education.length > 0) {
          const edu = data.education[0];
          setSchool(edu.school || '');
          setDegree(edu.degree || '');
          setFieldOfStudy(edu.fieldOfStudy || '');
          setEduStart(edu.startDate || '');
          setEduEnd(edu.endDate || '');
          setEduDesc(edu.description || '');
        }
        if (data.certifications && data.certifications.length > 0) {
          const cert = data.certifications[0];
          setCertName(cert.name || '');
          setCertIssuer(cert.issuer || '');
          setCertDate(cert.issueDate || '');
          setCertUrl(cert.credentialUrl || '');
        }
        if (data.achievements && data.achievements.length > 0) {
          const ach = data.achievements[0];
          setAchTitle(ach.title || '');
          setAchDesc(ach.description || '');
          setAchCategory(ach.category || 'Professional');
        }

        setUploadSuccess(true);
        setPart('manual-form');
        setFormStep(0);
      } else {
        setUploadError("Failed to fetch parsed resume details. Please complete your profile manually.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.response?.data?.message || "Failed to parse resume. Please complete your profile manually.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResumeUpload(e.dataTransfer.files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      processResumeUpload(e.target.files[0]);
    }
  }

  // Final manual wizard save
  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);

    // Clean lists
    const experienceList = company.trim() && roleTitle.trim() ? [{
      company,
      role: roleTitle,
      employmentType: empType,
      startDate: expStart || '2024-06',
      endDate: expEnd || 'Present',
      description: expDesc,
      technologies: expTech ? expTech.split(',').map(t => t.trim()).filter(Boolean) : [],
      achievements: expAch ? expAch.split('\n').map(a => a.trim()).filter(Boolean) : []
    }] : [];

    const projectList = projTitle.trim() ? [{
      title: projTitle,
      description: projDesc,
      category: projCategory,
      technologies: projTech ? projTech.split(',').map(t => t.trim()).filter(Boolean) : [],
      githubUrl: projGit,
      liveUrl: projLive,
      achievements: projAch ? projAch.split('\n').map(a => a.trim()).filter(Boolean) : [],
      impactMetrics: projMetrics ? projMetrics.split('\n').map(m => m.trim()).filter(Boolean) : []
    }] : [];

    const educationList = school.trim() && degree.trim() ? [{
      school,
      degree,
      fieldOfStudy,
      startDate: eduStart,
      endDate: eduEnd,
      description: eduDesc
    }] : [];

    const certificationsList = certName.trim() ? [{
      name: certName,
      issuer: certIssuer || 'Self',
      issueDate: certDate || '2025',
      credentialUrl: certUrl
    }] : [];

    const achievementsList = achTitle.trim() ? [{
      title: achTitle,
      description: achDesc,
      category: achCategory || 'Professional'
    }] : [];

    const payload = {
      // User properties
      name: manualName,
      isOnboarded: true,
      
      // Personal info / UserProfile fields
      phone,
      location,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      noticePeriod,
      summary,
      preferredRoles: preferredRoles ? preferredRoles.split(',').map(r => r.trim()).filter(Boolean) : [targetRole],
      preferredLocations: preferredLocations ? preferredLocations.split(',').map(l => l.trim()).filter(Boolean) : [location].filter(Boolean),
      salaryExpectation: {
        min: Number(salaryMin) || undefined,
        max: Number(salaryMax) || undefined,
        currency: salaryCurrency
      },

      // Sub-collections arrays
      skills: selectedSkills,
      experience: experienceList,
      projects: projectList,
      education: educationList,
      certifications: certificationsList,
      achievements: achievementsList
    };

    try {
      const ok = await updateUser(payload as any);
      if (ok) {
        navigate('/overview');
      } else {
        setFormError("Failed to save profile details. Please review your inputs and try again.");
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Server error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white overflow-hidden font-sans">
      
      {/* LEFT SECTION: Wizard Columns */}
      <div className="col-span-12 lg:col-span-6 flex flex-col justify-between p-8 md:p-14 overflow-y-auto max-h-screen">
        
        {/* Header Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-brand-500/20">
              <Bot size={18} />
            </div>
            <span className="text-md font-bold text-slate-900 tracking-tight">Intel<span className="text-brand-600">JET</span></span>
          </div>
          {part === 'showcase' && (
            <button 
              onClick={handleSkipShowcase}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-all"
            >
              Skip Intro
            </button>
          )}
        </div>

        {/* Form Body Container */}
        <div className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto py-2">
          
          {/* Progress Dashes Indicator */}
          {/* PART 1: 3 dashes for feature slides. PART 2: 6 dashes for profile manual setup steps. */}
          <div className="flex gap-1.5 mb-8">
            {part === 'showcase' ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    idx <= slideIdx ? 'bg-slate-900' : 'bg-slate-100'
                  }`}
                />
              ))
            ) : part === 'manual-form' ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    idx <= formStep ? 'bg-slate-900' : 'bg-slate-100'
                  }`}
                />
              ))
            ) : (
              <div className="h-1.5 w-full bg-slate-900 rounded-full" />
            )}
          </div>

          {/* SLIDES STEP */}
          {part === 'showcase' && (
            <div className="animate-slide-up">
              <span className="inline-block px-2.5 py-1 bg-brand-50 text-brand-600 font-bold rounded-lg text-[10px] tracking-wide uppercase mb-4">
                {slides[slideIdx].badge}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">
                {slides[slideIdx].title}
              </h1>
              <h2 className="text-lg font-semibold text-slate-500 mb-5 leading-normal">
                {slides[slideIdx].subtitle}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {slides[slideIdx].description}
              </p>
            </div>
          )}

          {/* SETUP CHOICE STEP */}
          {part === 'setup' && (
            <div className="animate-slide-up">
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">
                Tell us about yourself
              </h1>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Create your career profile to unlock customized dashboard features. Select how you want to configure your profile details.
              </p>

              <div className="space-y-4">
                <label 
                  className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    isDragOver ? 'border-brand-500 bg-brand-50/10' : 'border-slate-100 hover:border-brand-500/30 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt" 
                    className="hidden" 
                    onChange={handleFileSelect}
                    disabled={isUploading || uploadSuccess}
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-brand-600 animate-spin mb-3" />
                      <span className="text-xs font-semibold text-slate-800">Reading Resume...</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Gemini AI is extracting details...</span>
                    </div>
                  ) : uploadSuccess ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3 animate-bounce" />
                      <span className="text-xs font-semibold text-slate-800">Resume Parsed Successfully!</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Redirecting to overview...</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                        <Upload size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-0.5">Upload Resume (AI parsed)</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                          Drag & drop or select a PDF/DOCX file. AI will automatically populate all fields.
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700">
                          Upload Document <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  )}
                </label>

                <button 
                  type="button"
                  onClick={() => {
                    setPart('manual-form');
                    setFormStep(0);
                  }}
                  className="w-full text-left flex items-start p-6 rounded-2xl border border-slate-100 bg-white hover:border-brand-500/30 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mr-4">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5">Manually Fill Profile</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Configure your details step-by-step using our onboarding wizard.
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700">
                      Configure manually <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              </div>

              {uploadError && (
                <div className="mt-6 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* MANUAL MULTI-STEP WIZARD */}
          {part === 'manual-form' && (
            <div className="animate-slide-up space-y-4">
              
              {uploadSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold animate-fade-in">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                  <span>Resume parsed successfully! Please review and customize your auto-filled details below.</span>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* STEP 1: Personal Information */}
              {formStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                    <p className="text-xs text-slate-400">Let's configure your basic contact and salary preferences.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      <input type="text" required value={manualName} onChange={e => setManualName(e.target.value)} placeholder="e.g. Suraj Shegukar" className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 617 000 0000" className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                      <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Boston, MA" className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Notice Period</label>
                      <select value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="input-field !h-10 !rounded-lg text-xs">
                        <option>Immediate</option><option>1 Week</option><option>2 Weeks</option><option>1 Month</option><option>2 Months</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="col-span-3"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Expected Salary</span></div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Min</label>
                      <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80000" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Max</label>
                      <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120000" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">Currency</label>
                      <select value={salaryCurrency} onChange={e => setSalaryCurrency(e.target.value)} className="input-field !h-9 !py-1 !rounded-lg text-xs">
                        <option>USD</option><option>EUR</option><option>INR</option><option>GBP</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-700">Online Portfolios & Socials</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="Portfolio URL" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                      <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                      <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="GitHub URL" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Professional Summary</label>
                    <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} placeholder="Describe your professional background, skills, and accomplishments..." className="input-field !rounded-lg text-xs resize-none" />
                  </div>
                </div>
              )}

              {/* STEP 2: Target Roles & Locations */}
              {formStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Career Targets</h2>
                    <p className="text-xs text-slate-400">Specify your targeting roles and preferred job search locations.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Target Role *</label>
                    <input type="text" required value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className="input-field !h-10 !rounded-lg text-xs mb-2" />
                    <div className="flex flex-wrap gap-1">
                      {targetRoles.map(role => (
                        <button key={role} type="button" onClick={() => setTargetRole(role)} className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${targetRole === role ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{role}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Job Roles (comma-separated)</label>
                    <input type="text" value={preferredRoles} onChange={e => setPreferredRoles(e.target.value)} placeholder="e.g. Frontend Engineer, React Developer, Full Stack Engineer" className="input-field !h-10 !rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Locations (comma-separated)</label>
                    <input type="text" value={preferredLocations} onChange={e => setPreferredLocations(e.target.value)} placeholder="e.g. Boston MA, Remote, New York NY" className="input-field !h-10 !rounded-lg text-xs" />
                  </div>
                </div>
              )}

              {/* STEP 3: Core Skills */}
              {formStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Core Technical Skills</h2>
                    <p className="text-xs text-slate-400">Toggle quick suggest tags or type your skills to expand inventory.</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl max-h-[140px] overflow-y-auto">
                    {quickSkills.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                            isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {skill} {isSelected && <Check size={10} className="inline ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter Additional Skills (comma-separated)</label>
                    <input 
                      type="text" 
                      value={customSkillsInput}
                      placeholder="e.g. Docker, GraphQL, Kubernetes, Rust" 
                      onChange={e => {
                        const val = e.target.value;
                        setCustomSkillsInput(val);
                        if (val.endsWith(',')) {
                          const skill = val.slice(0, -1).trim();
                          if (skill && !selectedSkills.includes(skill)) {
                            setSelectedSkills([...selectedSkills, skill]);
                          }
                          setCustomSkillsInput('');
                        }
                      }}
                      className="input-field !h-10 !rounded-lg text-xs" 
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Work Experience */}
              {formStep === 3 && (
                <div className="space-y-4 animate-fade-in max-h-[50vh] overflow-y-auto pr-1">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Work Experience</h2>
                    <p className="text-xs text-slate-400">Detail your latest professional employment role.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                      <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Stripe Inc." className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                      <input type="text" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                      <select value={empType} onChange={e => setEmpType(e.target.value)} className="input-field !h-10 !rounded-lg text-xs">
                        <option>Full-Time</option><option>Part-Time</option><option>Contract</option><option>Internship</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Start Date</label>
                        <input type="text" value={expStart} onChange={e => setExpStart(e.target.value)} placeholder="YYYY-MM" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">End Date</label>
                        <input type="text" value={expEnd} onChange={e => setExpEnd(e.target.value)} placeholder="Present" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Key Technologies (comma-separated)</label>
                    <input type="text" value={expTech} onChange={e => setExpTech(e.target.value)} placeholder="React, Node.js, AWS" className="input-field !h-10 !rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role Description</label>
                    <textarea value={expDesc} onChange={e => setExpDesc(e.target.value)} rows={2} placeholder="Briefly describe your duties and responsibilities..." className="input-field !rounded-lg text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Achievements (one per line)</label>
                    <textarea value={expAch} onChange={e => setExpAch(e.target.value)} rows={2} placeholder="e.g. Led migration to Next.js, boosting SEO performance by 40%." className="input-field !rounded-lg text-xs resize-none" />
                  </div>
                </div>
              )}

              {/* STEP 5: Projects */}
              {formStep === 4 && (
                <div className="space-y-4 animate-fade-in max-h-[50vh] overflow-y-auto pr-1">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Featured Projects</h2>
                    <p className="text-xs text-slate-400">Add a highlight project showcasing your technology applications.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                      <input type="text" value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="e.g. AI Portfolio Analyzer" className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <input type="text" value={projCategory} onChange={e => setProjCategory(e.target.value)} placeholder="SaaS, Mobile, Web CLI" className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GitHub URL</label>
                      <input type="url" value={projGit} onChange={e => setProjGit(e.target.value)} placeholder="https://github.com/..." className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Live URL</label>
                      <input type="url" value={projLive} onChange={e => setProjLive(e.target.value)} placeholder="https://..." className="input-field !h-10 !rounded-lg text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Technologies Used (comma-separated)</label>
                    <input type="text" value={projTech} onChange={e => setProjTech(e.target.value)} placeholder="TypeScript, Tailwind CSS, OpenAI API" className="input-field !h-10 !rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Description</label>
                    <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} rows={2} placeholder="Explain the project objectives and tech stack..." className="input-field !rounded-lg text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Key Project Achievements (one per line)</label>
                    <textarea value={projAch} onChange={e => setProjAch(e.target.value)} rows={2} placeholder="e.g. Achieved 95% test coverage." className="input-field !rounded-lg text-xs resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Impact Metrics & Achievements (one per line)</label>
                    <textarea value={projMetrics} onChange={e => setProjMetrics(e.target.value)} rows={2} placeholder="e.g. Scored 100+ active users within first week." className="input-field !rounded-lg text-xs resize-none" />
                  </div>
                </div>
              )}

              {/* STEP 6: Education & Credentials */}
              {formStep === 5 && (
                <div className="space-y-4 animate-fade-in max-h-[50vh] overflow-y-auto pr-1">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Education & Credentials</h2>
                    <p className="text-xs text-slate-400">Fill in your academic history and professional certifications.</p>
                  </div>

                  {/* Education Form */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><GraduationCap size={12} /> Education History</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={school} onChange={e => setSchool(e.target.value)} placeholder="School Name" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      <input type="text" value={degree} onChange={e => setDegree(e.target.value)} placeholder="Degree Type" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      <input type="text" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="Field of Study" className="input-field !h-9 !py-1 !rounded-lg text-xs col-span-2" />
                      <input type="text" value={eduStart} onChange={e => setEduStart(e.target.value)} placeholder="Start Year" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      <input type="text" value={eduEnd} onChange={e => setEduEnd(e.target.value)} placeholder="End Year" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Description / Activities</label>
                        <textarea value={eduDesc} onChange={e => setEduDesc(e.target.value)} rows={2} placeholder="Specialized in software engineering..." className="input-field !rounded-lg text-xs resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* Certifications Form */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Award size={12} /> Core Certification</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={certName} onChange={e => setCertName(e.target.value)} placeholder="AWS Certified Solutions Architect" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                      <input type="text" value={certIssuer} onChange={e => setCertIssuer(e.target.value)} placeholder="Issuer (e.g. Amazon)" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                      <input type="text" value={certDate} onChange={e => setCertDate(e.target.value)} placeholder="Issue Date" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                      <input type="url" value={certUrl} onChange={e => setCertUrl(e.target.value)} placeholder="Credential URL" className="input-field !h-9 !py-1 !rounded-lg text-[11px]" />
                    </div>
                  </div>

                  {/* Achievements Form */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Sparkles size={12} /> Key Achievement</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={achTitle} onChange={e => setAchTitle(e.target.value)} placeholder="First place at AWS Hackathon" className="input-field !h-9 !py-1 !rounded-lg text-xs col-span-2" />
                      <input type="text" value={achCategory} onChange={e => setAchCategory(e.target.value)} placeholder="Category (e.g. Award, Honor)" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                      <input type="text" value={achDesc} onChange={e => setAchDesc(e.target.value)} placeholder="Description" className="input-field !h-9 !py-1 !rounded-lg text-xs" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="mt-8 border-t border-slate-100 pt-5 flex items-center justify-between">
          
          {/* Left/Back Button */}
          <div>
            <button
              type="button"
              onClick={handleBack}
              disabled={part === 'showcase' && slideIdx === 0}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Back
            </button>
          </div>

          {/* Setup Instructions */}
          {part === 'setup' && (
            <span className="text-slate-400 text-xs font-medium">Select method to continue</span>
          )}

          {/* Right/Next/Submit Button */}
          <div>
            {part === 'showcase' && (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm"
              >
                {slideIdx === slides.length - 1 ? "Get Started" : "Next"}
                <ChevronRight size={14} />
              </button>
            )}

            {part === 'manual-form' && formStep < 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            )}

            {part === 'manual-form' && formStep === 5 && (
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Finalizing Setup..." : "Finish Onboarding"}
                <CheckCircle2 size={14} />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* RIGHT SECTION: Soft Gradient with Floating Product Mockup */}
      <div className="hidden lg:flex lg:col-span-6 bg-slate-50 border-l border-slate-100 flex-col justify-center p-12 relative overflow-hidden bg-gradient-to-tr from-slate-50 via-indigo-50/10 to-blue-50/20">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Soft Background Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 left-2/3 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating Mockup Dashboard Card */}
        <div className={`relative w-full max-w-md mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-5 flex flex-col justify-between overflow-hidden animate-slide-up duration-500 ${
          part === 'manual-form' ? 'aspect-[1/1.4] max-h-[580px]' : 'aspect-[4/3]'
        }`}>
          
          {/* Mockup Header tab */}
          {/* <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>
            <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-semibold text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              {part === 'manual-form' ? 'Resume Live Preview' : 'IntelJet Live Preview'}
            </div>
          </div> */}

          {/* MOCKUP CONTENT: Dynamic rendering based on current step */}
          <div className="flex-1 flex flex-col justify-start overflow-hidden">
            
            {/* Slide 1 Mockup: Resume Score Analysis */}
            {currentStepIdx === 0 && (
              <div className="space-y-4 animate-fade-in my-auto">
                <div className="flex items-center justify-between bg-brand-50/20 border border-brand-100/50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full border-[3px] border-brand-600 border-r-transparent flex items-center justify-center font-extrabold text-sm text-brand-600 animate-spin-slow bg-white">
                      88%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Resume Match Score</h4>
                      <p className="text-[10px] text-brand-600 font-medium">Strong alignment found</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Passed</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Key Strengths</span>
                    <ul className="text-[9px] font-semibold text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-500" /> Next.js & React</li>
                      <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-500" /> TypeScript</li>
                    </ul>
                  </div>
                  <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Skill Gaps</span>
                    <ul className="text-[9px] font-semibold text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-500" /> Docker basics</li>
                      <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-500" /> Kubernetes setup</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2 Mockup: Cover Letter Tailor & Interview Prep */}
            {currentStepIdx === 1 && (
              <div className="space-y-3.5 animate-fade-in my-auto">
                <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500">Drafting cover letter...</span>
                    <span className="text-[8px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded">AI Tailored</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-[90%] bg-slate-200 rounded" />
                    <div className="h-2.5 w-full bg-slate-200 rounded" />
                    <div className="h-2.5 w-[95%] bg-slate-200 rounded" />
                    <div className="h-2.5 w-[60%] bg-brand-200 rounded animate-pulse" />
                  </div>
                </div>

                <div className="border border-purple-100 bg-purple-50/20 p-3 rounded-xl flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-700">Interview Prep Assistant</h5>
                    <p className="text-[9px] text-slate-500 mt-0.5">"Describe a complex React state challenge you resolved."</p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3 Mockup: Application Kanban Board */}
            {currentStepIdx === 2 && (
              <div className="animate-fade-in space-y-2.5 my-auto">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Search Pipeline Board</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-slate-400">SAVED</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    </div>
                    <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <h6 className="text-[9px] font-bold text-slate-800 leading-tight">Next.js Dev</h6>
                      <span className="text-[7px] text-slate-400 block mt-0.5">Vercel</span>
                    </div>
                  </div>

                  <div className="border border-brand-100/50 p-2.5 rounded-xl bg-brand-50/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-brand-600">INTERVIEW</span>
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                    </div>
                    <div className="p-2 bg-white border border-brand-100 rounded-lg shadow-sm">
                      <h6 className="text-[9px] font-bold text-slate-800 leading-tight">Cloud Arch</h6>
                      <span className="text-[7px] text-slate-400 block mt-0.5">Google</span>
                    </div>
                  </div>

                  <div className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-emerald-600">OFFER</span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </div>
                    <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <h6 className="text-[9px] font-bold text-slate-800 leading-tight">Engineer</h6>
                      <span className="text-[7px] text-slate-400 block mt-0.5">Stripe</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Onboarding visualizer: Minimal Resume Preview Sheet */}
            {currentStepIdx >= 3 && (
              <div className="animate-fade-in text-slate-800 text-[9.5px] text-left h-full flex flex-col overflow-hidden p-2">
                {/* Resume Header */}
                <div className="text-center shrink-0">
                  <h1 className="text-sm font-light tracking-wider text-slate-900 uppercase">
                    {manualName || user?.name || "YOUR NAME"}
                  </h1>
                  <p className="text-[8px] text-slate-500 my-0.5 font-normal">
                    {[
                      user?.email || "email@example.com",
                      phone,
                      location
                    ].filter(Boolean).join(' · ')}
                  </p>
                  {(linkedinUrl || githubUrl || portfolioUrl) && (
                    <p className="text-[8px] text-slate-500 my-0.5 font-normal">
                      {[
                        linkedinUrl && "Linkedin",
                        githubUrl && "Github",
                        portfolioUrl && "Website"
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                {/* <hr className="border-t border-slate-200 my-2 shrink-0" /> */}

                {/* Resume Sections */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5 scrollbar-none text-[8.5px]">
                  
                  {/* Summary Section */}
                  {summary && (
                    <div className="space-y-0.5">
                      <h2 className="text-[8.5px] font-bold text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-0.5">Summary</h2>
                      <p className="text-slate-600 leading-relaxed text-justify">
                        {summary}
                      </p>
                    </div>
                  )}

                  {/* Experience Section */}
                  {company && (
                    <div className="space-y-0.5">
                      <h2 className="text-[8.5px] font-bold text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-0.5">Experience</h2>
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between font-semibold text-slate-800 text-[8.5px]">
                            <span>{roleTitle || "Software Engineer"}</span>
                            <span className="text-[8px] text-slate-400 font-normal">{expStart || "Start"} — {expEnd || "Present"}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[8px] font-normal italic">
                            <span>{company}</span>
                            <span>{empType}</span>
                          </div>
                          {expDesc && (
                            <p className="text-slate-600 leading-normal mt-0.5 text-justify pl-1">
                              • {expDesc}
                            </p>
                          )}
                          {expAch && (
                            <p className="text-slate-600 leading-normal mt-0.5 text-justify pl-2">
                              • {expAch}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {projTitle && (
                    <div className="space-y-0.5">
                      <h2 className="text-[8.5px] font-bold text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-0.5">Projects</h2>
                      <div>
                        <div className="flex justify-between font-semibold text-slate-800 text-[8.5px]">
                          <span>{projTitle}</span>
                          {projCategory && <span className="text-[8px] font-normal text-slate-400">{projCategory}</span>}
                        </div>
                        {projDesc && (
                          <p className="text-slate-600 leading-normal mt-0.5 text-justify pl-1">
                            • {projDesc}
                          </p>
                        )}
                        {projMetrics && (
                          <p className="text-emerald-600 font-medium leading-normal mt-0.5 pl-2">
                            • {projMetrics}
                          </p>
                        )}
                        {projAch && (
                          <p className="text-slate-600 leading-normal mt-0.5 pl-2">
                            • {projAch}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Section */}
                  {selectedSkills.length > 0 && (
                    <div className="space-y-0.5">
                      <h2 className="text-[8.5px] font-bold text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-0.5">Skills</h2>
                      <p className="text-slate-600 leading-relaxed text-[8.5px] word-spacing-[2px]">
                        {selectedSkills.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Education Section */}
                  {school && (
                    <div className="space-y-0.5">
                      <h2 className="text-[8.5px] font-bold text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-0.5">Education</h2>
                      <div>
                        <div className="flex justify-between font-semibold text-slate-800 text-[8.5px]">
                          <span>{school}</span>
                          <span className="text-[8px] text-slate-400 font-normal">{eduStart || "Start"} — {eduEnd || "End"}</span>
                        </div>
                        <p className="text-slate-500 font-normal text-[8px]">
                          {degree || "Degree"} {fieldOfStudy ? `in ${fieldOfStudy}` : ""}
                        </p>
                        {eduDesc && (
                          <p className="text-slate-600 leading-normal mt-0.5 pl-1">
                            • {eduDesc}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certifications & Achievements Section */}
                  {(certName || achTitle) && (
                    <div className="space-y-0.5">
                      <h2 className="text-[8.5px] font-bold text-slate-850 uppercase tracking-wide border-b border-slate-100 pb-0.5">Certifications & Achievements</h2>
                      <div className="space-y-0.5 text-slate-600 text-[8px] pl-1">
                        {certName && (
                          <p>
                            • {certName} {certIssuer ? `— ${certIssuer}` : ""} {certDate ? `(${certDate})` : ""}
                          </p>
                        )}
                        {achTitle && (
                          <p>
                            • {achTitle} {achDesc ? `— ${achDesc}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Mockup footer bar */}
          {/* <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4 text-[9px] text-slate-400 font-medium">
            <span>IntelJet Client Console</span>
            <div className="flex gap-2">
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full" />
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full opacity-60" />
              <span className="h-1.5 w-1.5 bg-brand-600 rounded-full opacity-30" />
            </div>
          </div> */}

        </div>

      </div>

    </div>
  );
}

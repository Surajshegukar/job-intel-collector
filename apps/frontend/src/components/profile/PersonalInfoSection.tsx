import { useState } from 'react';
import {
  User, Phone, Mail, MapPin, Globe, Linkedin, Github as GithubIcon, Clock,
  Save, Loader2
} from 'lucide-react';

interface PersonalInfoSectionProps {
  profile: any;
  updateProfile: any;
  saveSuccess: boolean;
  setSaveSuccess: (v: boolean) => void;
}

// Controlled input with icon
function InputField({
  label, icon: Icon, type = 'text', value, onChange, placeholder, required,
}: {
  label: string; icon: any; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={14} />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 hover:border-slate-350"
        />
      </div>
    </div>
  );
}

export default function PersonalInfoSection({
  profile, updateProfile, saveSuccess, setSaveSuccess,
}: PersonalInfoSectionProps) {

  // Controlled state — initialised from profile prop once
  const [fields, setFields] = useState({
    fullName:           profile.name          || '',
    phone:              profile.phone         || '',
    location:           profile.location      || '',
    portfolioUrl:       profile.portfolioUrl  || '',
    linkedinUrl:        profile.linkedinUrl   || '',
    githubUrl:          profile.githubUrl     || '',
    noticePeriod:       profile.noticePeriod  || '',
    preferredRoles:     (profile.preferredRoles     || []).join(', '),
    preferredLocations: (profile.preferredLocations || []).join(', '),
    salaryMin:          String(profile.salaryExpectation?.min  || ''),
    salaryMax:          String(profile.salaryExpectation?.max  || ''),
    salaryCurrency:     profile.salaryExpectation?.currency    || 'USD',
  });

  function set(key: keyof typeof fields) {
    return (v: string) => setFields(prev => ({ ...prev, [key]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name:               fields.fullName,
      phone:              fields.phone,
      location:           fields.location,
      portfolioUrl:       fields.portfolioUrl,
      linkedinUrl:        fields.linkedinUrl,
      githubUrl:          fields.githubUrl,
      noticePeriod:       fields.noticePeriod,
      preferredRoles:     fields.preferredRoles.split(',').map((r: string) => r.trim()).filter(Boolean),
      preferredLocations: fields.preferredLocations.split(',').map((l: string) => l.trim()).filter(Boolean),
      salaryExpectation: {
        min:      Number(fields.salaryMin)  || undefined,
        max:      Number(fields.salaryMax)  || undefined,
        currency: fields.salaryCurrency     || 'USD',
      },
    };
    try {
      await updateProfile.mutateAsync(body);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Profile save failed:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Personal Information Card ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Personal Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">Basic details used across resumes and job applications.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-medium text-brand-600">Auto-synced</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="px-8 py-7 space-y-8">
          {/* Primary fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <InputField label="Full Name"         icon={User}        value={fields.fullName}     onChange={set('fullName')}     placeholder="Alex Johnson" required />
            <InputField label="Phone Number"      icon={Phone}       value={fields.phone}        onChange={set('phone')}        placeholder="+1 (555) 000-0000" />
            <InputField label="Location"          icon={MapPin}      value={fields.location}     onChange={set('location')}     placeholder="San Francisco, CA" />
            <InputField label="Portfolio Website" icon={Globe}       value={fields.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://yourportfolio.com" type="url" />
            <InputField label="LinkedIn Profile"  icon={Linkedin}    value={fields.linkedinUrl}  onChange={set('linkedinUrl')}  placeholder="https://linkedin.com/in/username" type="url" />
            <InputField label="GitHub Profile"    icon={GithubIcon}  value={fields.githubUrl}    onChange={set('githubUrl')}    placeholder="https://github.com/username" type="url" />
            <InputField label="Notice Period"     icon={Clock}       value={fields.noticePeriod} onChange={set('noticePeriod')} placeholder="30 days / Immediate" />
            <InputField label="Email Address"     icon={Mail}        value={profile.email || ''} onChange={() => {}}            placeholder="alex@example.com" type="email" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">Changes are saved to your profile and synced across all resumes.</p>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProfile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saveSuccess ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Professional Summary Card ── */}
      <ProfessionalSummaryCard profile={profile} updateProfile={updateProfile} />
    </div>
  );
}

function ProfessionalSummaryCard({ profile, updateProfile }: { profile: any; updateProfile: any }) {
  const [summary, setSummary] = useState<string>(profile.summary || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveSummary() {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ summary });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  }

  // const AI_ACTIONS = [
  //   { label: 'Improve', icon: '✦' },
  //   { label: 'Rewrite', icon: '↺' },
  //   { label: 'Shorten', icon: '⊖' },
  //   { label: 'ATS Optimize', icon: '◈' },
  // ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Professional Summary</h2>
            <p className="text-sm text-slate-500 mt-0.5">A compelling overview shown at the top of your resume.</p>
          </div>
          {/* <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-400 active:scale-95"
          >
            <Sparkles size={13} />
            Generate with AI
          </button> */}
        </div>
      </div>

      <div className="px-8 py-7 space-y-2">
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={6}
          placeholder="Write a compelling professional summary that highlights your core expertise, years of experience, and what makes you stand out..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 leading-relaxed transition-all duration-200 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 hover:border-slate-350 resize-none"
        />
<div className="flex items-center justify-between text-xs text-slate-400">
          <span>{summary.length} characters · {summary.split(/\s+/).filter(Boolean).length} words</span>
          <span className={summary.length > 800 ? 'text-amber-500' : 'text-emerald-500'}>
            {summary.length > 800 ? 'Too long — consider shortening' : 'Good length'}
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* <span className="text-xs text-slate-400 font-medium">AI actions:</span>
            {AI_ACTIONS.map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-full transition-all duration-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 hover:shadow-sm active:scale-95"
              >
                <span className="text-[11px]">{icon}</span>
                {label}
              </button>
            ))} */}
          </div>
          <button
            type="button"
            onClick={handleSaveSummary}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 hover:shadow-md hover:shadow-brand-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saved ? 'Saved!' : 'Save Summary'}
          </button>
        </div>

        
      </div>
    </div>
  );
}

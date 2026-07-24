import { useEffect, useState } from 'react';
import { MapPin, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { getGradient } from '../data/avatarGradients';

interface ProfileHeroProps {
  profile: any;
  completeness: number;
  experiences: any[];
  projects: any[];
  skills: any[];
  education: any[];
  onEditClick: () => void;
}

function AnimatedCircle({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const step = () => {
      start += 1.8;
      if (start >= score) { setDisplayed(score); return; }
      setDisplayed(Math.round(start));
      requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="64" cy="64" r={radius} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-extrabold text-slate-800 leading-none">{displayed}%</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Score</p>
      </div>
    </div>
  );
}

const CHECKLIST = [
  { label: 'Experience', key: 'exp' },
  { label: 'Projects',   key: 'proj' },
  { label: 'Skills',     key: 'skills' },
  { label: 'Education',  key: 'edu' },
];

export default function ProfileHero({
  profile, completeness, experiences, projects, skills, education, onEditClick: _onEditClick
}: ProfileHeroProps) {
  const initial = (profile.name || '?').charAt(0).toUpperCase();
  const gradient = getGradient(profile.name || '');

  const checks: Record<string, boolean> = {
    exp:    experiences.length > 0,
    proj:   projects.length > 0,
    skills: skills.length > 0,
    edu:    education.length > 0,
  };

  const totalYears = experiences.reduce((acc: number, exp: any) => {
    const start = exp.startDate ? new Date(exp.startDate).getFullYear() : null;
    const end   = exp.endDate   ? new Date(exp.endDate).getFullYear()   : new Date().getFullYear();
    return start ? acc + (end - start) : acc;
  }, 0);


  return (
    <div className="glass-card p-6 flex flex-col lg:flex-row gap-6 lg:gap-0 animate-slide-up">

      {/* ── LEFT ── */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-3xl font-extrabold shrink-0 shadow-md`}>
          {initial}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 truncate">{profile.name || 'Your Name'}</h2>
            <p className="text-sm font-medium text-brand-600 truncate">
              {(profile.preferredRoles?.[0]) || 'Software Engineer'}
            </p>
          </div>

          <div className="space-y-1.5">
            {profile.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                {profile.location}
              </div>
            )}
            {experiences.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Briefcase size={11} className="text-slate-400 shrink-0" />
                {experiences[0].role} · {experiences[0].company}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={11} className="text-slate-400 shrink-0" />
              {totalYears > 0 ? `${totalYears}+ yrs experience` : 'Experience not set'}
            </div>
          </div>

          {/* <div className="flex items-center gap-2 pt-1">
            <button onClick={onEditClick} className="btn-primary text-xs px-3 py-1.5 gap-1.5">
              <Edit2 size={11} /> Edit Profile
            </button>
            <button className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
              <Share2 size={11} /> Share Resume
            </button>
          </div> */}
        </div>
      </div>

      {/* ── CENTER ── */}
      <div className="flex flex-col items-center justify-center gap-4 px-4 ml-auto">
        <AnimatedCircle score={completeness} />

        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {CHECKLIST.map(({ label, key }) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <CheckCircle2
                size={13}
                className={checks[key] ? 'text-brand-500' : 'text-slate-300'}
              />
              <span className={checks[key] ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

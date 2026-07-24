import { Briefcase, FolderOpen, Code2, Award } from 'lucide-react';

interface ProfileStatsProps {
  experiences: any[];
  projects: any[];
  skills: any[];
  certifications: any[];
}

const STATS = [
  {
    key: 'experiences',
    label: 'Experience',
    subtitle: 'roles held',
    icon: Briefcase,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    hoverBorder: 'hover:border-blue-100',
    hoverShadow: 'hover:shadow-blue-50',
  },
  {
    key: 'projects',
    label: 'Projects',
    subtitle: 'built & shipped',
    icon: FolderOpen,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    hoverBorder: 'hover:border-violet-100',
    hoverShadow: 'hover:shadow-violet-50',
  },
  {
    key: 'skills',
    label: 'Skills',
    subtitle: 'technologies',
    icon: Code2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    hoverBorder: 'hover:border-emerald-100',
    hoverShadow: 'hover:shadow-emerald-50',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    subtitle: 'credentials earned',
    icon: Award,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    hoverBorder: 'hover:border-amber-100',
    hoverShadow: 'hover:shadow-amber-50',
  },
] as const;

export default function ProfileStats({ experiences, projects, skills, certifications }: ProfileStatsProps) {
  const counts: Record<string, number> = {
    experiences:    experiences.length,
    projects:       projects.length,
    skills:         skills.length,
    certifications: certifications.length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ key, label, subtitle, icon: Icon, iconBg, iconColor, hoverBorder, hoverShadow }) => (
        <div
          key={key}
          className={`glass-card p-5 flex  gap-4 cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hoverBorder} ${hoverShadow}`}
        >
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={18} className={iconColor} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-none">{counts[key]}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
            {/* <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p> */}
          </div>
          
        </div>
      ))}
    </div>
  );
}

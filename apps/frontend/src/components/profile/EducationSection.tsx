import { Plus, Edit2, Trash2, GraduationCap, Calendar } from 'lucide-react';

interface EducationSectionProps {
  education: any[];
  openEduModal: (edu?: any) => void;
  deleteEducation: any;
}

export default function EducationSection({
  education,
  openEduModal,
  deleteEducation,
}: EducationSectionProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Education</h2>
            <p className="text-sm text-slate-500 mt-0.5">Academic qualifications and degrees.</p>
          </div>
          <button
            onClick={() => openEduModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 hover:shadow-md hover:shadow-brand-500/20 active:scale-95"
          >
            <Plus size={13} />
            Add Education
          </button>
        </div>
      </div>

      <div className="px-8 py-7">
        {education.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <GraduationCap size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">No education records added</p>
              <p className="text-xs text-slate-400 mt-1">Add your academic history to complete your profile.</p>
            </div>
            <button
              onClick={() => openEduModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 text-xs font-semibold rounded-xl border border-brand-100 transition-all duration-200 hover:bg-brand-100"
            >
              <Plus size={12} /> Add education
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
            <div className="space-y-0">
              {education.map((edu: any) => (
                <div key={edu._id} className="relative pl-16 pb-8 group">
                  <div className="absolute left-3.5 top-4 w-5 h-5 rounded-full bg-white border-2 border-slate-300 shadow-sm z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                  <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:bg-white hover:border-slate-300 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">{edu.school}</h3>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
                          </p>
                        </div>
                        {(edu.startDate || edu.endDate) && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar size={12} className="text-slate-400" />
                            {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : '– Present'}
                          </div>
                        )}
                        {edu.description && (
                          <p className="text-sm text-slate-600 leading-relaxed mt-1">{edu.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                        <button
                          onClick={() => openEduModal(edu)}
                          className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all duration-150"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteEducation.mutate(edu._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, X, Code2, Loader2, Sparkles } from 'lucide-react';

interface SkillsSectionProps {
  skills: any[];
  addSkill: any;
  deleteSkill: any;
  newSkill: any;
  setNewSkill: (v: any) => void;
}



const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Testing', 'Mobile', 'AI/ML', 'General'];

export default function SkillsSection({
  skills,
  addSkill,
  deleteSkill,
  newSkill,
  setNewSkill,
}: SkillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!newSkill.skillName.trim()) return;
    await addSkill.mutateAsync(newSkill);
    setNewSkill({ skillName: '', category: '' });
    setIsAdding(false);
  }

  // Group skills by category
  const grouped: Record<string, any[]> = {};
  skills.forEach((sk: any) => {
    const cat = sk.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(sk);
  });

  const usedCategories = Object.keys(grouped).sort();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Skills</h2>
            <p className="text-sm text-slate-500 mt-0.5">Technologies and tools you're proficient in.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 hover:shadow-md hover:shadow-brand-500/20 active:scale-95"
          >
            <Plus size={13} />
            Add Skill
          </button>
        </div>
      </div>

      {/* Add skill inline form */}
      {isAdding && (
        <div className="px-8 py-5 bg-slate-50/60 border-b border-slate-100">
          <form onSubmit={handleAddSkill} className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-slate-500">Skill Name</label>
              <input
                type="text"
                value={newSkill.skillName}
                onChange={(e) => setNewSkill((p: any) => ({ ...p, skillName: e.target.value }))}
                placeholder="e.g. TypeScript"
                autoFocus
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 transition-all duration-200 hover:border-slate-355"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Category</label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill((p: any) => ({ ...p, category: e.target.value }))}
                className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 transition-all duration-200 hover:border-slate-355"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <button
                type="submit"
                disabled={addSkill.isPending}
                className="h-10 px-5 bg-brand-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:bg-brand-500 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {addSkill.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="h-[42px] px-4 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skills content */}
      <div className="px-8 py-7">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Code2 size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">No skills added yet</p>
              <p className="text-xs text-slate-400 mt-1">Add your technical skills or import a resume to auto-extract them.</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 text-xs font-semibold rounded-xl border border-brand-100 transition-all duration-200 hover:bg-brand-100"
            >
              <Plus size={12} /> Add your first skill
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* All skills as chips (flat, sorted) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Skills · {skills.length} total</span>
                <button className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors">
                  <Sparkles size={11} />
                  Suggest missing skills
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((sk: any) => {
                  return (
                    <div
                      key={sk._id}
                      className="group inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full transition-all duration-200 hover:shadow-sm"
                    >
                      <span className="text-sm font-medium text-slate-700">{sk.name || sk.skillName}</span>
                      <button
                        onClick={() => deleteSkill.mutate(sk._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all duration-150 ml-0.5"
                        aria-label={`Remove ${sk.name || sk.skillName}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills by category */}
            {usedCategories.length > 0 && (
              <div>
                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">By Category</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usedCategories.map((cat) => (
                    <div key={cat} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">{cat}</span>
                        <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                          {grouped[cat].length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {grouped[cat].map((sk: any) => (
                          <div
                            key={sk._id}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full transition-all duration-200 hover:border-slate-300"
                          >
                            <span className="text-xs font-medium text-slate-700">{sk.name || sk.skillName}</span>
                            <button
                              onClick={() => deleteSkill.mutate(sk._id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all duration-150"
                              aria-label="Remove"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        )}
      </div>
    </div>
  );
}

import { Plus, Trash2, Award, ExternalLink, Trophy, Calendar } from 'lucide-react';

interface CredentialsSectionProps {
  certifications: any[];
  achievements: any[];
  newCert: any;
  setNewCert: (v: any) => void;
  newAch: any;
  setNewAch: (v: any) => void;
  addCertification: any;
  deleteCertification: any;
  addAchievement: any;
  deleteAchievement: any;
}

const ACH_CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  'Hackathon': { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-100' },
  'Award':     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100' },
  'Open Source': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  'Speaking':  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100' },
};

function getAchStyle(cat: string) {
  return ACH_CATEGORY_STYLE[cat] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
}

export default function CredentialsSection({
  certifications,
  achievements,
  newCert,
  setNewCert,
  newAch,
  setNewAch,
  addCertification,
  deleteCertification,
  addAchievement,
  deleteAchievement,
}: CredentialsSectionProps) {
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

  const inputCls = 'w-full h-[42px] px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 hover:border-slate-300';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Certifications */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Award size={14} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Certifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Professional credentials and certificates.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Add form */}
          <form onSubmit={handleAddCert} className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs font-semibold text-slate-600">Add New Certification</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Certificate Name</label>
                <input type="text" value={newCert.name} onChange={e => setNewCert((p: any) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="AWS Solutions Architect" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Issuing Organization</label>
                <input type="text" value={newCert.issuer} onChange={e => setNewCert((p: any) => ({ ...p, issuer: e.target.value }))} className={inputCls} placeholder="Amazon Web Services" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Issue Date</label>
                <input type="text" value={newCert.issueDate} onChange={e => setNewCert((p: any) => ({ ...p, issueDate: e.target.value }))} className={inputCls} placeholder="2024" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Verification URL</label>
                <input type="url" value={newCert.credentialUrl} onChange={e => setNewCert((p: any) => ({ ...p, credentialUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
              </div>
            </div>
            <button
              type="submit"
              disabled={addCertification.isPending}
              className="w-full h-[38px] bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={12} /> Add Certification
            </button>
          </form>

          {/* List */}
          {certifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No certifications added yet.</p>
          ) : (
            <div className="space-y-2">
              {certifications.map((c: any) => (
                <div key={c._id} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl transition-all duration-200 hover:bg-white hover:border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <Award size={13} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">{c.issuer}</p>
                        {c.issueDate && (
                          <>
                            <span className="text-slate-300">·</span>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar size={10} />
                              {c.issueDate}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {c.credentialUrl && (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all duration-150"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => deleteCertification.mutate(c._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Trophy size={14} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Achievements</h2>
              <p className="text-xs text-slate-500 mt-0.5">Awards, honors, and notable accomplishments.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Add form */}
          <form onSubmit={handleAddAch} className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs font-semibold text-slate-600">Add New Achievement</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Achievement Title</label>
                <input type="text" value={newAch.title} onChange={e => setNewAch((p: any) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="1st Place – Regional Hackathon" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Category</label>
                  <input type="text" value={newAch.category} onChange={e => setNewAch((p: any) => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="Hackathon, Award..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Description</label>
                  <input type="text" value={newAch.description} onChange={e => setNewAch((p: any) => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Brief description" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={addAchievement.isPending}
              className="w-full h-[38px] bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-brand-500 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={12} /> Add Achievement
            </button>
          </form>

          {/* List */}
          {achievements.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No achievements added yet.</p>
          ) : (
            <div className="space-y-2">
              {achievements.map((a: any) => {
                const style = getAchStyle(a.category || '');
                return (
                  <div key={a._id} className="group flex items-start justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl transition-all duration-200 hover:bg-white hover:border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Trophy size={13} className="text-violet-500" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {a.category && (
                            <span className={`px-2 py-0.5 ${style.bg} ${style.text} border ${style.border} rounded-full text-[10px] font-semibold uppercase tracking-wide`}>
                              {a.category}
                            </span>
                          )}
                          <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                        </div>
                        {a.description && (
                          <p className="text-xs text-slate-500 leading-relaxed">{a.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAchievement.mutate(a._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

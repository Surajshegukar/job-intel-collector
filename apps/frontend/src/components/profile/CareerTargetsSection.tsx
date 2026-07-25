import { useState } from 'react';
import { Target, DollarSign, Save, Loader2 } from 'lucide-react';

interface CareerTargetsSectionProps {
  profile: any;
  updateProfile: any;
  saveSuccess: boolean;
  setSaveSuccess: (v: boolean) => void;
}

const plainInputCls = 'w-full h-[42px] px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 hover:border-slate-300';

export default function CareerTargetsSection({
  profile, updateProfile, saveSuccess, setSaveSuccess,
}: CareerTargetsSectionProps) {

  const [fields, setFields] = useState({
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
      console.error('Career targets save failed:', err);
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2"><Target size={18} className="text-brand-600" /> Career Targets</h2>
            <p className="text-sm text-slate-500 mt-0.5">Specify your targeting roles, preferred locations, and expected salary range.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="px-8 py-7 space-y-8">
        {/* Job Preferences */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Preferred Roles <span className="text-slate-400">(comma-separated)</span></label>
              <input type="text" value={fields.preferredRoles} onChange={e => set('preferredRoles')(e.target.value)} placeholder="Full-Stack Developer, Frontend Engineer" className={plainInputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Preferred Locations <span className="text-slate-400">(comma-separated)</span></label>
              <input type="text" value={fields.preferredLocations} onChange={e => set('preferredLocations')(e.target.value)} placeholder="New York, Remote" className={plainInputCls} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Salary */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><DollarSign size={15} /> Salary Expectation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Expected salary details matched with search filters.</p>
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Minimum</label>
              <input type="number" value={fields.salaryMin} onChange={e => set('salaryMin')(e.target.value)} placeholder="60000" className={plainInputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Maximum</label>
              <input type="number" value={fields.salaryMax} onChange={e => set('salaryMax')(e.target.value)} placeholder="120000" className={plainInputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Currency</label>
              <input type="text" value={fields.salaryCurrency} onChange={e => set('salaryCurrency')(e.target.value)} placeholder="USD" className={plainInputCls} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">Target metrics are synced across dashboard analytics.</p>
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
  );
}

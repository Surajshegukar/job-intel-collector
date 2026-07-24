// Shared skeleton primitives
export function Sk({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />;
}

// ─── Page-level skeletons ─────────────────────────────────────────────────────

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Sk className="h-6 w-40" /><Sk className="h-3.5 w-64" /></div>
        <Sk className="h-10 w-36 rounded-xl" />
      </div>
      {/* Hero card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 flex gap-6">
        <Sk className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Sk className="h-5 w-48" />
          <Sk className="h-3.5 w-32" />
          <div className="flex gap-2 pt-1"><Sk className="h-8 w-24 rounded-xl" /><Sk className="h-8 w-24 rounded-xl" /></div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Sk className="w-28 h-28 rounded-full" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_,i) => <Sk key={i} className="h-3 w-20" />)}
          </div>
        </div>
        <div className="space-y-3 w-56">
          <Sk className="h-16 rounded-xl" />
          <Sk className="h-16 rounded-xl" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <Sk className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5"><Sk className="h-6 w-12" /><Sk className="h-3 w-20" /></div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <Sk className="h-12 w-full rounded-2xl" />
      {/* Content card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-6">
        <div className="space-y-2"><Sk className="h-5 w-48" /><Sk className="h-3.5 w-72" /></div>
        <div className="grid grid-cols-2 gap-5">
          {[...Array(8)].map((_,i) => (
            <div key={i} className="space-y-1.5"><Sk className="h-3 w-24" /><Sk className="h-[42px] rounded-xl" /></div>
          ))}
        </div>
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Sk className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><Sk className="h-6 w-52" /><Sk className="h-3.5 w-72" /></div>
        <Sk className="h-9 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between"><Sk className="w-10 h-10 rounded-xl" /><Sk className="h-5 w-16 rounded-full" /></div>
            <div className="space-y-1.5"><Sk className="h-7 w-16" /><Sk className="h-3 w-28" /></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <Sk className="h-4 w-40" />
          <Sk className="h-52 rounded-xl" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <Sk className="h-4 w-32" />
          <Sk className="h-52 rounded-full mx-auto w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
          <Sk className="h-4 w-40" />
          {[...Array(5)].map((_,i) => <div key={i} className="flex items-center gap-3"><Sk className="h-3.5 w-28" /><Sk className="h-3 flex-1" /></div>)}
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
          <Sk className="h-4 w-32" />
          {[...Array(5)].map((_,i) => <Sk key={i} className="h-10 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}

export function AIMonitoringSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><Sk className="h-6 w-64" /><Sk className="h-3.5 w-80" /></div>
        <div className="flex gap-2"><Sk className="h-10 w-28 rounded-xl" /><Sk className="h-10 w-40 rounded-xl" /></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between"><Sk className="w-10 h-10 rounded-xl" /><Sk className="h-5 w-14 rounded-full" /></div>
            <div className="space-y-1.5"><Sk className="h-7 w-24" /><Sk className="h-3 w-36" /></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
          <Sk className="h-4 w-56" />
          <Sk className="h-64 rounded-xl" />
        </div>
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
          <Sk className="h-4 w-40" />
          <Sk className="h-44 rounded-full mx-auto w-44" />
          <div className="grid grid-cols-2 gap-2">
            <Sk className="h-14 rounded-xl" /><Sk className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <Sk className="h-4 w-56" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_,i) => <Sk key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><Sk className="h-6 w-44" /><Sk className="h-3.5 w-64" /></div>
        <div className="flex gap-2"><Sk className="h-9 w-20 rounded-xl" /><Sk className="h-9 w-20 rounded-xl" /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <Sk className="h-4 w-32" /><Sk className="h-72 rounded-xl" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <Sk className="h-4 w-32" /><Sk className="h-72 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_,i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between"><Sk className="h-3.5 w-24" /><Sk className="h-5 w-8 rounded-full" /></div>
            <div className="flex flex-wrap gap-2">{[...Array(4)].map((_,j) => <Sk key={j} className="h-6 w-16 rounded-full" />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrackerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2"><Sk className="h-6 w-44" /><Sk className="h-3.5 w-64" /></div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(5)].map((_,i) => (
          <div key={i} className="min-w-[220px] bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <Sk className="h-4 w-20" /><Sk className="h-5 w-6 rounded-full" />
            </div>
            {[...Array(3)].map((_,j) => (
              <div key={j} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2">
                <Sk className="h-3.5 w-full" />
                <Sk className="h-3 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompanyDrawerSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 animate-pulse">
      <div className="flex items-start gap-4">
        <Sk className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Sk className="h-5 w-48" />
          <Sk className="h-3.5 w-32" />
          <Sk className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex gap-2"><Sk className="h-9 w-28 rounded-xl" /><Sk className="h-9 w-24 rounded-xl" /></div>
      <div className="space-y-3">
        <Sk className="h-4 w-36" />
        {[...Array(4)].map((_,i) => <Sk key={i} className="h-3.5 w-full" />)}
      </div>
      <div className="space-y-3">
        <Sk className="h-4 w-28" />
        {[...Array(3)].map((_,i) => (
          <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-2">
            <Sk className="h-4 w-56" /><Sk className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalysisPanelSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <Sk className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5"><Sk className="h-4 w-36" /><Sk className="h-3 w-52" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_,i) => <Sk key={i} className="h-10 rounded-xl" />)}
      </div>
      <div className="space-y-3 pt-2">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-2">
            <div className="flex items-center gap-2"><Sk className="w-5 h-5 rounded-md" /><Sk className="h-3.5 w-40" /></div>
            <Sk className="h-3 w-full" /><Sk className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

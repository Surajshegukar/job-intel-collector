import React from 'react';

interface FilterTabsProps {
  tabs: string[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
  allLabel?: string;
  actions?: React.ReactNode;
}

export default function FilterTabs({
  tabs,
  selectedTab,
  onTabChange,
  allLabel = 'All',
  actions,
}: FilterTabsProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => onTabChange('')}
          className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
            selectedTab === ''
              ? 'bg-slate-200 text-slate-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          {allLabel}
        </button>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors shrink-0 ${
              selectedTab === tab
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
        <button className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 shrink-0">
          More ›
        </button>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

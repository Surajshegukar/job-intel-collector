import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  showDivider?: boolean;
}

export default function PageHeader({
  title,
  description,
  actions,
  meta,
  showDivider = false,
}: PageHeaderProps) {
  return (
    <div className={`relative z-10 ${showDivider ? 'border-b border-slate-100 pb-4 mb-5' : 'pb-2 mb-5'}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          {meta && <div className="flex items-center gap-2">{meta}</div>}
          <h1 className="text-[18px] font-bold text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-secondary font-medium">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

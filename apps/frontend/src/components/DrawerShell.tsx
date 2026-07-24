import { X } from 'lucide-react';

interface DrawerShellProps {
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}

export default function DrawerShell({ onClose, maxWidth = 'max-w-lg', children }: DrawerShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`w-full ${maxWidth} bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shadow-2xl`}>
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({ title, subtitle, avatar, onClose }: {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
      <div className="flex items-center gap-3">
        {avatar}
        <div>
          <h2 className="font-bold text-slate-800 text-sm leading-snug">{title}</h2>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
        <X size={15} />
      </button>
    </div>
  );
}

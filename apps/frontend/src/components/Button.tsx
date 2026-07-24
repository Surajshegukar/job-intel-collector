import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-[5px] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white  shadow-brand-600/10 border border-brand-600 focus:ring-2 focus:ring-brand-500/20',
    secondary: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 ',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    danger: 'bg-red-50 border border-red-100/50 text-red-600 hover:bg-red-100 hover:text-red-700 active:bg-red-200',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[10px]',
    md: 'px-3 py-2 text-xs',
    lg: 'px-4 py-2.5 text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

import { getGradient } from '../data/avatarGradients';

interface AvatarInitialsProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 rounded-md text-[10px]',
  md: 'w-9 h-9 rounded-xl text-sm',
  lg: 'w-14 h-14 rounded-2xl text-2xl',
};

export default function AvatarInitials({ name, size = 'sm', className = '' }: AvatarInitialsProps) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className={`bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${SIZE_CLASSES[size]} ${className}`}>
      {initial}
    </div>
  );
}

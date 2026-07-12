import React from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const colors = [
    'bg-indigo-150 text-indigo-700 border-indigo-250 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
    'bg-purple-150 text-purple-700 border-purple-250 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
    'bg-emerald-150 text-emerald-700 border-emerald-250 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    'bg-blue-150 text-blue-700 border-blue-250 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    'bg-amber-150 text-amber-700 border-amber-250 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
  ];

  // Hash code for name to pick consistent color index
  const getHashIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colors.length;
  };

  const selectedColor = colors[getHashIndex(name)];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-20 h-20 text-2xl font-bold'
  };

  return (
    <div className={`relative flex-shrink-0 ${className || ''}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          className={`rounded-full object-cover border border-gray-250 dark:border-zinc-800 ${sizeClasses[size]}`}
          onError={(e) => {
            // Fallback to initials if image loading fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}
      
      {/* Fallback container */}
      <div
        className={`flex items-center justify-center rounded-full border uppercase tracking-wider ${
          avatarUrl ? 'absolute inset-0 z-[-1]' : ''
        } ${selectedColor} ${sizeClasses[size]}`}
      >
        {getInitials(name)}
      </div>
    </div>
  );
}

export default UserAvatar;

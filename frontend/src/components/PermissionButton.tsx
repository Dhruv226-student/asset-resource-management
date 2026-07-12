import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  tooltipMessage?: string;
}

export function PermissionButton({
  allowedRoles,
  children,
  tooltipMessage,
  className = '',
  disabled,
  onClick,
  ...props
}: PermissionButtonProps) {
  const currentRole = useAppStore((state) => state.currentRole);
  
  const isAllowed = allowedRoles.includes(currentRole);
  const finalDisabled = disabled || !isAllowed;
  const message = tooltipMessage || `Requires role: ${allowedRoles.join(', ')}`;

  const buttonStyle = finalDisabled
    ? 'opacity-50 cursor-not-allowed select-none'
    : 'cursor-pointer';

  return (
    <div className="relative group inline-block">
      <button
        className={`${buttonStyle} ${className}`}
        disabled={finalDisabled}
        onClick={(e) => {
          if (!isAllowed) {
            e.preventDefault();
            return;
          }
          if (onClick) onClick(e);
        }}
        {...props}
      >
        {children}
      </button>
      
      {!isAllowed && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-55 w-48 p-2 bg-gray-900 text-white text-[11px] text-center rounded-lg shadow-lg">
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default PermissionButton;

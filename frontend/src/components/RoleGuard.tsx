import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const currentRole = useAppStore((state) => state.currentRole);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // For demonstration, if not authenticated but trying to inspect guarded components, check role
  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RoleGuard;

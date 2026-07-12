import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normStatus = status.toLowerCase().trim();

  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  // Green
  if (['available', 'active', 'completed', 'verified', 'approved', 'success', 'low', 'ongoing'].includes(normStatus)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50';
  }
  // Orange/Yellow
  else if (['pending', 'requested', 'warning', 'medium', 'upcoming', 'under-maintenance', 'in-progress'].includes(normStatus)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50';
  }
  // Red
  else if (['overdue', 'rejected', 'lost', 'critical', 'damaged', 'failed', 'high'].includes(normStatus)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50';
  }
  // Dark/Slate for retired, disposed
  else if (['retired', 'disposed'].includes(normStatus)) {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  }
  // Blue for reserved, info
  else if (['reserved', 'info'].includes(normStatus)) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/50';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded-full border',
    md: 'px-2.5 py-1 text-xs font-medium rounded-full border',
    lg: 'px-3 py-1.5 text-sm font-medium rounded-full border'
  };

  const label = status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span className={`inline-flex items-center tracking-wide ${sizeClasses[size]} ${colorClasses}`}>
      {label}
    </span>
  );
}
export default StatusBadge;

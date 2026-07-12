import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color?: 'purple' | 'indigo' | 'green' | 'orange' | 'red' | 'blue' | 'gray';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  color = 'indigo',
  onClick
}: StatCardProps) {
  const colorSchemes = {
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
    green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    orange: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    red: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    gray: 'text-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-slate-100 dark:border-slate-800'
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 leading-8">
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorSchemes[color]}`}>
          {icon}
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded-md ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
          <span className="text-gray-500 dark:text-zinc-400">
            {trend ? trend.label : description}
          </span>
        </div>
      )}
    </div>
  );
}

export default StatCard;

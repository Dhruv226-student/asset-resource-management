import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items matching the query or filter parameters. Try expanding your search.',
  icon = <PackageOpen className="w-12 h-12 text-gray-300 dark:text-zinc-600" />,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl min-h-[300px] w-full">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 dark:bg-zinc-800/50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'table' | 'cards' | 'details' | 'form';
  count?: number;
}

export function LoadingSkeleton({ type = 'table', count = 5 }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden animate-pulse">
        {/* Table Header */}
        <div className="h-12 bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-100 dark:border-zinc-800 flex items-center px-6 gap-4">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/6" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/6" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/12 ml-auto" />
        </div>
        {/* Table Rows */}
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="h-16 border-b border-gray-50 dark:border-zinc-800/50 flex items-center px-6 gap-4"
          >
            <div className="h-4 bg-gray-150 dark:bg-zinc-700 rounded w-16" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-700/85 rounded w-1/4" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-700/85 rounded w-1/6" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-700/85 rounded w-1/6" />
            <div className="h-6 bg-gray-150 dark:bg-zinc-700/85 rounded-full w-20" />
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-8 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
              <div className="w-16 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="mt-4">
              <div className="w-2/3 h-5 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="w-full h-8 bg-gray-300 dark:bg-zinc-800 rounded-lg mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'details') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-850 rounded w-full" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-850 rounded w-5/6" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-850 rounded w-2/3" />
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-150 dark:bg-zinc-850 rounded" />
              <div className="h-10 bg-gray-150 dark:bg-zinc-850 rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl space-y-4">
            <div className="w-20 h-20 bg-gray-250 dark:bg-zinc-800 rounded-full mx-auto" />
            <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-150 dark:bg-zinc-850 rounded w-1/3 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Form type
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-6 space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-16" />
            <div className="h-10 bg-gray-150 dark:bg-zinc-850 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;

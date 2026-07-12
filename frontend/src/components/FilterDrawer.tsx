import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FilterDrawer({
  isOpen,
  onClose,
  onReset,
  onApply,
  children,
  title = 'Filters'
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out">
          <div className="h-full flex flex-col bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-150 dark:border-zinc-800">
            
            {/* Header */}
            <div className="px-6 py-5 bg-gray-50 dark:bg-zinc-850/50 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-zinc-100">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{title}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {children}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-150 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850/50 flex items-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterDrawer;

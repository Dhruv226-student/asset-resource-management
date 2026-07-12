import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeColor = {
    danger: 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
  };

  const confirmBtnColor = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-850 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex gap-4">
            {/* Warning Icon */}
            <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${typeColor[type]}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            
            {/* Context */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-150 leading-6">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-850/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 border border-transparent rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmBtnColor[type]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

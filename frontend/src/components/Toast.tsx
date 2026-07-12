import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const hideToast = useAppStore((state) => state.hideToast);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  };

  const borderColors = {
    success: 'border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300',
    error: 'border-rose-100 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300',
    info: 'border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300'
  };

  return (
    <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full animate-in slide-in-from-bottom-8 fade-in duration-200">
      <div className={`p-4 border rounded-xl shadow-xl flex items-start gap-3 bg-white dark:bg-zinc-900 ${borderColors[toast.type]}`}>
        {/* Type Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>
        
        {/* Message */}
        <div className="flex-1 text-sm font-medium pr-2 leading-relaxed">
          {toast.message}
        </div>
        
        {/* Dismiss Button */}
        <button
          onClick={hideToast}
          className="flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Toast;

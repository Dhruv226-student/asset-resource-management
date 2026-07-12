import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onClear?: () => void;
}

export function SearchInput({ value, onClear, className, ...props }: SearchInputProps) {
  return (
    <div className={`relative flex-1 min-w-[200px] max-w-md ${className || ''}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4.5 w-4.5 text-gray-400 dark:text-zinc-500" />
      </div>
      <input
        type="text"
        value={value}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;

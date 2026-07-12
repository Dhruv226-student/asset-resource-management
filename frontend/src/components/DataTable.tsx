import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import EmptyState from './EmptyState';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T; // Simple client-side search field
  pageSize?: number;
  emptyState?: React.ReactNode;
  rowIdAccessor: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchField,
  pageSize = 8,
  emptyState,
  rowIdAccessor
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Client-Side Search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    return data.filter((row) => {
      if (searchField) {
        const val = row[searchField];
        if (val) {
          return String(val).toLowerCase().includes(searchTerm.toLowerCase());
        }
      } else {
        // Fallback: search all text fields
        return Object.values(row as any).some(val => 
          val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return false;
    });
  }, [data, searchTerm, searchField]);

  // 2. Client-Side Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle function accessors or nested lookups if sortKey was specified
      if (typeof valA === 'object' || typeof valB === 'object') {
        return 0;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
    });
  }, [filteredData, sortField, sortDirection]);

  // 3. Client-Side Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    // Reset to page 1 if current page is out of bounds due to filters
    const validPage = currentPage > totalPages ? 1 : currentPage;
    const startIndex = (validPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, totalPages]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Search bar */}
      {searchField && (
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page
            }}
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-gray-150 dark:divide-zinc-800 text-left">
            <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none">
              <tr>
                {columns.map((col, idx) => {
                  const key = (col.sortKey || (typeof col.accessor === 'string' ? col.accessor : '')) as string;
                  const isSortable = !!key;
                  return (
                    <th
                      key={idx}
                      onClick={() => isSortable && handleSort(key)}
                      className={`px-6 py-4 font-semibold ${col.className || ''} ${
                        isSortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {isSortable && sortField === key && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/80 text-sm text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={rowIdAccessor(row)}
                    className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/30 transition-colors"
                  >
                    {columns.map((col, idx) => {
                      let cellContent: React.ReactNode;
                      if (typeof col.accessor === 'function') {
                        cellContent = col.accessor(row);
                      } else {
                        cellContent = row[col.accessor] as any;
                      }
                      return (
                        <td key={idx} className={`px-6 py-4.5 align-middle ${col.className || ''}`}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    {emptyState || <EmptyState />}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {sortedData.length > pageSize && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-850/30 border-t border-gray-150 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
            <div>
              Showing <span className="font-semibold text-gray-900 dark:text-zinc-300">
                {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}
              </span> to <span className="font-semibold text-gray-900 dark:text-zinc-300">
                {Math.min(filteredData.length, currentPage * pageSize)}
              </span> of <span className="font-semibold text-gray-900 dark:text-zinc-300">
                {filteredData.length}
              </span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;

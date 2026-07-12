'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getActivityLogs } from '@/services/activity-log.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import SearchInput from '@/components/SearchInput';
import StatusBadge from '@/components/StatusBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import UserAvatar from '@/components/UserAvatar';
import { ActivityLog } from '@/types';
import { FileClock } from 'lucide-react';

const MODULES = ['All', 'Assets', 'Allocations', 'Maintenance', 'Audits', 'Resource Bookings', 'Organization', 'Authentication'];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    getActivityLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      const matchSearch = !q || l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.record.toLowerCase().includes(q);
      const matchModule = filterModule === 'All' || l.module === filterModule;
      const matchRole = !filterRole || l.role === filterRole;
      return matchSearch && matchModule && matchRole;
    });
  }, [logs, search, filterModule, filterRole]);

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={8} /></div>;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Activity Logs"
        description="Detailed audit trail of all actions performed in AssetFlow."
        breadcrumbs={[{ label: 'Activity Logs' }]}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by action, user, record…" className="max-w-sm" />
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500">
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="asset-manager">Asset Manager</option>
          <option value="department-head">Dept. Head</option>
          <option value="employee">Employee</option>
        </select>
        <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto">{filtered.length} records</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-4 text-left">User</th>
                <th className="px-5 py-4 text-left">Action</th>
                <th className="px-5 py-4 text-left hidden md:table-cell">Record</th>
                <th className="px-5 py-4 text-left">Module</th>
                <th className="px-5 py-4 text-left hidden lg:table-cell">Details</th>
                <th className="px-5 py-4 text-left hidden xl:table-cell">IP Address</th>
                <th className="px-5 py-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filtered.length > 0 ? filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={log.user} size="xs" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-zinc-200 text-xs">{log.user}</p>
                        <StatusBadge status={log.role} size="sm" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{log.action}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-zinc-400 hidden md:table-cell max-w-[180px]">
                    <p className="truncate text-xs">{log.record}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 uppercase tracking-wide">{log.module}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden lg:table-cell max-w-[250px]">
                    <p className="text-xs line-clamp-2">{log.details}</p>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <code className="text-xs text-gray-400 dark:text-zinc-500">{log.ipAddress}</code>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                    {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="py-12"><EmptyState icon={<FileClock className="w-10 h-10 text-gray-300 dark:text-zinc-600" />} title="No activity logs" description="No logs matching the current search or filter." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

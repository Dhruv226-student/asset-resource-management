'use client';

import React, { useEffect, useState } from 'react';
import { getReports, ReportsData } from '@/services/report.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { Package, Clock, AlertTriangle, Shield } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#6b7280'];

export default function ReportsPage() {
  const assets = useAppStore(s => s.assets);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const departments = useAppStore(s => s.departments);
  const categories = useAppStore(s => s.categories);

  const loadReports = () => {
    setLoading(true);
    getReports({ department: filterDept, category: filterCat })
      .then(setReports)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [filterDept, filterCat]);

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="cards" count={4} /></div>;
  if (!reports) return null;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into asset utilization, maintenance, and compliance."
        breadcrumbs={[{ label: 'Reports' }]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-4">
        <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Filter by:</span>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Idle Assets" value={reports.idleAssets.length} icon={<Package className="w-5 h-5" />} color="gray" description="Available & good condition" />
        <StatCard title="Nearing Expiry" value={reports.nearingWarrantyExpiry.length} icon={<Shield className="w-5 h-5" />} color="orange" description="Warranty expiring in 180 days" />
        <StatCard title="Overdue Returns" value={reports.overdueReturns.length} icon={<Clock className="w-5 h-5" />} color="red" description="Past expected return date" />
        <StatCard title="Audit Discrepancies" value={reports.auditDiscrepancySummary.missingCount + reports.auditDiscrepancySummary.damagedCount} icon={<AlertTriangle className="w-5 h-5" />} color="orange" description={`${reports.auditDiscrepancySummary.missingCount} missing, ${reports.auditDiscrepancySummary.damagedCount} damaged`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Asset Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={reports.statusDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name">
                {reports.statusDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Utilization Rate Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Utilization Rate by Category (%)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={reports.utilizationRate} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} formatter={v => [`${v}%`, 'Utilization']} />
              <Bar dataKey="rate" name="Utilization" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Frequency */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Maintenance Requests by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reports.maintenanceFrequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" name="Requests" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Allocation */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Assets per Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reports.departmentAllocation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" name="Assets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nearing Warranty Expiry Table */}
      {reports.nearingWarrantyExpiry.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Assets Nearing Warranty Expiry (180 days)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 text-left">Asset</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Warranty Expiry</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {reports.nearingWarrantyExpiry.map(asset => (
                  <tr key={asset.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800 dark:text-zinc-200">{asset.name}</p>
                      <code className="text-xs text-gray-400">{asset.tag}</code>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-400">{asset.category}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-400">{asset.department}</td>
                    <td className="px-5 py-3.5 text-amber-600 dark:text-amber-400 font-medium">{asset.warrantyExpiryDate}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={asset.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue Returns Table */}
      {reports.overdueReturns.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900/30 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Overdue Asset Returns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-rose-50 dark:bg-rose-950/10 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 text-left">Asset</th>
                  <th className="px-5 py-3 text-left">Assigned To</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-left">Expected Return</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {reports.overdueReturns.map(al => (
                  <tr key={al.id} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800 dark:text-zinc-200">{al.assetName}</p>
                      <code className="text-xs text-gray-400">{al.assetTag}</code>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-zinc-300">{al.assignedTo}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-400">{al.department}</td>
                    <td className="px-5 py-3.5 text-rose-600 dark:text-rose-400 font-semibold">{al.expectedReturnDate}</td>
                    <td className="px-5 py-3.5"><StatusBadge status="overdue" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

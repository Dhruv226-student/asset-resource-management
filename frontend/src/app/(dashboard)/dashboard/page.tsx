'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardSummary, DashboardSummary } from '@/services/dashboard.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import StatusBadge from '@/components/StatusBadge';
import {
  Package, Users, Wrench, Calendar, ArrowRightLeft, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';

export default function DashboardPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const currentRole = useAppStore((state) => state.currentRole);
  const assets = useAppStore((state) => state.assets);
  const maintenanceRequests = useAppStore((state) => state.maintenanceRequests);
  const allocations = useAppStore((state) => state.allocations);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  // Recent items for quick glance
  const recentAssets = assets.slice(0, 5);
  const pendingMaintenance = maintenanceRequests.filter(m => m.status === 'pending').slice(0, 4);
  const overdueAllocations = allocations.filter(a => a.status === 'overdue').slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-xl w-64 animate-pulse" />
        <LoadingSkeleton type="cards" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-72 bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const { kpis, assetStatusDistribution, monthlyAllocations, resourceBookingTrends, maintenanceByPriority, departmentAllocations } = summary;

  return (
    <div className="space-y-6 page-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
            {greeting()}, {currentUser?.name?.split(' ')[0] ?? 'User'} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Here's what's happening across AssetFlow today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentRole} size="md" />
          <span className="text-xs text-gray-400 dark:text-zinc-500">{currentUser?.departmentName}</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={kpis.totalAssets}
          icon={<Package className="w-5 h-5" />}
          color="indigo"
          description="Across all departments"
          onClick={() => {}}
        />
        <StatCard
          title="Available"
          value={kpis.availableAssets}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
          trend={{ value: 12, label: 'vs last month', isPositive: true }}
        />
        <StatCard
          title="Allocated"
          value={kpis.allocatedAssets}
          icon={<Users className="w-5 h-5" />}
          color="purple"
          description="Checked out to employees"
        />
        <StatCard
          title="Under Maintenance"
          value={kpis.underMaintenance}
          icon={<Wrench className="w-5 h-5" />}
          color="orange"
          description="Active repair tickets"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Bookings"
          value={kpis.activeBookings}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
          description="Rooms & equipment"
        />
        <StatCard
          title="Pending Transfers"
          value={kpis.pendingTransfers}
          icon={<ArrowRightLeft className="w-5 h-5" />}
          color="indigo"
          description="Awaiting approval"
        />
        <StatCard
          title="Due Returns"
          value={kpis.upcomingReturns}
          icon={<Clock className="w-5 h-5" />}
          color="gray"
          description="Expected soon"
        />
        <StatCard
          title="Overdue Returns"
          value={kpis.overdueReturns}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          trend={{ value: kpis.overdueReturns, label: 'need attention', isPositive: false }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Status Pie */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={assetStatusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {assetStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
                formatter={(val, name) => [`${val} assets`, name]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Allocations Bar */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Monthly Allocation Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyAllocations} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
              />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="allocations" name="Allocations" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returns" name="Returns" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Allocation Bar */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Assets by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={departmentAllocations} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="department" type="category" width={70} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="count" name="Assets" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Priority */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-4">Maintenance by Priority</h3>
          <div className="space-y-3 mt-4">
            {maintenanceByPriority.map((item) => (
              <div key={item.priority} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">{item.priority}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-100">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (item.count / Math.max(...maintenanceByPriority.map(m => m.count), 1)) * 100)}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/maintenance" className="mt-4 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            View all requests <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Recent Assets</h3>
            <Link href="/assets" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
            {recentAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate">{asset.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{asset.tag} · {asset.category}</p>
                </div>
                <StatusBadge status={asset.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Pending Maintenance */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Pending Maintenance</h3>
            <Link href="/maintenance" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {pendingMaintenance.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {pendingMaintenance.map((req) => (
                <div key={req.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate">{req.assetName}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{req.issue}</p>
                  </div>
                  <StatusBadge status={req.priority} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
              ✅ No pending maintenance requests
            </div>
          )}
        </div>
      </div>

      {/* Overdue Returns Alert Banner */}
      {overdueAllocations.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
              {overdueAllocations.length} overdue return{overdueAllocations.length > 1 ? 's' : ''} need attention
            </p>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              Assets past their expected return date. Please follow up with assigned employees.
            </p>
          </div>
          <Link href="/allocations" className="flex-shrink-0 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

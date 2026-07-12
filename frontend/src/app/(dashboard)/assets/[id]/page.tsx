'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssetById, updateAsset } from '@/services/asset.service';
import { getAllocations } from '@/services/allocation.service';
import { getMaintenanceRequests } from '@/services/maintenance.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ActivityTimeline from '@/components/ActivityTimeline';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import RoleGuard from '@/components/RoleGuard';
import { Asset, Allocation, MaintenanceRequest, AssetCondition } from '@/types';
import {
  Package, MapPin, User, Calendar, DollarSign, ShieldCheck,
  Wrench, ArrowLeft, Pencil, Tag, Building2, X, CheckCircle2
} from 'lucide-react';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const showToast = useAppStore(s => s.showToast);
  const currentRole = useAppStore(s => s.currentRole);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<{ location: string; description: string; condition: AssetCondition }>({ location: '', description: '', condition: 'good' });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getAssetById(id),
      getAllocations(),
      getMaintenanceRequests(),
    ]).then(([a, al, mr]) => {
      if (!a) { router.push('/assets'); return; }
      setAsset(a);
      setAllocations(al.filter(al => al.assetId === id));
      setMaintenance(mr.filter(m => m.assetId === id));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setSaving(true);
    try {
      const updated = await updateAsset(asset.id, editForm);
      setAsset(updated);
      showToast('Asset updated successfully.');
      setEditOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-32 animate-pulse" />
      <LoadingSkeleton type="details" />
    </div>
  );

  if (!asset) return null;

  const warrantyDaysLeft = asset.warrantyExpiryDate
    ? Math.ceil((new Date(asset.warrantyExpiryDate).getTime() - new Date('2026-07-12').getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const DETAIL_FIELDS = [
    { label: 'Asset Tag', value: asset.tag, icon: <Tag className="w-4 h-4" /> },
    { label: 'Serial Number', value: asset.serialNumber, icon: <Package className="w-4 h-4" /> },
    { label: 'Category', value: asset.category, icon: <Building2 className="w-4 h-4" /> },
    { label: 'Department', value: asset.department, icon: <Building2 className="w-4 h-4" /> },
    { label: 'Location', value: asset.location, icon: <MapPin className="w-4 h-4" /> },
    { label: 'Assigned To', value: asset.assignedTo || '— Unassigned', icon: <User className="w-4 h-4" /> },
    { label: 'Acquisition Date', value: asset.acquisitionDate, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Acquisition Cost', value: `₹${asset.acquisitionCost.toLocaleString('en-IN')}`, icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Supplier', value: asset.supplierName, icon: <Building2 className="w-4 h-4" /> },
    { label: 'Warranty Expiry', value: asset.warrantyExpiryDate || '—', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Back link + Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assets
        </button>
        <PageHeader
          title={asset.name}
          description={asset.description || `${asset.category} — ${asset.department}`}
          breadcrumbs={[{ label: 'Assets', href: '/assets' }, { label: asset.name }]}
          actions={
            <RoleGuard allowedRoles={['admin', 'asset-manager']}>
              <button
                onClick={() => {
                  setEditForm({ location: asset.location, description: asset.description || '', condition: asset.condition });
                  setEditOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors"
              >
                <Pencil className="w-4 h-4" /> Edit Asset
              </button>
            </RoleGuard>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status + Condition Strip */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-5 flex flex-wrap items-center gap-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Status:</span>
              <StatusBadge status={asset.status} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Condition:</span>
              <StatusBadge status={asset.condition} size="md" />
            </div>
            {asset.isBookable && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bookable Resource
              </div>
            )}
            {warrantyDaysLeft !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                warrantyDaysLeft <= 0
                  ? 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                  : warrantyDaysLeft <= 90
                  ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900'
                  : 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {warrantyDaysLeft <= 0 ? 'Warranty Expired' : `Warranty: ${warrantyDaysLeft}d left`}
              </div>
            )}
          </div>

          {/* Detail Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Asset Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {DETAIL_FIELDS.map((field) => (
                <div key={field.label} className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-400 dark:text-zinc-500 flex-shrink-0">
                    {field.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-0.5">{field.label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 truncate">
                      {field.label === 'Asset Tag' ? (
                        <code className="font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">{field.value}</code>
                      ) : field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation History */}
          {allocations.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Allocation History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    <tr>
                      <th className="px-5 py-3 text-left">Assigned To</th>
                      <th className="px-5 py-3 text-left">Dept</th>
                      <th className="px-5 py-3 text-left">Allocated</th>
                      <th className="px-5 py-3 text-left">Returned</th>
                      <th className="px-5 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                    {allocations.map(al => (
                      <tr key={al.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20">
                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-zinc-200">{al.assignedTo}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{al.department}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{al.allocationDate}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{al.actualReturnDate || '—'}</td>
                        <td className="px-5 py-3"><StatusBadge status={al.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maintenance History */}
          {maintenance.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" /> Maintenance History
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {maintenance.map(mr => (
                  <div key={mr.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono text-gray-500 dark:text-zinc-400">{mr.id}</code>
                        <StatusBadge status={mr.priority} />
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">{mr.issue}</p>
                      {mr.technician && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Technician: {mr.technician}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={mr.status} />
                      {mr.repairCost && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">₹{mr.repairCost.toLocaleString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Activity Timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-5">Activity Timeline</h3>
            <ActivityTimeline events={asset.activityTimeline || []} />
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1">Quick Stats</h3>
            {[
              { label: 'Total Allocations', value: allocations.length },
              { label: 'Active Allocations', value: allocations.filter(a => a.status === 'active').length },
              { label: 'Maintenance Requests', value: maintenance.length },
              { label: 'Resolved Issues', value: maintenance.filter(m => m.status === 'resolved').length },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">{stat.label}</span>
                <span className="font-bold text-gray-900 dark:text-zinc-100">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Edit Asset — {asset.tag}</h2>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Condition</label>
                <select
                  value={editForm.condition}
                  onChange={e => setEditForm(p => ({ ...p, condition: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200"
                >
                  {['new', 'good', 'fair', 'poor', 'damaged'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setEditOpen(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

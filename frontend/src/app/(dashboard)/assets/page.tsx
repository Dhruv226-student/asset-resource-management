'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getAssets, registerAsset, updateAsset, deleteAsset } from '@/services/asset.service';
import { getCategories } from '@/services/category.service';
import { getDepartments } from '@/services/department.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import SearchInput from '@/components/SearchInput';
import FilterDrawer from '@/components/FilterDrawer';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import RoleGuard from '@/components/RoleGuard';
import { Asset, AssetCategory, Department, AssetCondition } from '@/types';
import {
  Plus, SlidersHorizontal, Package, ChevronLeft, ChevronRight,
  Pencil, Trash2, Eye, QrCode, MoreHorizontal, X
} from 'lucide-react';

const PAGE_SIZE = 8;

interface AssetForm {
  name: string;
  serialNumber: string;
  category: string;
  department: string;
  location: string;
  condition: AssetCondition;
  description: string;
  acquisitionDate: string;
  acquisitionCost: number;
  supplierName: string;
  warrantyExpiryDate: string;
  isBookable: boolean;
}

const EMPTY_FORM: AssetForm = {
  name: '', serialNumber: '', category: '', department: '',
  location: '', condition: 'good', description: '',
  acquisitionDate: '', acquisitionCost: 0, supplierName: '',
  warrantyExpiryDate: '', isBookable: false
};

export default function AssetsPage() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const currentRole = useAppStore((s) => s.currentRole);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<AssetForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  useEffect(() => {
    Promise.all([getAssets(), getCategories(), getDepartments()])
      .then(([a, c, d]) => { setAssets(a); setCategories(c); setDepartments(d); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q);
      const matchStatus = !filterStatus || a.status === filterStatus;
      const matchCat = !filterCategory || a.category === filterCategory;
      const matchDept = !filterDept || a.department === filterDept;
      return matchSearch && matchStatus && matchCat && matchDept;
    });
  }, [assets, search, filterStatus, filterCategory, filterDept]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditAsset(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (asset: Asset) => {
    setEditAsset(asset);
    setForm({
      name: asset.name, serialNumber: asset.serialNumber, category: asset.category,
      department: asset.department, location: asset.location, condition: asset.condition,
      description: asset.description || '', acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost, supplierName: asset.supplierName,
      warrantyExpiryDate: asset.warrantyExpiryDate, isBookable: asset.isBookable
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editAsset) {
        const updated = await updateAsset(editAsset.id, form);
        setAssets((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        showToast(`Asset "${updated.name}" updated successfully.`);
      } else {
        const newAsset = await registerAsset(form as any);
        setAssets((prev) => [...prev, newAsset]);
        showToast(`Asset "${newAsset.name}" (${newAsset.tag}) registered.`);
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save asset.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAsset(deleteTarget.id);
      setAssets((prev) => prev.map(a => a.id === deleteTarget.id ? { ...a, status: 'disposed' as const } : a));
      showToast(`Asset "${deleteTarget.name}" marked as disposed.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispose asset.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const resetFilters = () => { setFilterStatus(''); setFilterCategory(''); setFilterDept(''); setSearch(''); };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={6} /></div>;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Asset Registry"
        description="Manage and track all organizational assets."
        breadcrumbs={[{ label: 'Assets' }]}
        actions={
          <RoleGuard allowedRoles={['admin', 'asset-manager']}>
            <button
              id="btn-register-asset"
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register Asset
            </button>
          </RoleGuard>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          onClear={() => setSearch('')}
          placeholder="Search by name, tag, serial…"
          className="flex-1 min-w-[200px] max-w-sm"
        />
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {(filterStatus || filterCategory || filterDept) && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[filterStatus, filterCategory, filterDept].filter(Boolean).length}
            </span>
          )}
        </button>
        <span className="text-xs text-gray-500 dark:text-zinc-400 ml-auto">{filtered.length} assets</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-4 text-left">Asset</th>
                <th className="px-5 py-4 text-left">Tag</th>
                <th className="px-5 py-4 text-left">Category</th>
                <th className="px-5 py-4 text-left hidden md:table-cell">Department</th>
                <th className="px-5 py-4 text-left hidden lg:table-cell">Assigned To</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left hidden sm:table-cell">Condition</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {paginated.length > 0 ? paginated.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-zinc-200">{asset.name}</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{asset.serialNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs font-mono bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-1 rounded-md">{asset.tag}</code>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-zinc-400">{asset.category}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-zinc-400 hidden md:table-cell">{asset.department}</td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    {asset.assignedTo ? (
                      <span className="text-gray-700 dark:text-zinc-300">{asset.assignedTo}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={asset.status} /></td>
                  <td className="px-5 py-4 hidden sm:table-cell"><StatusBadge status={asset.condition} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/assets/${asset.id}`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/20 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <RoleGuard allowedRoles={['admin', 'asset-manager']}>
                        <button
                          onClick={() => openEdit(asset)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-950/20 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(asset)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
                          title="Dispose"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="py-16">
                    <EmptyState
                      title="No assets found"
                      description="Try adjusting your search or filter criteria."
                      action={
                        (search || filterStatus || filterCategory || filterDept) ? (
                          <button onClick={resetFilters} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                            Clear filters
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850/30 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer isOpen={filterOpen} onClose={() => setFilterOpen(false)} onReset={resetFilters} onApply={() => setPage(1)}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-2">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500">
              <option value="">All Statuses</option>
              {['available','allocated','reserved','under-maintenance','lost','retired','disposed'].map(s => <option key={s} value={s}>{s.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-2">Category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-2">Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </FilterDrawer>

      {/* Asset Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                {editAsset ? `Edit Asset — ${editAsset.tag}` : 'Register New Asset'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Asset Name *', key: 'name', type: 'text', placeholder: 'Dell Latitude Laptop' },
                  { label: 'Serial Number *', key: 'serialNumber', type: 'text', placeholder: 'SN-XYZ-001' },
                  { label: 'Supplier Name', key: 'supplierName', type: 'text', placeholder: 'Dell India Pvt Ltd' },
                  { label: 'Location', key: 'location', type: 'text', placeholder: 'Head Office — Floor 2' },
                  { label: 'Acquisition Date *', key: 'acquisitionDate', type: 'date', placeholder: '' },
                  { label: 'Acquisition Cost (₹)', key: 'acquisitionCost', type: 'number', placeholder: '85000' },
                  { label: 'Warranty Expiry Date', key: 'warrantyExpiryDate', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form] as string}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      required={f.label.includes('*')}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Department *</label>
                  <select required value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Condition</label>
                  <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value as any }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500">
                    {['new','good','fair','poor','damaged'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={form.isBookable} onChange={e => setForm(p => ({ ...p, isBookable: e.target.checked }))} className="accent-indigo-600" />
                <span>This asset is bookable as a shared resource</span>
              </label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">
                  {saving ? 'Saving…' : editAsset ? 'Save Changes' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Dispose Asset"
        description={`Are you sure you want to mark "${deleteTarget?.name}" (${deleteTarget?.tag}) as Disposed? This action creates a permanent record.`}
        confirmLabel="Dispose Asset"
        type="danger"
      />
    </div>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getAuditCycles, getAuditItems, verifyAuditItem, closeAuditCycle, createAuditCycle } from '@/services/audit.service';
import { getDepartments } from '@/services/department.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import RoleGuard from '@/components/RoleGuard';
import { AuditCycle, AuditItem, Department } from '@/types';
import { Plus, ClipboardCheck, CheckCircle2, AlertTriangle, HelpCircle, X, Lock, ChevronRight } from 'lucide-react';

export default function AuditsPage() {
  const showToast = useAppStore(s => s.showToast);
  const currentUser = useAppStore(s => s.currentUser);

  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<AuditCycle | null>(null);
  const [cycleItems, setCycleItems] = useState<AuditItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closeTarget, setCloseTarget] = useState<AuditCycle | null>(null);
  const [form, setForm] = useState<{
    name: string;
    scopeType: 'all' | 'department' | 'location';
    department: string;
    location: string;
    startDate: string;
    endDate: string;
    auditors: string;
    notes: string;
  }>({ name: '', scopeType: 'all', department: '', location: '', startDate: '', endDate: '', auditors: currentUser?.name || '', notes: '' });

  useEffect(() => {
    Promise.all([getAuditCycles(), getDepartments()])
      .then(([c, d]) => { setCycles(c); setDepartments(d); })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectCycle = async (cycle: AuditCycle) => {
    setSelectedCycle(cycle);
    setLoadingItems(true);
    try {
      const fetchedItems = await getAuditItems(cycle.id);
      setCycleItems(fetchedItems);
    } finally { setLoadingItems(false); }
  };

  const handleVerify = async (itemId: string, status: 'verified' | 'missing' | 'damaged') => {
    try {
      const updated = await verifyAuditItem(itemId, { status });
      setCycleItems(prev => prev.map(i => i.id === itemId ? updated : i));
      // Update cycle progress
      setCycles(prev => prev.map(c => {
        if (c.id === selectedCycle?.id) {
          const total = cycleItems.length;
          const done = cycleItems.filter(i => i.id === itemId ? true : i.status !== 'pending').length;
          return { ...c, progress: Math.round((done / Math.max(total, 1)) * 100) };
        }
        return c;
      }));
      showToast(`Item marked as ${status}.`);
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleClose = async () => {
    if (!closeTarget) return;
    try {
      const updated = await closeAuditCycle(closeTarget.id);
      setCycles(prev => prev.map(c => c.id === updated.id ? updated : c));
      if (selectedCycle?.id === closeTarget.id) setSelectedCycle(updated);
      showToast(`Audit cycle "${closeTarget.name}" closed.`);
    } catch (err: any) { showToast(err.message, 'error'); }
    setCloseTarget(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) { showToast('Fill required fields.', 'error'); return; }
    setSaving(true);
    try {
      const newCycle = await createAuditCycle({ ...form, auditors: form.auditors.split(',').map(s => s.trim()) });
      setCycles(prev => [...prev, newCycle]);
      showToast(`Audit cycle "${newCycle.name}" created.`);
      setCreateOpen(false);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const STATUS_ICON = { verified: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, missing: <AlertTriangle className="w-4 h-4 text-rose-500" />, damaged: <AlertTriangle className="w-4 h-4 text-amber-500" />, pending: <HelpCircle className="w-4 h-4 text-gray-400" /> };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="cards" count={3} /></div>;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Asset Audits"
        description="Conduct physical verification cycles and track discrepancies."
        breadcrumbs={[{ label: 'Audits' }]}
        actions={
          <RoleGuard allowedRoles={['admin', 'asset-manager']}>
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New Audit Cycle
            </button>
          </RoleGuard>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycle List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Audit Cycles</h3>
          {cycles.length > 0 ? cycles.map(cycle => (
            <button
              key={cycle.id}
              onClick={() => handleSelectCycle(cycle)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedCycle?.id === cycle.id ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-700' : 'border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-900'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className={`w-4 h-4 ${selectedCycle?.id === cycle.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{cycle.name}</span>
                </div>
                <StatusBadge status={cycle.status} />
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-400">{cycle.startDate} → {cycle.endDate}</div>
              {/* Progress bar */}
              <div className="mt-2.5 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${cycle.progress}%` }} />
              </div>
              <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{cycle.progress}% verified</div>
            </button>
          )) : <EmptyState title="No audit cycles" description="Create a new audit cycle to begin verification." />}
        </div>

        {/* Verification Items Panel */}
        <div className="lg:col-span-2">
          {selectedCycle ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">{selectedCycle.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{cycleItems.length} assets to verify</p>
                </div>
                {selectedCycle.status !== 'completed' && (
                  <RoleGuard allowedRoles={['admin', 'asset-manager']}>
                    <button onClick={() => setCloseTarget(selectedCycle)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                      <Lock className="w-3.5 h-3.5" /> Close Cycle
                    </button>
                  </RoleGuard>
                )}
              </div>

              {loadingItems ? (
                <div className="p-8 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
              ) : cycleItems.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                  {cycleItems.map(item => (
                    <div key={item.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                      <div className="flex-shrink-0">{STATUS_ICON[item.status]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{item.assetName}</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{item.assetTag} · {item.expectedLocation} · {item.expectedHolder}</p>
                        {item.auditorNotes && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 italic">{item.auditorNotes}</p>}
                      </div>
                      {selectedCycle.status !== 'completed' && item.status === 'pending' && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => handleVerify(item.id, 'verified')} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors">✓ Found</button>
                          <button onClick={() => handleVerify(item.id, 'missing')} className="px-2 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-md text-xs font-semibold hover:bg-rose-100 transition-colors">✗ Missing</button>
                          <button onClick={() => handleVerify(item.id, 'damaged')} className="px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-md text-xs font-semibold hover:bg-amber-100 transition-colors">⚠ Damaged</button>
                        </div>
                      )}
                      {item.status !== 'pending' && <StatusBadge status={item.status} />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8"><EmptyState title="No items in this cycle" description="No assets were found for the selected audit scope." /></div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-4" />
              <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Select an audit cycle to view items</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Create Audit Cycle</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Cycle Name *</label>
                <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q3 2026 Physical Audit" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Scope</label>
                <select value={form.scopeType} onChange={e => setForm(p => ({ ...p, scopeType: e.target.value as any }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                  <option value="all">All Assets</option>
                  <option value="department">By Department</option>
                  <option value="location">By Location</option>
                </select>
              </div>
              {form.scopeType === 'department' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Department</label>
                  <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Start Date *</label>
                  <input required type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">End Date *</label>
                  <input required type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Auditors (comma-separated)</label>
                <input type="text" value={form.auditors} onChange={e => setForm(p => ({ ...p, auditors: e.target.value }))} placeholder="Aniket Kachadiya, Dhruv Kachwala" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Creating…' : 'Create Cycle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!closeTarget} onClose={() => setCloseTarget(null)} onConfirm={handleClose} title="Close Audit Cycle" description={`Permanently close "${closeTarget?.name}"? Missing assets will be marked as Lost. This cannot be undone.`} confirmLabel="Close & Lock Cycle" type="danger" />
    </div>
  );
}

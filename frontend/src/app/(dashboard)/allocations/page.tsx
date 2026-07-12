'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getAllocations, getTransferRequests, getReturnRequests, allocateAsset, approveTransferRequest, rejectTransferRequest, approveReturnRequest } from '@/services/allocation.service';
import { getAssets } from '@/services/asset.service';
import { getEmployees } from '@/services/employee.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import SearchInput from '@/components/SearchInput';
import ConfirmDialog from '@/components/ConfirmDialog';
import RoleGuard from '@/components/RoleGuard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { Allocation, TransferRequest, ReturnRequest, Asset, User } from '@/types';
import { Plus, CheckCircle2, XCircle, ArrowRightLeft, RotateCcw, X, AlertTriangle } from 'lucide-react';

type Tab = 'active' | 'transfers' | 'returns';

export default function AllocationsPage() {
  const showToast = useAppStore(s => s.showToast);
  const currentRole = useAppStore(s => s.currentRole);

  const [tab, setTab] = useState<Tab>('active');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Allocate modal
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({ assetId: '', assignedToId: '', assignmentType: 'employee' as const, allocationDate: new Date().toISOString().split('T')[0], expectedReturnDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  // Confirm states
  const [approveTransfer, setApproveTransfer] = useState<TransferRequest | null>(null);
  const [rejectTransfer, setRejectTransfer] = useState<TransferRequest | null>(null);
  const [approveReturn, setApproveReturn] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    Promise.all([getAllocations(), getTransferRequests(), getReturnRequests(), getAssets(), getEmployees()])
      .then(([al, tr, rr, as, em]) => { setAllocations(al); setTransfers(tr); setReturns(rr); setAssets(as); setEmployees(em); })
      .finally(() => setLoading(false));
  }, []);

  const filteredAllocations = useMemo(() => {
    const q = search.toLowerCase();
    return allocations.filter(a => !q || a.assetName.toLowerCase().includes(q) || a.assignedTo.toLowerCase().includes(q) || a.assetTag.toLowerCase().includes(q));
  }, [allocations, search]);

  const filteredTransfers = useMemo(() => {
    const q = search.toLowerCase();
    return transfers.filter(t => !q || t.assetName.toLowerCase().includes(q) || t.requestedHolder.toLowerCase().includes(q));
  }, [transfers, search]);

  const filteredReturns = useMemo(() => {
    const q = search.toLowerCase();
    return returns.filter(r => !q || r.assetName.toLowerCase().includes(q) || r.requestedBy.toLowerCase().includes(q));
  }, [returns, search]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocForm.assetId || !allocForm.assignedToId || !allocForm.expectedReturnDate) {
      showToast('Please fill all required fields.', 'error'); return;
    }
    setSaving(true);
    try {
      const newAlloc = await allocateAsset(allocForm);
      setAllocations(prev => [...prev, newAlloc]);
      showToast(`Asset allocated to ${newAlloc.assignedTo}.`);
      setAllocateOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleApproveTransfer = async () => {
    if (!approveTransfer) return;
    try {
      const updated = await approveTransferRequest(approveTransfer.id);
      setTransfers(prev => prev.map(t => t.id === updated.id ? updated : t));
      showToast(`Transfer approved. Asset transferred to ${approveTransfer.requestedHolder}.`);
    } catch (err: any) { showToast(err.message, 'error'); }
    setApproveTransfer(null);
  };

  const handleRejectTransfer = async () => {
    if (!rejectTransfer) return;
    try {
      const updated = await rejectTransferRequest(rejectTransfer.id);
      setTransfers(prev => prev.map(t => t.id === updated.id ? updated : t));
      showToast('Transfer request rejected.', 'info');
    } catch (err: any) { showToast(err.message, 'error'); }
    setRejectTransfer(null);
  };

  const handleApproveReturn = async () => {
    if (!approveReturn) return;
    try {
      const updated = await approveReturnRequest(approveReturn.id);
      setReturns(prev => prev.map(r => r.id === updated.id ? updated : r));
      setAllocations(prev => prev.map(a => a.assetId === approveReturn.assetId && a.status === 'active' ? { ...a, status: 'returned' as const } : a));
      showToast(`Asset "${approveReturn.assetName}" returned and marked available.`);
    } catch (err: any) { showToast(err.message, 'error'); }
    setApproveReturn(null);
  };

  const availableAssets = assets.filter(a => a.status === 'available');

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={5} /></div>;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'active', label: 'Active Allocations', count: allocations.filter(a => a.status !== 'returned').length },
    { key: 'transfers', label: 'Transfer Requests', count: transfers.filter(t => t.status === 'requested').length },
    { key: 'returns', label: 'Return Requests', count: returns.filter(r => r.status === 'requested').length },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Allocations & Transfers"
        description="Manage asset checkout, transfers, and returns."
        breadcrumbs={[{ label: 'Allocations' }]}
        actions={
          <RoleGuard allowedRoles={['admin', 'asset-manager']}>
            <button
              id="btn-allocate-asset"
              onClick={() => setAllocateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Allocate Asset
            </button>
          </RoleGuard>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t.key ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'}`}>
            {t.label}
            {t.count > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <SearchInput value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search allocations…" className="max-w-sm" />

      {/* === ACTIVE ALLOCATIONS TABLE === */}
      {tab === 'active' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-4 text-left">Asset</th>
                  <th className="px-5 py-4 text-left">Assigned To</th>
                  <th className="px-5 py-4 text-left hidden md:table-cell">Department</th>
                  <th className="px-5 py-4 text-left hidden lg:table-cell">Allocated</th>
                  <th className="px-5 py-4 text-left">Due Return</th>
                  <th className="px-5 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {filteredAllocations.length > 0 ? filteredAllocations.map(al => (
                  <tr key={al.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 dark:text-zinc-200">{al.assetName}</p>
                      <code className="text-xs text-gray-400 dark:text-zinc-500">{al.assetTag}</code>
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-zinc-300">{al.assignedTo}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden md:table-cell">{al.department}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden lg:table-cell">{al.allocationDate}</td>
                    <td className="px-5 py-4">
                      <span className={al.status === 'overdue' ? 'text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1' : 'text-gray-600 dark:text-zinc-400'}>
                        {al.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {al.expectedReturnDate}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={al.status} /></td>
                  </tr>
                )) : <tr><td colSpan={6} className="py-12"><EmptyState title="No allocations" description="No active asset allocations found." /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === TRANSFER REQUESTS TABLE === */}
      {tab === 'transfers' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-4 text-left">Asset</th>
                  <th className="px-5 py-4 text-left hidden md:table-cell">From</th>
                  <th className="px-5 py-4 text-left">To</th>
                  <th className="px-5 py-4 text-left hidden lg:table-cell">Date</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {filteredTransfers.length > 0 ? filteredTransfers.map(tr => (
                  <tr key={tr.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 dark:text-zinc-200">{tr.assetName}</p>
                      <code className="text-xs text-gray-400">{tr.assetTag}</code>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden md:table-cell">{tr.currentHolder}</td>
                    <td className="px-5 py-4 text-gray-700 dark:text-zinc-300">{tr.requestedHolder}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden lg:table-cell">{tr.requestDate}</td>
                    <td className="px-5 py-4"><StatusBadge status={tr.status} /></td>
                    <td className="px-5 py-4">
                      {tr.status === 'requested' && (
                        <RoleGuard allowedRoles={['admin', 'asset-manager', 'department-head']}>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setApproveTransfer(tr)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => setRejectTransfer(tr)} className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-colors">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </RoleGuard>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="py-12"><EmptyState title="No transfer requests" description="No transfer requests matching the criteria." /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === RETURN REQUESTS TABLE === */}
      {tab === 'returns' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-4 text-left">Asset</th>
                  <th className="px-5 py-4 text-left">Requested By</th>
                  <th className="px-5 py-4 text-left hidden md:table-cell">Condition</th>
                  <th className="px-5 py-4 text-left hidden lg:table-cell">Return Date</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {filteredReturns.length > 0 ? filteredReturns.map(rr => (
                  <tr key={rr.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 dark:text-zinc-200">{rr.assetName}</p>
                      <code className="text-xs text-gray-400">{rr.assetTag}</code>
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-zinc-300">{rr.requestedBy}</td>
                    <td className="px-5 py-4 hidden md:table-cell"><StatusBadge status={rr.conditionAtReturn} /></td>
                    <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden lg:table-cell">{rr.returnDate}</td>
                    <td className="px-5 py-4"><StatusBadge status={rr.status} /></td>
                    <td className="px-5 py-4">
                      {rr.status === 'requested' && (
                        <RoleGuard allowedRoles={['admin', 'asset-manager']}>
                          <button onClick={() => setApproveReturn(rr)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors ml-auto">
                            <RotateCcw className="w-3.5 h-3.5" /> Check In
                          </button>
                        </RoleGuard>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="py-12"><EmptyState title="No return requests" /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {allocateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Allocate Asset</h2>
              <button onClick={() => setAllocateOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Asset (Available Only) *</label>
                <select required value={allocForm.assetId} onChange={e => setAllocForm(p => ({ ...p, assetId: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                  <option value="">Select Available Asset</option>
                  {availableAssets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Assign To Employee *</label>
                <select required value={allocForm.assignedToId} onChange={e => setAllocForm(p => ({ ...p, assignedToId: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                  <option value="">Select Employee</option>
                  {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name} — {e.departmentName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Allocation Date</label>
                  <input type="date" value={allocForm.allocationDate} onChange={e => setAllocForm(p => ({ ...p, allocationDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Expected Return *</label>
                  <input type="date" required value={allocForm.expectedReturnDate} onChange={e => setAllocForm(p => ({ ...p, expectedReturnDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={2} value={allocForm.notes} onChange={e => setAllocForm(p => ({ ...p, notes: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200 resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setAllocateOpen(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Allocating…' : 'Allocate Asset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!approveTransfer} onClose={() => setApproveTransfer(null)} onConfirm={handleApproveTransfer} title="Approve Transfer" description={`Approve transfer of "${approveTransfer?.assetName}" to ${approveTransfer?.requestedHolder}? This will update all allocations.`} confirmLabel="Approve" type="info" />
      <ConfirmDialog isOpen={!!rejectTransfer} onClose={() => setRejectTransfer(null)} onConfirm={handleRejectTransfer} title="Reject Transfer" description={`Reject the transfer request for "${rejectTransfer?.assetName}"?`} confirmLabel="Reject" type="danger" />
      <ConfirmDialog isOpen={!!approveReturn} onClose={() => setApproveReturn(null)} onConfirm={handleApproveReturn} title="Confirm Asset Return" description={`Check in "${approveReturn?.assetName}" (${approveReturn?.assetTag}) and mark it as Available?`} confirmLabel="Check In" type="info" />
    </div>
  );
}

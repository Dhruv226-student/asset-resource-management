'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getMaintenanceRequests, raiseMaintenanceRequest, approveMaintenanceRequest, rejectMaintenanceRequest, resolveMaintenanceRequest } from '@/services/maintenance.service';
import { getAssets } from '@/services/asset.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import SearchInput from '@/components/SearchInput';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import RoleGuard from '@/components/RoleGuard';
import { MaintenanceRequest, Asset } from '@/types';
import { Plus, CheckCircle2, XCircle, Wrench, X } from 'lucide-react';

type Tab = 'all' | 'pending' | 'in-progress' | 'resolved';

export default function MaintenancePage() {
  const showToast = useAppStore(s => s.showToast);
  const currentRole = useAppStore(s => s.currentRole);
  const currentUser = useAppStore(s => s.currentUser);

  const [tab, setTab] = useState<Tab>('all');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Raise Request modal
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [raiseForm, setRaiseForm] = useState({ assetId: '', issue: '', priority: 'medium' as const, preferredDate: '' });
  const [saving, setSaving] = useState(false);

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<MaintenanceRequest | null>(null);
  const [approveForm, setApproveForm] = useState({ technician: '', estimatedCompletionDate: '', notes: '' });

  // Resolve modal
  const [resolveTarget, setResolveTarget] = useState<MaintenanceRequest | null>(null);
  const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', repairCost: 0, completionDate: new Date().toISOString().split('T')[0] });

  // Reject confirm
  const [rejectTarget, setRejectTarget] = useState<MaintenanceRequest | null>(null);

  useEffect(() => {
    Promise.all([getMaintenanceRequests(), getAssets()])
      .then(([mr, as]) => { setRequests(mr); setAssets(as); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter(r => {
      const matchSearch = !q || r.assetName.toLowerCase().includes(q) || r.issue.toLowerCase().includes(q) || r.reportedBy.toLowerCase().includes(q);
      const matchTab = tab === 'all' || r.status === tab;
      return matchSearch && matchTab;
    });
  }, [requests, search, tab]);

  const handleRaise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raiseForm.assetId || !raiseForm.issue) { showToast('Fill all required fields.', 'error'); return; }
    setSaving(true);
    try {
      const req = await raiseMaintenanceRequest(raiseForm);
      setRequests(prev => [...prev, req]);
      showToast(`Maintenance request ${req.id} raised for ${req.assetName}.`);
      setRaiseOpen(false);
      setRaiseForm({ assetId: '', issue: '', priority: 'medium', preferredDate: '' });
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveTarget) return;
    setSaving(true);
    try {
      const updated = await approveMaintenanceRequest(approveTarget.id, approveForm);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast(`Request ${approveTarget.id} approved. Technician: ${approveForm.technician}.`);
      setApproveTarget(null);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;
    setSaving(true);
    try {
      const updated = await resolveMaintenanceRequest(resolveTarget.id, resolveForm);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast(`Request ${resolveTarget.id} resolved. Asset marked Available.`);
      setResolveTarget(null);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      const updated = await rejectMaintenanceRequest(rejectTarget.id);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast('Maintenance request rejected.', 'info');
    } catch (err: any) { showToast(err.message, 'error'); }
    setRejectTarget(null);
  };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={5} /></div>;

  const counts = { all: requests.length, pending: requests.filter(r => r.status === 'pending').length, 'in-progress': requests.filter(r => r.status === 'in-progress').length, resolved: requests.filter(r => r.status === 'resolved').length };

  const PRIORITY_COLORS: Record<string, string> = { critical: 'text-rose-600', high: 'text-orange-600', medium: 'text-blue-600', low: 'text-emerald-600' };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Maintenance Requests"
        description="Track asset repair tickets and lifecycle events."
        breadcrumbs={[{ label: 'Maintenance' }]}
        actions={
          <button
            id="btn-raise-maintenance"
            onClick={() => setRaiseOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Raise Request
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-fit flex-wrap">
        {(['all', 'pending', 'in-progress', 'resolved'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'}`}>
            {t.replace('-', ' ')} <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400'}`}>{counts[t]}</span>
          </button>
        ))}
      </div>

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by asset, issue, reporter…" className="max-w-sm" />

      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-4 text-left">Request</th>
                <th className="px-5 py-4 text-left">Asset</th>
                <th className="px-5 py-4 text-left hidden md:table-cell">Reported By</th>
                <th className="px-5 py-4 text-left">Priority</th>
                <th className="px-5 py-4 text-left hidden lg:table-cell">Technician</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filtered.length > 0 ? filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-gray-700 dark:text-zinc-300">{req.id}</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{req.requestedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800 dark:text-zinc-200">{req.assetName}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 truncate max-w-[200px]">{req.issue}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-zinc-400 hidden md:table-cell">{req.reportedBy}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold uppercase ${PRIORITY_COLORS[req.priority]}`}>{req.priority}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-zinc-400 hidden lg:table-cell">{req.technician || '—'}</td>
                  <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {req.status === 'pending' && (
                        <RoleGuard allowedRoles={['admin', 'asset-manager']}>
                          <button onClick={() => { setApproveTarget(req); setApproveForm({ technician: '', estimatedCompletionDate: '', notes: '' }); }} className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => setRejectTarget(req)} className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-100 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </RoleGuard>
                      )}
                      {req.status === 'in-progress' && (
                        <RoleGuard allowedRoles={['admin', 'asset-manager']}>
                          <button onClick={() => { setResolveTarget(req); setResolveForm({ resolutionNotes: '', repairCost: 0, completionDate: new Date().toISOString().split('T')[0] }); }} className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                          </button>
                        </RoleGuard>
                      )}
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="py-12"><EmptyState title="No maintenance requests" description="No requests matching the current filter." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Modal */}
      {raiseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Raise Maintenance Request</h2>
              <button onClick={() => setRaiseOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRaise} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Asset *</label>
                <select required value={raiseForm.assetId} onChange={e => setRaiseForm(p => ({ ...p, assetId: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                  <option value="">Select Asset</option>
                  {assets.filter(a => !['retired','disposed'].includes(a.status)).map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Issue Description *</label>
                <textarea required rows={3} value={raiseForm.issue} onChange={e => setRaiseForm(p => ({ ...p, issue: e.target.value }))} placeholder="Describe the issue in detail…" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select value={raiseForm.priority} onChange={e => setRaiseForm(p => ({ ...p, priority: e.target.value as any }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                    {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Preferred Date</label>
                  <input type="date" value={raiseForm.preferredDate} onChange={e => setRaiseForm(p => ({ ...p, preferredDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setRaiseOpen(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Submitting…' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Approve Request — {approveTarget.id}</h2>
              <button onClick={() => setApproveTarget(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleApprove} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Assign Technician *</label>
                <input required type="text" value={approveForm.technician} onChange={e => setApproveForm(p => ({ ...p, technician: e.target.value }))} placeholder="e.g. Dell Service Center" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Est. Completion Date</label>
                <input type="date" value={approveForm.estimatedCompletionDate} onChange={e => setApproveForm(p => ({ ...p, estimatedCompletionDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setApproveTarget(null)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Approving…' : 'Approve'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Resolve Request — {resolveTarget.id}</h2>
              <button onClick={() => setResolveTarget(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Resolution Notes *</label>
                <textarea required rows={3} value={resolveForm.resolutionNotes} onChange={e => setResolveForm(p => ({ ...p, resolutionNotes: e.target.value }))} placeholder="Describe how the issue was resolved…" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Repair Cost (₹)</label>
                  <input type="number" value={resolveForm.repairCost} onChange={e => setResolveForm(p => ({ ...p, repairCost: Number(e.target.value) }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Completion Date</label>
                  <input type="date" value={resolveForm.completionDate} onChange={e => setResolveForm(p => ({ ...p, completionDate: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setResolveTarget(null)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Resolving…' : 'Mark Resolved'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={handleReject} title="Reject Maintenance Request" description={`Reject request ${rejectTarget?.id} for "${rejectTarget?.assetName}"?`} confirmLabel="Reject" type="danger" />
    </div>
  );
}

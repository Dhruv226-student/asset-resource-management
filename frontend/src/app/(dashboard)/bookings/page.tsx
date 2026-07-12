'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getBookings, createBooking, cancelBooking } from '@/services/booking.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import SearchInput from '@/components/SearchInput';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { Booking, Resource } from '@/types';
import { Plus, X, Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function BookingsPage() {
  const showToast = useAppStore(s => s.showToast);
  const currentUser = useAppStore(s => s.currentUser);
  const resources = useAppStore(s => s.resources);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    resourceId: '',
    resourceName: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    bookedFor: currentUser?.name || '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    getBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter(b => {
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.resourceName.toLowerCase().includes(q) || b.bookedFor.toLowerCase().includes(q);
      const matchResource = !filterResource || b.resourceId === filterResource;
      const matchStatus = !filterStatus || b.status === filterStatus;
      return matchSearch && matchResource && matchStatus;
    });
  }, [bookings, search, filterResource, filterStatus]);

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const res = resources.find(r => r.id === e.target.value);
    setForm(p => ({ ...p, resourceId: e.target.value, resourceName: res?.name || '' }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resourceId || !form.title || !form.date || !form.startTime || !form.endTime) {
      showToast('Please fill all required fields.', 'error'); return;
    }
    setSaving(true);
    try {
      const booking = await createBooking({ ...form, bookedFor: currentUser?.name || form.bookedFor });
      setBookings(prev => [...prev, booking]);
      showToast(`Booking confirmed for ${form.resourceName} on ${form.date}.`);
      setCreateOpen(false);
      setForm({ resourceId: '', resourceName: '', title: '', date: '', startTime: '', endTime: '', bookedFor: currentUser?.name || '', purpose: '', notes: '' });
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      const updated = await cancelBooking(cancelTarget.id);
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      showToast(`Booking "${cancelTarget.title}" cancelled.`, 'info');
    } catch (err: any) { showToast(err.message, 'error'); }
    setCancelTarget(null);
  };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={5} /></div>;

  const STATUS_COLORS: Record<string, string> = { upcoming: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30', ongoing: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30', completed: 'bg-gray-50 border-gray-200 dark:bg-zinc-900 dark:border-zinc-800', cancelled: 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30' };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Resource Bookings"
        description="Schedule rooms, vehicles, and shared equipment."
        breadcrumbs={[{ label: 'Bookings' }]}
        actions={
          <button
            id="btn-create-booking"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Booking
          </button>
        }
      />

      {/* Resources quick summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {resources.filter(r => r.status === 'available').map(res => (
          <button
            key={res.id}
            onClick={() => { setFilterResource(res.id === filterResource ? '' : res.id); }}
            className={`p-3 rounded-xl border text-left transition-all ${res.id === filterResource ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-700' : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900'}`}
          >
            <MapPin className={`w-4 h-4 mb-1.5 ${res.id === filterResource ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-zinc-500'}`} />
            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300 leading-tight">{res.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">{res.type}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search bookings…" className="max-w-xs" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span className="text-xs text-gray-500 dark:text-zinc-400 ml-auto">{filtered.length} bookings</span>
      </div>

      {/* Bookings Grid / Card View */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(booking => (
            <div key={booking.id} className={`border rounded-xl p-5 transition-all hover:shadow-md ${STATUS_COLORS[booking.status] || 'bg-white border-gray-150 dark:bg-zinc-900 dark:border-zinc-800'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-zinc-100 truncate">{booking.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{booking.resourceName}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                  <span>{booking.startTime} – {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                  <span>{booking.bookedFor} · {booking.department}</span>
                </div>
              </div>

              {booking.purpose && (
                <p className="mt-3 text-xs text-gray-500 dark:text-zinc-500 italic line-clamp-2">{booking.purpose}</p>
              )}

              {booking.status === 'upcoming' && (
                <div className="mt-4 pt-3 border-t border-current/10">
                  <button
                    onClick={() => setCancelTarget(booking)}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No bookings found" description="No bookings match the current filters." />
      )}

      {/* Create Booking Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Create New Booking</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Resource *</label>
                <select required value={form.resourceId} onChange={handleResourceChange} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                  <option value="">Select Resource</option>
                  {resources.filter(r => r.status === 'available').map(r => <option key={r.id} value={r.id}>{r.name} — {r.type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Booking Title *</label>
                <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Q3 Sprint Planning" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Date *</label>
                <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Start Time *</label>
                  <input required type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">End Time *</label>
                  <input required type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Purpose</label>
                <input type="text" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} placeholder="e.g. Client meeting, Training" className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Booking…' : 'Confirm Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} title="Cancel Booking" description={`Cancel booking "${cancelTarget?.title}" on ${cancelTarget?.date}? This cannot be undone.`} confirmLabel="Cancel Booking" type="danger" />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/services/notification.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { Notification } from '@/types';
import { Bell, Check, Trash2, ArrowRightLeft, UserCheck, ShieldCheck, Package, AlertTriangle, X } from 'lucide-react';

function NotifIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    'asset-assigned': <Package className="w-4 h-4 text-indigo-500" />,
    'transfer-requested': <ArrowRightLeft className="w-4 h-4 text-amber-500" />,
    'transfer-approved': <UserCheck className="w-4 h-4 text-emerald-500" />,
    'transfer-rejected': <X className="w-4 h-4 text-rose-500" />,
    'return-due': <AlertTriangle className="w-4 h-4 text-amber-500" />,
    'overdue-return': <AlertTriangle className="w-4 h-4 text-rose-500" />,
    'booking-confirmed': <ShieldCheck className="w-4 h-4 text-emerald-500" />,
    'maintenance-approved': <ShieldCheck className="w-4 h-4 text-indigo-500" />,
    'audit-discrepancy': <AlertTriangle className="w-4 h-4 text-rose-500" />,
  };
  return <>{icons[type] || <Bell className="w-4 h-4 text-gray-400" />}</>;
}

export default function NotificationsPage() {
  const showToast = useAppStore(s => s.showToast);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    getNotifications().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={6} /></div>;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Notifications"
        description="All system alerts and activity updates."
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unreadCount > 0 ? (
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">
              <Check className="w-4 h-4" /> Mark All Read
            </button>
          ) : undefined
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
        <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto">{filtered.length} notifications</span>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(notif => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                !notif.isRead
                  ? 'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30'
                  : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800'
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.isRead ? 'bg-indigo-100 dark:bg-indigo-950/30' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                <NotifIcon type={notif.type} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${!notif.isRead ? 'text-gray-900 dark:text-zinc-100' : 'text-gray-700 dark:text-zinc-300'}`}>
                    {notif.title}
                    {!notif.isRead && <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full align-middle" />}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap flex-shrink-0">
                    {new Date(notif.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.isRead && (
                  <button onClick={() => handleMarkRead(notif.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20 transition-colors" title="Mark as read">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleDelete(notif.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="w-12 h-12 text-gray-300 dark:text-zinc-600" />}
          title={filter === 'unread' ? 'All caught up!' : 'No notifications'}
          description={filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here as you use AssetFlow.'}
        />
      )}
    </div>
  );
}

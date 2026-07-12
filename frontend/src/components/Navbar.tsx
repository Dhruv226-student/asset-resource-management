import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { markAsRead, markAllAsRead } from '@/services/notification.service';
import { 
  Bell, Menu, Search, X, Check, Eye, HelpCircle, AlertCircle, 
  ArrowRightLeft, UserCheck, ShieldCheck, ChevronDown 
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';
import { UserRole } from '@/types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const currentRole = useAppStore((state) => state.currentRole);
  const setCurrentRole = useAppStore((state) => state.setCurrentRole);
  const currentUser = useAppStore((state) => state.currentUser);
  const notifications = useAppStore((state) => state.notifications);
  const showToast = useAppStore((state) => state.showToast);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Role names
  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    'asset-manager': 'Asset Manager',
    'department-head': 'Dept. Head',
    employee: 'Employee'
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setCurrentRole(role);
    showToast(`Role switched to ${roleLabels[role]} (Demo Mode)`);
    // Redirect to dashboard on role change to prevent access violations on restricted pages
    router.push('/dashboard');
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      showToast('All notifications marked as read.');
      setIsNotifOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800 h-16 flex items-center px-4 md:px-6 justify-between select-none">
      {/* Mobile Sidebar Trigger & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
        )}
        
        {/* Visual Search input (Desktop) */}
        <div className="hidden sm:flex relative items-center max-w-xs w-64">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search assets..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs bg-gray-50 dark:bg-zinc-950 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all"
            onClick={() => router.push('/assets')}
            readOnly
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Persistent Role Switcher Badge (Demo utility) */}
        <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 px-3 py-1 rounded-lg">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 hidden lg:inline">Demo Role:</span>
          <select
            value={currentRole}
            onChange={handleRoleChange}
            className="bg-transparent text-xs font-bold text-indigo-700 dark:text-indigo-400 border-none outline-none focus:ring-0 cursor-pointer pr-1"
          >
            <option value="admin" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Administrator</option>
            <option value="asset-manager" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Asset Manager</option>
            <option value="department-head" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Department Head</option>
            <option value="employee" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200">Employee</option>
          </select>
        </div>

        {/* Notifications Dropdown trigger */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 relative transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Card */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-150">
              <div className="px-4 py-3.5 bg-gray-50 dark:bg-zinc-850/50 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900 dark:text-zinc-150">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-indigo-600 hover:text-indigo-850 font-semibold dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Alert items list */}
              <div className="divide-y divide-gray-100 dark:divide-zinc-850 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        router.push('/notifications');
                      }}
                      className={`p-3.5 hover:bg-gray-50/50 dark:hover:bg-zinc-850/20 cursor-pointer flex gap-3 text-xs leading-relaxed transition-colors ${
                        !notif.isRead ? 'bg-indigo-50/10 dark:bg-indigo-950/5 font-medium' : ''
                      }`}
                    >
                      {/* Notification Icons */}
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.type.includes('requested') || notif.type.includes('transfer') ? (
                          <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                        ) : notif.type.includes('assigned') ? (
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-zinc-200 truncate">{notif.title}</p>
                        <p className="text-gray-550 dark:text-zinc-450 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>

                      {/* Read tick action */}
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkRead(notif.id, e)}
                          className="self-center p-1 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-zinc-500 text-xs flex flex-col items-center justify-center gap-1.5">
                    <HelpCircle className="w-6 h-6" />
                    <span>All caught up! No alerts.</span>
                  </div>
                )}
              </div>

              {/* View all footer */}
              <div className="bg-gray-50 dark:bg-zinc-850/50 border-t border-gray-150 dark:border-zinc-800 p-2.5 text-center text-[11px]">
                <Link
                  href="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User initials bubble dropdown or simple label */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatar} size="sm" />
            <div className="hidden md:block text-left">
              <span className="block text-xs font-semibold text-gray-900 dark:text-zinc-150 leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-450 mt-1 block">{currentUser.departmentName}</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;

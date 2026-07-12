import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { logout } from '@/services/auth.service';
import { 
  LayoutDashboard, Package, ShieldAlert, Calendar, Wrench, 
  ClipboardCheck, BarChart3, Users, FileClock, LogOut, Activity 
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const currentUser = useAppStore((state) => state.currentUser);
  const currentRole = useAppStore((state) => state.currentRole);
  const showToast = useAppStore((state) => state.showToast);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully.');
      router.push('/login');
    } catch (e: any) {
      showToast(e.message || 'Logout failed.', 'error');
    }
  };

  const allNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'asset-manager', 'department-head', 'employee']
    },
    {
      label: 'Assets',
      href: '/assets',
      icon: <Package className="w-5 h-5" />,
      roles: ['admin', 'asset-manager', 'department-head', 'employee']
    },
    {
      label: 'Allocations',
      href: '/allocations',
      icon: <ShieldAlert className="w-5 h-5" />, // ShieldAlert represents checkout/transfers/returns
      roles: ['admin', 'asset-manager', 'department-head', 'employee']
    },
    {
      label: 'Resource Bookings',
      href: '/bookings',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['admin', 'asset-manager', 'department-head', 'employee']
    },
    {
      label: 'Maintenance',
      href: '/maintenance',
      icon: <Wrench className="w-5 h-5" />,
      roles: ['admin', 'asset-manager', 'department-head', 'employee']
    },
    {
      label: 'Audits',
      href: '/audits',
      icon: <ClipboardCheck className="w-5 h-5" />,
      roles: ['admin', 'asset-manager', 'department-head']
    },
    {
      label: 'Reports & Analytics',
      href: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'asset-manager', 'department-head']
    },
    {
      label: 'Organization',
      href: '/organization',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'asset-manager']
    },
    {
      label: 'Activity Logs',
      href: '/activity-logs',
      icon: <FileClock className="w-5 h-5" />,
      roles: ['admin', 'asset-manager']
    }
  ];

  // Filter items based on active role
  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="h-full flex flex-col justify-between w-64 bg-slate-900 text-slate-300 border-r border-slate-800 font-medium">
      {/* Brand Header */}
      <div>
        <div className="px-6 py-5.5 border-b border-slate-800 flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-wide">AssetFlow</span>
            <span className="block text-[10px] text-indigo-400 font-semibold tracking-widest uppercase mt-0.5">Enterprise ERP</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-3.5 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info Block */}
      {currentUser && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3.5">
            <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <div className="mt-1 flex items-center">
                <StatusBadge status={currentRole} size="sm" />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-800 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 text-sm font-semibold rounded-lg transition-colors border border-slate-850 hover:border-rose-900/30"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;

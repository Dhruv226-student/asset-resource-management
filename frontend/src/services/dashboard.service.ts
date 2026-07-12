import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import initialDashboardData from '@/data/mock-dashboard.json';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export interface DashboardSummary {
  kpis: {
    totalAssets: number;
    availableAssets: number;
    allocatedAssets: number;
    underMaintenance: number;
    activeBookings: number;
    pendingTransfers: number;
    upcomingReturns: number;
    overdueReturns: number;
  };
  assetStatusDistribution: { name: string; value: number; color: string }[];
  monthlyAllocations: any[];
  resourceBookingTrends: any[];
  maintenanceByPriority: { priority: string; count: number; color: string }[];
  departmentAllocations: { department: string; count: number }[];
  frequentlyUsedAssets: any[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await simulateDelay(400);
  
  // Real API implementation placeholder:
  // return apiClient.get<DashboardSummary>('/dashboard/summary');

  const state = useAppStore.getState();
  const { assets, bookings, transferRequests, allocations, maintenanceRequests } = state;

  // Calculate KPIs dynamically
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'available').length;
  const allocatedAssets = assets.filter(a => a.status === 'allocated').length;
  const underMaintenance = assets.filter(a => a.status === 'under-maintenance').length;
  
  const activeBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'ongoing').length;
  const pendingTransfers = transferRequests.filter(tr => tr.status === 'requested').length;
  
  // Dynamic return calculations
  const now = new Date();
  const activeAllocations = allocations.filter(al => al.status === 'active' || al.status === 'overdue');
  const overdueReturns = activeAllocations.filter(al => {
    return al.status === 'overdue' || new Date(al.expectedReturnDate) < now;
  }).length;
  const upcomingReturns = activeAllocations.length - overdueReturns;

  // Dynamic asset distribution
  const statusColors: Record<string, string> = {
    'available': '#10B981', // green
    'allocated': '#8B5CF6', // purple
    'reserved': '#3B82F6', // blue
    'under-maintenance': '#F59E0B', // orange
    'lost': '#EF4444', // red
    'retired': '#6B7280', // gray
    'disposed': '#374151' // dark gray
  };

  const statusCounts = assets.reduce((acc, asset) => {
    acc[asset.status] = (acc[asset.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assetStatusDistribution = Object.entries(statusCounts).map(([status, count]) => {
    const displayName = status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
      name: displayName,
      value: count,
      color: statusColors[status] || '#6B7280'
    };
  });

  // Dynamic maintenance counts by priority
  const activeMaint = maintenanceRequests.filter(mr => mr.status !== 'resolved' && mr.status !== 'rejected');
  const priorityCounts = activeMaint.reduce((acc, mr) => {
    acc[mr.priority] = (acc[mr.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityColors: Record<string, string> = {
    'critical': '#EF4444',
    'high': '#F97316',
    'medium': '#3B82F6',
    'low': '#10B981'
  };

  const maintenanceByPriority = ['critical', 'high', 'medium', 'low'].map(prio => ({
    priority: prio.charAt(0).toUpperCase() + prio.slice(1),
    count: priorityCounts[prio] || 0,
    color: priorityColors[prio] || '#6B7280'
  }));

  // Dynamic department allocations
  const deptCounts = assets.filter(a => a.status === 'allocated').reduce((acc, asset) => {
    acc[asset.department] = (acc[asset.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentAllocations = Object.entries(deptCounts).map(([dept, count]) => ({
    department: dept,
    count
  }));

  return {
    kpis: {
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenance,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns
    },
    assetStatusDistribution: assetStatusDistribution.length > 0 ? assetStatusDistribution : initialDashboardData.assetStatusDistribution,
    monthlyAllocations: initialDashboardData.monthlyAllocations,
    resourceBookingTrends: initialDashboardData.resourceBookingTrends,
    maintenanceByPriority,
    departmentAllocations: departmentAllocations.length > 0 ? departmentAllocations : initialDashboardData.departmentAllocations,
    frequentlyUsedAssets: initialDashboardData.frequentlyUsedAssets
  };
}

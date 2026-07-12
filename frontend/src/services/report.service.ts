import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { Asset, Allocation, MaintenanceRequest } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}

export interface ReportsData {
  utilizationRate: { category: string; rate: number; total: number; allocated: number }[];
  statusDistribution: { name: string; value: number }[];
  departmentAllocation: { department: string; count: number }[];
  maintenanceFrequency: { category: string; count: number }[];
  mostUsedAssets: { name: string; bookingsCount: number }[];
  idleAssets: Asset[];
  nearingWarrantyExpiry: Asset[];
  nearingRetirement: Asset[];
  overdueReturns: Allocation[];
  auditDiscrepancySummary: { missingCount: number; damagedCount: number; verifiedCount: number };
}

export async function getReports(filters: ReportFilters = {}): Promise<ReportsData> {
  await simulateDelay(500);

  // Real API implementation:
  // return apiClient.get<ReportsData>('/reports', { params: filters as any });

  const { assets, allocations, bookings, maintenanceRequests, auditItems } = useAppStore.getState();

  // Apply filters to assets
  let filteredAssets = [...assets];
  if (filters.category && filters.category !== 'all') {
    filteredAssets = filteredAssets.filter(a => a.category === filters.category);
  }
  if (filters.department && filters.department !== 'all') {
    filteredAssets = filteredAssets.filter(a => a.department === filters.department);
  }

  // 1. Asset Utilization (Allocated vs Total by Category)
  const categoryGroups = filteredAssets.reduce((acc, a) => {
    acc[a.category] = acc[a.category] || { total: 0, allocated: 0 };
    acc[a.category].total += 1;
    if (a.status === 'allocated') {
      acc[a.category].allocated += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; allocated: number }>);

  const utilizationRate = Object.entries(categoryGroups).map(([category, stats]) => ({
    category,
    total: stats.total,
    allocated: stats.allocated,
    rate: stats.total > 0 ? Math.round((stats.allocated / stats.total) * 100) : 0
  }));

  // 2. Status Distribution
  const statusCounts = filteredAssets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => {
    const name = status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { name, value: count };
  });

  // 3. Department Allocation
  const deptCounts = filteredAssets.filter(a => a.status === 'allocated').reduce((acc, a) => {
    acc[a.department] = (acc[a.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentAllocation = Object.entries(deptCounts).map(([department, count]) => ({
    department,
    count
  }));

  // 4. Maintenance Frequency
  const maintCounts = maintenanceRequests.reduce((acc, mr) => {
    // Find category of the asset
    const asset = assets.find(a => a.id === mr.assetId);
    const cat = asset ? asset.category : 'Unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maintenanceFrequency = Object.entries(maintCounts).map(([category, count]) => ({
    category,
    count
  }));

  // 5. Most used assets from Bookings
  const bookingCounts = bookings.reduce((acc, b) => {
    acc[b.resourceName] = (acc[b.resourceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedAssets = Object.entries(bookingCounts)
    .map(([name, count]) => ({ name, bookingsCount: count }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // 6. Idle Assets (Available and Good condition)
  const idleAssets = filteredAssets.filter(a => a.status === 'available' && (a.condition === 'good' || a.condition === 'new'));

  // 7. Nearing Warranty Expiry (within 180 days from current date)
  const now = new Date('2026-07-12'); // Mock current date
  const nearingWarrantyExpiry = filteredAssets.filter(a => {
    if (!a.warrantyExpiryDate) return false;
    const expiry = new Date(a.warrantyExpiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 180;
  });

  // 8. Nearing Retirement (lifespan exceeding 3 years for Electronics, 8 years for others, or condition poor/damaged)
  const nearingRetirement = filteredAssets.filter(a => {
    if (a.condition === 'poor' || a.condition === 'damaged') return true;
    const acq = new Date(a.acquisitionDate);
    const diffTime = now.getTime() - acq.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    if (a.category === 'Electronics' && diffYears >= 2.5) return true;
    if (a.category === 'Vehicles' && diffYears >= 5) return true;
    return diffYears >= 4;
  });

  // 9. Overdue returns
  const overdueReturns = allocations.filter(al => {
    if (al.status !== 'active' && al.status !== 'overdue') return false;
    if (filters.department && filters.department !== 'all' && al.department !== filters.department) return false;
    const expected = new Date(al.expectedReturnDate);
    return al.status === 'overdue' || expected < now;
  });

  // 10. Audit discrepancies
  const missingCount = auditItems.filter(ai => ai.status === 'missing').length;
  const damagedCount = auditItems.filter(ai => ai.status === 'damaged').length;
  const verifiedCount = auditItems.filter(ai => ai.status === 'verified').length;

  return {
    utilizationRate,
    statusDistribution,
    departmentAllocation,
    maintenanceFrequency,
    mostUsedAssets,
    idleAssets,
    nearingWarrantyExpiry,
    nearingRetirement,
    overdueReturns,
    auditDiscrepancySummary: {
      missingCount,
      damagedCount,
      verifiedCount
    }
  };
}

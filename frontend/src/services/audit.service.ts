import { simulateDelay, MockApiError } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { AuditCycle, AuditItem, AuditVerificationStatus, AssetStatus } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getAuditCycles(): Promise<AuditCycle[]> {
  await simulateDelay(350);
  return useAppStore.getState().auditCycles;
}

export async function getAuditItems(cycleId: string): Promise<AuditItem[]> {
  await simulateDelay(250);
  return useAppStore.getState().auditItems.filter(item => item.auditCycleId === cycleId);
}

// 1. Create Audit Cycle
export async function createAuditCycle(payload: {
  name: string;
  scopeType: 'department' | 'location' | 'all';
  department?: string;
  location?: string;
  startDate: string;
  endDate: string;
  auditors: string[];
  notes?: string;
}): Promise<AuditCycle> {
  await simulateDelay(500);

  // Real API implementation:
  // return apiClient.post<AuditCycle>('/audits', payload);

  const { auditCycles, setAuditCycles, auditItems, setAuditItems, assets, currentUser, addActivityLog, addNotification } = useAppStore.getState();

  const cycleId = 'aud' + Date.now();
  const newCycle: AuditCycle = {
    ...payload,
    id: cycleId,
    progress: 0,
    status: 'upcoming'
  };

  // Generate audit items dynamically based on scope!
  const scopeAssets = assets.filter(a => {
    if (a.status === 'retired' || a.status === 'disposed') return false;
    if (payload.scopeType === 'department') {
      return a.department === payload.department;
    }
    if (payload.scopeType === 'location') {
      return a.location === payload.location;
    }
    return true; // scope 'all'
  });

  const generatedItems: AuditItem[] = scopeAssets.map(asset => ({
    id: 'ai' + Math.random().toString(36).substr(2, 9),
    auditCycleId: cycleId,
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.tag,
    expectedLocation: asset.location,
    expectedHolder: asset.assignedTo || 'Unassigned',
    status: 'pending'
  }));

  setAuditCycles([...auditCycles, newCycle]);
  setAuditItems([...auditItems, ...generatedItems]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Create Audit Cycle',
      module: 'Audits',
      record: newCycle.name,
      details: `Created audit scope: ${payload.scopeType}. Generated ${generatedItems.length} verification items.`
    });
  }

  // Notify auditors
  addNotification({
    type: 'booking-reminder',
    title: 'Assigned to Audit Cycle',
    message: `You have been assigned as an auditor for cycle: ${newCycle.name}.`,
    link: `/audits/${cycleId}`
  });

  return newCycle;
}

// 2. Verify Audit Item
export async function verifyAuditItem(
  itemId: string,
  payload: {
    status: AuditVerificationStatus;
    actualLocation?: string;
    auditorNotes?: string;
  }
): Promise<AuditItem> {
  await simulateDelay(300);

  // Real API implementation:
  // return apiClient.patch<AuditItem>(`/audits/items/${itemId}`, payload);

  const { auditItems, setAuditItems, auditCycles, setAuditCycles, assets, setAssets, currentUser } = useAppStore.getState();
  
  const item = auditItems.find(ai => ai.id === itemId);
  if (!item) throw new MockApiError('Audit item not found.', 404);

  const cycle = auditCycles.find(ac => ac.id === item.auditCycleId);
  if (cycle && cycle.status === 'completed') {
    throw new MockApiError('Cannot modify items in a completed/locked audit cycle.', 400);
  }

  // 1. Update verification item
  let updatedItem: AuditItem | null = null;
  const updatedItems = auditItems.map(ai => {
    if (ai.id === itemId) {
      updatedItem = {
        ...ai,
        status: payload.status,
        actualLocation: payload.actualLocation || ai.expectedLocation,
        auditorNotes: payload.auditorNotes
      };
      return updatedItem;
    }
    return ai;
  });
  if (!updatedItem) throw new MockApiError('Verification failed.', 500);
  setAuditItems(updatedItems);

  // 2. Recalculate cycle progress percentage
  const cycleItems = updatedItems.filter(ai => ai.auditCycleId === item.auditCycleId);
  const verifiedCount = cycleItems.filter(ai => ai.status !== 'pending').length;
  const progress = Math.round((verifiedCount / cycleItems.length) * 100);

  const updatedCycles = auditCycles.map(ac => {
    if (ac.id === item.auditCycleId) {
      return { 
        ...ac, 
        progress,
        status: ac.status === 'upcoming' ? ('active' as const) : ac.status
      };
    }
    return ac;
  });
  setAuditCycles(updatedCycles);

  // 3. If verified damaged or missing, we can flag the asset condition/status immediately or wait till close
  if (payload.status === 'damaged') {
    const updatedAssets = assets.map(a => {
      if (a.id === item.assetId) {
        return { 
          ...a, 
          condition: 'damaged' as const,
          activityTimeline: [
            ...(a.activityTimeline || []),
            {
              id: 't' + Date.now(),
              date: new Date().toISOString().split('T')[0],
              action: 'Audit Check: Damaged',
              user: currentUser?.name || 'Auditor',
              notes: payload.auditorNotes || 'Marked damaged during verification.'
            }
          ]
        };
      }
      return a;
    });
    setAssets(updatedAssets);
  }

  return updatedItem;
}

// 3. Close Audit Cycle
export async function closeAuditCycle(cycleId: string): Promise<AuditCycle> {
  await simulateDelay(600);

  // Real API implementation:
  // return apiClient.post<AuditCycle>(`/audits/${cycleId}/close`, {});

  const { auditCycles, setAuditCycles, auditItems, assets, setAssets, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const cycle = auditCycles.find(ac => ac.id === cycleId);
  if (!cycle) throw new MockApiError('Audit cycle not found.', 404);
  if (cycle.status === 'completed') {
    return cycle; // Already closed
  }

  // 1. Lock the audit cycle status
  const updatedCycles = auditCycles.map(ac => {
    if (ac.id === cycleId) {
      return { ...ac, status: 'completed' as const, progress: 100 };
    }
    return ac;
  });
  setAuditCycles(updatedCycles);

  // 2. Fetch items for this cycle and process discrepancies
  const cycleItems = auditItems.filter(ai => ai.auditCycleId === cycleId);
  const missingItems = cycleItems.filter(ai => ai.status === 'missing');
  const damagedItems = cycleItems.filter(ai => ai.status === 'damaged');

  // Mark missing assets as Lost
  const missingAssetIds = missingItems.map(item => item.assetId);
  
  const updatedAssets = assets.map(a => {
    if (missingAssetIds.includes(a.id)) {
      return {
        ...a,
        status: 'lost' as AssetStatus,
        activityTimeline: [
          ...(a.activityTimeline || []),
          {
            id: 't' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            action: 'Marked Lost',
            user: 'System Audit Closure',
            notes: `Asset confirmed missing in audit: ${cycle.name}`
          }
        ]
      };
    }
    return a;
  });
  setAssets(updatedAssets);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Close Audit Cycle',
      module: 'Audits',
      record: cycle.name,
      details: `Closed audit cycle. Discrepancies resolved: ${missingItems.length} missing (marked Lost), ${damagedItems.length} damaged.`
    });
  }

  // Create notifications about discrepancies
  if (missingItems.length > 0 || damagedItems.length > 0) {
    addNotification({
      type: 'audit-discrepancy',
      title: 'Audit Discrepancies Generated',
      message: `Audit ${cycle.name} closed with ${missingItems.length} missing items and ${damagedItems.length} damaged items.`,
      link: `/audits`
    });
  }

  return { ...cycle, status: 'completed', progress: 100 };
}

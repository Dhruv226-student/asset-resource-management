import { simulateDelay, MockApiError } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { MaintenanceRequest, AssetStatus } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  await simulateDelay(300);
  return useAppStore.getState().maintenanceRequests;
}

// 1. Raise Maintenance Request
export async function raiseMaintenanceRequest(payload: {
  assetId: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  photo?: string;
  preferredDate?: string;
}): Promise<MaintenanceRequest> {
  await simulateDelay(450);

  // Real API implementation:
  // return apiClient.post<MaintenanceRequest>('/maintenance', payload);

  const { assets, maintenanceRequests, setMaintenanceRequests, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const asset = assets.find(a => a.id === payload.assetId);
  if (!asset) throw new MockApiError('Asset not found.', 404);

  const nextNum = maintenanceRequests.length + 1001;
  const requestId = `MR-${nextNum}`;

  const newRequest: MaintenanceRequest = {
    id: requestId,
    assetId: payload.assetId,
    assetName: asset.name,
    assetTag: asset.tag,
    reportedBy: currentUser?.name || 'Employee',
    reportedById: currentUser?.id,
    issue: payload.issue,
    priority: payload.priority,
    requestedDate: payload.preferredDate || new Date().toISOString().split('T')[0],
    status: 'pending',
    photo: payload.photo
  };

  setMaintenanceRequests([...maintenanceRequests, newRequest]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Raise Maintenance Request',
      module: 'Maintenance',
      record: `${asset.name} (${asset.tag})`,
      details: `Raised request ${requestId} with priority ${payload.priority}. Issue: ${payload.issue}`
    });
  }

  // Notify managers
  addNotification({
    type: 'transfer-requested', // generic request alert
    title: 'Maintenance Raised',
    message: `Maintenance request ${requestId} raised for ${asset.name} (${payload.priority} priority).`,
    link: '/maintenance'
  });

  return newRequest;
}

// 2. Approve Maintenance Request
export async function approveMaintenanceRequest(
  requestId: string,
  payload: {
    technician: string;
    estimatedCompletionDate: string;
    notes?: string;
  }
): Promise<MaintenanceRequest> {
  await simulateDelay(500);

  // Real API implementation:
  // return apiClient.patch<MaintenanceRequest>(`/maintenance/${requestId}/approve`, payload);

  const { maintenanceRequests, setMaintenanceRequests, assets, setAssets, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const request = maintenanceRequests.find(mr => mr.id === requestId);
  if (!request) throw new MockApiError('Maintenance request not found.', 404);

  // 1. Update request status to approved/in-progress
  const updatedRequests = maintenanceRequests.map(mr => {
    if (mr.id === requestId) {
      return { 
        ...mr, 
        status: 'in-progress' as const, 
        technician: payload.technician, 
        estimatedCompletionDate: payload.estimatedCompletionDate,
        resolutionNotes: payload.notes
      };
    }
    return mr;
  });
  setMaintenanceRequests(updatedRequests);

  // 2. Change asset status to under-maintenance
  const updatedAssets = assets.map(a => {
    if (a.id === request.assetId) {
      const timeline = a.activityTimeline || [];
      return {
        ...a,
        status: 'under-maintenance' as AssetStatus,
        activityTimeline: [
          ...timeline,
          {
            id: 't' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            action: 'Sent to Maintenance',
            user: currentUser?.name || 'Asset Manager',
            notes: `Approved request ${requestId}. Technician: ${payload.technician}. Est. completion: ${payload.estimatedCompletionDate}`
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
      action: 'Approve Maintenance',
      module: 'Maintenance',
      record: `${request.assetName} - ${requestId}`,
      details: `Approved maintenance request. Assigned technician: ${payload.technician}.`
    });
  }

  // Notify reporter
  if (request.reportedById) {
    addNotification({
      type: 'maintenance-approved',
      title: 'Maintenance Approved',
      message: `Your maintenance request ${requestId} for ${request.assetName} has been approved. Tech: ${payload.technician}.`,
      link: '/maintenance'
    });
  }

  return { 
    ...request, 
    status: 'in-progress', 
    technician: payload.technician, 
    estimatedCompletionDate: payload.estimatedCompletionDate 
  };
}

// 3. Reject Maintenance Request
export async function rejectMaintenanceRequest(requestId: string, notes?: string): Promise<MaintenanceRequest> {
  await simulateDelay(400);

  const { maintenanceRequests, setMaintenanceRequests, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  const request = maintenanceRequests.find(mr => mr.id === requestId);
  if (!request) throw new MockApiError('Request not found.', 404);

  const updated = maintenanceRequests.map(mr => {
    if (mr.id === requestId) {
      return { ...mr, status: 'rejected' as const, resolutionNotes: notes };
    }
    return mr;
  });
  setMaintenanceRequests(updated);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Reject Maintenance',
      module: 'Maintenance',
      record: `${request.assetName} - ${requestId}`,
      details: `Rejected maintenance request MR-${requestId}. Reason: ${notes || 'No reason specified'}`
    });
  }

  if (request.reportedById) {
    addNotification({
      type: 'maintenance-rejected',
      title: 'Maintenance Rejected',
      message: `Your maintenance request ${requestId} for ${request.assetName} has been rejected.`,
      link: '/maintenance'
    });
  }

  return { ...request, status: 'rejected', resolutionNotes: notes };
}

// 4. Resolve Maintenance Request
export async function resolveMaintenanceRequest(
  requestId: string,
  payload: {
    resolutionNotes: string;
    repairCost: number;
    completionDate: string;
  }
): Promise<MaintenanceRequest> {
  await simulateDelay(500);

  // Real API implementation:
  // return apiClient.patch<MaintenanceRequest>(`/maintenance/${requestId}/resolve`, payload);

  const { maintenanceRequests, setMaintenanceRequests, assets, setAssets, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const request = maintenanceRequests.find(mr => mr.id === requestId);
  if (!request) throw new MockApiError('Maintenance request not found.', 404);

  // 1. Update request status to resolved
  const updatedRequests = maintenanceRequests.map(mr => {
    if (mr.id === requestId) {
      return { 
        ...mr, 
        status: 'resolved' as const,
        resolutionNotes: payload.resolutionNotes,
        repairCost: payload.repairCost,
        completionDate: payload.completionDate
      };
    }
    return mr;
  });
  setMaintenanceRequests(updatedRequests);

  // 2. Change asset status back to available
  const updatedAssets = assets.map(a => {
    if (a.id === request.assetId) {
      const timeline = a.activityTimeline || [];
      return {
        ...a,
        status: 'available' as AssetStatus,
        activityTimeline: [
          ...timeline,
          {
            id: 't' + Date.now(),
            date: payload.completionDate,
            action: 'Maintenance Completed',
            user: currentUser?.name || 'Asset Manager',
            notes: `Resolved request ${requestId}. Cost: ${payload.repairCost} INR. Notes: ${payload.resolutionNotes}`
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
      action: 'Resolve Maintenance',
      module: 'Maintenance',
      record: `${request.assetName} - ${requestId}`,
      details: `Resolved maintenance request. Repair Cost: ${payload.repairCost} INR.`
    });
  }

  // Notify reporter
  if (request.reportedById) {
    addNotification({
      type: 'maintenance-resolved',
      title: 'Maintenance Completed',
      message: `Your maintenance request ${requestId} for ${request.assetName} has been resolved.`,
      link: '/maintenance'
    });
  }

  return { 
    ...request, 
    status: 'resolved', 
    resolutionNotes: payload.resolutionNotes,
    repairCost: payload.repairCost,
    completionDate: payload.completionDate
  };
}

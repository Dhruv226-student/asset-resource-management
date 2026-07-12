import { simulateDelay, MockApiError } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { Allocation, TransferRequest, ReturnRequest, AssetStatus, User } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getAllocations(): Promise<Allocation[]> {
  await simulateDelay(300);
  return useAppStore.getState().allocations;
}

export async function getTransferRequests(): Promise<TransferRequest[]> {
  await simulateDelay(300);
  return useAppStore.getState().transferRequests;
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  await simulateDelay(300);
  return useAppStore.getState().returnRequests;
}

// 1. Allocate Asset
export async function allocateAsset(payload: {
  assetId: string;
  assignedToId: string;
  assignmentType: 'employee' | 'department';
  allocationDate: string;
  expectedReturnDate: string;
  notes?: string;
}): Promise<Allocation> {
  await simulateDelay(500);

  // Real API implementation placeholder:
  // return apiClient.post<Allocation>('/allocations', payload);

  const { assets, setAssets, allocations, setAllocations, users, departments, addActivityLog, currentUser, addNotification } = useAppStore.getState();
  
  const asset = assets.find(a => a.id === payload.assetId);
  if (!asset) {
    throw new MockApiError('Asset not found.', 404);
  }

  // Validate status
  if (['allocated', 'reserved', 'under-maintenance', 'lost', 'retired', 'disposed'].includes(asset.status)) {
    const holder = asset.assignedTo || 'another user/department';
    throw new MockApiError(`This asset is currently ${asset.status.replace('-', ' ')} and allocated to ${holder}.`, 400);
  }

  // Find assignee name
  let assigneeName = '';
  if (payload.assignmentType === 'employee') {
    const emp = users.find(u => u.id === payload.assignedToId);
    assigneeName = emp ? emp.name : 'Unknown Employee';
  } else {
    const dept = departments.find(d => d.id === payload.assignedToId);
    assigneeName = dept ? dept.name : 'Unknown Department';
  }

  // Create new allocation record
  const newAllocation: Allocation = {
    id: 'al' + Date.now(),
    assetId: payload.assetId,
    assetName: asset.name,
    assetTag: asset.tag,
    assignedTo: assigneeName,
    assignedToId: payload.assignedToId,
    assignmentType: payload.assignmentType,
    department: asset.department,
    allocationDate: payload.allocationDate,
    expectedReturnDate: payload.expectedReturnDate,
    status: 'active',
    notes: payload.notes
  };

  // Update asset status
  const updatedAssets = assets.map(a => {
    if (a.id === payload.assetId) {
      const timeline = a.activityTimeline || [];
      return {
        ...a,
        status: 'allocated' as AssetStatus,
        assignedTo: assigneeName,
        assignedToId: payload.assignedToId,
        activityTimeline: [
          ...timeline,
          {
            id: 't' + Date.now(),
            date: payload.allocationDate,
            action: 'Asset Allocated',
            user: currentUser?.name || 'Asset Manager',
            notes: `Allocated to ${assigneeName}. Expected return: ${payload.expectedReturnDate}`
          }
        ]
      };
    }
    return a;
  });

  // Update user stats
  if (payload.assignmentType === 'employee') {
    const updatedUsers = users.map(u => {
      if (u.id === payload.assignedToId) {
        return { ...u, assignedAssetsCount: (u.assignedAssetsCount || 0) + 1 };
      }
      return u;
    });
    useAppStore.setState({ users: updatedUsers });
  }

  setAssets(updatedAssets);
  setAllocations([...allocations, newAllocation]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Allocate Asset',
      module: 'Allocations',
      record: `${asset.name} (${asset.tag})`,
      details: `Allocated to ${assigneeName}. Expected Return: ${payload.expectedReturnDate}`
    });
  }

  // Send notification to assignee
  if (payload.assignmentType === 'employee') {
    addNotification({
      type: 'asset-assigned',
      title: 'New Asset Assigned',
      message: `You have been allocated ${asset.name} (${asset.tag}). Return due by ${payload.expectedReturnDate}.`,
      link: `/assets/${asset.id}`
    });
  }

  return newAllocation;
}

// 2. Create Transfer Request
export async function createTransferRequest(payload: {
  assetId: string;
  requestedHolderId: string; // Employee ID
  reason: string;
}): Promise<TransferRequest> {
  await simulateDelay(400);

  // Real API implementation:
  // return apiClient.post<TransferRequest>('/allocations/transfers', payload);

  const { assets, transferRequests, setTransferRequests, users, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const asset = assets.find(a => a.id === payload.assetId);
  if (!asset) throw new MockApiError('Asset not found.', 404);

  const reqHolder = users.find(u => u.id === payload.requestedHolderId);
  if (!reqHolder) throw new MockApiError('Target employee not found.', 404);

  const currentHolder = asset.assignedTo || 'None';

  const newRequest: TransferRequest = {
    id: 'tr' + Date.now(),
    assetId: payload.assetId,
    assetName: asset.name,
    assetTag: asset.tag,
    currentHolder,
    requestedHolder: reqHolder.name,
    requestedHolderId: reqHolder.id,
    requestedBy: currentUser?.name || 'Employee',
    requestedById: currentUser?.id,
    requestDate: new Date().toISOString().split('T')[0],
    reason: payload.reason,
    status: 'requested'
  };

  setTransferRequests([...transferRequests, newRequest]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Create Transfer Request',
      module: 'Allocations',
      record: `${asset.name} (${asset.tag})`,
      details: `Requested transfer from ${currentHolder} to ${reqHolder.name}. Reason: ${payload.reason}`
    });
  }

  // Notify asset manager
  addNotification({
    type: 'transfer-requested',
    title: 'Asset Transfer Requested',
    message: `${currentUser?.name || 'An employee'} requested to transfer ${asset.name} to ${reqHolder.name}.`,
    link: '/allocations'
  });

  return newRequest;
}

// 3. Approve Transfer Request
export async function approveTransferRequest(requestId: string): Promise<TransferRequest> {
  await simulateDelay(500);

  // Real API implementation:
  // return apiClient.patch<TransferRequest>(`/allocations/transfers/${requestId}/approve`, {});

  const { transferRequests, setTransferRequests, assets, setAssets, allocations, setAllocations, users, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const request = transferRequests.find(tr => tr.id === requestId);
  if (!request) throw new MockApiError('Transfer request not found.', 404);

  // 1. Update transfer request status
  const updatedRequests = transferRequests.map(tr => {
    if (tr.id === requestId) {
      return { ...tr, status: 'completed' as const };
    }
    return tr;
  });
  setTransferRequests(updatedRequests);

  // 2. Update Asset assigned info
  const updatedAssets = assets.map(a => {
    if (a.id === request.assetId) {
      const timeline = a.activityTimeline || [];
      return {
        ...a,
        assignedTo: request.requestedHolder,
        assignedToId: request.requestedHolderId,
        activityTimeline: [
          ...timeline,
          {
            id: 't' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            action: 'Transfer Completed',
            user: currentUser?.name || 'Asset Manager',
            notes: `Transferred from ${request.currentHolder} to ${request.requestedHolder} by approval.`
          }
        ]
      };
    }
    return a;
  });
  setAssets(updatedAssets);

  // 3. Close old allocation, create new allocation
  const updatedAllocations = allocations.map(al => {
    if (al.assetId === request.assetId && al.status === 'active') {
      return { ...al, status: 'returned' as const, actualReturnDate: new Date().toISOString().split('T')[0] };
    }
    return al;
  });

  const newAllocation: Allocation = {
    id: 'al' + Date.now(),
    assetId: request.assetId,
    assetName: request.assetName,
    assetTag: request.assetTag,
    assignedTo: request.requestedHolder,
    assignedToId: request.requestedHolderId,
    assignmentType: 'employee',
    department: assets.find(a => a.id === request.assetId)?.department || 'IT',
    allocationDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year default
    status: 'active'
  };

  setAllocations([...updatedAllocations, newAllocation]);

  // Adjust user counts
  const updatedUsers = users.map(u => {
    // Decrement from old holder if found in user directory
    if (u.name === request.currentHolder) {
      return { ...u, assignedAssetsCount: Math.max(0, (u.assignedAssetsCount || 0) - 1) };
    }
    // Increment for new holder
    if (u.id === request.requestedHolderId) {
      return { ...u, assignedAssetsCount: (u.assignedAssetsCount || 0) + 1 };
    }
    return u;
  });
  useAppStore.setState({ users: updatedUsers });

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Approve Transfer',
      module: 'Allocations',
      record: `${request.assetName} (${request.assetTag})`,
      details: `Approved transfer request TR-${request.id}. Transferred to ${request.requestedHolder}.`
    });
  }

  // Notify requester and new holder
  if (request.requestedHolderId) {
    addNotification({
      type: 'transfer-approved',
      title: 'Transfer Request Approved',
      message: `Asset ${request.assetName} has been successfully transferred to you.`,
      link: `/assets/${request.assetId}`
    });
  }

  return { ...request, status: 'completed' };
}

// 4. Reject Transfer Request
export async function rejectTransferRequest(requestId: string): Promise<TransferRequest> {
  await simulateDelay(400);

  const { transferRequests, setTransferRequests, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  const request = transferRequests.find(tr => tr.id === requestId);
  if (!request) throw new MockApiError('Request not found.', 404);

  const updated = transferRequests.map(tr => {
    if (tr.id === requestId) return { ...tr, status: 'rejected' as const };
    return tr;
  });
  setTransferRequests(updated);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Reject Transfer',
      module: 'Allocations',
      record: `${request.assetName} (${request.assetTag})`,
      details: `Rejected transfer request TR-${request.id}.`
    });
  }

  addNotification({
    type: 'transfer-rejected',
    title: 'Transfer Request Rejected',
    message: `Your transfer request for ${request.assetName} has been rejected.`,
    link: '/allocations'
  });

  return { ...request, status: 'rejected' };
}

// 5. Create Return Request
export async function createReturnRequest(payload: {
  assetId: string;
  conditionAtReturn: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  checkInNotes?: string;
}): Promise<ReturnRequest> {
  await simulateDelay(450);

  const { assets, returnRequests, setReturnRequests, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  const asset = assets.find(a => a.id === payload.assetId);
  if (!asset) throw new MockApiError('Asset not found.', 404);

  const newRequest: ReturnRequest = {
    id: 'rr' + Date.now(),
    assetId: payload.assetId,
    assetName: asset.name,
    assetTag: asset.tag,
    requestedBy: currentUser?.name || 'Employee',
    requestedById: currentUser?.id,
    returnDate: new Date().toISOString().split('T')[0],
    conditionAtReturn: payload.conditionAtReturn,
    checkInNotes: payload.checkInNotes,
    status: 'requested'
  };

  setReturnRequests([...returnRequests, newRequest]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Create Return Request',
      module: 'Allocations',
      record: `${asset.name} (${asset.tag})`,
      details: `Employee raised return request. Current condition: ${payload.conditionAtReturn}. Notes: ${payload.checkInNotes}`
    });
  }

  addNotification({
    type: 'transfer-requested', // generic asset request
    title: 'Asset Return Requested',
    message: `${currentUser?.name || 'Employee'} requested to return ${asset.name}.`,
    link: '/allocations'
  });

  return newRequest;
}

// 6. Approve Return Request (Check-in Asset)
export async function approveReturnRequest(requestId: string): Promise<ReturnRequest> {
  await simulateDelay(500);

  const { returnRequests, setReturnRequests, assets, setAssets, allocations, setAllocations, users, currentUser, addActivityLog, addNotification } = useAppStore.getState();
  
  const request = returnRequests.find(rr => rr.id === requestId);
  if (!request) throw new MockApiError('Return request not found.', 404);

  // 1. Update return request status
  const updatedRequests = returnRequests.map(rr => {
    if (rr.id === requestId) return { ...rr, status: 'completed' as const };
    return rr;
  });
  setReturnRequests(updatedRequests);

  // 2. Set Asset status to available, clear holder
  const updatedAssets = assets.map(a => {
    if (a.id === request.assetId) {
      const timeline = a.activityTimeline || [];
      return {
        ...a,
        status: 'available' as AssetStatus,
        assignedTo: '',
        assignedToId: '',
        condition: request.conditionAtReturn,
        activityTimeline: [
          ...timeline,
          {
            id: 't' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            action: 'Asset Returned',
            user: currentUser?.name || 'Asset Manager',
            notes: `Asset checked in. Condition: ${request.conditionAtReturn}. Notes: ${request.checkInNotes || 'None'}`
          }
        ]
      };
    }
    return a;
  });
  setAssets(updatedAssets);

  // 3. Mark Allocation as returned
  const updatedAllocations = allocations.map(al => {
    if (al.assetId === request.assetId && al.status === 'active') {
      return {
        ...al,
        status: 'returned' as const,
        actualReturnDate: new Date().toISOString().split('T')[0]
      };
    }
    return al;
  });
  setAllocations(updatedAllocations);

  // 4. Decrement employee assets count
  const updatedUsers = users.map(u => {
    if (u.id === request.requestedById) {
      return { ...u, assignedAssetsCount: Math.max(0, (u.assignedAssetsCount || 0) - 1) };
    }
    return u;
  });
  useAppStore.setState({ users: updatedUsers });

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Approve Return',
      module: 'Allocations',
      record: `${request.assetName} (${request.assetTag})`,
      details: `Approved return request RR-${request.id}. Asset is now Available.`
    });
  }

  addNotification({
    type: 'booking-confirmed', // generic success
    title: 'Asset Return Approved',
    message: `Your return request for ${request.assetName} has been approved and completed.`,
    link: `/assets/${request.assetId}`
  });

  return { ...request, status: 'completed' };
}

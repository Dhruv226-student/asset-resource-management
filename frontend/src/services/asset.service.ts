import { simulateDelay, MockApiError } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { Asset, AssetStatus, AssetCondition } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getAssets(): Promise<Asset[]> {
  await simulateDelay(400);

  // Real API implementation placeholder:
  // return apiClient.get<Asset[]>('/assets');

  return useAppStore.getState().assets;
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  await simulateDelay(250);

  // Real API implementation placeholder:
  // return apiClient.get<Asset>(`/assets/${id}`);

  return useAppStore.getState().assets.find(a => a.id === id);
}

export async function registerAsset(payload: Omit<Asset, 'id' | 'tag' | 'status' | 'activityTimeline'>): Promise<Asset> {
  await simulateDelay(500);

  // Real API implementation placeholder:
  // return apiClient.post<Asset>('/assets', payload);

  const { assets, setAssets, addActivityLog, currentUser } = useAppStore.getState();

  // Auto-generate tag AF-XXXX
  let nextNum = 1;
  if (assets.length > 0) {
    const tags = assets
      .map(a => {
        const match = a.tag.match(/AF-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));
    if (tags.length > 0) {
      nextNum = Math.max(...tags) + 1;
    }
  }
  const tag = `AF-${String(nextNum).padStart(4, '0')}`;

  const newAsset: Asset = {
    ...payload,
    id: 'a' + Date.now(),
    tag,
    status: 'available', // Defaults to available upon registration
    activityTimeline: [
      {
        id: 't' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        action: 'Asset Registered',
        user: currentUser?.name || 'Asset Manager',
        notes: `Registered with tag ${tag}. Condition: ${payload.condition}`
      }
    ]
  };

  setAssets([...assets, newAsset]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Register Asset',
      module: 'Assets',
      record: `${newAsset.name} (${newAsset.tag})`,
      details: `Registered asset into category: ${newAsset.category}. Acquisition Cost: ${newAsset.acquisitionCost} INR.`
    });
  }

  return newAsset;
}

export async function updateAsset(id: string, payload: Partial<Asset>): Promise<Asset> {
  await simulateDelay(400);

  const { assets, setAssets, addActivityLog, currentUser } = useAppStore.getState();
  
  const originalAsset = assets.find(a => a.id === id);
  if (!originalAsset) throw new MockApiError('Asset not found', 404);

  const timeline = originalAsset.activityTimeline || [];
  const updatedTimeline = [...timeline];
  
  if (payload.status && payload.status !== originalAsset.status) {
    updatedTimeline.push({
      id: 't' + Date.now() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString().split('T')[0],
      action: 'Status Changed',
      user: currentUser?.name || 'System',
      notes: `Status changed from ${originalAsset.status} to ${payload.status}`
    });
  }
  
  if (payload.condition && payload.condition !== originalAsset.condition) {
    updatedTimeline.push({
      id: 't' + Date.now() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString().split('T')[0],
      action: 'Condition Checked',
      user: currentUser?.name || 'System',
      notes: `Condition updated from ${originalAsset.condition} to ${payload.condition}`
    });
  }

  const updatedAsset: Asset = { 
    ...originalAsset, 
    ...payload,
    activityTimeline: updatedTimeline
  };

  const updatedList = assets.map(a => a.id === id ? updatedAsset : a);
  setAssets(updatedList);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Update Asset',
      module: 'Assets',
      record: `${updatedAsset.name} (${updatedAsset.tag})`,
      details: `Updated fields: ${Object.keys(payload).join(', ')}`
    });
  }

  return updatedAsset;
}

export async function deleteAsset(id: string): Promise<void> {
  await simulateDelay(400);

  // Real API implementation placeholder:
  // await apiClient.delete(`/assets/${id}`);

  const { assets, setAssets, addActivityLog, currentUser } = useAppStore.getState();
  const asset = assets.find(a => a.id === id);
  if (!asset) throw new MockApiError('Asset not found', 404);

  // Instead of deleting from database, we mark as Retired/Disposed to preserve allocation records
  const updatedList = assets.map(a => {
    if (a.id === id) {
      return { ...a, status: 'disposed' as AssetStatus };
    }
    return a;
  });
  setAssets(updatedList);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Dispose Asset',
      module: 'Assets',
      record: `${asset.name} (${asset.tag})`,
      details: 'Marked asset as Disposed.'
    });
  }
}

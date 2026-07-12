import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { AssetCategory } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getCategories(): Promise<AssetCategory[]> {
  await simulateDelay(300);

  // Real API implementation placeholder:
  // return apiClient.get<AssetCategory[]>('/categories');

  return useAppStore.getState().categories;
}

export async function createCategory(payload: Omit<AssetCategory, 'id' | 'assetCount'>): Promise<AssetCategory> {
  await simulateDelay(400);

  // Real API implementation placeholder:
  // return apiClient.post<AssetCategory>('/categories', payload);

  const { categories, setCategories, addActivityLog, currentUser } = useAppStore.getState();
  
  const newCat: AssetCategory = {
    ...payload,
    id: 'c' + Date.now(),
    assetCount: 0
  };

  setCategories([...categories, newCat]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Create Category',
      module: 'Organization',
      record: `${newCat.name} (${newCat.code})`,
      details: `Created new category. Warranty tracking: ${newCat.warrantyTrackingEnabled ? 'Enabled' : 'Disabled'}.`
    });
  }

  return newCat;
}

export async function updateCategory(id: string, payload: Partial<AssetCategory>): Promise<AssetCategory> {
  await simulateDelay(400);

  const { categories, setCategories, addActivityLog, currentUser } = useAppStore.getState();
  
  const originalCat = categories.find(c => c.id === id);
  if (!originalCat) throw new Error('Category not found');

  const updatedCat: AssetCategory = { ...originalCat, ...payload };
  const updatedList = categories.map(c => c.id === id ? updatedCat : c);
  setCategories(updatedList);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Update Category',
      module: 'Organization',
      record: `${updatedCat.name} (${updatedCat.code})`,
      details: `Updated category fields: ${Object.keys(payload).join(', ')}`
    });
  }

  return updatedCat;
}

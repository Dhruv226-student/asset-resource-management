import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { Department } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getDepartments(): Promise<Department[]> {
  await simulateDelay(300);
  
  // Real API implementation placeholder:
  // return apiClient.get<Department[]>('/departments');

  return useAppStore.getState().departments;
}

export async function getDepartmentById(id: string): Promise<Department | undefined> {
  await simulateDelay(200);
  
  // Real API implementation placeholder:
  // return apiClient.get<Department>(`/departments/${id}`);

  return useAppStore.getState().departments.find(d => d.id === id);
}

export async function createDepartment(payload: Omit<Department, 'id' | 'employeeCount' | 'assetCount'>): Promise<Department> {
  await simulateDelay(400);

  // Real API implementation placeholder:
  // return apiClient.post<Department>('/departments', payload);

  const { departments, setDepartments, addActivityLog, currentUser } = useAppStore.getState();
  
  const newDept: Department = {
    ...payload,
    id: 'd' + Date.now(),
    employeeCount: 0,
    assetCount: 0
  };

  setDepartments([...departments, newDept]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Create Department',
      module: 'Organization',
      record: `${newDept.name} (${newDept.code})`,
      details: `Created new department: ${newDept.description || 'No description'}`
    });
  }

  return newDept;
}

export async function updateDepartment(id: string, payload: Partial<Department>): Promise<Department> {
  await simulateDelay(400);

  const { departments, setDepartments, addActivityLog, currentUser } = useAppStore.getState();
  
  const originalDept = departments.find(d => d.id === id);
  if (!originalDept) throw new Error('Department not found');

  const updatedDept: Department = { ...originalDept, ...payload };
  const updatedList = departments.map(d => d.id === id ? updatedDept : d);
  setDepartments(updatedList);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Update Department',
      module: 'Organization',
      record: `${updatedDept.name} (${updatedDept.code})`,
      details: `Updated department fields: ${Object.keys(payload).join(', ')}`
    });
  }

  return updatedDept;
}

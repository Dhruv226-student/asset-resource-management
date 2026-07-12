import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { User, UserRole } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getEmployees(): Promise<User[]> {
  await simulateDelay(300);

  // Real API implementation placeholder:
  // return apiClient.get<User[]>('/employees');

  return useAppStore.getState().users;
}

export async function createEmployee(payload: Omit<User, 'id' | 'assignedAssetsCount'>): Promise<User> {
  await simulateDelay(400);

  // Real API implementation placeholder:
  // return apiClient.post<User>('/employees', payload);

  const { users, setUsers, addActivityLog, currentUser } = useAppStore.getState();

  const newEmp: User = {
    ...payload,
    id: 'u' + Date.now(),
    assignedAssetsCount: 0
  };

  setUsers([...users, newEmp]);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Add Employee',
      module: 'Organization',
      record: `${newEmp.name} (${newEmp.employeeId})`,
      details: `Added new employee in department: ${newEmp.departmentName}`
    });
  }

  return newEmp;
}

export async function updateEmployee(id: string, payload: Partial<User>): Promise<User> {
  await simulateDelay(400);

  const { users, setUsers, addActivityLog, currentUser } = useAppStore.getState();
  
  const originalUser = users.find(u => u.id === id);
  if (!originalUser) throw new Error('Employee not found');

  const updatedUser: User = { ...originalUser, ...payload };
  const updatedList = users.map(u => u.id === id ? updatedUser : u);
  setUsers(updatedList);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Update Employee',
      module: 'Organization',
      record: `${updatedUser.name} (${updatedUser.employeeId})`,
      details: `Updated employee fields: ${Object.keys(payload).join(', ')}`
    });
  }

  return updatedUser;
}

export async function updateEmployeeRole(id: string, role: UserRole): Promise<User> {
  await simulateDelay(500);

  const { users, setUsers, addActivityLog, currentUser, addNotification } = useAppStore.getState();
  
  const originalUser = users.find(u => u.id === id);
  if (!originalUser) throw new Error('Employee not found');

  const targetUser: User = { ...originalUser, role };
  const updatedList = users.map(u => u.id === id ? targetUser : u);
  setUsers(updatedList);

  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Assign Role',
      module: 'Organization',
      record: `${targetUser.name} (${targetUser.employeeId})`,
      details: `Changed role from ${originalUser.role} to ${role}.`
    });
  }

  // Notify employee
  addNotification({
    type: 'asset-assigned',
    title: 'Role Permissions Updated',
    message: `Your account role has been updated to ${role.toUpperCase()} by the Administrator.`,
    link: '/dashboard'
  });

  return targetUser;
}

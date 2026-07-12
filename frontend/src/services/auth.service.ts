import { simulateDelay, MockApiError } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { User, UserRole } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function login(email: string, password: string): Promise<User> {
  await simulateDelay(600);
  
  // Real API implementation placeholder:
  // return apiClient.post<User>('/auth/login', { email, password });
  
  if (password !== 'password123') {
    throw new MockApiError('Invalid credentials. Password is password123 for all demo accounts.', 401);
  }
  
  const { users, setCurrentUser, setCurrentRole, setAuthenticated, addActivityLog } = useAppStore.getState();
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new MockApiError('User not found. Try admin@assetflow.com or manager@assetflow.com.', 404);
  }
  
  if (user.status === 'inactive') {
    throw new MockApiError('This account is currently deactivated.', 403);
  }

  setCurrentUser(user);
  setCurrentRole(user.role);
  setAuthenticated(true);
  
  addActivityLog({
    user: user.name,
    role: user.role,
    action: 'Login',
    module: 'Authentication',
    record: user.email,
    details: `User successfully logged in via credentials.`
  });

  return user;
}

export async function signup(payload: {
  name: string;
  email: string;
  departmentId: string;
  employeeId: string;
}): Promise<User> {
  await simulateDelay(600);

  // Real API implementation placeholder:
  // return apiClient.post<User>('/auth/signup', payload);

  const { users, setUsers, departments } = useAppStore.getState();
  
  const emailExists = users.some(u => u.email.toLowerCase() === payload.email.toLowerCase());
  if (emailExists) {
    throw new MockApiError('Email already registered.', 400);
  }

  const dept = departments.find(d => d.id === payload.departmentId);

  const newEmployee: User = {
    id: 'u' + Date.now(),
    name: payload.name,
    email: payload.email,
    role: 'employee', // Auto gets employee role
    departmentId: payload.departmentId,
    departmentName: dept ? dept.name : 'Unassigned',
    employeeId: payload.employeeId,
    status: 'active',
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=100&h=100&fit=crop&crop=faces`
  };

  const updatedUsers = [...users, newEmployee];
  setUsers(updatedUsers);

  return newEmployee;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  await simulateDelay(500);

  // Real API implementation placeholder:
  // return apiClient.post('/auth/forgot-password', { email });

  const { users } = useAppStore.getState();
  const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!userExists) {
    throw new MockApiError('No account found with this email address.', 404);
  }

  return { 
    success: true, 
    message: 'Reset instructions have been sent to your email.' 
  };
}

export async function logout(): Promise<void> {
  await simulateDelay(300);
  
  // Real API implementation placeholder:
  // await apiClient.post('/auth/logout', {});

  const { currentUser, resetStore, addActivityLog } = useAppStore.getState();
  if (currentUser) {
    addActivityLog({
      user: currentUser.name,
      role: currentUser.role,
      action: 'Logout',
      module: 'Authentication',
      record: currentUser.email,
      details: 'User logged out.'
    });
  }
  
  resetStore();
}

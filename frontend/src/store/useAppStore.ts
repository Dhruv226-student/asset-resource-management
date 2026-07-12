import { create } from 'zustand';
import { 
  User, UserRole, Department, AssetCategory, Asset, Allocation, 
  TransferRequest, ReturnRequest, Resource, Booking, MaintenanceRequest, 
  AuditCycle, AuditItem, Notification, ActivityLog 
} from '@/types';

// Import initial mock data
import initialUsers from '@/data/mock-users.json';
import initialDepartments from '@/data/mock-departments.json';
import initialCategories from '@/data/mock-categories.json';
import initialAssets from '@/data/mock-assets.json';
import initialAllocations from '@/data/mock-allocations.json';
import initialTransferRequests from '@/data/mock-transfer-requests.json';
import initialReturnRequests from '@/data/mock-return-requests.json';
import initialResources from '@/data/mock-resources.json';
import initialBookings from '@/data/mock-bookings.json';
import initialMaintenance from '@/data/mock-maintenance.json';
import initialAudits from '@/data/mock-audits.json';
import initialNotifications from '@/data/mock-notifications.json';
import initialActivityLogs from '@/data/mock-activity-logs.json';

interface AppState {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  
  users: User[];
  departments: Department[];
  categories: AssetCategory[];
  assets: Asset[];
  allocations: Allocation[];
  transferRequests: TransferRequest[];
  returnRequests: ReturnRequest[];
  resources: Resource[];
  bookings: Booking[];
  maintenanceRequests: MaintenanceRequest[];
  auditCycles: AuditCycle[];
  auditItems: AuditItem[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  
  // Toast notifications state
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  
  // Actions to mutate state (called by services to simulate DB updates)
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
  setAuthenticated: (auth: boolean) => void;
  
  setUsers: (users: User[]) => void;
  setDepartments: (departments: Department[]) => void;
  setCategories: (categories: AssetCategory[]) => void;
  setAssets: (assets: Asset[]) => void;
  setAllocations: (allocations: Allocation[]) => void;
  setTransferRequests: (requests: TransferRequest[]) => void;
  setReturnRequests: (requests: ReturnRequest[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setMaintenanceRequests: (requests: MaintenanceRequest[]) => void;
  setAuditCycles: (cycles: AuditCycle[]) => void;
  setAuditItems: (items: AuditItem[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'date' | 'ipAddress'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
  
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  
  resetStore: () => void;
}

// Helper to check for client side
const isClient = typeof window !== 'undefined';

const getLocalStorage = <T>(key: string, initialValue: T): T => {
  if (!isClient) return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const useAppStore = create<AppState>((set, get) => {
  // Setup initial states loaded from localStorage if exists
  const users = getLocalStorage<User[]>('af_users', initialUsers as User[]);
  const departments = getLocalStorage<Department[]>('af_departments', initialDepartments as Department[]);
  const categories = getLocalStorage<AssetCategory[]>('af_categories', initialCategories as AssetCategory[]);
  const assets = getLocalStorage<Asset[]>('af_assets', initialAssets as Asset[]);
  const allocations = getLocalStorage<Allocation[]>('af_allocations', initialAllocations as Allocation[]);
  const transferRequests = getLocalStorage<TransferRequest[]>('af_transferRequests', initialTransferRequests as TransferRequest[]);
  const returnRequests = getLocalStorage<ReturnRequest[]>('af_returnRequests', initialReturnRequests as ReturnRequest[]);
  const resources = getLocalStorage<Resource[]>('af_resources', initialResources as Resource[]);
  const bookings = getLocalStorage<Booking[]>('af_bookings', initialBookings as Booking[]);
  const maintenanceRequests = getLocalStorage<MaintenanceRequest[]>('af_maintenanceRequests', initialMaintenance as MaintenanceRequest[]);
  const auditCycles = getLocalStorage<AuditCycle[]>('af_auditCycles', initialAudits.cycles as AuditCycle[]);
  const auditItems = getLocalStorage<AuditItem[]>('af_auditItems', initialAudits.items as AuditItem[]);
  const notifications = getLocalStorage<Notification[]>('af_notifications', initialNotifications as Notification[]);
  const activityLogs = getLocalStorage<ActivityLog[]>('af_activityLogs', initialActivityLogs as ActivityLog[]);
  
  // Default login (e.g. Employee User by default, or none)
  const currentUser = getLocalStorage<User | null>('af_currentUser', null);
  const currentRole = getLocalStorage<UserRole>('af_currentRole', 'employee');
  const isAuthenticated = getLocalStorage<boolean>('af_isAuthenticated', false);

  return {
    currentUser,
    currentRole,
    isAuthenticated,
    users,
    departments,
    categories,
    assets,
    allocations,
    transferRequests,
    returnRequests,
    resources,
    bookings,
    maintenanceRequests,
    auditCycles,
    auditItems,
    notifications,
    activityLogs,
    toast: null,

    setCurrentUser: (user) => {
      set({ currentUser: user });
      setLocalStorage('af_currentUser', user);
    },
    setCurrentRole: (role) => {
      set({ currentRole: role });
      setLocalStorage('af_currentRole', role);
      // Update currentUser role if matching
      const user = get().currentUser;
      if (user) {
        const updatedUser = { ...user, role };
        set({ currentUser: updatedUser });
        setLocalStorage('af_currentUser', updatedUser);
        
        // Also update users array
        const updatedUsers = get().users.map(u => u.id === user.id ? updatedUser : u);
        set({ users: updatedUsers });
        setLocalStorage('af_users', updatedUsers);
      }
    },
    setAuthenticated: (auth) => {
      set({ isAuthenticated: auth });
      setLocalStorage('af_isAuthenticated', auth);
    },
    setUsers: (users) => {
      set({ users });
      setLocalStorage('af_users', users);
    },
    setDepartments: (departments) => {
      set({ departments });
      setLocalStorage('af_departments', departments);
    },
    setCategories: (categories) => {
      set({ categories });
      setLocalStorage('af_categories', categories);
    },
    setAssets: (assets) => {
      set({ assets });
      setLocalStorage('af_assets', assets);
    },
    setAllocations: (allocations) => {
      set({ allocations });
      setLocalStorage('af_allocations', allocations);
    },
    setTransferRequests: (transferRequests) => {
      set({ transferRequests });
      setLocalStorage('af_transferRequests', transferRequests);
    },
    setReturnRequests: (returnRequests) => {
      set({ returnRequests });
      setLocalStorage('af_returnRequests', returnRequests);
    },
    setBookings: (bookings) => {
      set({ bookings });
      setLocalStorage('af_bookings', bookings);
    },
    setMaintenanceRequests: (maintenanceRequests) => {
      set({ maintenanceRequests });
      setLocalStorage('af_maintenanceRequests', maintenanceRequests);
    },
    setAuditCycles: (auditCycles) => {
      set({ auditCycles });
      setLocalStorage('af_auditCycles', auditCycles);
    },
    setAuditItems: (auditItems) => {
      set({ auditItems });
      setLocalStorage('af_auditItems', auditItems);
    },
    setNotifications: (notifications) => {
      set({ notifications });
      setLocalStorage('af_notifications', notifications);
    },
    addActivityLog: (log) => {
      const newLog: ActivityLog = {
        ...log,
        id: 'act' + Date.now(),
        date: new Date().toISOString(),
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 2)
      };
      const updatedLogs = [newLog, ...get().activityLogs];
      set({ activityLogs: updatedLogs });
      setLocalStorage('af_activityLogs', updatedLogs);
    },
    addNotification: (notif) => {
      const newNotif: Notification = {
        ...notif,
        id: 'notif' + Date.now(),
        date: new Date().toISOString(),
        isRead: false
      };
      const updatedNotifications = [newNotif, ...get().notifications];
      set({ notifications: updatedNotifications });
      setLocalStorage('af_notifications', updatedNotifications);
    },
    
    showToast: (message, type = 'success') => {
      set({ toast: { message, type } });
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        const currentToast = get().toast;
        if (currentToast && currentToast.message === message) {
          get().hideToast();
        }
      }, 4000);
    },
    hideToast: () => set({ toast: null }),
    
    resetStore: () => {
      if (isClient) {
        window.localStorage.removeItem('af_currentUser');
        window.localStorage.removeItem('af_currentRole');
        window.localStorage.removeItem('af_isAuthenticated');
        window.localStorage.removeItem('af_users');
        window.localStorage.removeItem('af_departments');
        window.localStorage.removeItem('af_categories');
        window.localStorage.removeItem('af_assets');
        window.localStorage.removeItem('af_allocations');
        window.localStorage.removeItem('af_transferRequests');
        window.localStorage.removeItem('af_returnRequests');
        window.localStorage.removeItem('af_bookings');
        window.localStorage.removeItem('af_maintenanceRequests');
        window.localStorage.removeItem('af_auditCycles');
        window.localStorage.removeItem('af_auditItems');
        window.localStorage.removeItem('af_notifications');
        window.localStorage.removeItem('af_activityLogs');
      }
      set({
        currentUser: null,
        currentRole: 'employee',
        isAuthenticated: false,
        users: initialUsers as User[],
        departments: initialDepartments as Department[],
        categories: initialCategories as AssetCategory[],
        assets: initialAssets as Asset[],
        allocations: initialAllocations as Allocation[],
        transferRequests: initialTransferRequests as TransferRequest[],
        returnRequests: initialReturnRequests as ReturnRequest[],
        resources: initialResources as Resource[],
        bookings: initialBookings as Booking[],
        maintenanceRequests: initialMaintenance as MaintenanceRequest[],
        auditCycles: initialAudits.cycles as AuditCycle[],
        auditItems: initialAudits.items as AuditItem[],
        notifications: initialNotifications as Notification[],
        activityLogs: initialActivityLogs as ActivityLog[],
        toast: null
      });
    }
  };
});

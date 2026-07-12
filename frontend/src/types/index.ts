export type UserRole = 'admin' | 'asset-manager' | 'department-head' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  employeeId: string;
  status: 'active' | 'inactive';
  avatar?: string;
  assignedAssetsCount?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  parentDepartment?: string;
  employeeCount: number;
  assetCount: number;
  status: 'active' | 'inactive';
  description?: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  assetCount: number;
  customFields?: string[];
  status: 'active' | 'inactive';
  description?: string;
  warrantyTrackingEnabled: boolean;
  maintenanceInterval?: number; // in days
}

export type AssetCondition = 'new' | 'good' | 'fair' | 'poor' | 'damaged';
export type AssetStatus = 'available' | 'allocated' | 'reserved' | 'under-maintenance' | 'lost' | 'retired' | 'disposed';

export interface Asset {
  id: string;
  name: string;
  tag: string; // e.g. AF-0001
  serialNumber: string;
  category: string;
  assignedTo?: string; // employee name or id
  assignedToId?: string;
  department: string;
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  description?: string;
  acquisitionDate: string;
  acquisitionCost: number;
  supplierName: string;
  warrantyExpiryDate: string;
  isBookable: boolean;
  image?: string;
  documents?: string[]; // file names
  activityTimeline?: {
    id: string;
    date: string;
    action: string;
    user: string;
    notes?: string;
  }[];
}

export type AssignmentType = 'employee' | 'department';
export type AllocationStatus = 'active' | 'returned' | 'overdue';

export interface Allocation {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  assignedTo: string; // employee/dept name
  assignedToId?: string;
  assignmentType: AssignmentType;
  department: string;
  allocationDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: AllocationStatus;
  notes?: string;
}

export type TransferRequestStatus = 'requested' | 'approved' | 'rejected' | 'completed';

export interface TransferRequest {
  id: string; // Request ID
  assetId: string;
  assetName: string;
  assetTag: string;
  currentHolder: string;
  requestedHolder: string;
  requestedHolderId?: string;
  requestedBy: string;
  requestedById?: string;
  requestDate: string;
  reason: string;
  status: TransferRequestStatus;
}

export type ReturnRequestStatus = 'requested' | 'approved' | 'rejected' | 'completed';

export interface ReturnRequest {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  requestedBy: string;
  requestedById?: string;
  returnDate: string;
  conditionAtReturn: AssetCondition;
  checkInNotes?: string;
  status: ReturnRequestStatus;
}

export interface Resource {
  id: string;
  name: string;
  type: string; // e.g., 'Conference Room', 'Vehicle', 'Equipment'
  description?: string;
  status: 'available' | 'maintenance' | 'retired';
}

export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  bookedFor: string; // user name
  bookedForId?: string;
  department: string;
  purpose: string;
  notes?: string;
  status: BookingStatus;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'approved' | 'in-progress' | 'resolved' | 'rejected';

export interface MaintenanceRequest {
  id: string; // MR-1001
  assetId: string;
  assetName: string;
  assetTag: string;
  reportedBy: string;
  reportedById?: string;
  issue: string;
  priority: MaintenancePriority;
  technician?: string;
  requestedDate: string;
  estimatedCompletionDate?: string;
  status: MaintenanceStatus;
  resolutionNotes?: string;
  repairCost?: number;
  completionDate?: string;
  photo?: string;
}

export type AuditStatus = 'active' | 'upcoming' | 'completed';
export type AuditVerificationStatus = 'pending' | 'verified' | 'missing' | 'damaged';

export interface AuditCycle {
  id: string;
  name: string;
  scopeType: 'department' | 'location' | 'all';
  department?: string;
  location?: string;
  startDate: string;
  endDate: string;
  auditors: string[];
  progress: number; // percentage
  status: AuditStatus;
  notes?: string;
}

export interface AuditItem {
  id: string;
  auditCycleId: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  expectedLocation: string;
  actualLocation?: string;
  expectedHolder: string;
  status: AuditVerificationStatus;
  auditorNotes?: string;
}

export interface Notification {
  id: string;
  type:
    | 'asset-assigned'
    | 'transfer-requested'
    | 'transfer-approved'
    | 'transfer-rejected'
    | 'return-due'
    | 'overdue-return'
    | 'booking-confirmed'
    | 'booking-cancelled'
    | 'booking-reminder'
    | 'maintenance-approved'
    | 'maintenance-rejected'
    | 'maintenance-resolved'
    | 'audit-discrepancy';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  link?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  userId?: string;
  role: UserRole;
  action: string;
  module: string;
  record: string;
  date: string;
  ipAddress: string;
  details?: string;
}

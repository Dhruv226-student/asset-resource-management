import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { ActivityLog } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getActivityLogs(): Promise<ActivityLog[]> {
  await simulateDelay(300);

  // Real API implementation:
  // return apiClient.get<ActivityLog[]>('/activity-logs');

  return useAppStore.getState().activityLogs;
}

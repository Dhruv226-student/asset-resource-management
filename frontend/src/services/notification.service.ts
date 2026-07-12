import { simulateDelay } from '@/lib/mock-api';
import { useAppStore } from '@/store/useAppStore';
import { Notification } from '@/types';

// Replace mock service implementation with real API client:
// import { apiClient } from '@/lib/api-client';

export async function getNotifications(): Promise<Notification[]> {
  await simulateDelay(200);
  return useAppStore.getState().notifications;
}

export async function markAsRead(id: string): Promise<Notification> {
  await simulateDelay(150);

  // Real API implementation:
  // return apiClient.patch<Notification>(`/notifications/${id}/read`, {});

  const { notifications, setNotifications } = useAppStore.getState();
  
  let updatedNotification: Notification | null = null;
  const updatedList = notifications.map(n => {
    if (n.id === id) {
      updatedNotification = { ...n, isRead: true };
      return updatedNotification;
    }
    return n;
  });

  if (!updatedNotification) throw new Error('Notification not found');
  setNotifications(updatedList);

  return updatedNotification;
}

export async function markAllAsRead(): Promise<void> {
  await simulateDelay(200);

  // Real API implementation:
  // await apiClient.patch('/notifications/read-all', {});

  const { notifications, setNotifications } = useAppStore.getState();
  const updatedList = notifications.map(n => ({ ...n, isRead: true }));
  setNotifications(updatedList);
}

export async function deleteNotification(id: string): Promise<void> {
  await simulateDelay(150);

  // Real API implementation:
  // await apiClient.delete(`/notifications/${id}`);

  const { notifications, setNotifications } = useAppStore.getState();
  const updatedList = notifications.filter(n => n.id !== id);
  setNotifications(updatedList);
}
